"use client";

import { useState } from "react";
import { X, Plus, Trash2, Wallet, Sparkles, CheckCircle2 } from "lucide-react";
import { ProjectContract, Milestone } from "@/lib/dashboard-data";
import { PayPalIcon } from "./icons";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: ProjectContract) => void;
}

export default function NewProjectModal({
  isOpen,
  onClose,
  onCreateProject,
}: NewProjectModalProps) {
  const [title, setTitle] = useState("AI SaaS Agent Platform & API Sandbox");
  const [freelancerEmail, setFreelancerEmail] = useState("rohan.verma@dev.demo");
  const [freelancerName, setFreelancerName] = useState("Rohan Verma");

  const [milestones, setMilestones] = useState([
    {
      title: "Architecture & Core API Design",
      amount: 1500,
      dueDate: "Nov 20, 2026",
      criteria: "FastAPI server, PostgreSQL schema, and authentication routes.",
    },
    {
      title: "Agent Reasoning Loop & Tools",
      amount: 2000,
      dueDate: "Nov 30, 2026",
      criteria: "Gemini 2.5 Flash function calling, tool execution sandbox, and rate limiter.",
    },
    {
      title: "Frontend Dashboard & PayPal Subscription",
      amount: 1500,
      dueDate: "Dec 10, 2026",
      criteria: "Next.js 16 app with PayPal Orders v2 integration and webhook billing.",
    },
  ]);

  if (!isOpen) return null;

  const totalBudget = milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0);

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Milestone Stage ${milestones.length + 1}`,
        amount: 1000,
        dueDate: "Dec 15, 2026",
        criteria: "Define specific deliverables and criteria for AI verification.",
      },
    ]);
  };

  const removeMilestone = (idx: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== idx));
    }
  };

  const updateMilestone = (idx: number, field: string, val: any) => {
    setMilestones(
      milestones.map((m, i) => (i === idx ? { ...m, [field]: val } : m))
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedMilestones: Milestone[] = milestones.map((m, i) => ({
      id: `ms_custom_${Date.now()}_${i}`,
      stageNumber: i + 1,
      title: m.title,
      description: m.criteria,
      amount: Number(m.amount),
      currency: "USD",
      dueDate: m.dueDate,
      status: i === 0 ? "in_progress" : "upcoming",
    }));

    const newProj: ProjectContract = {
      id: `proj_${Date.now()}`,
      title,
      clientName: "Sarah Chen",
      clientEmail: "sarah.chen@client.demo",
      clientAvatar: "SC",
      freelancerName,
      freelancerEmail,
      freelancerAvatar: "RV",
      totalBudget,
      currency: "USD",
      escrowFunded: totalBudget,
      escrowReleased: 0,
      createdAt: "Today",
      status: "active",
      milestones: formattedMilestones,
    };

    onCreateProject(newProj);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-white/95 p-6 sm:p-8 text-slate-900 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#0D1527]/95 dark:text-white transition-all animate-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-white/10">
          <div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-100 text-[#0070BA] dark:bg-blue-500/20 dark:text-sky-300">
              New Milestone Contract
            </span>
            <h3 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Create & Fund with PayPal Escrow
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Lock payment into safe PayPal Sandbox escrow. Funds only release when you personally approve AI-verified deliverables.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Project Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Freelancer Name
              </label>
              <input
                type="text"
                required
                value={freelancerName}
                onChange={(e) => setFreelancerName(e.target.value)}
                className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Freelancer PayPal Email
              </label>
              <input
                type="email"
                required
                value={freelancerEmail}
                onChange={(e) => setFreelancerEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
              />
            </div>
          </div>

          {/* Milestones List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Milestone Stages ({milestones.length})
              </label>
              <button
                type="button"
                onClick={addMilestone}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0070BA] hover:underline dark:text-sky-400 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Add Stage</span>
              </button>
            </div>

            <div className="space-y-3">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-white/10 dark:bg-slate-900/40 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Stage {idx + 1}
                    </span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(idx)}
                        className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Remove stage"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Stage title..."
                        value={m.title}
                        onChange={(e) => updateMilestone(idx, "title", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-white/10 dark:bg-[#131C31] dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Price USD"
                        value={m.amount}
                        onChange={(e) => updateMilestone(idx, "amount", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-white/10 dark:bg-[#131C31] dark:text-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Acceptance criteria description (e.g. tests passing, live demo link)..."
                      value={m.criteria}
                      onChange={(e) => updateMilestone(idx, "criteria", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-white/10 dark:bg-[#131C31] dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow summary & fund action */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">
                Total Escrow Deposit
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ${totalBudget.toLocaleString()}.00 USD
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-gradient-glow w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] via-[#00A3E0] to-[#004C8F] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <PayPalIcon className="h-4 w-4" />
                <span>Fund Escrow with PayPal</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
