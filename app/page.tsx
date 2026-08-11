import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import { LayoutGrid, ArrowRight, CheckCircle2 } from "lucide-react";
import GradientWaves from "@/components/ui/GradientWaves";
import HeroHeading from "@/components/ui/HeroHeading";
import { LandingHeader } from "@/components/header/landing-header";

export default async function HomePage() {
  // get user session to check if user is already logged in
  const user = await getServerSession();

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors overflow-x-clip">
      {/* full screen edge-to-edge background waves */}
      <div 
        className="absolute inset-x-0 top-0 h-[700px] md:h-[900px] w-full z-0 opacity-80 dark:opacity-70 overflow-hidden pointer-events-auto" 
        style={{ 
          maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)", 
          WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)" 
        }}
      >
        <GradientWaves
          horizonColor="#064e3b"
          waveColor="#16a34a"
          crestColor="#86efac"
          speed={0.4}
          amplitude={3.0}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.11}
          zoom={1.0}
          height={5.5}
          fogDepth={25}
          detail="medium"
          brightness={1.3}
          opacity={1.0}
          mouseInteraction={true}
          parallaxStrength={0.5}
          grain={true}
          grainIntensity={0.05}
        />
      </div>

      {/* header section with scroll effect */}
      <LandingHeader user={user} />

      {/* hero section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-20 md:pt-36 md:pb-32">
        <div className="text-center pointer-events-none">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 border border-green-500/20 pointer-events-auto">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /> Modern task management
          </p>

          <HeroHeading />

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400 md:text-xl pointer-events-auto">
            A minimalist, collaborative workspace built for planning tasks, tracking progress, and keeping your team aligned on goals.
          </p>

          <div className="mt-10 flex justify-center gap-4 pointer-events-auto">
            <Link
              href={user ? "/dashboard" : "/sign-in"}
              className="group inline-flex items-center gap-2 rounded-2xl bg-green-600 px-6 py-3.5 text-base font-semibold text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] transition hover:bg-green-700 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
            >
              {user ? "Go to Dashboard" : "Get Started for Free"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* decorative app mockup showcase */}
        <div className="mt-20 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-4 shadow-2xl transition-colors">
          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="h-3.5 w-3.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="h-3.5 w-3.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="h-3.5 w-3.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="ml-4 h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50 p-4">
              <div className="h-4 w-1/2 rounded bg-slate-300 dark:bg-slate-700" />
              <div className="h-16 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm" />
              <div className="h-16 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm" />
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50 p-4">
              <div className="h-4 w-2/3 rounded bg-slate-300 dark:bg-slate-700" />
              <div className="h-16 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm" />
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50 p-4">
              <div className="h-4 w-1/3 rounded bg-slate-300 dark:bg-slate-700" />
              <div className="h-16 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
