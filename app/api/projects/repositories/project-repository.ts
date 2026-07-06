import prisma from "@/lib/db";

// get a workspace membership for a user
export async function getWorkspaceMembership(workspaceId: string, userId: string) {
  return prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
}

// find project workspace id by project id
export async function getProjectWorkspaceId(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  return project?.workspaceId || null;
}

// get all projects for a workspace with columns and task counts
export async function getProjectsByWorkspace(workspaceId: string) {
  return prisma.project.findMany({
    where: { workspaceId },
    include: {
      columns: {
        orderBy: { position: "asc" },
      },
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// get project basic info
export async function getProjectById(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
  });
}

// get full project with columns, tasks, assignees, and tags
export async function getProjectWithDetails(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
            include: {
              assignees: {
                include: { user: { select: { id: true, name: true, image: true } } },
              },
            },
          },
        },
      },
      tags: true,
      _count: {
        select: { tasks: true },
      },
    },
  });
}

// create a project along with default board columns in a transaction
export async function createProject(name: string, description: string | undefined, workspaceId: string) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name,
        description,
        workspaceId,
      },
    });

    await tx.taskColumn.createMany({
      data: [
        { title: "To Do", position: 1, projectId: project.id },
        { title: "In Progress", position: 2, projectId: project.id },
        { title: "Done", position: 3, projectId: project.id },
      ],
    });

    return project;
  });
}

// update project details dynamically
export async function updateProject(
  projectId: string,
  data: { name?: string; description?: string | null; color?: string; icon?: string }
) {
  return prisma.project.update({
    where: { id: projectId },
    data,
  });
}

// delete project and all its related child records in a transaction
export async function deleteProject(projectId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.comment.deleteMany({ where: { task: { projectId } } });
    await tx.checklistItem.deleteMany({ where: { task: { projectId } } });
    await tx.attachment.deleteMany({ where: { task: { projectId } } });
    await tx.activityLog.deleteMany({ where: { task: { projectId } } });
    await tx.taskAssignee.deleteMany({ where: { task: { projectId } } });
    await tx.taskTag.deleteMany({ where: { task: { projectId } } });
    await tx.task.deleteMany({ where: { projectId } });
    await tx.tag.deleteMany({ where: { projectId } });
    await tx.taskColumn.deleteMany({ where: { projectId } });
    return tx.project.delete({ where: { id: projectId } });
  });
}
