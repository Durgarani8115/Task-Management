"use client";

import React, { useState } from 'react';
import { Settings2, X } from 'lucide-react';
import { updateProjectAction, deleteProjectAction } from '@/app/actions/workspace-actions';

type Props = {
  project: {
    id: string;
    name: string;
    description: string | null;
  };
};

export function EditProjectModal({ project }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="minimal-btn-secondary p-2 flex items-center gap-2 text-sm"
      >
        <Settings2 className="w-4 h-4" />
        Project Settings
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="minimal-card p-6 w-[400px] max-w-[90vw] relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 dark:text-zinc-500 hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-zinc-100">Project Settings</h3>
            
            <form action={async (formData) => {
              await updateProjectAction(formData);
              setIsOpen(false);
            }} className='flex flex-col gap-4'>
              <input type="hidden" name="projectId" value={project.id} />

              <input
                name='name'
                type='text'
                defaultValue={project.name}
                className='minimal-panel px-4 py-2 outline-none focus:ring-2 focus:ring-slate-900 w-full text-sm'
                required
              />

              <textarea
                name='description'
                rows={3}
                defaultValue={project.description || ''}
                className='minimal-panel px-4 py-2 outline-none focus:ring-2 focus:ring-slate-900 w-full text-sm resize-none'
                placeholder='Project description...'
              ></textarea>

              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="minimal-btn-secondary px-4 py-2 text-sm">
                  Cancel
                </button>
                <button type='submit' className='minimal-btn-primary px-6 py-2 text-sm'>
                  Save
                </button>
              </div>
            </form>

            <div className="border-t border-slate-200 dark:border-zinc-800 pt-4 mt-6">
              <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Danger Zone</h4>
              <form action={async (formData) => {
                if (confirm("Are you sure you want to delete this project? This will delete all its columns and tasks!")) {
                  await deleteProjectAction(formData);
                  setIsOpen(false);
                }
              }}>
                <input type="hidden" name="projectId" value={project.id} />
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-md transition-colors text-sm cursor-pointer"
                >
                  Delete Project
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
