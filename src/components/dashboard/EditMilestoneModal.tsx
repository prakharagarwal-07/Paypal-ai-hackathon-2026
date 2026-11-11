"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, Calendar, DollarSign, Edit3, AlertCircle, Lock, ShieldCheck } from "lucide-react";
import { Milestone, ProjectContract, isProjectAccepted } from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";

interface EditMilestoneModalProps {
  project: ProjectContract | null;
  milestone: Milestone | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditMilestoneModal({
  project,
  milestone,
  isOpen,
  onClose,
}: EditMilestoneModalProps) {
  const { editMilestone, role } = useDashboard();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");
  const [hasMutualConsent, setHasMutualConsent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const dateInputRef = useRef<HTMLInputElement>(null);

  const isAccepted = project ? isProjectAccepted(project) : false;
  const curr = milestone?.currency || project?.currency || "USD";
  const currSym = curr.toUpperCase() === "INR" ? "₹" : "$";
  const otherPartyName = project
    ? role === "client"
      ? project.freelancer.name
      : project.client.name
    : "Counterparty";

  useEffect(() => {
    if (milestone) {
      setTitle(milestone.title);
      setDescription(milestone.description);
      setAmount(milestone.amount);
      setDueDate(milestone.dueDate || "");
      setHasMutualConsent(false);
      setFormError(null);
    }
  }, [milestone]);

  if (!isOpen || !project || !milestone) return null;

  // Convert "Dec 25, 2026" or other valid date strings to "YYYY-MM-DD" for native picker
  const toIsoValue = (str: string) => {
    if (!str) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const parsed = Date.parse(str);
    if (!isNaN(parsed)) {
      const d = new Date(parsed);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    return "";
  };

  // Convert "YYYY-MM-DD" from native picker to "MMM DD, YYYY"
  const fromIsoValue = (isoStr: string) => {
    if (!isoStr) return "";
    const parts = isoStr.split("-").map(Number);
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const d = new Date(year, month - 1, day);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
    }
    return isoStr;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Milestone title cannot be empty.");
      return;
    }

    if (isAccepted && !hasMutualConsent) {
      setFormError(`Please confirm mutual consent with ${otherPartyName} before saving changes.`);
      return;
    }

    const numAmount = Number(amount);
    if (!isAccepted && (isNaN(numAmount) || numAmount <= 0)) {
      setFormError("Amount must be a positive number.");
      return;
    }

    editMilestone(project.id, milestone.id, {
      title: title.trim(),
      description: description.trim(),
      // Once accepted, price is locked to original contract amount
      amount: isAccepted ? milestone.amount : numAmount,
      dueDate: dueDate.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0D1527] space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0070BA] dark:bg-sky-950/50 dark:text-sky-300">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Edit Milestone 0{milestone.stageNumber}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Project: {project.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Banner */}
        {formError && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Milestone Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0070BA]/40"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Deliverables & Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0070BA]/40 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Amount ({currSym} {curr})
                </label>
                {isAccepted && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>Price Locked</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  {currSym}
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  disabled={isAccepted}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className={`w-full pl-8 pr-8 py-2.5 rounded-xl border font-mono text-xs ${
                    isAccepted
                      ? "border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 cursor-not-allowed select-none opacity-80"
                      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0070BA]/40"
                  }`}
                  required
                />
                {isAccepted && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
              {isAccepted && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-tight">
                  Milestone price cannot be modified once accepted.
                </p>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Expected Due Date
              </label>
              <div className="relative flex items-center w-full">
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="e.g. Dec 25, 2026"
                  className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0070BA]/40 text-xs"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={toIsoValue(dueDate)}
                    onChange={(e) => {
                      if (e.target.value) {
                        setDueDate(fromIsoValue(e.target.value));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    aria-label="Select milestone due date"
                  />
                  <div className="p-1 rounded-md text-slate-400 hover:text-[#0070BA] dark:hover:text-sky-400 transition-colors pointer-events-none">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mutual Consent Requirement when contract is active */}
          {isAccepted && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
              <div className="flex items-start gap-2 text-[11px] text-blue-950 dark:text-sky-200">
                <ShieldCheck className="h-4 w-4 text-[#0070BA] dark:text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Mutual Consent:</strong> Deliverable scope and timeline updates are editable with mutual agreement with <strong>{otherPartyName}</strong>.
                </span>
              </div>
              <label className="flex items-start gap-2 cursor-pointer select-none text-[11px] text-slate-700 dark:text-slate-300 pt-0.5">
                <input
                  type="checkbox"
                  checked={hasMutualConsent}
                  onChange={(e) => {
                    setHasMutualConsent(e.target.checked);
                    if (formError) setFormError(null);
                  }}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[#0070BA] focus:ring-[#0070BA] cursor-pointer"
                />
                <span>
                  I confirm these deliverable/timeline updates have been mutually agreed with <strong>{otherPartyName}</strong>.
                </span>
              </label>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
