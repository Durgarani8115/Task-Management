"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Sparkles, 
  LayoutGrid, 
  BarChart3, 
  CheckCircle2, 
  Monitor, 
  Moon, 
  Sun,
  Maximize2
} from "lucide-react";
import { SpotlightCard } from "@/components/landing/spotlight-card";
import ShinyText from "@/components/ui/ShinyText";

export function AppSlideshow() {
  // active slide index
  const [currentSlide, setCurrentSlide] = useState(0);

  // auto play state
  const [isPlaying, setIsPlaying] = useState(true);

  // slides data array with real application images and interactive features
  const slides = [
    {
      id: 1,
      title: "Workspace Dashboard & Velocity Insights",
      category: "Dark Forest Interface",
      badge: "Dark Mode Native",
      image: "/images/dashboard-dark.png",
      description:
        "Comprehensive workspace hub showing cumulative 14-day task velocity curves, active task counts, workspace scope, and overall project status distribution.",
      stats: [
        { label: "Active Tasks", value: "6 Tasks" },
        { label: "Completion Rate", value: "88.5%" },
        { label: "Latency", value: "< 20ms" },
      ],
    },
    {
      id: 2,
      title: "Team Workload & Contribution Analytics",
      category: "Sage Light Interface",
      badge: "Light Mode Native",
      image: "/images/dashboard-light.png",
      description:
        "Granular team breakdown tables comparing active vs completed tasks per member. Track individual contributions across Not Started, In Research, On Track, and Completed stages.",
      stats: [
        { label: "Tracked Members", value: "5 Active" },
        { label: "Total Tasks", value: "8 Assigned" },
        { label: "Workload Balance", value: "Optimal" },
      ],
    },
    {
      id: 3,
      title: "Interactive Kanban Sprint Pipelines",
      category: "Agile Workflow",
      badge: "Drag & Drop",
      image: "/images/dashboard-dark.png",
      description:
        "Organize sprints with drag-and-drop Kanban columns. Assign priority flags (Low, Medium, High, Urgent), due dates, and workspace members with zero UI lag.",
      stats: [
        { label: "Columns", value: "Custom Stages" },
        { label: "Updates", value: "Optimistic UI" },
        { label: "Notifications", value: "FCM Push" },
      ],
    },
  ];

  // auto play timer effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  // manual navigation controls
  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-slate-50/40 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800/80">
      {/* background ambient green radial lighting */}
      <div className="pointer-events-none absolute top-1/3 right-10 h-96 w-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-96 w-96 rounded-full bg-teal-500/10 dark:bg-emerald-600/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* section header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm mb-4">
            <Monitor className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <ShinyText text="Interactive UI Showcase" color="#15803d" shineColor="#86efac" speed={3} />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 sm:text-4xl md:text-5xl tracking-tight">
            See Clove in <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 bg-clip-text text-transparent">Action</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Experience our production interface designed for high-density analytics, agile Kanban tracking, and seamless dark and light mode adaptation.
          </p>
        </div>

        {/* main interactive slideshow stage */}
        <SpotlightCard className="p-4 sm:p-8 overflow-hidden">
          {/* top controls & slide indicator bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4 mb-6">
            {/* slide tabs selector */}
            <div className="flex flex-wrap items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(index)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 border ${
                    currentSlide === index
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                      : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500/40"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      currentSlide === index ? "bg-white animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  <span>Slide 0{index + 1}</span>
                </button>
              ))}
            </div>

            {/* auto-play pause toggle & arrows */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-colors"
                title={isPlaying ? "Pause auto-slideshow" : "Play auto-slideshow"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>

              <button
                onClick={handlePrev}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* main slide presentation layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* left column: slide info details */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {slides[currentSlide].badge}
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {slides[currentSlide].title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {slides[currentSlide].description}
              </p>

              {/* stats grid */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {slides[currentSlide].stats.map((stat, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-100/70 dark:bg-slate-900 p-2.5 border border-slate-200/80 dark:border-slate-800">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">{stat.label}</span>
                    <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* right column: high-resolution image preview frame */}
            <div className="lg:col-span-8">
              <div className="group relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-slate-950 shadow-2xl transition-all hover:border-emerald-500/50">
                {/* browser chrome mockup bar */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400/50" />
                    <div className="h-3 w-3 rounded-full bg-slate-700" />
                    <span className="ml-2 text-[11px] font-mono text-slate-400 truncate">
                      clove.app / {slides[currentSlide].category.toLowerCase().replace(/\s+/g, "-")}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live UI Preview
                  </span>
                </div>

                {/* main slide image container with transition */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                  <Image
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    fill
                    className="object-cover object-top transition-all duration-500 group-hover:scale-[1.02]"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* slide progress bar bottom */}
          <div className="mt-8 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
