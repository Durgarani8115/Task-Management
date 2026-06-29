"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, FolderKanban } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Project = {
  id: string;
  name: string;
};

type Workspace = {
  id: string;
  name: string;
  projects: Project[];
};

export default function DashboardSelector({
  workspaces,
}: {
  workspaces: Workspace[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // read current workspace and project IDs from client-side search params
  const currentWorkspaceId = searchParams.get("workspaceId");
  const currentProjectId = searchParams.get("projectId");

  // find projects for currently selected workspace
  const selectedWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);
  const projects = selectedWorkspace ? selectedWorkspace.projects : [];

  const handleWorkspaceChange = (wsId: string) => {
    const targetWs = wsId === "none" ? "" : wsId;
    const params = new URLSearchParams(searchParams.toString());
    
    // update url parameters on workspace change
    if (targetWs) {
      params.set("workspaceId", targetWs);
      params.delete("projectId"); // reset project selection
    } else {
      params.delete("workspaceId");
      params.delete("projectId");
    }

    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  };

  const handleProjectChange = (pId: string) => {
    const targetProj = pId === "none" ? "" : pId;
    const params = new URLSearchParams(searchParams.toString());
    
    // update url parameters on project change
    if (targetProj) {
      params.set("projectId", targetProj);
    } else {
      params.delete("projectId");
    }

    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-4 shrink-0">
      {/* workspace dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider items-center gap-1 hidden md:inline-flex">
          <Briefcase className="w-3.5 h-3.5 text-primary" /> Workspace
        </label>
        <Select
          value={currentWorkspaceId || "none"}
          onValueChange={handleWorkspaceChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-[110px] sm:w-[160px] bg-secondary border-border h-8 text-xs text-foreground cursor-pointer">
            <SelectValue placeholder="Select a workspace..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select a workspace...</SelectItem>
            {workspaces.map((ws) => (
              <SelectItem key={ws.id} value={ws.id}>
                {ws.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* project dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider items-center gap-1 hidden md:inline-flex">
          <FolderKanban className="w-3.5 h-3.5 text-primary" /> Project
        </label>
        <Select
          value={currentProjectId || "none"}
          onValueChange={handleProjectChange}
          disabled={!currentWorkspaceId || isPending}
        >
          <SelectTrigger className="w-[110px] sm:w-[160px] bg-secondary border-border h-8 text-xs text-foreground cursor-pointer">
            <SelectValue placeholder="Select a project..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select a project...</SelectItem>
            {projects.map((proj) => (
              <SelectItem key={proj.id} value={proj.id}>
                {proj.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending && (
        <span className="text-[10px] text-slate-400 animate-pulse">
          Loading...
        </span>
      )}
    </div>
  );
}
