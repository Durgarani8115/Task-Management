"use client";

import React from "react";
import Link from "next/link";
import { CloveLogo } from "@/components/ui/clove-logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
        {/* logo brand without dot */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <CloveLogo textSize="text-xl" iconSize={24} />
          </Link>
          <span className="text-slate-400 dark:text-slate-600">|</span>
          <span>Project Management System</span>
        </div>


        {/* copyright & text */}
        <p className="text-center sm:text-right">
          © {new Date().getFullYear()} Clove Workspace. Built with Next.js, ReactBits & Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
