"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";

export async function updateWorkspaceAction(formData: FormData) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId")?.toString();
  if (!workspaceId) throw new Error("Missing workspace ID");

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();

  // Verify membership and ownership before update
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: user.id } },
  });

  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    throw new Error("Unauthorized to edit workspace");
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/workspaces");
  revalidatePath("/workspaces/[workspaceId]", "page");
  
  return { success: true };
}

export async function updateProjectAction(formData: FormData) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  const projectId = formData.get("projectId")?.toString();
  if (!projectId) throw new Error("Missing project ID");

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();

  // Verify access
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: { include: { members: true } } }
  });

  if (!project) throw new Error("Project not found");
  
  const isMember = project.workspace.members.some(m => m.userId === user.id);
  if (!isMember) throw new Error("Unauthorized to edit project");

  await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/workspaces/projects/[projectId]", "page");
  
  return { success: true };
}

export async function deleteWorkspaceAction(formData: FormData) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId")?.toString();
  if (!workspaceId) throw new Error("Missing workspace ID");

  // Verify ownership before deletion (must be OWNER)
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: user.id } },
  });

  if (!membership || membership.role !== "OWNER") {
    throw new Error("Only the owner can delete the workspace");
  }

  // Deletion logic (delete dependent tasks, projects, workspace members, activity logs)
  const projects = await prisma.project.findMany({
    where: { workspaceId },
    select: { id: true }
  });
  const projectIds = projects.map(p => p.id);

  // 1. Delete task assignees & activity logs & comments
  await prisma.taskAssignee.deleteMany({
    where: { task: { projectId: { in: projectIds } } }
  });
  await prisma.activityLog.deleteMany({
    where: { task: { projectId: { in: projectIds } } }
  });
  await prisma.comment.deleteMany({
    where: { task: { projectId: { in: projectIds } } }
  });
  await prisma.checklistItem.deleteMany({
    where: { task: { projectId: { in: projectIds } } }
  });
  await prisma.attachment.deleteMany({
    where: { task: { projectId: { in: projectIds } } }
  });
  await prisma.taskTag.deleteMany({
    where: { task: { projectId: { in: projectIds } } }
  });

  // 2. Delete tasks
  await prisma.task.deleteMany({
    where: { projectId: { in: projectIds } }
  });

  // 3. Delete task columns
  await prisma.taskColumn.deleteMany({
    where: { projectId: { in: projectIds } }
  });

  // 4. Delete projects & workspace members
  await prisma.tag.deleteMany({
    where: { projectId: { in: projectIds } }
  });
  await prisma.project.deleteMany({
    where: { workspaceId }
  });
  await prisma.workspaceMember.deleteMany({
    where: { workspaceId }
  });

  // 5. Delete workspace
  await prisma.workspace.delete({
    where: { id: workspaceId }
  });

  revalidatePath("/dashboard");
  revalidatePath("/workspaces");

  redirect("/workspaces");
}

export async function deleteProjectAction(formData: FormData) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  const projectId = formData.get("projectId")?.toString();
  if (!projectId) throw new Error("Missing project ID");

  // Verify access
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: { include: { members: true } } }
  });

  if (!project) throw new Error("Project not found");

  const membership = project.workspace.members.find(m => m.userId === user.id);
  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    throw new Error("Unauthorized to delete project");
  }

  // Deletion logic (delete dependent tasks, columns, tags)
  await prisma.taskAssignee.deleteMany({
    where: { task: { projectId } }
  });
  await prisma.activityLog.deleteMany({
    where: { task: { projectId } }
  });
  await prisma.comment.deleteMany({
    where: { task: { projectId } }
  });
  await prisma.checklistItem.deleteMany({
    where: { task: { projectId } }
  });
  await prisma.attachment.deleteMany({
    where: { task: { projectId } }
  });
  await prisma.taskTag.deleteMany({
    where: { task: { projectId } }
  });
  await prisma.task.deleteMany({
    where: { projectId }
  });
  await prisma.taskColumn.deleteMany({
    where: { projectId }
  });
  await prisma.tag.deleteMany({
    where: { projectId }
  });
  await prisma.project.delete({
    where: { id: projectId }
  });

  revalidatePath("/dashboard");
  revalidatePath(`/workspaces/${project.workspaceId}`);

  redirect(`/workspaces/${project.workspaceId}`);
}

export async function createWorkspaceAction(formData: FormData) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();

  if (!name) {
    throw new Error("Workspace name is required");
  }

  // Handle unique slug generation by appending index if it exists
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const newWorkspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      description: description || null,
      members: {
        create: { userId: user.id, role: 'OWNER' }
      }
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/workspaces");

  return { success: true, workspaceId: newWorkspace.id };
}

