"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";

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
    // delete current assignees
    await prisma.taskAssignee.deleteMany({
      where: { taskId },
    });

    // create new assignee if a valid member is selected
    if (assigneeId && assigneeId !== "none") {
      await prisma.taskAssignee.create({
        data: {
          taskId,
          userId: assigneeId,
        },
      });
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

  // Update task's column in the database
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

