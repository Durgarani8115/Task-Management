"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FolderKanban, Info } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

type Project = {
  id: string;
  name: string;
};

type Workspace = {
  id: string;
  name: string;
  projects: Project[];
};

export default function SidebarProjectsList({
  workspaces,
}: {
  workspaces: Workspace[];
}) {
  const searchParams = useSearchParams();
  const currentWorkspaceId = searchParams.get("workspaceId");

  // find active workspace details
  const activeWorkspace = workspaces.find((ws) => ws.id === currentWorkspaceId);
  const projects = activeWorkspace ? activeWorkspace.projects : [];

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        {activeWorkspace ? `Projects: ${activeWorkspace.name}` : "Workspace Projects"}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        {activeWorkspace ? (
          projects.length > 0 ? (
            <SidebarMenu>
              {projects.map((proj) => (
                <SidebarMenuItem key={proj.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={`/workspaces/projects/${proj.id}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <FolderKanban className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs truncate">{proj.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          ) : (
            <div className="px-3 py-2 flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
              <Info className="w-3 h-3" />
              <span>No projects created yet.</span>
            </div>
          )
        ) : (
          <div className="px-3 py-2 flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
            <Info className="w-3 h-3" />
            <span>Select workspace to view projects.</span>
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
