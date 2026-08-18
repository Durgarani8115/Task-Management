"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import ShinyText from "@/components/ui/ShinyText";

interface CTASectionProps {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  } | null;
}

export function CTASection({ user }: CTASectionProps) {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-900/20 via-slate-900/90 to-slate-950 p-8 sm:p-12 md:p-16 text-center shadow-2xl overflow-hidden backdrop-blur-2xl">
          {/* background subtle green radial blur */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-emerald-500/20 blur-3xl" />

          {/* cta badge */}
          <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20 mb-6">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Start Planning Today
          </div>

          {/* main title */}
          <h2 className="relative z-10 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto">
            Take control of your workflow with{" "}
            <ShinyText text="Clove Workspace" color="#22c55e" shineColor="#ffffff" speed={3} />
          </h2>

          <p className="relative z-10 mt-4 max-w-xl mx-auto text-base sm:text-lg text-slate-300">
            Join developers, designers, and project managers keeping their work synchronized with minimal overhead.
          </p>

          {/* cta action button */}
          <div className="relative z-10 mt-8 flex justify-center">
            <Link
              href={user ? "/dashboard" : "/sign-in"}
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-300 hover:bg-emerald-700 hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] active:scale-[0.98]"
            >
              {user ? "Go to Dashboard" : "Get Started Now"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
