"use client";

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createWorkspaceAction } from '@/app/actions/workspace-actions';

export function CreateWorkspaceForm() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-lg hover:border-slate-400 dark:hover:border-zinc-600 transition-colors cursor-pointer bg-transparent"
      >
        <Plus className="w-8 h-8 text-slate-500 mb-2" />
        <span className="text-slate-500 font-medium">add new workspace</span>
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
            
            <h2 className='text-lg font-bold mb-4 text-slate-800 dark:text-zinc-100'>Create New Workspace</h2>
            
            <form action={async (formData) => {
              await createWorkspaceAction(formData);
              setIsOpen(false);
            }} className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1.5'>
                <label htmlFor='name' className='font-semibold text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider'>
                  Name
                </label>
                <input
                  id='name'
                  name='name'
                  type='text'
                  placeholder='Workspace name'
                  className='minimal-panel px-4 py-2 outline-none focus:ring-2 focus:ring-slate-900 w-full text-sm'
                  required
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label htmlFor='description' className='font-semibold text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider'>
                  Description
                </label>
                <textarea
                  id='description'
                  name='description'
                  rows={3}
                  className='minimal-panel px-4 py-2 outline-none focus:ring-2 focus:ring-slate-900 w-full text-sm resize-none'
                  placeholder='Workspace description (5-100 chars)'
                  required
                  minLength={5}
                  maxLength={100}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="minimal-btn-secondary px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='minimal-btn-primary px-6 py-2 text-sm'
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
