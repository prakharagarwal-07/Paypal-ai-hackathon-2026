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
        threadCount={9}
        speed={0.15}
        frequency={4.2}
        spread={0.28}
        position={0.48}
        glow={isDark ? 0.022 : 0.028}
        brightness={isDark ? 0.74 : 0.88}
        thickness={1.1}
        fade={0.015}
        mouseInteraction={true}
        pulseOnClick={true}
      />
    </div>
  );
}
