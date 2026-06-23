import React from 'react';
import { Flag, MessageSquare, Link2, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';

type TaskCardProps = {
  task: any; 
};

// helper to get priority colors
function getPriorityColor(priority: string) {
  switch (priority) {
    case 'LOW': return 'bg-blue-100 text-blue-600';
    case 'MEDIUM': return 'bg-orange-100 text-orange-600';
    case 'HIGH': return 'bg-red-100 text-red-600';
    case 'URGENT': return 'bg-red-200 text-red-700 font-bold';
    default: return 'bg-gray-100 text-gray-600';
  }
}

// helper to get tag styling based on text
function getTagStyle(tag: string) {
  if (tag === 'Not Started') return 'text-indigo-600 bg-indigo-50';
  if (tag === 'In Research') return 'text-amber-600 bg-amber-50';
  if (tag === 'On Track') return 'text-pink-600 bg-pink-50';
  if (tag === 'Complete') return 'text-emerald-600 bg-emerald-50';
  return 'text-gray-600 bg-gray-50';
}

export function TaskCard({ task }: TaskCardProps) {
  // Mock tags based on the screenshot since we don't have tags in the DB yet
  const tagText = task.position % 2 === 0 ? "In Research" : "Not Started"; 
  
  const formattedDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : "No date";

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-gray-300 transition-colors cursor-grab flex flex-col gap-3">
      
      {/* Top row: Tag & Options */}
      <div className="flex justify-between items-center">
        <div className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 ${getTagStyle(tagText)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {tagText}
        </div>
        <button className="text-gray-400 hover:text-black">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="font-bold text-[15px] text-gray-900 leading-tight">{task.title}</h4>
        {task.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
        )}
      </div>

      {/* Assignees placeholder */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-gray-500">Asignees :</span>
        <div className="flex -space-x-1.5">
          <Image src="/girl3.jpg" alt="assignee" width={18} height={18} className="rounded-full ring-2 ring-white" />
          <div className="w-[18px] h-[18px] rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-[8px] font-bold text-gray-600">
            +
          </div>
        </div>
      </div>

      {/* Footer row: Date & Priority */}
      <div className="flex justify-between items-center mt-1">
        <div className="flex items-center text-xs text-gray-400 gap-1.5 font-medium">
          <Flag className="w-3.5 h-3.5" />
          {formattedDate}
        </div>
        <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority === 'LOW' ? 'Low' : task.priority === 'MEDIUM' ? 'Medium' : task.priority === 'HIGH' ? 'High' : 'Urgent'}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400 font-medium border-t border-gray-50 pt-3 mt-1">
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" />
          no Comments
        </div>
        <div className="flex items-center gap-1">
          <Link2 className="w-3.5 h-3.5" />
          1 Links
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 border border-gray-400 rounded-sm flex items-center justify-center text-[8px]">✓</span>
          0/3
        </div>
      </div>

    </div>
  );
}
