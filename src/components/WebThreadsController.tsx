"use client";

import { useState, useEffect } from "react";
import WebThreads from "./WebThreads";
import { Sliders, RotateCcw, X, Sparkles, Sun, ChevronUp, ChevronDown, Activity } from "lucide-react";

interface ThreadSettings {
  brightness: number;
  glow: number;
  threadCount: number;
  spread: number;
  speed: number;
  thickness: number;
}

const DEFAULT_SETTINGS: ThreadSettings = {
  brightness: 0.74,
  glow: 0.022,
  threadCount: 9,
  spread: 0.28,
  speed: 0.15,
  thickness: 1.1,
};

const PRESETS = [
  {
    name: "Default",
    settings: DEFAULT_SETTINGS,
  },
  {
    name: "Subtle",
    settings: {
      brightness: 0.52,
      glow: 0.014,
      threadCount: 7,
      spread: 0.22,
      speed: 0.12,
      thickness: 0.9,
    },
  },
  {
    name: "Vibrant",
    settings: {
      brightness: 0.76,
      glow: 0.020,
      threadCount: 9,
      spread: 0.28,
      speed: 0.15,
      thickness: 1.0,
    },
  },
  {
    name: "Luminous",
    settings: {
      brightness: 0.84,
      glow: 0.024,
      threadCount: 11,
      spread: 0.32,
      speed: 0.16,
      thickness: 1.1,
    },
  },
];

export default function WebThreadsController() {
  const [settings, setSettings] = useState<ThreadSettings>(DEFAULT_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string>("Default");
  const [isDark, setIsDark] = useState(false);

  // Sync theme changes in real-time
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

  // Load persisted user settings from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("milestone_webthreads_settings_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch {
      // fallback to default
    }
  }, []);

  // Update a single setting
  const updateSetting = (key: keyof ThreadSettings, value: number) => {
    setActivePreset("");
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem("milestone_webthreads_settings_v3", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Apply a preset
  const applyPreset = (presetName: string, presetSettings: ThreadSettings) => {
    setActivePreset(presetName);
    setSettings(presetSettings);
    try {
      localStorage.setItem("milestone_webthreads_settings_v3", JSON.stringify(presetSettings));
    } catch {
      // ignore
    }
  };

  // Reset to default
  const handleReset = () => {
    applyPreset("Default", DEFAULT_SETTINGS);
  };

  return (
    <>
      {/* 
        FIXED FULL-PAGE WEBTHREADS BACKGROUND CANVAS:
        Receives real-time state from this controller!
      */}
      <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden pointer-events-none opacity-90 dark:opacity-85 transition-opacity duration-300">
        <WebThreads
          colors={["#00E599", "#0070BA", "#38BDF8", "#10B981", "#6366F1"]}
          coreColor="#FFFFFF"
          lightMode={false}
          threadCount={settings.threadCount}
          speed={settings.speed}
          frequency={4.2}
          spread={settings.spread}
          position={0.48}
          glow={isDark ? settings.glow : settings.glow * 1.25}
          brightness={isDark ? settings.brightness : settings.brightness * 1.2}
          thickness={settings.thickness}
          fade={0.015}
          mouseInteraction={true}
          pulseOnClick={true}
        />
      </div>

      {/* 
        INTERACTIVE FLOATING CONTROL PANEL:
        Positioned at bottom-right for easy real-time visual adjustment
      */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
        {/* Expanded Controls Card */}
        {isOpen && (
          <div className="mb-3 w-80 sm:w-96 rounded-3xl border border-white/20 bg-slate-950/90 dark:bg-black/92 p-5 text-white shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                    <span>Web Threads Studio</span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h4>
                  <p className="text-[11px] text-slate-400">Real-time background adjustments</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Reset to default"
                  aria-label="Reset"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Close panel"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-3.5 flex items-center gap-1.5">
              {PRESETS.map((p) => {
                const isSelected = activePreset === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p.name, p.settings)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${
                      isSelected
                        ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                        : "bg-white/10 hover:bg-white/15 text-slate-300"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>

            {/* Sliders Container */}
            <div className="mt-4 space-y-3.5 text-xs">
              {/* 1. BRIGHTNESS SLIDER */}
              <div>
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span>Brightness</span>
                  </span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                    {settings.brightness.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="1.40"
                  step="0.02"
                  value={settings.brightness}
                  onChange={(e) => updateSetting("brightness", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* 2. GLOW SLIDER */}
              <div>
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Glow</span>
                  </span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                    {settings.glow.toFixed(3)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.005"
                  max="0.045"
                  step="0.001"
                  value={settings.glow}
                  onChange={(e) => updateSetting("glow", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* 3. NUMBER OF LINES (THREAD COUNT) */}
              <div>
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-sky-400" />
                    <span>Number of Lines</span>
                  </span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                    {settings.threadCount} lines
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={settings.threadCount}
                  onChange={(e) => updateSetting("threadCount", parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* 4. SPREAD SLIDER */}
              <div>
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <span>Spread</span>
                  </span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                    {settings.spread.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.01"
                  value={settings.spread}
                  onChange={(e) => updateSetting("spread", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* 5. THICKNESS SLIDER */}
              <div>
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span>Line Thickness</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                    {settings.thickness.toFixed(1)}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.1"
                  value={settings.thickness}
                  onChange={(e) => updateSetting("thickness", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* 6. SPEED SLIDER */}
              <div>
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span>Speed</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                    {settings.speed.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.40"
                  step="0.01"
                  value={settings.speed}
                  onChange={(e) => updateSetting("speed", parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border shadow-xl backdrop-blur-xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? "bg-slate-900 text-white border-white/20"
              : "bg-white/90 text-slate-900 border-slate-200/80 hover:scale-105 hover:bg-white hover:border-emerald-400/80 dark:bg-slate-900/90 dark:text-white dark:border-white/15 dark:hover:border-emerald-500/50"
          }`}
          aria-label="Toggle background control panel"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Sliders className="h-3 w-3" />
          </div>
          <span className="text-xs font-bold tracking-tight">Adjust Web Threads</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
            {(settings.brightness * 100).toFixed(0)}%
          </span>
          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>
    </>
  );
}
