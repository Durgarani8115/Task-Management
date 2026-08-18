"use client";

import React from "react";
import { 
  Sparkles, 
  Target, 
  Moon, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Cpu, 
  Lock 
} from "lucide-react";
import { SpotlightCard } from "@/components/landing/spotlight-card";

export function BenefitsSection() {
  // production-level benefits data with diverse green shades and technical detail
  const benefits = [
    {
      icon: Target,
      tag: "Focus & Efficiency",
      tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      title: "Eliminate Context Switching",
      description:
        "Clove combines task management, project milestones, and team assignments into a streamlined, high-speed interface. Spend time building features instead of updating complex tracking tools.",
      metrics: "3.5x Faster Task Updates",
    },
    {
      icon: TrendingUp,
      tag: "Team Velocity",
      tagColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
      title: "Crystal-Clear Sprint Alignment",
      description:
        "Give every engineer, designer, and project owner real-time visibility into task priorities, due dates, and sprint bottlenecks without status meetings.",
      metrics: "100% Milestone Visibility",
    },
    {
      icon: Moon,
      tag: "Ergonomics",
      tagColor: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      title: "Tailored Dark & Light Modes",
      description:
        "Switch seamlessly between deep forest dark mode for late night sprints and crisp sage white light mode for daytime reviews—engineered for eye comfort.",
      metrics: "Zero Strain Visual System",
    },
    {
      icon: Lock,
      tag: "Security",
      tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      title: "Workspace Scoped Isolation",
      description:
        "Strict multi-tenant workspace boundaries guarantee client privacy and role-based permissions. Control who views, creates, or manages project resources.",
      metrics: "Enterprise Scoped Protection",
    },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* background subtle green gradient lighting */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Strategic Advantages
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 sm:text-4xl md:text-5xl tracking-tight">
            Why high-growth teams prefer{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 bg-clip-text text-transparent">
              Clove Workspace
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Built specifically to address the pain points of modern remote and hybrid dev teams.
          </p>
        </div>

        {/* benefit cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <SpotlightCard key={idx} className="p-8 group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-transparent border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${benefit.tagColor}`}>
                      {benefit.tag}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {benefit.title}
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {benefit.metrics}
                  </span>
                  <span className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                    Learn more →
                  </span>
                </div>
              </SpotlightCard>
            );
          })}
        </div>

        {/* production trust banner */}
        <div className="mt-16 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-slate-950 p-6 sm:p-10 text-white shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-left">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xl">
              ✓
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-white">
                Production Ready Out-of-the-Box
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Integrated auth, Neon Postgres DB backend, FCM notifications, and dark/light theme standard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
