"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";
import { 
  Users, 
  Briefcase, 
  CheckSquare, 
  AlertCircle, 
  X,
  TrendingUp,
  Layers
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type Task = {
  id: string;
  title: string;
  priority: string;
  dueDate: Date | null;
  columnId: string;
  projectId: string;
  project?: { name: string };
  column: { title: string };
  assignees: { userId: string; user: { name: string; email: string } }[];
  createdAt: Date;
  updatedAt: Date;
};

type Project = {
  id: string;
  name: string;
  columns: { id: string; title: string }[];
  tasks: Task[];
};

type WorkspaceMember = {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type Workspace = {
  id: string;
  name: string;
  description: string | null;
  projects: Project[];
  members: WorkspaceMember[];
};

type Props = {
  workspaces: Workspace[];
};

type StatusCategory = "Not Started" | "In Research" | "On Track" | "Complete";

// helper to classify task status column title
function getStatusCategory(columnTitle: string): StatusCategory {
  const t = columnTitle.toLowerCase();
  if (t.includes("todo") || t.includes("to do") || t.includes("not started") || t.includes("backlog")) {
    return "Not Started";
  }
  if (t.includes("progress") || t.includes("research") || t.includes("working") || t.includes("active")) {
    return "In Research";
  }
  if (t.includes("track") || t.includes("review") || t.includes("verify") || t.includes("test")) {
    return "On Track";
  }
  if (t.includes("done") || t.includes("complete") || t.includes("finish") || t.includes("resolved")) {
    return "Complete";
  }
  return "Not Started";
}

const COLORS = {
  "Not Started": "#71717a", // zinc
  "In Research": "#10b981", // emerald
  "On Track": "#22c55e",    // green
  "Complete": "#09090b"     // black / primary
};

export function GlobalAnalytics({ workspaces }: Props) {
  const [mounted, setMounted] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<{
    memberName: string;
    status: StatusCategory | "Total";
    tasks: Task[];
  } | null>(null);

  // track if component is mounted on client to prevent ssr chart issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // filter active workspaces based on selector
  const activeWorkspaces = selectedWorkspaceId === "all"
    ? workspaces
    : workspaces.filter((w) => w.id === selectedWorkspaceId);

  // gather all projects across active workspaces
  const activeProjects: Project[] = [];
  activeWorkspaces.forEach((ws) => {
    activeProjects.push(...(ws.projects || []));
  });

  // gather all tasks across active workspaces
  const allTasks: Task[] = [];
  activeProjects.forEach((proj) => {
    if (proj.tasks) {
      proj.tasks.forEach((t) => {
        allTasks.push({
          ...t,
          project: { name: proj.name }
        });
      });
    }
  });

  // gather all unique members across active workspaces
  const uniqueMembersMap = new Map<string, { id: string; userId: string; name: string; email: string }>();
  activeWorkspaces.forEach((ws) => {
    if (ws.members) {
      ws.members.forEach((m) => {
        if (!uniqueMembersMap.has(m.userId)) {
          uniqueMembersMap.set(m.userId, {
            id: m.id,
            userId: m.userId,
            name: m.user.name,
            email: m.user.email
          });
        }
      });
    }
  });
  const activeMembersList = Array.from(uniqueMembersMap.values());

  // compute aggregates
  const totalWorkspaces = activeWorkspaces.length;
  const totalProjects = activeProjects.length;
  const totalTasks = allTasks.length;
  
  const completedTasks = allTasks.filter(
    (t) => getStatusCategory(t.column?.title || "Not Started") === "Complete"
  );
  const activeTasksCount = totalTasks - completedTasks.length;

  // process member contributions
  const memberStats = activeMembersList.map((member) => {
    const memberTasks = allTasks.filter((t) =>
      t.assignees?.some((a) => a.userId === member.userId)
    );

    const notStarted = memberTasks.filter(
      (t) => getStatusCategory(t.column?.title || "Not Started") === "Not Started"
    );
    const inResearch = memberTasks.filter(
      (t) => getStatusCategory(t.column?.title || "Not Started") === "In Research"
    );
    const onTrack = memberTasks.filter(
      (t) => getStatusCategory(t.column?.title || "Not Started") === "On Track"
    );
    const complete = memberTasks.filter(
      (t) => getStatusCategory(t.column?.title || "Not Started") === "Complete"
    );

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      tasks: {
        "Not Started": notStarted,
        "In Research": inResearch,
        "On Track": onTrack,
        "Complete": complete,
        Total: memberTasks,
      }
    };
  });

  // check if there are any unassigned tasks
  const unassignedTasks = allTasks.filter((t) => !t.assignees || t.assignees.length === 0);

  const unassignedStats = {
    name: "Unassigned Tasks",
    email: "tasks with no assigned team members",
    tasks: {
      "Not Started": unassignedTasks.filter(
        (t) => getStatusCategory(t.column?.title || "Not Started") === "Not Started"
      ),
      "In Research": unassignedTasks.filter(
        (t) => getStatusCategory(t.column?.title || "Not Started") === "In Research"
      ),
      "On Track": unassignedTasks.filter(
        (t) => getStatusCategory(t.column?.title || "Not Started") === "On Track"
      ),
      "Complete": unassignedTasks.filter(
        (t) => getStatusCategory(t.column?.title || "Not Started") === "Complete"
      ),
      Total: unassignedTasks,
    }
  };

  // compute column totals for the table footer
  const footerTotals = {
    "Not Started": allTasks.filter(
      (t) => getStatusCategory(t.column?.title || "Not Started") === "Not Started"
    ),
    "In Research": allTasks.filter(
      (t) => getStatusCategory(t.column?.title || "Not Started") === "In Research"
    ),
    "On Track": allTasks.filter(
      (t) => getStatusCategory(t.column?.title || "Not Started") === "On Track"
    ),
    "Complete": completedTasks,
    Total: allTasks
  };

  // process status distribution for pie chart
  const statusData = [
    { name: "Not Started", value: footerTotals["Not Started"].length, color: COLORS["Not Started"] },
    { name: "In Research", value: footerTotals["In Research"].length, color: COLORS["In Research"] },
    { name: "On Track", value: footerTotals["On Track"].length, color: COLORS["On Track"] },
    { name: "Complete", value: footerTotals["Complete"].length, color: COLORS["Complete"] },
  ].filter(d => d.value > 0);

  // process teammate workloads for bar chart
  const workloadData = memberStats.map((m) => ({
    name: m.name,
    "Active Tasks": m.tasks["Not Started"].length + m.tasks["In Research"].length + m.tasks["On Track"].length,
    "Completed Tasks": m.tasks["Complete"].length,
  }));

  if (unassignedTasks.length > 0) {
    workloadData.push({
      name: "Unassigned",
      "Active Tasks": unassignedStats.tasks["Not Started"].length + unassignedStats.tasks["In Research"].length + unassignedStats.tasks["On Track"].length,
      "Completed Tasks": unassignedStats.tasks["Complete"].length,
    });
  }

  // generate 14-day timeline data for the velocity chart
  const timelineData = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // cumulative metrics
    const cumulativeTotal = allTasks.filter(t => new Date(t.createdAt) <= d).length;
    const cumulativeCompleted = completedTasks.filter(t => new Date(t.updatedAt) <= d).length;

    timelineData.push({
      date: dateLabel,
      "Total Scope": cumulativeTotal,
      "Completed": cumulativeCompleted
    });
  }

  return (
    <div className="w-full px-4 py-8 sm:p-8 max-w-6xl mx-auto flex flex-col gap-8 overflow-y-auto scrollbar-thin h-full">
      
      {/* header row with workspace switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        
        
        {/* workspace filter select dropdown */}
        <div className="flex items-center gap-2 shrink-0 ">
          <label htmlFor="workspace-filter" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Workspace:
          </label>
          <select
            id="workspace-filter"
            value={selectedWorkspaceId}
            onChange={(e) => setSelectedWorkspaceId(e.target.value)}
            className="minimal-panel px-3 py-1.5 outline-none focus:ring-2 focus:ring-slate-900 text-sm font-semibold pr-8 bg-white dark:bg-zinc-950 border border-border"
          >
            <option value="all">All Workspaces</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* kpi cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {selectedWorkspaceId === "all" && (
          <div className="minimal-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-zinc-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Workspaces</span>
              <span className="text-2xl font-black text-foreground">{totalWorkspaces}</span>
            </div>
          </div>
        )}

        <div className="minimal-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Projects</span>
            <span className="text-2xl font-black text-foreground">{totalProjects}</span>
          </div>
        </div>

        <div className="minimal-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-100/40 dark:bg-emerald-950/20 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Tasks</span>
            <span className="text-2xl font-black text-foreground">{totalTasks}</span>
          </div>
        </div>

        <div className="minimal-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-100/40 dark:bg-green-950/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Completed</span>
            <span className="text-2xl font-black text-foreground">{completedTasks.length}</span>
          </div>
        </div>

        <div className="minimal-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-100/40 dark:bg-red-950/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Active</span>
            <span className="text-2xl font-black text-foreground">{activeTasksCount}</span>
          </div>
        </div>
      </div>

      {/* velocity / burn-up chart */}
      <div className="minimal-card p-6 flex flex-col gap-4 min-h-[350px]">
        <div>
          <h3 className="font-bold text-base text-foreground">Task Velocity (Last 14 Days)</h3>
          <p className="text-xs text-muted-foreground">cumulative task creation vs completion over time</p>
        </div>
        <div className="flex-1 w-full min-h-[250px] flex items-center justify-center">
          {!mounted ? (
            <div className="text-xs text-muted-foreground">loading charts...</div>
          ) : timelineData.length === 0 ? (
            <div className="text-xs text-muted-foreground italic">no tasks created yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip 
                  contentStyle={{ 
                    borderRadius: "6px", 
                    fontSize: "12px", 
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)"
                  }} 
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }} />
                <Area type="monotone" dataKey="Total Scope" stroke="#71717a" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* visual charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* status distribution chart */}
        <div className="minimal-card p-6 lg:col-span-2 flex flex-col gap-4 min-h-[350px]">
          <div>
            <h3 className="font-bold text-base text-foreground">Task Status Distribution</h3>
            <p className="text-xs text-muted-foreground">proportion of tasks by column status</p>
          </div>
          <div className="flex-1 w-full min-h-[220px] flex items-center justify-center">
            {!mounted ? (
              <div className="text-xs text-muted-foreground">loading charts...</div>
            ) : statusData.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">no tasks created yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    contentStyle={{ 
                      borderRadius: "6px", 
                      fontSize: "12px", 
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                    }} 
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* team workloads chart */}
        <div className="minimal-card p-6 lg:col-span-3 flex flex-col gap-4 min-h-[350px]">
          <div>
            <h3 className="font-bold text-base text-foreground">Team Member Workloads</h3>
            <p className="text-xs text-muted-foreground">compare active and completed tasks count per member</p>
          </div>
          <div className="flex-1 w-full min-h-[220px] flex items-center justify-center">
            {!mounted ? (
              <div className="text-xs text-muted-foreground">loading charts...</div>
            ) : workloadData.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">no members in selected workspace(s)</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip 
                    cursor={{ fill: "rgba(0,0,0,0.02)" }}
                    contentStyle={{ 
                      borderRadius: "6px", 
                      fontSize: "12px", 
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)" 
                    }} 
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="Active Tasks" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="Completed Tasks" fill="#09090b" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* team contribution table */}
      <div className="minimal-card p-6 flex flex-col gap-4">
        <div>
          <h3 className="font-bold text-base text-foreground">Team Contribution Breakdown</h3>
          <p className="text-xs text-muted-foreground">click on any status count to inspect member tasks details.</p>
        </div>
        <div className="border border-border rounded-lg overflow-hidden bg-white dark:bg-zinc-950/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-56 font-bold">Team Member</TableHead>
                <TableHead className="text-center font-bold">Not Started</TableHead>
                <TableHead className="text-center font-bold">In Research</TableHead>
                <TableHead className="text-center font-bold">On Track</TableHead>
                <TableHead className="text-center font-bold">Complete</TableHead>
                <TableHead className="text-center font-bold bg-slate-50/50 dark:bg-zinc-900/10">Total Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberStats.map((member) => (
                <TableRow key={member.id} className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/10">
                  <TableCell className="font-semibold text-slate-800 dark:text-zinc-200">
                    <div className="flex flex-col">
                      <span>{member.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">{member.email}</span>
                    </div>
                  </TableCell>
                  
                  {/* status columns count cells */}
                  {(["Not Started", "In Research", "On Track", "Complete"] as StatusCategory[]).map((status) => {
                    const tasks = member.tasks[status] || [];
                    const count = tasks.length;
                    return (
                      <TableCell key={status} className="text-center">
                        <button
                          disabled={count === 0}
                          onClick={() => setSelectedSection({ memberName: member.name, status, tasks })}
                          className={`w-7 h-7 rounded-md font-bold text-xs inline-flex items-center justify-center transition-all ${
                            count > 0
                              ? "bg-slate-100 dark:bg-zinc-900 hover:bg-primary hover:text-primary-foreground cursor-pointer"
                              : "text-slate-300 dark:text-zinc-700 pointer-events-none"
                          }`}
                        >
                          {count}
                        </button>
                      </TableCell>
                    );
                  })}

                  {/* total column count cell */}
                  <TableCell className="text-center bg-slate-50/50 dark:bg-zinc-900/10 font-bold">
                    <button
                      disabled={member.tasks.Total.length === 0}
                      onClick={() => setSelectedSection({ memberName: member.name, status: "Total", tasks: member.tasks.Total })}
                      className={`px-2.5 py-1 rounded-md font-extrabold text-xs inline-flex items-center justify-center transition-all ${
                        member.tasks.Total.length > 0
                          ? "bg-slate-200/60 dark:bg-zinc-800 hover:bg-primary hover:text-primary-foreground cursor-pointer"
                          : "text-slate-300 dark:text-zinc-700 pointer-events-none"
                      }`}
                    >
                      {member.tasks.Total.length}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {/* unassigned tasks row */}
              {unassignedTasks.length > 0 && (
                <TableRow className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/10 bg-slate-50/20 dark:bg-zinc-950/20 italic">
                  <TableCell className="font-semibold text-slate-800 dark:text-zinc-200">
                    <div className="flex flex-col">
                      <span>{unassignedStats.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">{unassignedStats.email}</span>
                    </div>
                  </TableCell>
                  {(["Not Started", "In Research", "On Track", "Complete"] as StatusCategory[]).map((status) => {
                    const tasks = unassignedStats.tasks[status] || [];
                    const count = tasks.length;
                    return (
                      <TableCell key={status} className="text-center">
                        <button
                          disabled={count === 0}
                          onClick={() => setSelectedSection({ memberName: unassignedStats.name, status, tasks })}
                          className={`w-7 h-7 rounded-md font-bold text-xs inline-flex items-center justify-center transition-all ${
                            count > 0
                              ? "bg-slate-100 dark:bg-zinc-900 hover:bg-primary hover:text-primary-foreground cursor-pointer"
                              : "text-slate-300 dark:text-zinc-700 pointer-events-none"
                          }`}
                        >
                          {count}
                        </button>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center bg-slate-50/50 dark:bg-zinc-900/10 font-bold">
                    <button
                      disabled={unassignedStats.tasks.Total.length === 0}
                      onClick={() => setSelectedSection({ memberName: unassignedStats.name, status: "Total", tasks: unassignedStats.tasks.Total })}
                      className={`px-2.5 py-1 rounded-md font-extrabold text-xs inline-flex items-center justify-center transition-all ${
                        unassignedStats.tasks.Total.length > 0
                          ? "bg-slate-200/60 dark:bg-zinc-800 hover:bg-primary hover:text-primary-foreground cursor-pointer"
                          : "text-slate-300 dark:text-zinc-700 pointer-events-none"
                      }`}
                    >
                      {unassignedStats.tasks.Total.length}
                    </button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-slate-100/50 dark:bg-zinc-900/40">
                <TableCell className="font-bold text-slate-800 dark:text-zinc-200">Workspace Totals</TableCell>
                {(["Not Started", "In Research", "On Track", "Complete"] as StatusCategory[]).map((status) => {
                  const tasks = footerTotals[status] || [];
                  return (
                    <TableCell key={status} className="text-center font-black text-slate-900 dark:text-zinc-100">
                      {tasks.length}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-black text-slate-900 dark:text-zinc-100 bg-slate-200/50 dark:bg-zinc-900/60">
                  {footerTotals.Total.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      {/* side sheet task inspection drawer */}
      {selectedSection && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedSection(null)}
        >
          <div 
            className="w-[480px] max-w-full bg-background border-l border-border h-full p-6 shadow-2xl animate-in slide-in-from-right duration-250 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* drawer header */}
            <div className="flex justify-between items-start pb-4 border-b border-border">
              <div>
                <h3 className="font-bold text-lg text-foreground">{selectedSection.memberName}'s Tasks</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  showing {selectedSection.status.toLowerCase()} tasks ({selectedSection.tasks.length})
                </p>
              </div>
              <button 
                onClick={() => setSelectedSection(null)} 
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* drawer tasks list body */}
            <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 flex flex-col gap-3.5">
              {selectedSection.tasks.length === 0 ? (
                <div className="text-sm text-muted-foreground italic text-center py-10">no tasks assigned.</div>
              ) : (
                selectedSection.tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/workspaces/projects/${task.projectId}`}
                    onClick={() => setSelectedSection(null)}
                    className="minimal-card p-4 hover:border-primary/50 transition flex flex-col gap-3 cursor-pointer group bg-white dark:bg-zinc-950/20"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[9px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border/50 uppercase tracking-wide">
                        #{task.id.slice(-4).toUpperCase()}
                      </span>
                      
                      {/* priority badge */}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        task.priority === 'URGENT' ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30' :
                        task.priority === 'HIGH' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' :
                        task.priority === 'MEDIUM' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' :
                        'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                      }`}>
                        {task.priority === 'LOW' ? 'Low' : task.priority === 'MEDIUM' ? 'Medium' : task.priority === 'HIGH' ? 'High' : 'Urgent'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-100 group-hover:text-primary transition-colors leading-tight">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Project: <span className="font-semibold text-slate-700 dark:text-zinc-300">{task.project?.name || "Unknown"}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2.5 border-t border-slate-100 dark:border-zinc-900/60 mt-1">
                      <span>Status: <span className="font-medium text-slate-700 dark:text-zinc-300">{task.column?.title || "Not Started"}</span></span>
                      {task.dueDate && (
                        <span>
                          Due: {new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
