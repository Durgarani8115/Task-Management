import React from 'react';
import db from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EditProjectModal } from '@/components/project/edit-project-modal';
import { KanbanBoard } from '@/components/board/kanban-board';
import { getMemberPermissions } from '@/lib/rbac';

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectBoardPage({ params }: Props) {
  const user = await getServerSession();
  if (!user) redirect('/sign-in');

  const resolvedParams = await params;
  const projectId = resolvedParams.projectId;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: {
          tasks: {
            orderBy: { position: 'asc' },
            include: {
              assignees: {
                include: {
                  user: {
                    select: { name: true, image: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!project) return <div>project not found</div>;

  // fetch workspace members to allow assigning tasks
  const workspaceMembers = await db.workspaceMember.findMany({
    where: { workspaceId: project.workspaceId },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });
  const members = workspaceMembers.map(m => m.user);

  // fetch user permissions for the current workspace
  const permissions = await getMemberPermissions(user.id, project.workspaceId);
  const canManageProject = permissions.includes("canManageProject");

  // if user is teammate, check if they are assigned to any task in this project
  if (!canManageProject) {
    const hasAssignedTask = await db.task.findFirst({
      where: {
        projectId,
        assignees: {
          some: {
            userId: user.id
          }
        }
      }
    });

    if (!hasAssignedTask) {
      return (
        <div className="w-full h-full flex items-center justify-center p-8 mt-20">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-500">access denied</h2>
            <p className="text-sm text-muted-foreground mt-2">you are not assigned to any tasks in this project.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className='w-full h-full flex flex-col p-4 sm:p-8 overflow-hidden'>
      
      {/* project header */}
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h1 className='text-2xl font-bold text-foreground'>{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-1 text-sm">{project.description}</p>
          )}
        </div>
        {canManageProject && <EditProjectModal project={project} />}
      </div>

      {/* kanban board container */}
      <KanbanBoard initialColumns={project.columns} projectId={project.id} members={members} permissions={permissions} />
      
    </div>
  );
}
