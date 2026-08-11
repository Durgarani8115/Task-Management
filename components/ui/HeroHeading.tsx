"use client";
import { useRef } from 'react';
import VariableProximity from './VariableProximity';
import ShinyText from './ShinyText';

export default function HeroHeading() {
  const containerRef = useRef<HTMLHeadingElement>(null);

  return (
    <h1
      ref={containerRef}
      className="mt-8 text-5xl tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl md:text-7xl pointer-events-auto cursor-default flex flex-col items-center justify-center gap-2"
    >
      <VariableProximity
        label="Organize your work"
        className="variable-proximity-demo"
        fromFontVariationSettings="'wght' 400, 'opsz' 9"
        toFontVariationSettings="'wght' 900, 'opsz' 40"
        containerRef={containerRef}
        radius={150}
        falloff="linear"
      />
      <ShinyText
        text="without the clutter."
        className="font-extrabold"
        color="#22c55e"
        shineColor="#ffffff"
      />
    </h1>
  );
}
