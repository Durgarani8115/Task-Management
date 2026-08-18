"use client";

import React from "react";

interface CloveLogoProps {
  // optional custom class name for container
  className?: string;
  // size of the logo icon in pixels
  iconSize?: number;
  // size class for text
  textSize?: string;
  // whether to show the text next to icon
  showText?: boolean;
}

// reusable clove logo component with icon mark and text (no dot)
export function CloveLogo({
  className = "",
  iconSize = 26,
  textSize = "text-xl",
  showText = true,
}: CloveLogoProps) {
  return (
    <div className={`flex items-center gap-2 group cursor-pointer ${className}`}>
      {/* clove brand icon mark */}
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
        >
          {/* outer diamond leaf shape */}
          <path
            d="M16 2L2 16L16 30L30 16L16 2Z"
            fill="url(#clove_grad_1)"
            fillOpacity="0.9"
          />
          {/* inner accent layer */}
          <path
            d="M16 6L6 16L16 26L26 16L16 6Z"
            fill="url(#clove_grad_2)"
          />
          {/* center diamond core */}
          <path
            d="M16 10L10 16L16 22L22 16L16 10Z"
            fill="#FFFFFF"
            fillOpacity="0.9"
          />
          <defs>
            <linearGradient id="clove_grad_1" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#059669" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="clove_grad_2" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" />
              <stop offset="1" stopColor="#34D399" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* clove brand name text without dot */}
      {showText && (
        <span
          className={`${textSize} font-black tracking-widest text-emerald-700 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-emerald-400 dark:via-emerald-200 dark:to-green-400 transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]`}
        >
          CLOVE
        </span>
      )}
    </div>
  );
}
