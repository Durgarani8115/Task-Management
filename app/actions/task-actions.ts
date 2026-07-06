"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { sendAssignmentEmail } from "@/lib/mail";

export async function updateTaskAction(formData: FormData) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  const taskId = formData.get("taskId")?.toString();
  if (!taskId) throw new Error("Missing task ID");

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const priority = formData.get("priority")?.toString() as any;
  const dueDateStr = formData.get("dueDate")?.toString();
  const columnId = formData.get("columnId")?.toString();
  const assigneeId = formData.get("assigneeId")?.toString();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { 
      project: true,
      assignees: true
    }
  });
  if (!task) throw new Error("Task not found");

  // check if user has manager-level edit permission or teammate-level status update permission
  const isManager = await hasPermission(user.id, task.project.workspaceId, "canEditTask");
  const canUpdateStatus = await hasPermission(user.id, task.project.workspaceId, "canUpdateTaskStatus");

  if (!isManager && !canUpdateStatus) {
    throw new Error("You do not have permission to update tasks in this workspace.");
  }

  // if user is only a teammate, check if they tried to edit restricted fields
  if (!isManager) {
    const hasTitleChanged = title !== undefined && title !== task.title;
    const hasDescChanged = description !== undefined && (description || null) !== task.description;
    const hasPriorityChanged = priority !== undefined && priority !== task.priority;
    
    const currentDueDateStr = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
    const hasDueDateChanged = dueDateStr !== undefined && dueDateStr !== currentDueDateStr;
    
    const currentAssigneeId = task.assignees && task.assignees.length > 0
      ? task.assignees[0].userId
      : "none";
    const hasAssigneeChanged = assigneeId !== undefined && assigneeId !== currentAssigneeId;

    if (hasTitleChanged || hasDescChanged || hasPriorityChanged || hasDueDateChanged || hasAssigneeChanged) {
      throw new Error("You do not have permission to edit task details. You can only update the status.");
    }
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(priority && { priority }),
      ...(dueDateStr !== undefined && { dueDate: dueDateStr ? new Date(dueDateStr) : null }),
      ...(columnId && { columnId }),
    },
  });

  // handle task assignee updates
  if (assigneeId !== undefined) {
    const canAssign = await hasPermission(user.id, task.project.workspaceId, "canAssignTask");
    if (!canAssign) throw new Error("You do not have permission to assign tasks in this workspace.");

    // check if user is already assigned to 5 or more active tasks in this workspace
    if (assigneeId && assigneeId !== "none") {
      // fetch all other task assignments for the user in this workspace
      const assignedTasks = await prisma.taskAssignee.findMany({
        where: {
          userId: assigneeId,
          taskId: { not: taskId },
          task: {
            project: {
              workspaceId: task.project.workspaceId
            }
          }
        },
        include: {
          task: {
            include: {
              column: true
            }
          }
        }
      });

      // filter out completed tasks based on column title matching
      const activeTasks = assignedTasks.filter((ta) => {
        const title = ta.task.column.title.toLowerCase();
        const isCompleted = title.includes("done") || title.includes("complete") || title.includes("finish") || title.includes("resolved");
        return !isCompleted;
      });

      if (activeTasks.length >= 5) {
        throw new Error("user busy, it have full quotas of task try to assigne new teammember");
      }
    }

    // delete current assignees
    await prisma.taskAssignee.deleteMany({
      where: { taskId },
    });

    // create new assignee if a valid member is selected
    if (assigneeId && assigneeId !== "none") {
      const newAssignee = await prisma.taskAssignee.create({
        data: {
          taskId,
          userId: assigneeId,
        },
        include: {
          user: true,
          task: {
            include: {
              project: true
            }
          }
        }
      });

      // send task assignment email notification to assignee
      await sendAssignmentEmail(
        newAssignee.user.email,
        newAssignee.user.name,
        newAssignee.task.title,
        newAssignee.task.project.name
      );
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/workspaces/projects/[projectId]", "page");
  
  return { success: true };
}

export async function createTaskAction(formData: FormData) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const priority = formData.get("priority")?.toString() as any;
  const dueDateStr = formData.get("dueDate")?.toString();
  const columnId = formData.get("columnId")?.toString();
  const projectId = formData.get("projectId")?.toString();

  if (!title || !columnId || !projectId) {
    throw new Error("Missing required fields");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });
  if (!project) throw new Error("Project not found");

  const isAllowed = await hasPermission(user.id, project.workspaceId, "canCreateTask");
  if (!isAllowed) throw new Error("You do not have permission to create tasks in this workspace.");

  const existingTasksCount = await prisma.task.count({
    where: { columnId }
  });

  await prisma.task.create({
    data: {
      title,
      description,
      priority: priority || 'MEDIUM',
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      position: existingTasksCount + 1,
      columnId,
      projectId,
      createdById: user.id
    }
  });

  revalidatePath("/dashboard");
  revalidatePath(`/workspaces/projects/${projectId}`);
  revalidatePath("/workspaces/projects/[projectId]", "page");
  
  return { success: true };
}

export async function moveTaskAction(taskId: string, targetColumnId: string) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  if (!taskId || !targetColumnId) {
    throw new Error("Missing task ID or target column ID");
  }

  const taskExist = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });
  if (!taskExist) throw new Error("Task not found");

  // check teammate-level permission to change status/move tasks
  const isAllowed = await hasPermission(user.id, taskExist.project.workspaceId, "canUpdateTaskStatus");
  if (!isAllowed) throw new Error("You do not have permission to move tasks in this workspace.");

  // update task's column in the database
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      columnId: targetColumnId,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/workspaces/projects/${task.projectId}`);
  revalidatePath("/workspaces/projects/[projectId]", "page");

  return { success: true };
}

export async function deleteTaskAction(taskId: string) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  if (!taskId) throw new Error("Missing task ID");

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });

  if (!task) throw new Error("Task not found");

  // verify delete permission (only manager-level users can delete tasks)
  const isAllowed = await hasPermission(user.id, task.project.workspaceId, "canEditTask");
  if (!isAllowed) throw new Error("You do not have permission to delete tasks in this workspace.");

  // delete all child relationships first before deleting the task
  await prisma.$transaction(async (tx) => {
    await tx.comment.deleteMany({ where: { taskId } });
    await tx.checklistItem.deleteMany({ where: { taskId } });
    await tx.attachment.deleteMany({ where: { taskId } });
    await tx.activityLog.deleteMany({ where: { taskId } });
    await tx.taskAssignee.deleteMany({ where: { taskId } });
    await tx.taskTag.deleteMany({ where: { taskId } });
    await tx.task.delete({ where: { id: taskId } });
  });

  revalidatePath("/dashboard");
  revalidatePath(`/workspaces/projects/${task.projectId}`);
  revalidatePath("/workspaces/projects/[projectId]", "page");

  return { success: true };
}

