import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import { LayoutGrid, ArrowRight, CheckCircle2 } from "lucide-react";

export default async function HomePage() {
  // get user session to check if user is already logged in
  const user = await getServerSession();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* header section */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-green-700 p-2 text-white">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">TaskFlow</span>
          </div>

          <nav className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-semibold text-slate-600 hover:text-slate-950 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-in"
                  className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* hero section */}
      <main className="mx-auto max-w-7xl px-6 py-20 md:py-32">
        <div className="text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-700" /> Modern task management
          </p>
          
          <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
            Organize your work <br />
            <span className="bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">
              without the clutter.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 md:text-xl">
            A minimalist, collaborative workspace built for planning tasks, tracking progress, and keeping your team aligned on goals.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              href={user ? "/dashboard" : "/sign-in"}
              className="group inline-flex items-center gap-2 rounded-2xl bg-green-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-green-800 hover:shadow-xl"
            >
              {user ? "Go to Dashboard" : "Get Started for Free"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* decorative app mockup showcase */}
        <div className="mt-20 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-4">
            <div className="h-3.5 w-3.5 rounded-full bg-slate-200" />
            <div className="h-3.5 w-3.5 rounded-full bg-slate-200" />
            <div className="h-3.5 w-3.5 rounded-full bg-slate-200" />
            <div className="ml-4 h-4 w-40 rounded bg-slate-100" />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="h-4 w-1/2 rounded bg-slate-200" />
              <div className="h-16 w-full rounded-xl border border-slate-100 bg-white shadow-sm" />
              <div className="h-16 w-full rounded-xl border border-slate-100 bg-white shadow-sm" />
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="h-16 w-full rounded-xl border border-slate-100 bg-white shadow-sm" />
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-16 w-full rounded-xl border border-slate-100 bg-white shadow-sm" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

