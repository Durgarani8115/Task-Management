"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Users, 
  Lock, 
  FolderKanban, 
  Bell, 
  Command, 
  Database, 
  Zap,
  Check
} from "lucide-react";
import { SpotlightCard } from "@/components/landing/spotlight-card";

export function FeatureListSection() {
  // active feature category filter tab
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // list of feature categories
  const categories = [
    { id: "all", label: "All Capabilities" },
    { id: "security", label: "Multi-Tenant & Security" },
    { id: "collaboration", label: "Team Collaboration" },
    { id: "productivity", label: "Push & Command Search" },
  ];

  // production-grade features list
  const featureItems = [
    {
      category: "security",
      title: "Multi-Tenant Data Isolation",
      badge: "Architecture",
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: Database,
      description:
        "Workspace data is strictly isolated at the query level using Neon Postgres and Prisma ORM to ensure complete client privacy.",
      highlights: [
        "Workspace-scoped schema validation",
        "Zero cross-tenant data leakage",
      ],
    },
    {
      category: "security",
      title: "Granular RBAC Permissions",
      badge: "Security",
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: Lock,
      description:
        "Role-Based Access Control (Owner, Admin, Member) gives precise authority over settings, member invitations, and project access.",
      highlights: [
        "Role-based action permissions",
        "Secure team invitation workflow",
      ],
    },
    {
      category: "collaboration",
      title: "Real-Time Team Alignment",
      badge: "Collaboration",
      badgeColor: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20",
      icon: Users,
      description:
        "Assign tasks to team members with clear priority levels (Low, Medium, High, Urgent) and track sprint milestones together.",
      highlights: [
        "Task assignee tracking & priorities",
        "Milestone due-date scheduling",
      ],
    },
    {
      category: "collaboration",
      title: "Agile Kanban Workflows",
      badge: "Workflow",
      badgeColor: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20",
      icon: FolderKanban,
      description:
        "Customizable Kanban columns allow teams to triage backlogs, manage in-progress work, and confirm completed deliverables.",
      highlights: [
        "Custom status column pipelines",
        "Drag & drop board management",
      ],
    },
    {
      category: "productivity",
      title: "Firebase FCM Push Alerts",
      badge: "Notifications",
      badgeColor: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20",
      icon: Bell,
      description:
        "Native browser Web Push alerts powered by Firebase Cloud Messaging notify members when assigned to tasks or mentioned.",
      highlights: [
        "Desktop & mobile web push alerts",
        "In-app notification drawer",
      ],
    },
    {
      category: "productivity",
      title: "Global Command Menu (Cmd+K)",
      badge: "Speed",
      badgeColor: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20",
      icon: Command,
      description:
        "Sub-second keyboard navigation palette. Search tasks, switch workspaces, or trigger quick actions without leaving the keyboard.",
      highlights: [
        "Universal Cmd+K shortcut menu",
        "Cross-workspace task search",
      ],
    },
  ];

  // filter features based on selected tab
  const filteredFeatures =
    activeCategory === "all"
      ? featureItems
      : featureItems.filter((item) => item.category === activeCategory);

  return (
    <section className="relative py-20 md:py-28 bg-slate-50/60 dark:bg-slate-950/70 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* section header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Enterprise Platform Capabilities
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 sm:text-4xl md:text-5xl tracking-tight">
            Built with production SaaS standards
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Engineered to mirror real-world software engineering practices—from database multi-tenancy to background push alerts.
          </p>
        </div>

        {/* category filter buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                activeCategory === cat.id
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* features grid list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <SpotlightCard key={idx} className="p-6 group flex flex-col justify-between">
                <div>
                  {/* card header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* title & description */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* highlight bullet list */}
                <div className="mt-6 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
                  {item.highlights.map((point, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
