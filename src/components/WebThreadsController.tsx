"use client";

import { useState, useEffect } from "react";
import WebThreads from "./WebThreads";

export default function WebThreadsController() {
  const [isDark, setIsDark] = useState(false);

  // Sync theme changes
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden pointer-events-none opacity-90 dark:opacity-85 transition-opacity duration-300">
      <WebThreads
        colors={["#0070BA", "#00457C", "#009CDE", "#38BDF8", "#00E599"]}
        coreColor="#FFFFFF"
        lightMode={false}
        threadCount={6}
        speed={0.12}
        frequency={4.0}
        spread={0.26}
        position={0.48}
        glow={isDark ? 0.02 : 0.026}
        brightness={isDark ? 0.72 : 0.86}
        thickness={1.05}
        fade={0.015}
        mouseInteraction={true}
        pulseOnClick={true}
        dpr={1}
      />
    </div>
  );
}
