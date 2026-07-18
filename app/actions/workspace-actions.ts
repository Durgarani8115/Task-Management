"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import { hasPermission } from "@/lib/rbac";
import { createProject } from "@/app/api/projects/repositories/project-repository";


export async function updateWorkspaceAction(formData: FormData) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId")?.toString();
  if (!workspaceId) throw new Error("Missing workspace ID");

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();

  const isAllowed = await hasPermission(user.id, workspaceId, "canManageWorkspace");
  if (!isAllowed) {
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

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) throw new Error("Project not found");
  
  const isAllowed = await hasPermission(user.id, project.workspaceId, "canManageProject");
  if (!isAllowed) throw new Error("Unauthorized to edit project");

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

  const isAllowed = await hasPermission(user.id, workspaceId, "canManageWorkspace");
  if (!isAllowed) {
    throw new Error("Only the workspace administrator can delete the workspace");
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

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) throw new Error("Project not found");

  const isAllowed = await hasPermission(user.id, project.workspaceId, "canManageProject");
  if (!isAllowed) {
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

  const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
  if (!adminRole) throw new Error("System default roles are missing. Please run seed script.");

  const newWorkspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      description: description || null,
      members: {
        create: { 
          userId: user.id, 
          role: 'OWNER',
          roleId: adminRole.id
        }
      }
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/workspaces");

  return { success: true, workspaceId: newWorkspace.id };
}

export async function addWorkspaceMemberAction(formData: FormData) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId")?.toString();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const roleId = formData.get("roleId")?.toString();

  if (!workspaceId || !email || !roleId) {
    throw new Error("Missing required fields");
  }

  // check permissions
  const isAllowed = await hasPermission(user.id, workspaceId, "canManageWorkspace");
  if (!isAllowed) {
    throw new Error("Unauthorized to manage workspace members");
  }

  // find user by email
  const targetUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!targetUser) {
    throw new Error("User with this email not found in the system");
  }

  // check if user is already a member
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: targetUser.id
      }
    }
  });

  if (existingMember) {
    throw new Error("User is already a member of this workspace");
  }

  // add member
  await prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: targetUser.id,
      roleId,
      role: 'MEMBER' // compatibility with previous enum column
    }
  });

  revalidatePath(`/workspaces/${workspaceId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function updateWorkspaceMemberRoleAction(formData: FormData) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId")?.toString();
  const memberId = formData.get("memberId")?.toString();
  const roleId = formData.get("roleId")?.toString();

  if (!workspaceId || !memberId || !roleId) {
    throw new Error("Missing required fields");
  }

  // check permissions
  const isAllowed = await hasPermission(user.id, workspaceId, "canManageWorkspace");
  if (!isAllowed) {
    throw new Error("Unauthorized to manage workspace members");
  }

  const memberToUpdate = await prisma.workspaceMember.findUnique({
    where: { id: memberId },
    include: { roleRef: true }
  });

  if (!memberToUpdate) {
    throw new Error("Workspace member not found");
  }

  // lockout check: if demoting an Admin, ensure there's at least one other Admin in the workspace
  const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
  if (!targetRole) throw new Error("Target role not found");

  const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
  if (!adminRole) throw new Error("Admin role not found");

  if (memberToUpdate.roleId === adminRole.id && roleId !== adminRole.id) {
    const adminCount = await prisma.workspaceMember.count({
      where: {
        workspaceId,
        roleId: adminRole.id
      }
    });
    if (adminCount <= 1) {
      throw new Error("Cannot demote the last administrator of this workspace");
    }
  }

  await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { roleId }
  });

  revalidatePath(`/workspaces/${workspaceId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function removeWorkspaceMemberAction(formData: FormData) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId")?.toString();
  const memberId = formData.get("memberId")?.toString();

  if (!workspaceId || !memberId) {
    throw new Error("Missing required fields");
  }

  // check permissions
  const isAllowed = await hasPermission(user.id, workspaceId, "canManageWorkspace");
  if (!isAllowed) {
    throw new Error("Unauthorized to manage workspace members");
  }

  const memberToRemove = await prisma.workspaceMember.findUnique({
    where: { id: memberId }
  });

  if (!memberToRemove) {
    throw new Error("Workspace member not found");
  }

  const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
  if (!adminRole) throw new Error("Admin role not found");

  if (memberToRemove.roleId === adminRole.id) {
    const adminCount = await prisma.workspaceMember.count({
      where: {
        workspaceId,
        roleId: adminRole.id
      }
    });
    if (adminCount <= 1) {
      throw new Error("Cannot remove the last administrator of this workspace");
    }
  }

  await prisma.workspaceMember.delete({
    where: { id: memberId }
  });

  revalidatePath(`/workspaces/${workspaceId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function createProjectAction(formData: FormData) {
  const user = await getServerSession();
  if (!user) throw new Error("unauthorized");

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const workspaceId = formData.get("workspaceId")?.toString();

  if (!name || !workspaceId) {
    throw new Error("name and workspace id are required");
  }

  // check if user is a member of the workspace
  const isAllowed = await hasPermission(user.id, workspaceId, "canManageProject");
  if (!isAllowed) {
    throw new Error("you do not have permission to create projects in this workspace");
  }

  // create project and default columns together
  await createProject(name, description, workspaceId);

  // revalidate paths so user sees updates immediately
  revalidatePath("/dashboard");
  revalidatePath(`/workspaces/${workspaceId}`);

  return { success: true };
}


