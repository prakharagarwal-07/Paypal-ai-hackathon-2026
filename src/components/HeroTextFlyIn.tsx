"use client";

import { useEffect, useState } from "react";

export default function HeroTextFlyIn() {
  const [scrollY, setScrollY] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    // Trigger initial cinematic entrance
    const timer = setTimeout(() => {
      setHasEntered(true);
    }, 80);

    // Scroll listener for dynamic parallax
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Subtle parallax translation as user scrolls
  const parallaxOffset = Math.min(scrollY * 0.22, 90);
  const parallaxOpacity = Math.max(1 - scrollY / 600, 0);

  return (
    <div
      style={{
        transform: `translateY(${parallaxOffset}px)`,
        opacity: parallaxOpacity,
        willChange: "transform, opacity",
      }}
      className="transition-transform duration-75 ease-out"
    >
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
        {/* Line 1: Deep high-contrast text */}
        <span
          className="block overflow-hidden pb-1"
          style={{ perspective: "1000px" }}
        >
          <span
            className="inline-block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            style={{
              transform: hasEntered
                ? "translate3d(0, 0, 0) rotate(0deg)"
                : "translate3d(-24px, 120%, 0) rotate(-3deg)",
              opacity: hasEntered ? 1 : 0,
              filter: hasEntered ? "blur(0px)" : "blur(8px)",
              transitionDelay: "120ms",
            }}
          >
            Work completed.
          </span>
        </span>

        {/* Line 2: High-contrast text */}
        <span
          className="block overflow-hidden pb-1"
          style={{ perspective: "1000px" }}
        >
          <span
            className="inline-block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            style={{
              transform: hasEntered
                ? "translate3d(0, 0, 0) rotate(0deg)"
                : "translate3d(0, 120%, 0) rotate(2deg)",
              opacity: hasEntered ? 1 : 0,
              filter: hasEntered ? "blur(0px)" : "blur(8px)",
              transitionDelay: "240ms",
            }}
          >
            Progress verified.
          </span>
        </span>

        {/* Line 3: Rich contrast gradient line */}
        <span
          className="block overflow-hidden pt-1 pb-2"
          style={{ perspective: "1000px" }}
        >
          <span
            className="inline-block bg-gradient-to-r from-emerald-700 via-teal-700 to-[#005294] dark:from-emerald-400 dark:via-teal-300 dark:to-sky-400 bg-clip-text text-transparent font-black transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
            style={{
              transform: hasEntered
                ? "translate3d(0, 0, 0) scale(1)"
                : "translate3d(0, 130%, 0) scale(0.96)",
              opacity: hasEntered ? 1 : 0,
              filter: hasEntered ? "blur(0px)" : "blur(10px)",
              transitionDelay: "380ms",
            }}
          >
            Payments made with confidence.
          </span>
        </span>
      </h1>
    </div>
  );
}
