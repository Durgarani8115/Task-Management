"use client";

import React from "react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
        {/* logo brand */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1.5 group">
            <span className="text-xl font-black tracking-widest text-emerald-700 dark:text-emerald-400">
              CLOVE
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </Link>
          <span className="text-slate-400 dark:text-slate-600">|</span>
          <span>Minimalist Task Management System</span>
        </div>

        {/* copyright & text */}
        <p className="text-center sm:text-right">
          © {new Date().getFullYear()} Clove Workspace. Built with Next.js, ReactBits & Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
