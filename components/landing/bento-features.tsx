"use client";

import React, { useState } from "react";
import { 
  Layers, 
  FolderKanban, 
  Bell, 
  Command, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Users, 
  Sparkles,
  ArrowRight,
  Sliders,
  Activity,
  ChevronRight,
  Terminal,
  MousePointerClick,
  Lock
} from "lucide-react";
import { SpotlightCard } from "@/components/landing/spotlight-card";
import ShinyText from "@/components/ui/ShinyText";

export function BentoFeatures() {
  // active tab state for interactive feature explorer
  const [activeFeature, setActiveFeature] = useState<number>(0);

  // sample interactive state for workspace selector feature demo
  const [selectedRole, setSelectedRole] = useState<"Owner" | "Admin" | "Member">("Admin");
  
  // sample interactive state for command menu simulator
  const [cmdSearch, setCmdSearch] = useState<string>("");

  // sample interactive state for push notification toast test
  const [toastVisible, setToastVisible] = useState<boolean>(true);

  // production level feature list with rich descriptions
  const featureList = [
    {
      id: 0,
      title: "Multi-Tenant Workspaces & RBAC",
      tagline: "Enterprise Security & Isolation",
      badge: "Architecture",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      description:
        "Isolate projects, team members, and permissions per workspace. Grant granular role-based permissions (Owner, Admin, Member) so confidential client data stays strictly scoped.",
      icon: Layers,
    },
    {
      id: 1,
      title: "Interactive Agile Kanban Boards",
      tagline: "Smooth Task Management",
      badge: "Workflow",
      badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
      description:
        "Custom status pipelines with optimistic UI updates. Categorize tasks with priority indicators (Low, Medium, High, Urgent), due dates, and assignee avatars.",
      icon: FolderKanban,
    },
    {
      id: 2,
      title: "Firebase FCM Real-Time Push Alerts",
      tagline: "Instant Cloud Messaging",
      badge: "Notifications",
      badgeColor: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      description:
        "Stay updated in real-time. Native browser background notifications alert team members immediately when assigned to a task, mentioned in comments, or when due dates approach.",
      icon: Bell,
    },
    {
      id: 3,
      title: "Global Command Palette (Cmd + K)",
      tagline: "Sub-Second Keyboard Navigation",
      badge: "Productivity",
      badgeColor: "bg-mint-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20",
      description:
        "Navigate anywhere in Clove without leaving your keyboard. Instantly search tasks across workspaces, switch themes, create projects, or execute action shortcuts.",
      icon: Command,
    },
    {
      id: 4,
      title: "Workspace Analytics & Health",
      tagline: "Data-Driven Performance",
      badge: "Insights",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      description:
        "Track team velocity, milestone progress, and completion percentages. Real-time statistical reports give team leaders complete visibility into project throughput.",
      icon: BarChart3,
    },
  ];

  return (
    <section id="features" className="relative py-24 md:py-32 bg-slate-50/70 dark:bg-slate-950/80 overflow-hidden">
      {/* ambient background green glow circles */}
      <div className="pointer-events-none absolute top-1/4 left-0 h-96 w-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-96 w-96 rounded-full bg-teal-500/10 dark:bg-emerald-600/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* main section title header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm mb-4">
            <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <ShinyText text="Production-Grade Platform" color="#15803d" shineColor="#86efac" speed={3} />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 sm:text-4xl md:text-5xl tracking-tight">
            Engineered for high-performing{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 bg-clip-text text-transparent">
              agile teams
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Explore Clove&apos;s modular architecture designed to eliminate friction, automate notifications, and keep your workspace operating at maximum velocity.
          </p>
        </div>

        {/* section 1: interactive feature explorer tabbed showcase */}
        <div className="mb-20 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-4 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* left column: feature tab selector list */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Interactive Feature Showcase
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Click any capability to test live demo
              </h3>

              <div className="space-y-2">
                {featureList.map((feat) => {
                  const Icon = feat.icon;
                  const isActive = activeFeature === feat.id;
                  return (
                    <button
                      key={feat.id}
                      onClick={() => setActiveFeature(feat.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/50 shadow-md translate-x-1"
                          : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:border-emerald-500/30"
                      }`}
                    >
                      <div
                        className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
                          isActive
                            ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                            : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`text-sm font-bold truncate ${
                              isActive
                                ? "text-emerald-700 dark:text-emerald-300"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {feat.title}
                          </h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${feat.badgeColor}`}>
                            {feat.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {feat.tagline}
                        </p>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 mt-3 transition-transform ${
                          isActive ? "text-emerald-600 dark:text-emerald-400 translate-x-0.5" : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* right column: dynamic live preview stage */}
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-950 p-6 sm:p-8 text-white min-h-[380px] flex flex-col justify-between overflow-hidden shadow-xl">
                {/* background subtle green gradient glow */}
                <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

                {/* preview header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono tracking-wider uppercase text-emerald-400">
                      Live Simulation // {featureList[activeFeature].badge}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1">
                    <MousePointerClick className="h-3 w-3 text-emerald-400" /> Interactive
                  </span>
                </div>

                {/* dynamic content depending on active feature tab */}
                <div className="my-auto">
                  {activeFeature === 0 && (
                    /* demo 0: RBAC & Workspace selector */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Selected Role Context:</span>
                        <div className="flex gap-2">
                          {(["Owner", "Admin", "Member"] as const).map((role) => (
                            <button
                              key={role}
                              onClick={() => setSelectedRole(role)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                selectedRole === role
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                              }`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                          <span className="font-semibold text-slate-200 flex items-center gap-2">
                            <Lock className="h-3.5 w-3.5 text-emerald-400" /> Permissions Matrix
                          </span>
                          <span className="text-emerald-400 font-mono text-[11px]">{selectedRole} Access Active</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center text-slate-300">
                            <span>Create & Delete Workspaces</span>
                            <span className={selectedRole === "Owner" ? "text-emerald-400 font-bold" : "text-slate-600"}>
                              {selectedRole === "Owner" ? "Allowed ✓" : "Restricted ✗"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                            <span>Manage Project Members & Roles</span>
                            <span className={selectedRole !== "Member" ? "text-emerald-400 font-bold" : "text-slate-600"}>
                              {selectedRole !== "Member" ? "Allowed ✓" : "Restricted ✗"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                            <span>Create, Assign & Move Tasks</span>
                            <span className="text-emerald-400 font-bold">Allowed ✓</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFeature === 1 && (
                    /* demo 1: Agile Kanban board simulator */
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-2">
                          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                            In Progress (1)
                          </span>
                          <div className="rounded-lg bg-slate-950 p-2.5 border border-emerald-500/30">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                              High Priority
                            </span>
                            <p className="text-xs font-medium text-slate-200 mt-1.5">
                              Setup TanStack Table filters
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-2">
                          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                            Done (1)
                          </span>
                          <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 opacity-80">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              Backend
                            </span>
                            <p className="text-xs font-medium text-slate-400 line-through mt-1.5">
                              Prisma schema database migration
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFeature === 2 && (
                    /* demo 2: FCM Push notifications simulation */
                    <div className="space-y-3">
                      {toastVisible ? (
                        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 flex items-start justify-between gap-3 shadow-lg">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                              <Bell className="h-4 w-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                                Clove FCM Push Notification
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                              </h5>
                              <p className="text-xs text-slate-300 mt-1">
                                User &quot;Dev Lead&quot; assigned task <strong>#204: Refactor Auth Middleware</strong> to you.
                              </p>
                              <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Just now • Browser Web Push</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setToastVisible(false)}
                            className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-900 rounded border border-slate-800"
                          >
                            Dismiss
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-xs text-slate-400 mb-2">Notification dismissed.</p>
                          <button
                            onClick={() => setToastVisible(true)}
                            className="text-xs font-semibold text-emerald-400 hover:underline"
                          >
                            Trigger test push notification again
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeFeature === 3 && (
                    /* demo 3: Command palette interactive search input */
                    <div className="space-y-3">
                      <div className="rounded-xl border border-emerald-500/40 bg-slate-900 p-3 flex items-center gap-3">
                        <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
                        <input
                          type="text"
                          value={cmdSearch}
                          onChange={(e) => setCmdSearch(e.target.value)}
                          placeholder="Type a command (e.g. 'theme', 'create', 'search')..."
                          className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full font-mono"
                        />
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                          ESC
                        </span>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1 text-xs font-mono">
                        <div className="p-2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex justify-between">
                          <span>&gt; Jump to: Mobile App Sprint</span>
                          <span className="text-[10px] text-slate-400">↵ Enter</span>
                        </div>
                        <div className="p-2 rounded hover:bg-slate-800 text-slate-400 flex justify-between">
                          <span>&gt; Action: Create New Workspace Task</span>
                          <span className="text-[10px] text-slate-500">Shortcut</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFeature === 4 && (
                    /* demo 4: Workspace Analytics insight chart */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Weekly Task Velocity</span>
                        <span className="text-emerald-400 font-bold">94.2% On Track</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 items-end h-28 rounded-xl border border-slate-800 bg-slate-900 p-3">
                        <div className="bg-emerald-800 rounded-t h-[45%]" />
                        <div className="bg-emerald-700 rounded-t h-[60%]" />
                        <div className="bg-emerald-600 rounded-t h-[80%]" />
                        <div className="bg-emerald-500 rounded-t h-[65%]" />
                        <div className="bg-emerald-400 rounded-t h-[95%] shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* preview footer text */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>{featureList[activeFeature].description}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* section 2: production grid of diverse green cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* green shade card 1: deep forest glass card */}
          <div className="group relative rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-slate-950 p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl hover:border-emerald-400/50 transition-all duration-300 flex flex-col justify-between">
            <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl group-hover:bg-emerald-500/30 transition-all" />
            
            <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Prisma & Neon DB Backend
              </span>
              
              <h3 className="mt-4 text-xl font-bold text-white">
                Enterprise Database Architecture
              </h3>
              
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Backed by Neon Serverless Postgres and Prisma ORM. Instant connection pooling, zero database cold starts, and relational data integrity across workspaces.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-500/20 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span>Postgres + Prisma</span>
              <span>Sub-20ms latency</span>
            </div>
          </div>

          {/* green shade card 2: mint green accent card */}
          <div className="group relative rounded-3xl border border-emerald-500/20 dark:border-emerald-500/30 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                <Sliders className="h-6 w-6" />
              </div>
              
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
                Custom Status Pipelines
              </span>
              
              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">
                Tailored Sprint Columns
              </h3>
              
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Configure your workspace columns to match your exact software lifecycle—from initial backlog triage to automated deployment confirmation.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Fully customizable per project</span>
            </div>
          </div>

          {/* green shade card 3: electric green accent card */}
          <div className="group relative rounded-3xl border border-emerald-500/20 dark:border-emerald-500/30 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-6 group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6" />
              </div>
              
              <span className="text-[11px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-500/10 px-2.5 py-1 rounded-md border border-green-500/20">
                Optimistic UI Updates
              </span>
              
              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">
                Zero UI Lag Experience
              </h3>
              
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Powered by TanStack Query & React state synchronization. Dragging tasks or editing titles updates the interface instantly while syncing background DB state.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Instant Response
              </span>
              <span>100% Sync</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
