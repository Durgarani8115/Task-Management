import React from 'react'
import db from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CreateProjectForm } from '@/components/project/project-form';

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
    <div className='w-full px-4 py-6 sm:p-6 max-w-6xl mx-auto'>
      <div className="mb-8">
        <h1 className='text-3xl font-bold'>{workspace.name}</h1>
        {workspace.description && (
          <p className="text-gray-500 mt-2">{workspace.description}</p>
        )}
      </div>

      <h2 className='text-xl font-semibold mb-4'>projects</h2>
      
      {/* grid to display projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {projects.map((proj) => (
          <Link 
            key={proj.id} 
            href={`/workspaces/projects/${proj.id}`}
            className="flex flex-col p-5 border rounded-md hover:border-black transition-colors min-h-[120px] h-full"
          >
            <h3 className="font-semibold text-lg">{proj.name}</h3>
            {proj.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{proj.description}</p>
            )}
          </Link>
        ))}

        {/* create new project tile */}
        <CreateProjectForm workspaceId={workspace.id} />
      </div>
    </div>
  )
}
