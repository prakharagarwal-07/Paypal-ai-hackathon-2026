"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Send, FileText, CheckCircle2 } from "lucide-react";
import {
  FREELANCER_OPTIONS,
  CLIENT_OPTIONS,
  Milestone,
  AcceptanceCriterion,
  ProjectContract,
} from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProject?: ProjectContract | null;
}

interface DraftMilestone {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  criteria: string[];
}

export default function NewProjectModal({ isOpen, onClose, initialProject }: NewProjectModalProps) {
  const { role, createProject, resubmitProposal } = useDashboard();

  const isClient = role === "client";

  const [title, setTitle] = useState(initialProject?.title || "");
  const [description, setDescription] = useState(initialProject?.description || "");
  const [category, setCategory] = useState(
    initialProject?.category || (isClient ? "Web Development" : "Custom Web Application")
  );
  const [targetDeadline, setTargetDeadline] = useState(initialProject?.targetDeadline || "Dec 25, 2026");

  // Selection indexes
  const [selectedFreelancerIndex, setSelectedFreelancerIndex] = useState(0);
  const [selectedClientIndex, setSelectedClientIndex] = useState(0);

  const [milestones, setMilestones] = useState<DraftMilestone[]>(
    initialProject
      ? initialProject.milestones.map((m) => ({
          title: m.title,
          description: m.description,
          amount: m.amount,
          dueDate: m.dueDate,
          criteria: m.acceptanceCriteria.map((c) => c.title),
        }))
      : [
          {
            title: isClient ? "Initial Design & Setup" : "Architecture & Prototype",
            description: isClient
              ? "Project setup and core page layouts."
              : "Database schema, API contracts, and core wireframes.",
            amount: 1500,
            dueDate: "Dec 05, 2026",
            criteria: ["Clean responsive layout", "Core technical requirements met"],
          },
          {
            title: isClient ? "Core Feature Implementation" : "Payment Integration & Delivery",
            description: isClient
              ? "Main interactive features and payment integration."
              : "PayPal sandbox checkout integration and production deployment.",
            amount: 2000,
            dueDate: "Dec 20, 2026",
            criteria: ["Features working as specified", "Tested checkout and receipts"],
          },
        ]
  );

  const [newCriteriaText, setNewCriteriaText] = useState<{ [milestoneIdx: number]: string }>({});

  useEffect(() => {
    if (initialProject) {
      setTitle(initialProject.title);
      setDescription(initialProject.description);
      setCategory(initialProject.category);
      setTargetDeadline(initialProject.targetDeadline);
      setMilestones(
        initialProject.milestones.map((m) => ({
          title: m.title,
          description: m.description,
          amount: m.amount,
          dueDate: m.dueDate,
          criteria: m.acceptanceCriteria.map((c) => c.title),
        }))
      );
    }
  }, [initialProject]);

  if (!isOpen) return null;

  const totalBudget = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const selectedFreelancer = FREELANCER_OPTIONS[selectedFreelancerIndex];
  const selectedClient = CLIENT_OPTIONS[selectedClientIndex];

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Milestone 0${milestones.length + 1}`,
        description: "Stage deliverables and agreed acceptance requirements.",
        amount: 1000,
        dueDate: "Dec 28, 2026",
        criteria: ["Deliverables completed according to agreement"],
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

  const handleSaveOrSend = (asDraft: boolean) => {
    if (!title.trim() || !description.trim()) {
      alert("Please provide a project name and description.");
      return;
    }

    const formattedMilestones: Milestone[] = milestones.map((m, idx) => {
      const acceptanceCriteria: AcceptanceCriterion[] = m.criteria.map((critText, cIdx) => ({
        id: `crit_new_${idx}_${cIdx}_${Date.now()}`,
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
        status: "not_started",
        acceptanceCriteria,
        submissions: [],
      };
    });

    const clientData = isClient
      ? {
          name: "Sarah Chen",
          email: "sarah.chen@client.demo",
          avatar: "SC",
          company: "Apex Commerce",
        }
      : selectedClient;

    const freelancerData = isClient
      ? selectedFreelancer
      : {
          name: "Rohan Verma",
          email: "rohan.verma@dev.demo",
          avatar: "RV",
          title: "Web Developer",
          rating: 4.98,
        };

    if (initialProject) {
      // Resubmitting revised proposal
      resubmitProposal(initialProject.id, {
        title,
        description,
        category,
        client: clientData,
        freelancer: freelancerData,
        totalBudget,
        targetDeadline,
        milestones: formattedMilestones,
      });
    } else {
      // Creating brand new project or proposal
      createProject(
        {
          title,
          description,
          category,
          client: clientData,
          freelancer: freelancerData,
          totalBudget,
          currency: "USD",
          targetDeadline,
          status: asDraft ? "draft" : "awaiting_acceptance",
          initiatedBy: role,
          proposalStatus: asDraft ? "draft" : "awaiting_acceptance",
          termsAgreed: false,
          milestones: formattedMilestones,
        },
        asDraft
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#0070BA] dark:text-sky-400">
                {isClient ? "Client Project Initiation" : "Freelancer Project Proposal"}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {isClient ? "Logged in as Sarah Chen" : "Logged in as Rohan Verma"}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialProject
                ? "Revise & Resend Project Proposal"
                : isClient
                ? "Create Project & Assign Milestones"
                : "Propose Project to Client"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isClient
                ? "Define scope, select your freelancer, and set milestones to send for agreement."
                : "Define proposed scope, select your client, and structure milestones to send for agreement."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Project Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs">
              Project Scope & Overview
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isClient
                      ? "e.g. Website Redesign & PayPal Checkout"
                      : "e.g. AI Search & Recommendation Engine"
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0070BA]"
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
                placeholder="A clear description of what deliverables and features will be built..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* Other Party Selection (Already known contacts) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isClient ? "Select Freelancer *" : "Select Client *"}
                </label>
                {isClient ? (
                  <select
                    value={selectedFreelancerIndex}
                    onChange={(e) => setSelectedFreelancerIndex(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-[#131C31] dark:text-white cursor-pointer"
                  >
                    {FREELANCER_OPTIONS.map((f, i) => (
                      <option key={f.email} value={i}>
                        {f.name} — {f.title} (★ {f.rating})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedClientIndex}
                    onChange={(e) => setSelectedClientIndex(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-[#131C31] dark:text-white cursor-pointer"
                  >
                    {CLIENT_OPTIONS.map((c, i) => (
                      <option key={c.email} value={i}>
                        {c.name} — {c.company}
                      </option>
                    ))}
                  </select>
                )}
                <span className="text-[10px] text-slate-400 block mt-1">
                  Both parties already have an established connection.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Completion Deadline
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

          {/* Milestones & Acceptance Criteria */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                  Milestones & Acceptance Criteria
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Every milestone requires verifiable criteria mutually visible to both parties.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMilestone}
                className="text-xs font-bold text-[#0070BA] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.02] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-500 dark:text-slate-400">
                      Stage 0{idx + 1}
                    </span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded-md cursor-pointer"
                        title="Remove milestone"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Milestone Title
                      </label>
                      <input
                        type="text"
                        required
                        value={m.title}
                        onChange={(e) => handleUpdateMilestone(idx, "title", e.target.value)}
                        placeholder="e.g. Design & Page Layouts"
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Amount (USD)
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={m.amount}
                        onChange={(e) => handleUpdateMilestone(idx, "amount", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Deliverable Description
                      </label>
                      <input
                        type="text"
                        value={m.description}
                        onChange={(e) => handleUpdateMilestone(idx, "description", e.target.value)}
                        placeholder="e.g. Homepage, product catalog, responsive mobile layout."
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Due Date
                      </label>
                      <input
                        type="text"
                        value={m.dueDate}
                        onChange={(e) => handleUpdateMilestone(idx, "dueDate", e.target.value)}
                        placeholder="e.g. Dec 10, 2026"
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Criteria items */}
                  <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-white/5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Acceptance Criteria:
                    </label>

                    <div className="space-y-1.5">
                      {m.criteria.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[11px]"
                        >
                          <span className="truncate">• {c}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCriterion(idx, cIdx)}
                            className="text-slate-400 hover:text-rose-500 shrink-0 cursor-pointer"
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
                        onChange={(e) =>
                          setNewCriteriaText({ ...newCriteriaText, [idx]: e.target.value })
                        }
                        placeholder="Add acceptance criterion (e.g. Tested responsive layouts)..."
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCriterion(idx);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCriterion(idx)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-[11px] font-semibold cursor-pointer transition-colors"
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
          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between">
            <div>
              <span className="text-slate-600 dark:text-slate-400 block text-[11px]">
                Total Agreed Budget:
              </span>
              <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                ${totalBudget.toLocaleString()} USD
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {milestones.length} milestone stage{milestones.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Notice: Mutual Agreement Required */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#0070BA] shrink-0 mt-0.5" />
            <p>
              Once sent, the other party will review the proposed budget and milestone criteria. Work and payments cannot begin until both parties accept the agreement.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer order-3 sm:order-1"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
            {!initialProject && (
              <button
                type="button"
                onClick={() => handleSaveOrSend(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
              >
                Save as Draft
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSaveOrSend(false)}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>
                {initialProject
                  ? "Resend Proposal"
                  : isClient
                  ? "Create & Send to Freelancer"
                  : "Send Proposal to Client"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}