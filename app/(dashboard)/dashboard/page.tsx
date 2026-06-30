import React from 'react';
import db from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, MoreHorizontal, BarChart3, CheckCircle2, AlertTriangle, FolderKanban, LayoutGrid, Clock, User, ChevronRight } from 'lucide-react';
import { AnalyticsChart } from '@/components/dashboard/analytics-chart';
import { CreateTaskModal } from '@/components/board/create-task-modal';
import { TaskCard } from '@/components/board/task-card';
import { KanbanBoard } from '@/components/board/kanban-board';
import { getMemberPermissions } from '@/lib/rbac';

type Props = {
  searchParams: Promise<{
    workspaceId?: string;
    projectId?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  // authenticate user
  const user = await getServerSession();
  if (!user) redirect('/sign-in');

  const resolvedParams = await searchParams;
  const workspaceId = resolvedParams.workspaceId;
  const projectId = resolvedParams.projectId;

  // fetch user's workspaces and their projects for the selectors
  const userMemberships = await db.workspaceMember.findMany({
    where: { userId: user.id },
    include: {
      workspace: {
        include: {
          projects: {
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  const workspaces = userMemberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    projects: m.workspace.projects.map((p) => ({
      id: p.id,
      name: p.name,
    })),
  }));

  // if a project is selected, fetch its columns and tasks
  let project = null;
  if (projectId) {
    project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                assignees: {
                  include: {
                    user: {
                      select: { name: true, image: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  // fetch workspace members to allow assigning tasks
  let members: any[] = [];
  let permissions: string[] = [];
  if (project) {
    const workspaceMembers = await db.workspaceMember.findMany({
      where: { workspaceId: project.workspaceId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    members = workspaceMembers.map(m => m.user);
    permissions = await getMemberPermissions(user.id, project.workspaceId);
  }

  // calculate summary statistics across all user workspaces for the default view
  const totalProjectsCount = workspaces.reduce((sum, w) => sum + w.projects.length, 0);

  // count total tasks assigned/accessible to user
  const totalTasksCount = await db.task.count({
    where: {
      project: {
        workspace: {
          members: {
            some: { userId: user.id }
          }
        }
      }
    }
  });

  // count completed tasks
  const completedTasksCount = await db.task.count({
    where: {
      column: {
        title: {
          equals: 'Done',
          mode: 'insensitive'
        }
      },
      project: {
        workspace: {
          members: {
            some: { userId: user.id }
          }
        }
      }
    }
  });

  // count urgent/high priority tasks
  const urgentTasksCount = await db.task.count({
    where: {
      priority: {
        in: ['HIGH', 'URGENT']
      },
      project: {
        workspace: {
          members: {
            some: { userId: user.id }
          }
        }
      }
    }
  });

  // fetch top 5 recently updated tasks
  const recentTasks = await db.task.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    where: {
      project: {
        workspace: {
          members: {
            some: { userId: user.id }
          }
        }
      }
    },
    include: {
      column: { select: { title: true } },
      project: { select: { name: true } }
    }
  });

  // fetch top 5 recent activities
  const recentActivities = await db.activityLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    where: {
      task: {
        project: {
          workspace: {
            members: {
              some: { userId: user.id }
            }
          }
        }
      }
    },
    include: {
      actor: { select: { name: true } },
      task: { select: { title: true } }
    }
  });

  // fetch priority counts for distribution
  const lowCount = await db.task.count({
    where: { priority: 'LOW', project: { workspace: { members: { some: { userId: user.id } } } } }
  });
  const mediumCount = await db.task.count({
    where: { priority: 'MEDIUM', project: { workspace: { members: { some: { userId: user.id } } } } }
  });
  const highCount = await db.task.count({
    where: { priority: 'HIGH', project: { workspace: { members: { some: { userId: user.id } } } } }
  });
  const urgentCount = await db.task.count({
    where: { priority: 'URGENT', project: { workspace: { members: { some: { userId: user.id } } } } }
  });

  return (
    <div className={`w-full h-full flex flex-col ${project ? "overflow-hidden p-4 sm:p-6" : "overflow-y-auto p-4 sm:p-6 space-y-6"}`}>
      {/* top bar with greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, <span className="text-primary">{user.name}</span>!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage, organize, and track your workspace tasks in one place.
          </p>
        </div>
      </div>

      {project ? (
        /* dynamic selected project board */
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <div className="border-b border-border pb-3 flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-primary tracking-wider uppercase">Active Project Board</span>
              <h2 className="text-xl font-bold text-foreground">{project.name}</h2>
              {project.description && <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>}
            </div>
          </div>

          <KanbanBoard initialColumns={project.columns} projectId={project.id} members={members} permissions={permissions} />
        </div>
      ) : (
        /* enterprise dashboard overview layout */
        <div className="space-y-8 flex-1 flex flex-col">
          {/* metrics summary line */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/workspaces" className="minimal-card p-5 hover:border-primary/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Workspaces Projects</span>
                  <p className="text-2xl font-extrabold text-foreground">{totalProjectsCount}</p>
                </div>
                <div className="p-2.5 bg-secondary text-primary rounded-xl">
                  <FolderKanban className="w-5 h-5" />
                </div>
              </div>
            </Link>

            <Link href={workspaceId ? `/workspaces/${workspaceId}` : "/workspaces"} className="minimal-card p-5 hover:border-primary/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Active Tasks</span>
                  <p className="text-2xl font-extrabold text-foreground">{totalTasksCount}</p>
                </div>
                <div className="p-2.5 bg-secondary text-primary rounded-xl">
                  <LayoutGrid className="w-5 h-5" />
                </div>
              </div>
            </Link>

            <Link href={workspaceId ? `/workspaces/${workspaceId}` : "/workspaces"} className="minimal-card p-5 hover:border-primary/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Completed Tasks</span>
                  <p className="text-2xl font-extrabold text-foreground">{completedTasksCount}</p>
                </div>
                <div className="p-2.5 bg-secondary text-primary rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </Link>

            <Link href={workspaceId ? `/workspaces/${workspaceId}` : "/workspaces"} className="minimal-card p-5 hover:border-primary/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Critical Items</span>
                  <p className="text-2xl font-extrabold text-foreground">{urgentTasksCount}</p>
                </div>
                <div className="p-2.5 bg-secondary text-primary rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </div>

          {/* main enterprise content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* left column: work items & activity feed (spans 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* recent work items card */}
              <div className="minimal-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Recent Work Items
                  </h3>
                </div>

                {recentTasks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border/50 text-muted-foreground font-semibold text-xs">
                          <th className="py-2.5">Task</th>
                          <th className="py-2.5">Project</th>
                          <th className="py-2.5">Status</th>
                          <th className="py-2.5">Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTasks.map((t) => (
                          <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition">
                            <td className="py-3 font-semibold text-foreground">{t.title}</td>
                            <td className="py-3 text-muted-foreground text-xs">{t.project.name}</td>
                            <td className="py-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-primary border border-border">
                                {t.column.title}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                                {t.priority}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-xs">
                    No active tasks found in your workspaces.
                  </div>
                )}
              </div>

              {/* workspace activity feed card */}
              <div className="minimal-card p-6">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-6">
                  <BarChart3 className="w-4 h-4 text-primary" /> Workspace Activity Feed
                </h3>

                {recentActivities.length > 0 ? (
                  <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/50">
                    {recentActivities.map((act) => (
                      <div key={act.id} className="flex gap-4 items-start relative pl-1.5">
                        <div className="w-6 h-6 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-xs shrink-0 z-10">
                          {act.actor.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm text-foreground">
                            <span className="font-semibold text-foreground">{act.actor.name}</span>{' '}
                            {act.action}{' '}
                            <span className="font-semibold text-primary">"{act.task.title}"</span>
                          </p>
                          <span className="text-[10px] text-muted-foreground block">
                            {new Date(act.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No recent activity logs found in this workspace.
                  </div>
                )}
              </div>
            </div>

            {/* right column: priority breakdown & team info (spans 1 col) */}
            <div className="space-y-6">
              {/* priority distribution card */}
              <div className="minimal-card p-6">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                  Analytics & Priorities
                </h3>

                <AnalyticsChart
                  activeCount={totalTasksCount}
                  completedCount={completedTasksCount}
                  urgentCount={urgentTasksCount}
                />

                <div className="space-y-4 mt-6">
                  {[
                    { label: 'Urgent', count: urgentCount, style: 'bg-red-500', pct: totalTasksCount ? (urgentCount / totalTasksCount) * 100 : 0 },
                    { label: 'High', count: highCount, style: 'bg-primary', pct: totalTasksCount ? (highCount / totalTasksCount) * 100 : 0 },
                    { label: 'Medium', count: mediumCount, style: 'bg-emerald-500', pct: totalTasksCount ? (mediumCount / totalTasksCount) * 100 : 0 },
                    { label: 'Low', count: lowCount, style: 'bg-zinc-300 dark:bg-zinc-600', pct: totalTasksCount ? (lowCount / totalTasksCount) * 100 : 0 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="text-foreground">{item.count} items</span>
                      </div>
                      <div className="h-2 w-full bg-secondary dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.style} rounded-full`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* quick actions/onboarding card */}
              <div className="minimal-btn-primary p-6">
                <h3 className="font-bold text-base text-primary-foreground">Select a Project Board</h3>
                <p className="text-xs text-primary-foreground/90 mt-2 leading-relaxed">
                  Use the Workspace and Project selectors in the header to load an interactive Kanban sprint board, create columns, and assign new tasks.
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-primary-foreground/95 cursor-pointer hover:underline gap-1">
                  Learn how TaskFlow works <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


