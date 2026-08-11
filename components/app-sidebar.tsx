import {
    Sidebar,
    SidebarMenu,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarSeparator,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar"
import Link from "next/link"
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth"
import { Home, Settings, Briefcase, FolderKanban, LayoutGrid, LogOut, TrendingUp } from "lucide-react";
import SidebarProjectsList from "@/components/dashboard/sidebar-projects-list";

export async function AppSidebar() {
    // get current logged in user session
    const user = await getServerSession()

    // fetch all workspaces this user is a member of, along with their projects
    let personalWorkspaces: any[] = [];
    let assignedWorkspaces: any[] = [];
    if (user) {
        const userMemberships = await db.workspaceMember.findMany({
            where: { userId: user.id },
            include: {
                roleRef: {
                    include: {
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                },
                workspace: {
                    include: {
                        projects: {
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }
            }
        });

        for (const membership of userMemberships) {
            const hasManagePermission = membership.roleRef?.permissions.some(
                (rp) => rp.permission.name === "canManageProject"
            ) || false;

            if (hasManagePermission) {
                // managers/admins see all projects in this workspace
                if (membership.role === "OWNER") {
                    personalWorkspaces.push(membership.workspace);
                } else {
                    assignedWorkspaces.push(membership.workspace);
                }
            } else {
                // teammates only see projects where they have tasks assigned
                const assignedProjects = await db.project.findMany({
                    where: {
                        workspaceId: membership.workspaceId,
                        tasks: {
                            some: {
                                assignees: {
                                    some: {
                                        userId: user.id
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                });

                // only include the workspace if the teammate is assigned to at least one project
                if (assignedProjects.length > 0) {
                    const workspaceWithFilteredProjects = {
                        ...membership.workspace,
                        projects: assignedProjects
                    };
                    if (membership.role === "OWNER") {
                        personalWorkspaces.push(workspaceWithFilteredProjects);
                    } else {
                        assignedWorkspaces.push(workspaceWithFilteredProjects);
                    }
                }
            }
        }
    }

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
            <SidebarHeader className="bg-sidebar">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="h-auto py-2 hover:bg-transparent">
                            <Link href="/dashboard" className="flex items-center gap-2 group/sidebarlogo">
                                {/* text-only green logo for sidebar with dark glow effect */}
                                <div className="flex items-center">
                                    <span className="font-black text-lg tracking-widest text-emerald-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-emerald-400 dark:via-emerald-200 dark:to-green-400 transition-all duration-300 group-hover/sidebarlogo:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                                        CLOVE
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarSeparator className="mx-0 bg-sidebar-border opacity-50" />

            <SidebarContent className="scrollbar-thin bg-sidebar">
                {/* 1. core workspace section */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Workspace</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/dashboard" className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors">
                                        <Home className="w-4.5 h-4.5" />
                                        <span className="text-sm font-medium">Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/analytics" className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors">
                                        <TrendingUp className="w-4.5 h-4.5" />
                                        <span className="text-sm font-medium">Analytics</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/workspaces" className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors">
                                        <Settings className="w-4.5 h-4.5" />
                                        <span className="text-sm font-medium">Workspaces Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* 2. dynamic active workspace projects */}
                <SidebarProjectsList 
                    personalWorkspaces={personalWorkspaces} 
                    assignedWorkspaces={assignedWorkspaces} 
                />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center justify-between w-full px-2 py-1.5">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div className="flex flex-col overflow-hidden text-left">
                                    <span className="text-xs font-semibold text-foreground truncate">{user?.name || "Guest User"}</span>
                                    <span className="text-[10px] text-muted-foreground truncate">{user?.email || "guest@clove.com"}</span>
                                </div>
                            </div>
                            <form action="/api/auth/logout" method="POST" className="shrink-0">
                                <button
                                    type="submit"
                                    aria-label="Logout"
                                    className="p-1.5 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-secondary transition-colors cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}