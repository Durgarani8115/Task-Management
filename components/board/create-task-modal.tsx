"use client";

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTaskAction } from '@/app/actions/task-actions';

type Props = {
  columnId: string;
  projectId: string;
  variant?: 'header' | 'footer';
};

export function CreateTaskModal({ columnId, projectId, variant = 'footer' }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === 'header' ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="hover:text-primary transition"
        >
          <Plus className="w-4 h-4" />
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center text-sm text-slate-500 hover:text-primary mt-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors w-full"
        >
          <Plus className="w-4 h-4 mr-1" />
          add task
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="minimal-card p-6 w-[400px] max-w-[90vw] relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 dark:text-zinc-500 hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-zinc-100">Create New Task</h3>
            
            <form action={async (formData) => {
              await createTaskAction(formData);
              setIsOpen(false);
            }} className='flex flex-col gap-4'>
              <input type="hidden" name="columnId" value={columnId} />
              <input type="hidden" name="projectId" value={projectId} />

              <input
                name='title'
                type='text'
                placeholder='Task Title...'
                className='minimal-panel px-4 py-2 outline-none focus:ring-2 focus:ring-slate-900 w-full text-sm'
                required
              />

              <textarea
                name='description'
                rows={3}
                className='minimal-panel px-4 py-2 outline-none focus:ring-2 focus:ring-slate-900 w-full text-sm resize-none'
                placeholder='Short description...'
              ></textarea>

              <div className="flex gap-3">
                <div className="flex-1">
                  <Select name="priority" defaultValue="MEDIUM">
                    <SelectTrigger className="w-full minimal-panel px-3 py-2 h-9 outline-none text-sm cursor-pointer border border-border">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <input 
                  type="date" 
                  name="dueDate" 
                  className="minimal-panel px-3 py-2 outline-none text-sm flex-1 cursor-pointer border border-border h-9" 
                />
              </div>

              <button
                type='submit'
                className='minimal-btn-primary w-full py-2.5 mt-2'
              >
                Save Task
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
