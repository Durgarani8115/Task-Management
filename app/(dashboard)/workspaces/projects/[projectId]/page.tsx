import React from 'react';
import db from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Plus, MoreHorizontal } from 'lucide-react';
import { CreateTaskModal } from '@/components/board/create-task-modal';// using your file name exactly
import { TaskCard } from '@/components/board/task-card';

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
            orderBy: { position: 'asc' }
          }
        }
      }
    }
  });

  if (!project) return <div>project not found</div>;

  return (
    <div className='w-full h-full flex flex-col p-8 overflow-hidden bg-[#FAFBFC]'>
      
      {/* project header */}
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 mt-1 text-sm">{project.description}</p>
          )}
        </div>
      </div>

      {/* kanban board container */}
      <div className="flex-1 overflow-x-auto flex gap-6 pb-4 items-start scrollbar-thin">
        {project.columns.map((column, index) => {
          
          // give each column a unique dot color like the screenshot
          const dotColor = index === 0 ? "bg-amber-400" : index === 1 ? "bg-blue-500" : "bg-pink-500";

          return (
            <div key={column.id} className="w-[320px] shrink-0 bg-[#F4F5F7] rounded-2xl p-4 flex flex-col max-h-full">
              
              {/* column header */}
              <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                  <h3 className="font-semibold text-gray-700">{column.title}</h3>
                  <span className="text-xs bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full font-medium ml-1">
                    {column.tasks.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <button className="hover:text-black"><Plus className="w-4 h-4" /></button>
                  <button className="hover:text-black"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
              </div>

              {/* tasks container */}
              <div className="flex flex-col gap-3 overflow-y-auto pb-2">
                {column.tasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                
                {/* this is your add task button/modal! */}
                <CreateTaskModal columnId={column.id} projectId={project.id} />
              </div>

            </div>
          );
        })}
        
        {/* add column button */}
        <div className="w-[320px] shrink-0 mt-1">
          <button className="flex items-center justify-center w-12 h-12 bg-white border rounded-xl text-gray-400 hover:border-black hover:text-black shadow-sm transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
      </div>
    </div>
  );
}
