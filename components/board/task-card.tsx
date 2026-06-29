"use client"

import { useState } from 'react';
import { Flag, MoreHorizontal, X } from 'lucide-react';
import { updateTaskAction } from '@/app/actions/task-actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TaskCardProps = {
  task: any; 
  columns?: any[];
  members?: any[];
  columnTitle?: string;
};

// helper to get priority colors
function getPriorityColor(priority: string) {
  switch (priority) {
    case 'LOW': return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700';
    case 'MEDIUM': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
    case 'HIGH': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 font-semibold';
    case 'URGENT': return 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 font-bold';
    default: return 'bg-slate-50 text-slate-400';
  }
}

// helper to translate column title to a friendly progress status text
function getFriendlyTagText(columnTitle: string) {
  const t = columnTitle.toLowerCase();
  if (t.includes('todo') || t.includes('to do') || t.includes('not started') || t.includes('backlog')) {
    return 'Not Started';
  }
  if (t.includes('progress') || t.includes('research') || t.includes('working') || t.includes('active')) {
    return 'In Research';
  }
  if (t.includes('track') || t.includes('review') || t.includes('verify') || t.includes('test')) {
    return 'On Track';
  }
  if (t.includes('done') || t.includes('complete') || t.includes('finish') || t.includes('resolved')) {
    return 'Complete';
  }
  return columnTitle;
}

// helper to get tag styling based on text
function getTagStyle(tag: string) {
  const t = tag.toLowerCase();
  if (t.includes('not started')) {
    return 'text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-semibold';
  }
  if (t.includes('in research')) {
    return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/20 font-semibold';
  }
  if (t.includes('on track')) {
    return 'text-green-800 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 font-semibold';
  }
  if (t.includes('complete')) {
    return 'text-primary-foreground bg-primary font-semibold';
  }
  return 'text-slate-500 bg-slate-50 border border-slate-100';
}

export function TaskCard({ task, columns, members, columnTitle }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // use column title dynamically if provided, otherwise fallback to column name or default
  const rawStatus = columnTitle || (task.column?.title) || "Not Started"; 
  const tagText = getFriendlyTagText(rawStatus);
  
  const formattedDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : "No date";

  return (
    <>
      <div 
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", task.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onClick={() => setIsEditing(true)}
        className="minimal-card p-4 hover:border-primary/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col gap-3"
      >
        
        {/* top row: tag & options */}
        <div className="flex justify-between items-center">
          <div className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1.5 ${getTagStyle(tagText)}`}>
            <span className="w-1 h-1 rounded-full bg-current"></span>
            {tagText}
          </div>
          <button className="text-slate-400 hover:text-primary transition" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* title & description */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[9px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded tracking-wide border border-border/50 uppercase">
              #{task.id.slice(-4).toUpperCase()}
            </span>
          </div>
          <h4 className="font-bold text-[14px] text-slate-800 dark:text-zinc-100 leading-tight">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
          )}
        </div>

        {/* assignees list */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">Assignees:</span>
          <div className="flex -space-x-1.5">
            {task.assignees && task.assignees.length > 0 ? (
              task.assignees.map((assignee: any) => (
                <div 
                  key={assignee.id} 
                  className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-[9px] font-bold ring-2 ring-white dark:ring-zinc-950 border border-zinc-300 dark:border-zinc-700"
                  title={assignee.user?.name || "Member"}
                >
                  {(assignee.user?.name || "M").charAt(0).toUpperCase()}
                </div>
              ))
            ) : (
              <span className="text-[10px] text-slate-400">None</span>
            )}
          </div>
        </div>

        {/* footer row: date & priority */}
        <div className="flex justify-between items-center mt-1 pt-2.5 border-t border-slate-200/50 dark:border-zinc-800/50">
          <div className="flex items-center text-xs text-slate-400 dark:text-zinc-400 gap-1.5 font-medium">
            <Flag className="w-3.5 h-3.5 text-slate-400" />
            {formattedDate}
          </div>
          <div className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority === 'LOW' ? 'Low' : task.priority === 'MEDIUM' ? 'Medium' : task.priority === 'HIGH' ? 'High' : 'Urgent'}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="minimal-card p-6 w-[500px] max-w-full relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsEditing(false)} 
              className="absolute top-4 right-4 text-slate-400 dark:text-zinc-500 hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-bold text-lg mb-4 text-slate-800">Edit Task</h3>
            
            <form action={async (formData) => {
              await updateTaskAction(formData);
              setIsEditing(false);
            }} className='flex flex-col gap-4'>
              <input type="hidden" name="taskId" value={task.id} />

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Title</label>
                <input
                  name='title'
                  type='text'
                  defaultValue={task.title}
                  className='minimal-panel px-4 py-2 outline-none focus:ring-2 focus:ring-slate-900 w-full text-sm'
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
                <textarea
                  name='description'
                  rows={4}
                  defaultValue={task.description || ''}
                  className='minimal-panel px-4 py-2 outline-none focus:ring-2 focus:ring-slate-900 w-full text-sm resize-none'
                ></textarea>
              </div>

              {columns && columns.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">Status</label>
                  <Select name="columnId" defaultValue={task.columnId}>
                    <SelectTrigger className="w-full minimal-panel px-3 py-2 h-9 outline-none text-sm cursor-pointer border border-border">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {members && members.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">Assignee</label>
                  {(() => {
                    const currentAssigneeId = task.assignees && task.assignees.length > 0
                      ? task.assignees[0].userId
                      : "none";
                    return (
                      <Select name="assigneeId" defaultValue={currentAssigneeId}>
                        <SelectTrigger className="w-full minimal-panel px-3 py-2 h-9 outline-none text-sm cursor-pointer border border-border">
                          <SelectValue placeholder="Assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  })()}
                </div>
              )}

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Priority</label>
                  <Select name="priority" defaultValue={task.priority}>
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

                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Due Date</label>
                  <input 
                    type="date" 
                    name="dueDate" 
                    defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                    className="minimal-panel w-full px-3 py-2 outline-none text-sm cursor-pointer" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="minimal-btn-secondary px-4 py-2 text-sm">
                  Cancel
                </button>
                <button type='submit' className='minimal-btn-primary px-6 py-2 text-sm'>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
