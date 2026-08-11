"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/header/theme-toggle";

interface LandingHeaderProps {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  } | null;
}

export function LandingHeader({ user }: LandingHeaderProps) {
  // state to track if user has scrolled down
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // scroll listener to update header style dynamically
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // run check on initial mount
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "h-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm"
          : "h-20 border-b border-transparent bg-transparent backdrop-blur-none"
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 transition-all duration-300">
        {/* text-only clove logo with minimal green glowing effect */}
        <Link href="/" className="flex items-center group">
          <span className="text-2xl font-black tracking-widest text-emerald-700 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-emerald-400 dark:via-emerald-200 dark:to-green-400 transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
            CLOVE
          </span>
        </Link>

        {/* right navigation section */}
        <nav className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 shadow-sm"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-in"
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
