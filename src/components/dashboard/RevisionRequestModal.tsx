"use client";

import { useState } from "react";
import { X, AlertCircle, AlertTriangle, Send } from "lucide-react";
import { Milestone, ProjectContract } from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";

interface RevisionRequestModalProps {
  project: ProjectContract;
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_REASONS = [
  "Add idempotency key header to prevent duplicate billing",
  "Fix responsive layout shifts on 375px mobile viewports",
  "Provide automated test coverage with passing CI logs",
  "Implement retry queue for failed webhook delivery",
  "Verify HMAC signature before processing event payload",
];

export default function RevisionRequestModal({
  project,
  milestone,
  isOpen,
  onClose,
}: RevisionRequestModalProps) {
  const { requestRevision } = useDashboard();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide an explanation of the requested changes.");
      return;
    }

    requestRevision(project.id, milestone.id, reason.trim());
    onClose();
  };

  const handleAddPreset = (preset: string) => {
    setError(null);
    if (!reason) {
      setReason(preset + ".");
    } else {
      setReason((prev) => `${prev.trim()} ${preset}.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[92vh] flex flex-col transition-all">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-white/10 bg-amber-50/60 dark:bg-amber-950/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Request Milestone Revision
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stage 0{milestone.stageNumber}: {milestone.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300">
            Escrow of <span className="font-bold text-slate-900 dark:text-white">${milestone.amount.toLocaleString()} USD</span> remains safely locked. Freelancer ({project.freelancer.name}) will be prompted to resolve requested changes and resubmit for Gemini AI verification.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              What requirements need to be adjusted? *
            </label>
            <textarea
              rows={4}
              required
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Be specific about missing criteria, error codes, reproduction steps, or styling adjustments..."
              className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
            />
            {error && (
              <p className="mt-1 text-xs text-rose-500 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Preset Chips */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Quick Feedback Suggestions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REASONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 dark:bg-white/5 dark:hover:bg-amber-950/30 text-[11px] text-slate-600 dark:text-slate-300 transition-colors text-left cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Revision Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
