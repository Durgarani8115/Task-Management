"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, Info, ChevronDown, ChevronRight, Settings } from "lucide-react";
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
  personalWorkspaces,
  assignedWorkspaces,
}: {
  personalWorkspaces: Workspace[];
  assignedWorkspaces: Workspace[];
}) {
  const pathname = usePathname();

  // track the ID of the currently expanded workspace
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(null);

  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspaceId((prevId) => (prevId === workspaceId ? null : workspaceId));
  };

  const renderWorkspaceGroup = (title: string, workspaces: Workspace[]) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        {workspaces.length > 0 ? (
          <div className="flex flex-col gap-3">
            {workspaces.map((ws) => {
              const isExpanded = expandedWorkspaceId === ws.id;

              return (
                <div key={ws.id} className="flex flex-col gap-1">
                  {/* workspace header row */}
                  <div className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-secondary/20 transition-colors">
                    <button
                      onClick={() => toggleWorkspace(ws.id)}
                      className="flex items-center gap-1.5 text-left flex-1 min-w-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-[11px] font-bold text-foreground truncate uppercase tracking-wider">
                        {ws.name}
                      </span>
                    </button>
                    <Link
                      href={`/workspaces/${ws.id}`}
                      className="text-muted-foreground hover:text-primary p-0.5 rounded transition"
                      title="workspace settings"
                    >
                      <Settings className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* projects dropdown (renders only if expanded) */}
                  {isExpanded && (
                    <div className="pl-1">
                      {ws.projects.length > 0 ? (
                        <SidebarMenu className="pl-2 border-l border-sidebar-border/50 ml-2">
                          {ws.projects.map((proj) => {
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
                                    <FolderKanban
                                      className={`w-3.5 h-3.5 ${
                                        isActive ? "text-primary" : "text-muted-foreground"
                                      }`}
                                    />
                                    <span className="text-xs truncate">{proj.name}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      ) : (
                        <div className="px-3 py-1 flex items-center gap-1 text-[10px] text-muted-foreground font-medium italic pl-6">
                          <span>no projects yet</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-3 py-2 flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
            <Info className="w-3 h-3" />
            <span>no workspaces found.</span>
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <>
      {renderWorkspaceGroup("personal workspace", personalWorkspaces)}
      {renderWorkspaceGroup("assigned workspace", assignedWorkspaces)}
    </>
  );
}
