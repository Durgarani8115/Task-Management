"use client";

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createProjectAction } from '@/app/actions/workspace-actions';

export function CreateProjectForm({ workspaceId }: { workspaceId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed rounded-md hover:border-black transition-colors cursor-pointer bg-transparent"
      >
        <Plus className="w-8 h-8 text-gray-500 mb-2" />
        <span className="text-gray-500 font-medium">add new project</span>
      </button>
    );
  }

  return (
    <div className="border rounded-md p-5 bg-gray-50/50 relative shadow-sm w-full">
      <button 
        onClick={() => setIsOpen(false)} 
        className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        disabled={isSubmitting}
      >
        <X className="w-5 h-5" />
      </button>
      
      <h2 className='text-lg font-semibold mb-4'>create new project</h2>
      
      {/* this form will submit using a server action */}
      <form 
        action={async (formData) => {
          setIsSubmitting(true);
          try {
            await createProjectAction(formData);
            setIsOpen(false);
          } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : "failed to create project");
          } finally {
            setIsSubmitting(false);
          }
        }} 
        className='flex flex-col gap-4'
      >
        <input type="hidden" name="_action" value="create" />
        {/* we pass the workspaceid so the database knows where to link the project */}
        <input type="hidden" name="workspaceId" value={workspaceId} />
        
        <div className='flex flex-col gap-2'>
          <label htmlFor='name' className='font-medium text-sm'>
            name
          </label>
          <input
            id='name'
            name='name'
            type='text'
            placeholder='project name'
            className='border rounded-md px-3 py-2 outline-none focus:ring-2 w-full text-sm sm:text-base'
            required
            disabled={isSubmitting}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label htmlFor='description' className='font-medium text-sm'>
            description
          </label>
          <textarea
            id='description'
            name='description'
            rows={3}
            className='border rounded-md px-3 py-2 outline-none focus:ring-2 w-full text-sm sm:text-base'
            placeholder='project description'
            required
            disabled={isSubmitting}
          ></textarea>
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors w-full sm:w-auto sm:self-start mt-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSubmitting ? 'submitting...' : 'submit'}
        </button>
      </form>
    </div>
  );
}

