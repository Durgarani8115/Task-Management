"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { FolderKanban, Info, Users } from "lucide-react";
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
  const pathname = usePathname();
  const currentWorkspaceId = searchParams.get("workspaceId");

  // find active workspace details
  const activeWorkspace = workspaces.find((ws) => ws.id === currentWorkspaceId);
  const projects = activeWorkspace ? activeWorkspace.projects : [];

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        {activeWorkspace ? `Workspace: ${activeWorkspace.name}` : "Workspace Projects"}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        {activeWorkspace ? (
          <div className="flex flex-col gap-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href={`/workspaces/${activeWorkspace.id}/members?workspaceId=${activeWorkspace.id}`}
                    className={`flex items-center gap-2 transition-all duration-200 rounded-md px-2 py-1.5 ${
                      pathname === `/workspaces/${activeWorkspace.id}/members`
                        ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    }`}
                  >
                    <Users className={`w-3.5 h-3.5 ${pathname === `/workspaces/${activeWorkspace.id}/members` ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-xs">Manage Members</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {projects.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">Projects</span>
                <SidebarMenu>
                  {projects.map((proj) => {
                    const isActive = pathname === `/workspaces/projects/${proj.id}`;
                    return (
                      <SidebarMenuItem key={proj.id}>
                        <SidebarMenuButton asChild>
                          <Link
                            href={`/workspaces/projects/${proj.id}`}
                            className={`flex items-center gap-2 transition-all duration-200 rounded-md px-2 py-1.5 ${
                              isActive
                                ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                            }`}
                          >
                            <FolderKanban className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="text-xs truncate">{proj.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            ) : (
              <div className="px-3 py-2 flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium border-t border-sidebar-border/30 pt-3">
                <Info className="w-3 h-3" />
                <span>No projects created yet.</span>
              </div>
            )}
          </div>
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
