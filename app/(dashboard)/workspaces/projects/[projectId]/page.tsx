import React from 'react';
import db from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectBoardPage({ params }: Props) {
  // 1. secure the page
  const user = await getServerSession();
  if (!user) redirect('/sign-in');

  // 2. extract the dynamic project id from the url
  const resolvedParams = await params;
  const projectId = resolvedParams.projectId;

  // 3. fetch the project, its columns, and the tasks inside those columns
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      columns: {
        orderBy: { position: 'asc' }, // order columns correctly (1, 2, 3)
        include: {
          tasks: {
            orderBy: { position: 'asc' } // order tasks by their position in the column
          }
        }
      }
    }
  });

  if (!project) {
    return <div>project not found</div>;
  }

  return (
    <div className='w-full h-full flex flex-col p-6 overflow-hidden'>
      {/* project header */}
      <div className="mb-6 shrink-0">
        <h1 className='text-3xl font-bold'>{project.name}</h1>
        {project.description && (
          <p className="text-gray-500 mt-2">{project.description}</p>
        )}
      </div>

      {/* kanban board horizontal scroll container */}
      <div className="flex-1 overflow-x-auto flex gap-6 pb-4 items-start">
        {project.columns.map(column => (
          <div key={column.id} className="w-80 shrink-0 bg-gray-50/50 rounded-lg p-4 flex flex-col max-h-full border">
            
            {/* column header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{column.title}</h3>
              <span className="text-sm bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                {column.tasks.length}
              </span>
            </div>

            {/* task list inside the column */}
            <div className="flex flex-col gap-3 overflow-y-auto">
              {column.tasks.map(task => (
                <div key={task.id} className="bg-white p-3 rounded-md shadow-sm border border-gray-100 hover:border-black transition-colors cursor-grab">
                  <h4 className="font-medium">{task.title}</h4>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                  )}
                </div>
              ))}

              {/* add task button */}
              <button className="flex items-center text-sm text-gray-500 hover:text-black mt-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <Plus className="w-4 h-4 mr-1" />
                add task
              </button>
            </div>
          </div>
        ))}
        
        {/* optional: add column button */}
        <div className="w-80 shrink-0">
          <button className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg text-gray-500 hover:border-black hover:text-black transition-colors">
            <Plus className="w-5 h-5 mr-2" />
            add column
          </button>
        </div>
      </div>
    </div>
  );
}
