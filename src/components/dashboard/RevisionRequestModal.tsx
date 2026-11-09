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

const COMMON_SUGGESTIONS = [
  "Include order number on customer receipt",
  "Check mobile layout and spacing",
  "Fix button alignment on smaller screens",
  "Verify form validation error messages",
];

export default function RevisionRequestModal({
  project,
  milestone,
  isOpen,
  onClose,
}: RevisionRequestModalProps) {
  const { requestChanges } = useDashboard();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please describe the changes needed.");
      return;
    }

    requestChanges(project.id, milestone.id, reason.trim());
    onClose();
  };

  const handleAddSuggestion = (sug: string) => {
    setError(null);
    if (!reason) {
      setReason(sug + ".");
    } else {
      setReason((prev) => `${prev.trim()} ${sug}.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1527] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Request Changes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {milestone.title} • {project.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300 text-xs">
            Let {project.freelancer.name} know what needs to be adjusted before you can approve this milestone.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Changes needed: *
            </label>
            <textarea
              rows={4}
              required
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Describe the adjustments needed..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            {error && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {error}
              </p>
            )}
          </div>

          {/* Quick Suggestions */}
          <div>
            <span className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddSuggestion(sug)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
