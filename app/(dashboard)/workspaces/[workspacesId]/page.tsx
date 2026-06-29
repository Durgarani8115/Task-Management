import React from 'react'
import db from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CreateProjectForm } from '@/components/project/project-form';
import { EditWorkspaceModal } from '@/components/workspace/edit-workspace-modal';

type Props = {
  params: Promise<{ workspacesId: string }>;
};

export default async function WorkspaceDetailPage({ params }: Props) {
  const user = await getServerSession();
  
  if (!user) {
    redirect('/sign-in'); // secure the page
  }

  // extract the dynamic id from the url
  const resolvedParams = await params;
  const workspaceId = resolvedParams.workspacesId;

  // fetch the specific workspace and its connected projects
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      projects: true // fetches all projects linked to this workspace
    }
  });

  if (!workspace) {
    return <div>workspace not found</div>;
  }

  const projects = workspace.projects || [];

  return (
    <div className='w-full px-4 py-8 sm:p-8 max-w-6xl mx-auto'>
      <div className="mb-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className='text-3xl font-bold text-foreground'>{workspace.name}</h1>
          {workspace.description && (
            <p className="text-muted-foreground mt-2">{workspace.description}</p>
          )}
        </div>
        <EditWorkspaceModal workspace={workspace} />
      </div>

      <h2 className='text-xl font-bold mb-6 text-foreground uppercase tracking-wider'>Projects</h2>
      
      {/* grid to display projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {projects.map((proj) => (
          <Link 
            key={proj.id} 
            href={`/workspaces/projects/${proj.id}`}
            className="flex flex-col p-6 minimal-card hover:border-primary hover:-translate-y-1 transition-all duration-200 min-h-[140px] h-full cursor-pointer"
          >
            <h3 className="font-bold text-lg text-foreground">{proj.name}</h3>
            {proj.description && (
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{proj.description}</p>
            )}
          </Link>
        ))}

        {/* create new project tile */}
        <CreateProjectForm workspaceId={workspace.id} />
      </div>
    </div>
  )
}
