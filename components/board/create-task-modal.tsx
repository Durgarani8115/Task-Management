"use client";

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

type Props = {
  columnId: string;
  projectId: string;
};

export function CreateTaskModal({ columnId, projectId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center text-sm text-gray-500 hover:text-black mt-2 p-2 rounded-md hover:bg-gray-100 transition-colors w-full"
      >
        <Plus className="w-4 h-4 mr-1" />
        add task
      </button>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border shadow-lg mt-2 relative z-10">
      <button 
        onClick={() => setIsOpen(false)} 
        className="absolute top-2 right-2 text-gray-400 hover:text-black transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      <h3 className="font-semibold text-sm mb-3">create new task</h3>
      
      <form action="/api/tasks" method="post" className='flex flex-col gap-3'>
        {/* hidden fields for database relations */}
        <input type="hidden" name="columnId" value={columnId} />
        <input type="hidden" name="projectId" value={projectId} />

        <input
          name='title'
          type='text'
          placeholder='task title...'
          className='border rounded-md px-3 py-1.5 outline-none focus:ring-2 w-full text-sm'
          required
        />

        <textarea
          name='description'
          rows={2}
          className='border rounded-md px-3 py-1.5 outline-none focus:ring-2 w-full text-sm'
          placeholder='short description...'
        ></textarea>

        <div className="flex gap-2">
          <select name="priority" className="border rounded-md px-2 py-1.5 outline-none text-sm bg-transparent flex-1 cursor-pointer">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <input 
            type="date" 
            name="dueDate" 
            className="border rounded-md px-2 py-1.5 outline-none text-sm flex-1 cursor-pointer" 
          />
        </div>

        <button
          type='submit'
          className='bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors w-full text-sm mt-1'
        >
          save task
        </button>
      </form>
    </div>
  );
}
