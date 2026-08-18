"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  CheckCircle2, 
  LayoutGrid, 
  Sparkles, 
  Users, 
  CheckSquare, 
  Clock, 
  ShieldCheck,
  TrendingUp,
  Plus
} from "lucide-react";
import GradientWaves from "@/components/ui/GradientWaves";
import HeroHeading from "@/components/ui/HeroHeading";
import ShinyText from "@/components/ui/ShinyText";

interface HeroSectionProps {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  } | null;
}

export function HeroSection({ user }: HeroSectionProps) {
  // active tab filter for interactive mockup
  const [activeTab, setActiveTab] = useState<"board" | "analytics">("board");

  // sample interactive tasks state for demo
  const [tasks, setTasks] = useState([
    { id: 1, title: "Design system dark & light theme", status: "Done", tag: "Design", priority: "High" },
    { id: 2, title: "Workspace role permissions", status: "In Progress", tag: "Backend", priority: "Urgent" },
    { id: 3, title: "Firebase FCM push notifications", status: "In Progress", tag: "Feature", priority: "Medium" },
    { id: 4, title: "Sprint retrospective & planning", status: "To Do", tag: "Planning", priority: "Low" },
  ]);

  // toggle task status for interactive live preview
  const toggleTask = (id: number) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextStatus = t.status === "Done" ? "To Do" : "Done";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  return (
    <div className="relative pt-24 pb-16 md:pt-32 md:pb-24">
      {/* background waves canvas with green horizon & crest colors */}
      <div 
        className="absolute inset-x-0 top-0 h-[650px] md:h-[850px] w-full z-0 opacity-80 dark:opacity-70 overflow-hidden pointer-events-auto" 
        style={{ 
          maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)", 
          WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)" 
        }}
      >
        <GradientWaves
          horizonColor="#064e3b"
          waveColor="#16a34a"
          crestColor="#86efac"
          speed={0.4}
          amplitude={2.8}
          waveScale={0.65}
          waveRatio={0.9}
          swell={30}
          turbulence={18}
          tilt={1.1}
          zoom={1.0}
          height={5.2}
          fogDepth={25}
          detail="medium"
          brightness={1.3}
          opacity={1.0}
          mouseInteraction={true}
          parallaxStrength={0.4}
          grain={true}
          grainIntensity={0.04}
        />
      </div>

      {/* main content container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* top shiny status pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-sm backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <ShinyText text="Clove - Project Management" color="#15803d" shineColor="#86efac" speed={3} />
        </div>

        {/* main interactive proximity heading */}
        <HeroHeading />

        {/* hero description paragraph */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg md:text-xl font-normal leading-relaxed">
          The green-powered, minimalist workspace built for agile teams to plan projects, track deliverables, and achieve goals together seamlessly.
        </p>

        {/* hero call to action button group */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href={user ? "/dashboard" : "/sign-in"}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-7 py-3.5 text-base font-semibold text-white shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all duration-300 hover:bg-emerald-700 hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] active:scale-[0.98]"
          >
            {user ? "Go to Dashboard" : "Get Started for Free"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 px-6 py-3.5 text-base font-semibold text-slate-800 dark:text-slate-200 backdrop-blur-md transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-emerald-500/40"
          >
            Explore Features
          </a>
        </div>

        {/* stats bullet highlights */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Multi-workspace collaboration
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Real-time push notifications
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Dark & Light mode standard
          </span>
        </div>

        {/* live interactive dashboard preview card */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl transition-all">
          {/* window controls header bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-400/50" />
              <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="ml-2 text-xs font-semibold tracking-wider uppercase text-slate-400">Clove Workspace Preview</span>
            </div>

            {/* view toggle buttons */}
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab("board")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
                  activeTab === "board"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Board View
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
                  activeTab === "analytics"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" /> Insights
              </button>
            </div>
          </div>

          {/* preview content body */}
          {activeTab === "board" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
              {/* column 1: to do */}
              <div className="space-y-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-400" /> To Do (1)
                  </span>
                  <Plus className="h-4 w-4 text-slate-400 hover:text-emerald-500 transition-colors" />
                </div>
                {tasks
                  .filter(t => t.status === "To Do")
                  .map(task => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {task.tag}
                        </span>
                        <span className="text-[10px] text-slate-400">{task.priority}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {task.title}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 2 days left</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Click to complete</span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* column 2: in progress */}
              <div className="space-y-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> In Progress (2)
                  </span>
                  <Plus className="h-4 w-4 text-slate-400 hover:text-emerald-500 transition-colors" />
                </div>
                {tasks
                  .filter(t => t.status === "In Progress")
                  .map(task => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="group rounded-xl border border-emerald-500/30 dark:border-emerald-500/30 bg-white dark:bg-slate-900 p-3.5 shadow-sm transition-all hover:border-emerald-500 hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {task.tag}
                        </span>
                        <span className="text-[10px] text-amber-500 font-medium">{task.priority}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {task.title}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3 text-emerald-500" /> Assigned</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Click to complete</span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* column 3: completed */}
              <div className="space-y-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300 tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Completed (1)
                  </span>
                </div>
                {tasks
                  .filter(t => t.status === "Done")
                  .map(task => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-3.5 shadow-sm opacity-90 transition-all hover:border-emerald-500/50 hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {task.tag}
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-500 line-through dark:text-slate-400">
                        {task.title}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Completed</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Click to reopen</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
              {/* insights stat 1 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sprint Completion Rate</span>
                <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">88.5%</p>
                <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "88.5%" }} />
                </div>
              </div>
              {/* insights stat 2 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Workspace Tasks</span>
                <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100">142 Tasks</p>
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">+12 completed this week</p>
              </div>
              {/* insights stat 3 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Team Velocity</span>
                <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">24 pts/wk</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Optimal team throughput</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
