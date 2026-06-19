"use client";

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export function CreateWorkspaceForm() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed rounded-md hover:border-black transition-colors cursor-pointer bg-transparent"
      >
        <Plus className="w-8 h-8 text-gray-500 mb-2" />
        <span className="text-gray-500 font-medium">add new workspace</span>
      </button>
    );
  }

  return (
    <div className="border rounded-md p-5 bg-gray-50/50 relative shadow-sm w-full">
      <button 
        onClick={() => setIsOpen(false)} 
        className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      
      <h2 className='text-lg font-semibold mb-4'>create new workspace</h2>
      <form action="/api/workspaces" method="post" className='flex flex-col gap-4'>
        <input type="hidden" name="_action" value="create" />
        
        <div className='flex flex-col gap-2'>
          <label htmlFor='name' className='font-medium text-sm'>
            name
          </label>
          <input
            id='name'
            name='name'
            type='text'
            placeholder='enter name'
            className='border rounded-md px-3 py-2 outline-none focus:ring-2 w-full text-sm sm:text-base'
            required
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
            placeholder='enter description (5-20 chars)'
            required
            minLength={5}
            maxLength={20}
          ></textarea>
        </div>

        <button
          type='submit'
          className='bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors w-full sm:w-auto sm:self-start mt-2 text-sm sm:text-base'
        >
          submit
        </button>
      </form>
    </div>
  );
}
