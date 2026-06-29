"use client";

import React, { useState } from 'react';
import { Edit2, X } from 'lucide-react';
import { updateWorkspaceAction, deleteWorkspaceAction } from '@/app/actions/workspace-actions';

type Props = {
  workspace: {
    id: string;
    name: string;
    description: string | null;
  };
};

export function EditWorkspaceModal({ workspace }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="minimal-btn-secondary p-2 flex items-center gap-2 text-sm"
      >
        <Edit2 className="w-4 h-4" />
        Edit Workspace
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
            
            <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-zinc-100">Edit Workspace</h3>
            
            <form action={async (formData) => {
              await updateWorkspaceAction(formData);
              setIsOpen(false);
            }} className='flex flex-col gap-4'>
              <input type="hidden" name="workspaceId" value={workspace.id} />

              <input
                name='name'
                type='text'
                defaultValue={workspace.name}
                className='minimal-panel px-4 py-2 outline-none focus:ring-2 focus:ring-slate-900 w-full text-sm'
                required
              />

              <textarea
                name='description'
                rows={3}
                defaultValue={workspace.description || ''}
                className='minimal-panel px-4 py-2 outline-none focus:ring-2 focus:ring-slate-900 w-full text-sm resize-none'
                placeholder='Workspace description...'
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
                if (confirm("Are you sure you want to delete this workspace? This will delete all its projects and tasks!")) {
                  await deleteWorkspaceAction(formData);
                  setIsOpen(false);
                }
              }}>
                <input type="hidden" name="workspaceId" value={workspace.id} />
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-md transition-colors text-sm cursor-pointer"
                >
                  Delete Workspace
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
