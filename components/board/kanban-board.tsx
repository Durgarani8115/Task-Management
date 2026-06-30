"use client";

import React, { useState, useTransition, useEffect } from "react";
import { TaskCard } from "@/components/board/task-card";
import { CreateTaskModal } from "@/components/board/create-task-modal";
import { moveTaskAction } from "@/app/actions/task-actions";
import { Plus, MoreHorizontal } from "lucide-react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: Date | null;
  position: number;
  columnId: string;
  projectId: string;
  assignees?: any[];
};

type Column = {
  id: string;
  title: string;
  position: number;
  tasks: Task[];
};

type Props = {
  initialColumns: Column[];
  projectId: string;
  members?: any[];
  permissions?: string[];
};

export function KanbanBoard({ initialColumns, projectId, members, permissions = [] }: Props) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeDragCol, setActiveDragCol] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Keep local state in sync when server data changes
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const canEdit = permissions.includes("canEditTask");
    if (!canEdit) return;

    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;

    // Find the dragged task and its current column
    let draggedTask: Task | null = null;
    let sourceColumnId = "";

    for (const col of columns) {
      const found = col.tasks.find((t) => t.id === taskId);
      if (found) {
        draggedTask = found;
        sourceColumnId = col.id;
        break;
      }
    }

    if (!draggedTask || sourceColumnId === targetColumnId) return;

    // Optimistically update client UI
    const updatedColumns = columns.map((col) => {
      if (col.id === sourceColumnId) {
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        };
      }
      if (col.id === targetColumnId) {
        const newTask = { ...draggedTask!, columnId: targetColumnId };
        return {
          ...col,
          tasks: [...col.tasks, newTask],
        };
      }
      return col;
    });

    setColumns(updatedColumns);

    // Save to database
    startTransition(async () => {
      try {
        await moveTaskAction(taskId, targetColumnId);
      } catch (error) {
        console.error("Failed to move task:", error);
        // Revert to original state on error
        setColumns(initialColumns);
      }
    });
  };

  return (
    <div className="flex-1 overflow-x-auto flex gap-6 pb-4 items-start scrollbar-thin">
      {columns.map((column, index) => {
        // give column headings green/zinc accents
        const dotColor =
          index === 0
            ? "bg-zinc-400 dark:bg-zinc-650"
            : index === 1
            ? "bg-primary"
            : "bg-emerald-700 dark:bg-emerald-600";

        return (
          <div
            key={column.id}
            className="w-[280px] sm:w-[320px] shrink-0 minimal-panel p-4 flex flex-col max-h-full"
          >
            {/* column header */}
            <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                <h3 className="font-semibold text-foreground text-sm">
                  {column.title}
                </h3>
                <span className="text-[10px] minimal-btn-primary w-4.5 h-4.5 flex items-center justify-center rounded-full font-bold ml-1">
                  {column.tasks.length}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CreateTaskModal
                  columnId={column.id}
                  projectId={projectId}
                  variant="header"
                />
                <button type="button" className="hover:text-primary transition">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* tasks container */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                const canEdit = permissions.includes("canEditTask");
                if (canEdit) {
                  setActiveDragCol(column.id);
                }
              }}
              onDragLeave={() => {
                setActiveDragCol(null);
              }}
              onDrop={(e) => {
                setActiveDragCol(null);
                handleDrop(e, column.id);
              }}
              className={`flex flex-col gap-3 overflow-y-auto pb-2 min-h-[250px] transition-all duration-200 rounded-lg p-1 ${
                activeDragCol === column.id ? "bg-primary/5 border border-dashed border-primary/35 p-2" : ""
              }`}
            >
              {column.tasks.map((task) => (
                <TaskCard key={task.id} task={task} columns={columns} members={members} columnTitle={column.title} permissions={permissions} />
              ))}

              {/* add task button/modal */}
              {permissions.includes("canCreateTask") && (
                <CreateTaskModal columnId={column.id} projectId={projectId} />
              )}
            </div>
          </div>
        );
      })}

      {/* add column placeholder button */}
      <div className="w-[280px] sm:w-[320px] shrink-0 mt-1">
        <button
          type="button"
          className="flex items-center justify-center w-12 h-12 minimal-btn-secondary text-slate-400"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
