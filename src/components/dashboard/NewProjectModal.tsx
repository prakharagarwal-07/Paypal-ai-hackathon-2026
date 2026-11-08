"use client";

import { useState } from "react";
import { X, Plus, Trash2, Wallet, Sparkles, CheckCircle2, User, Calendar, DollarSign, Tag } from "lucide-react";
import { FREELANCER_OPTIONS, Milestone, AcceptanceCriterion } from "@/lib/dashboard-data";
import { PayPalIcon } from "./icons";
import { useDashboard } from "@/lib/dashboard-store";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DraftMilestone {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  criteria: string[];
}

export default function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const { createProject, role } = useDashboard();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("FinTech & Payments");
  const [targetDeadline, setTargetDeadline] = useState("Dec 15, 2026");
  const [selectedFreelancerIndex, setSelectedFreelancerIndex] = useState(0);

  const [milestones, setMilestones] = useState<DraftMilestone[]>([
    {
      title: "Architecture & Tokenized System",
      description: "Application scaffolding, secure authentication, and database schema setup.",
      amount: 1500,
      dueDate: "Dec 01, 2026",
      criteria: ["Next.js 16 app router setup", "WCAG 2.1 AA accessible theme", "JWT & OAuth integration"],
    },
    {
      title: "PayPal Orders v2 Checkout & Webhooks",
      description: "Direct PayPal SDK integration, webhook microservice, and escrow release triggers.",
      amount: 2000,
      dueDate: "Dec 15, 2026",
      criteria: ["Server-side /v2/checkout/orders endpoint", "HMAC SHA-256 webhook verification", "Idempotent capture handling"],
    },
  ]);

  const [newCriteriaText, setNewCriteriaText] = useState<{ [milestoneIdx: number]: string }>({});

  if (!isOpen) return null;

  const totalBudget = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const selectedFreelancer = FREELANCER_OPTIONS[selectedFreelancerIndex];

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Milestone Stage 0${milestones.length + 1}`,
        description: "Deliverables specification and automated verification criteria.",
        amount: 1000,
        dueDate: "Dec 20, 2026",
        criteria: ["Core functionality implemented", "Passing automated unit tests"],
      },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleUpdateMilestone = (index: number, field: keyof DraftMilestone, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleAddCriterion = (milestoneIdx: number) => {
    const text = newCriteriaText[milestoneIdx]?.trim();
    if (!text) return;
    const updated = [...milestones];
    updated[milestoneIdx].criteria.push(text);
    setMilestones(updated);
    setNewCriteriaText({ ...newCriteriaText, [milestoneIdx]: "" });
  };

  const handleRemoveCriterion = (milestoneIdx: number, critIdx: number) => {
    const updated = [...milestones];
    updated[milestoneIdx].criteria = updated[milestoneIdx].criteria.filter((_, i) => i !== critIdx);
    setMilestones(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedMilestones: Milestone[] = milestones.map((m, idx) => {
      const acceptanceCriteria: AcceptanceCriterion[] = m.criteria.map((critText, cIdx) => ({
        id: `crit_new_${idx}_${cIdx}`,
        title: critText,
        description: `Verified by MilestoneOS automated inspection against ${critText}.`,
        status: "pending",
        evidence: "",
        aiNotes: "Pending milestone deliverable submission.",
      }));

      return {
        id: `ms_new_${Date.now()}_${idx}`,
        stageNumber: idx + 1,
        title: m.title,
        description: m.description,
        amount: Number(m.amount) || 0,
        currency: "USD",
        dueDate: m.dueDate,
        status: idx === 0 ? "in_progress" : "not_started",
        acceptanceCriteria,
        submissions: [],
      };
    });

    createProject({
      title,
      description,
      category,
      client: {
        name: "Sarah Chen",
        email: "sarah.chen@client.demo",
        avatar: "SC",
        company: "Apex Global Commerce Ltd.",
      },
      freelancer: selectedFreelancer,
      totalBudget,
      currency: "USD",
      escrowFunded: totalBudget,
      targetDeadline,
      status: "active",
      milestones: formattedMilestones,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[92vh] flex flex-col transition-all">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0070BA] dark:bg-blue-900/40 dark:text-sky-300">
                New Milestone Escrow Contract
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                PayPal Orders v2 Protected
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Create Project & Define Milestones
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Project Fundamentals
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next.js Mobile Storefront & PayPal Integration"
                  className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. FinTech, AI, Web3"
                  className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Project Scope & Deliverable Description *
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High-level overview of what the freelancer is building, tech stack, and goals..."
                className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Freelancer *
                </label>
                <select
                  value={selectedFreelancerIndex}
                  onChange={(e) => setSelectedFreelancerIndex(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all cursor-pointer"
                >
                  {FREELANCER_OPTIONS.map((f, i) => (
                    <option key={f.email} value={i}>
                      {f.name} — {f.title} (★ {f.rating})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Project Completion
                </label>
                <input
                  type="text"
                  value={targetDeadline}
                  onChange={(e) => setTargetDeadline(e.target.value)}
                  placeholder="e.g. Dec 25, 2026"
                  className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-[#0070BA]/20 dark:border-white/15 dark:bg-[#131C31] dark:text-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Milestones & Acceptance Criteria Builder */}
          <div className="space-y-4 pt-3 border-t border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  2. Milestone Stages & Acceptance Criteria
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Each milestone locks escrow funds that are only disbursed when Gemini AI verifies criteria.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3 py-1.5 rounded-xl border border-[#0070BA]/40 bg-blue-50 hover:bg-blue-100 text-[#0070BA] dark:bg-blue-900/30 dark:text-sky-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Stage</span>
              </button>
            </div>

            <div className="space-y-4">
              {milestones.map((ms, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-white/10 dark:bg-white/5 space-y-3 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0070BA] dark:text-sky-400 uppercase tracking-wider">
                      Stage 0{idx + 1}
                    </span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                        title="Remove stage"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Stage Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={ms.title}
                        onChange={(e) => handleUpdateMilestone(idx, "title", e.target.value)}
                        placeholder="e.g. Orders v2 API Integration"
                        className="w-full rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-xs text-slate-900 dark:border-white/15 dark:bg-[#131C31] dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Payout ($ USD) *
                      </label>
                      <input
                        type="number"
                        required
                        min={100}
                        step={50}
                        value={ms.amount}
                        onChange={(e) => handleUpdateMilestone(idx, "amount", Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:border-white/15 dark:bg-[#131C31] dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Stage Description
                    </label>
                    <input
                      type="text"
                      value={ms.description}
                      onChange={(e) => handleUpdateMilestone(idx, "description", e.target.value)}
                      placeholder="Summary of deliverables expected in this stage..."
                      className="w-full rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-xs text-slate-900 dark:border-white/15 dark:bg-[#131C31] dark:text-white"
                    />
                  </div>

                  {/* Acceptance Criteria Sub-list */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      Acceptance Criteria for AI Verification ({ms.criteria.length})
                    </label>

                    <div className="space-y-1.5 mb-2">
                      {ms.criteria.map((crit, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#070B14] border border-slate-200/80 dark:border-white/10 text-xs"
                        >
                          <span className="text-slate-700 dark:text-slate-300">{crit}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCriterion(idx, cIdx)}
                            className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCriteriaText[idx] || ""}
                        onChange={(e) => setNewCriteriaText({ ...newCriteriaText, [idx]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCriterion(idx);
                          }
                        }}
                        placeholder="Add new verifiable criterion (e.g. Webhook returns 200 OK)..."
                        className="flex-1 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#131C31] px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCriterion(idx)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-xs font-bold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow Deposit Summary */}
          <div className="p-4 rounded-2xl border border-blue-200/80 bg-blue-50/60 dark:border-blue-500/20 dark:bg-[#0D182E]/50 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Escrow Vault Funding Required
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                ${totalBudget.toLocaleString()}.00 USD
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Guaranteed by PayPal Sandbox Escrow across {milestones.length} stages.
              </span>
            </div>

            <div className="h-10 w-10 rounded-2xl bg-[#0070BA]/10 text-[#0070BA] dark:text-sky-400 flex items-center justify-center">
              <PayPalIcon className="h-6 w-6" />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gradient-glow px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#004C8F] via-[#0070BA] to-[#00A3E0] text-xs font-bold text-white shadow-md shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
            >
              <PayPalIcon className="h-4 w-4" />
              <span>Create Contract & Deposit ${totalBudget.toLocaleString()}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
