"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { FREELANCER_OPTIONS, Milestone, AcceptanceCriterion } from "@/lib/dashboard-data";
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
  const { createProject } = useDashboard();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [targetDeadline, setTargetDeadline] = useState("Dec 15, 2026");
  const [selectedFreelancerIndex, setSelectedFreelancerIndex] = useState(0);

  const [milestones, setMilestones] = useState<DraftMilestone[]>([
    {
      title: "Initial Design & Setup",
      description: "Project setup and core page layouts.",
      amount: 1500,
      dueDate: "Dec 01, 2026",
      criteria: ["Clean responsive layout", "Navigation works on mobile and desktop"],
    },
    {
      title: "Core Feature Implementation",
      description: "Main interactive features and payment integration.",
      amount: 2000,
      dueDate: "Dec 15, 2026",
      criteria: ["Features working as specified", "Tested checkout flow"],
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
        title: `Milestone 0${milestones.length + 1}`,
        description: "Stage deliverables and requirements.",
        amount: 1000,
        dueDate: "Dec 20, 2026",
        criteria: ["Deliverables completed as agreed"],
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
        description: `Verified against agreed milestone requirement: ${critText}.`,
        status: "needs_manual_review",
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
        company: "Apex Commerce",
      },
      freelancer: selectedFreelancer,
      totalBudget,
      currency: "USD",
      targetDeadline,
      status: "active",
      milestones: formattedMilestones,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Create a New Project
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set project details, assign a freelancer, and define work milestones.
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Project Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs">
              Project Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Website Redesign & Shop"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Web Development"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Description *
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short summary of what is being built..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Freelancer *
                </label>
                <select
                  value={selectedFreelancerIndex}
                  onChange={(e) => setSelectedFreelancerIndex(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white cursor-pointer"
                >
                  {FREELANCER_OPTIONS.map((f, i) => (
                    <option key={f.email} value={i}>
                      {f.name} — {f.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="text"
                  value={targetDeadline}
                  onChange={(e) => setTargetDeadline(e.target.value)}
                  placeholder="e.g. Dec 25, 2026"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                Milestones & Requirements
              </h3>

              <button
                type="button"
                onClick={handleAddMilestone}
                className="text-xs font-bold text-[#0070BA] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-3">
              {milestones.map((ms, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-white/10 dark:bg-white/5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-400 font-bold text-[10px]">
                      Milestone 0{idx + 1}
                    </span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        value={ms.title}
                        onChange={(e) => handleUpdateMilestone(idx, "title", e.target.value)}
                        placeholder="Milestone Name..."
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        required
                        min={50}
                        step={50}
                        value={ms.amount}
                        onChange={(e) => handleUpdateMilestone(idx, "amount", Number(e.target.value))}
                        placeholder="Amount ($ USD)"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 block">Requirements:</span>
                    <div className="space-y-1">
                      {ms.criteria.map((crit, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[11px]"
                        >
                          <span className="truncate">{crit}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCriterion(idx, cIdx)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={newCriteriaText[idx] || ""}
                        onChange={(e) => setNewCriteriaText({ ...newCriteriaText, [idx]: e.target.value })}
                        placeholder="Add requirement..."
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCriterion(idx)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 text-[11px] font-semibold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Total Summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Total Project Budget:</span>
            <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
              ${totalBudget.toLocaleString()} USD ({milestones.length} milestones)
            </span>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
