import React from 'react';
import db from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EditProjectModal } from '@/components/project/edit-project-modal';
import { KanbanBoard } from '@/components/board/kanban-board';

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
        <EditProjectModal project={project} />
      </div>

      {/* kanban board container */}
      <KanbanBoard initialColumns={project.columns} projectId={project.id} members={members} />
      
    </div>
  );
}
