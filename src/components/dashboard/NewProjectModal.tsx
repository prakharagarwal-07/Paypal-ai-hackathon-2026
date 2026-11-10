"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  Search,
  Share2,
  UserCheck,
  UserX,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  FREELANCER_OPTIONS,
  CLIENT_OPTIONS,
  Milestone,
  AcceptanceCriterion,
  ProjectContract,
  MilestoneOSUser,
  lookupMilestoneOSUser,
  generateInvitationToken,
} from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";
import ShareInvitationModal from "./ShareInvitationModal";

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

type InitiationMethod = "user_id" | "share_link";

export default function NewProjectModal({ isOpen, onClose, initialProject }: NewProjectModalProps) {
  const { role, userProfiles, createProject, resubmitProposal, showAlert, projects } = useDashboard();

  const isClient = role === "client";
  const myProfile = userProfiles[role];

  // Initiation Method: Find by User ID vs Create & Share Proposal Link
  const [method, setMethod] = useState<InitiationMethod>("user_id");

  // User ID Lookup States (Method A)
  const [milestoneIdInput, setMilestoneIdInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<MilestoneOSUser | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Form Fields
  const [title, setTitle] = useState(initialProject?.title || "");
  const [description, setDescription] = useState(initialProject?.description || "");
  const [category, setCategory] = useState(
    initialProject?.category || (isClient ? "Web Development" : "Custom Web Application")
  );
  const [targetDeadline, setTargetDeadline] = useState(initialProject?.targetDeadline || "Dec 25, 2026");
  const [proposedBudget, setProposedBudget] = useState<number>(initialProject?.totalBudget || 3500);
  const [formError, setFormError] = useState<string | null>(null);

  // Invitation Modal for Method B
  const [createdShareProject, setCreatedShareProject] = useState<ProjectContract | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

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
            title: isClient ? "Initial Deliverable & Architecture" : "Scope, Architecture & Wireframes",
            description: isClient
              ? "Project setup, core mockups, and agreed structural layout."
              : "Database contracts, technical architecture, and core screen wireframes.",
            amount: 1500,
            dueDate: "Dec 05, 2026",
            criteria: ["Clean responsive layout", "Agreed milestone criteria verified"],
          },
          {
            title: isClient ? "Core Deliverables Implementation" : "Interactive Features & Delivery",
            description: isClient
              ? "Main interactive deliverables, payment integration, and testing."
              : "Feature implementation, PayPal sandbox checkout, and final delivery.",
            amount: 2000,
            dueDate: "Dec 20, 2026",
            criteria: ["Deliverables completed as specified", "Tested checkout and receipt records"],
          },
        ]
  );

  const [newCriteriaText, setNewCriteriaText] = useState<{ [milestoneIdx: number]: string }>({});

  // Sync initial project data if editing/revising
  useEffect(() => {
    if (initialProject) {
      setTitle(initialProject.title);
      setDescription(initialProject.description);
      setCategory(initialProject.category);
      setTargetDeadline(initialProject.targetDeadline);
      setProposedBudget(initialProject.totalBudget);
      setMilestones(
        initialProject.milestones.map((m) => ({
          title: m.title,
          description: m.description,
          amount: m.amount,
          dueDate: m.dueDate,
          criteria: m.acceptanceCriteria.map((c) => c.title),
        }))
      );

      // Populate counterparty
      const counterpartyId = isClient
        ? initialProject.freelancer.milestoneOSId
        : initialProject.client.milestoneOSId;

      if (counterpartyId) {
        const found = lookupMilestoneOSUser(counterpartyId);
        if (found) setSelectedUser(found);
      }
    } else {
      // Default initial partner for convenience:
      const defaultPartner = isClient
        ? FREELANCER_OPTIONS[0] // Rohan Verma MSO-2W8L41
        : CLIENT_OPTIONS[0]; // Sarah Chen MSO-7K4P92
      const matched = lookupMilestoneOSUser(defaultPartner.milestoneOSId);
      if (matched) setSelectedUser(matched);
    }
  }, [initialProject, isClient]);

  if (!isOpen && !shareModalOpen) return null;

  const totalMilestonesSum = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const budgetMatches = proposedBudget === totalMilestonesSum;

  // Handle User ID Lookup
  const handleLookupUserId = (idToLookup?: string) => {
    const rawId = (idToLookup || milestoneIdInput).trim().toUpperCase();
    setLookupError(null);

    if (!rawId) {
      setLookupError("Please enter a MilestoneOS ID (e.g. MSO-8K4P92).");
      return;
    }

    if (!rawId.startsWith("MSO-")) {
      setLookupError("Invalid format. MilestoneOS IDs start with 'MSO-' followed by 6 characters.");
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);

      // Prevent self-selection
      if (rawId === myProfile.milestoneOSId.toUpperCase()) {
        setLookupError("You cannot initiate a proposal with your own MilestoneOS ID.");
        setSelectedUser(null);
        return;
      }

      const found = lookupMilestoneOSUser(rawId);

      if (!found) {
        setLookupError(`No MilestoneOS account found with ID "${rawId}". Please verify the ID.`);
        setSelectedUser(null);
        return;
      }

      // Enforce role constraints
      if (isClient && found.role === "client") {
        setLookupError(`"${found.name}" is registered as a Client. As a Client, you can only initiate projects with Freelancers.`);
        setSelectedUser(null);
        return;
      }

      if (!isClient && found.role === "freelancer") {
        setLookupError(`"${found.name}" is registered as a Freelancer. As a Freelancer, you can only propose projects to Clients.`);
        setSelectedUser(null);
        return;
      }

      // Valid match found!
      setSelectedUser(found);
      setMilestoneIdInput(found.milestoneOSId);
      setLookupError(null);
    }, 250);
  };

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Milestone 0${milestones.length + 1}`,
        description: "Stage deliverables and agreed acceptance requirements.",
        amount: 1000,
        dueDate: "Dec 28, 2026",
        criteria: ["Agreed deliverables completed according to scope"],
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
    setFormError(null);

    if (!title.trim() || !description.trim()) {
      setFormError("Please provide both a project name and description before proceeding.");
      showAlert({
        title: "Missing Project Scope",
        message: "Please enter a project title and description to define what deliverables will be built.",
        type: "warning",
      });
      return;
    }

    if (method === "user_id" && !selectedUser && !initialProject) {
      setFormError("Please search for and confirm the counterparty by their MilestoneOS ID, or select 'Create & Share Proposal Link'.");
      showAlert({
        title: "Counterparty Required",
        message: "Please enter a valid MilestoneOS ID for the other party, or switch to 'Create & Share Proposal Link'.",
        type: "warning",
      });
      return;
    }

    // Validate budget
    if (totalMilestonesSum <= 0) {
      setFormError("Milestone amounts must be greater than $0.");
      return;
    }

    if (!budgetMatches && !asDraft) {
      setFormError(`The total of milestone amounts ($${totalMilestonesSum.toLocaleString()}) does not match the proposed project budget ($${proposedBudget.toLocaleString()}).`);
      showAlert({
        title: "Budget Mismatch",
        message: `Milestone amounts sum to $${totalMilestonesSum.toLocaleString()} USD, but the proposed budget is $${proposedBudget.toLocaleString()} USD. Please adjust milestone amounts or update the proposed budget.`,
        type: "warning",
      });
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

    // Determine Client & Freelancer Data
    const isPublicInvitation = method === "share_link";

    let clientData: ProjectContract["client"];
    let freelancerData: ProjectContract["freelancer"];

    if (isClient) {
      clientData = {
        name: myProfile.name,
        email: myProfile.email,
        avatar: myProfile.avatar,
        company: (myProfile as any).company || "Client Company",
        milestoneOSId: myProfile.milestoneOSId,
      };

      if (isPublicInvitation) {
        freelancerData = {
          name: "Unassigned Recipient",
          email: "pending-invitation@milestoneos.link",
          avatar: "??",
          title: "Invited Specialist Freelancer",
          rating: 5.0,
          milestoneOSId: "",
        };
      } else {
        freelancerData = {
          name: selectedUser?.name || "Rohan Verma",
          email: selectedUser?.email || "freelancer@domain.demo",
          avatar: selectedUser?.avatar || "RV",
          title: selectedUser?.title || "Specialist Developer",
          rating: selectedUser?.rating || 4.98,
          milestoneOSId: selectedUser?.milestoneOSId || "MSO-2W8L41",
        };
      }
    } else {
      freelancerData = {
        name: myProfile.name,
        email: myProfile.email,
        avatar: myProfile.avatar,
        title: (myProfile as any).title || "Senior Specialist",
        rating: 4.98,
        milestoneOSId: myProfile.milestoneOSId,
      };

      if (isPublicInvitation) {
        clientData = {
          name: "Unassigned Recipient",
          email: "pending-invitation@milestoneos.link",
          avatar: "??",
          company: "Invited Client Organization",
          milestoneOSId: "",
        };
      } else {
        clientData = {
          name: selectedUser?.name || "Sarah Chen",
          email: selectedUser?.email || "client@domain.demo",
          avatar: selectedUser?.avatar || "SC",
          company: selectedUser?.company || "Client Organization",
          milestoneOSId: selectedUser?.milestoneOSId || "MSO-7K4P92",
        };
      }
    }

    if (initialProject) {
      // Resubmitting revised proposal
      resubmitProposal(initialProject.id, {
        title,
        description,
        category,
        client: clientData,
        freelancer: freelancerData,
        totalBudget: totalMilestonesSum,
        targetDeadline,
        milestones: formattedMilestones,
      });
      onClose();
    } else {
      // Create new proposal
      const invToken = isPublicInvitation ? generateInvitationToken() : undefined;

      const createdId = createProject(
        {
          title,
          description,
          category,
          client: clientData,
          freelancer: freelancerData,
          totalBudget: totalMilestonesSum,
          currency: "USD",
          targetDeadline,
          status: asDraft ? "draft" : "awaiting_acceptance",
          milestones: formattedMilestones,
          initiatedBy: role,
          proposalStatus: asDraft ? "draft" : "awaiting_acceptance",
          termsAgreed: false,
          isPublicInvitation,
          invitationToken: invToken,
          invitationStatus: isPublicInvitation ? "active" : undefined,
          invitationExpiresAt: isPublicInvitation
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
          invitationCreatedByRole: role,
        },
        asDraft
      );

      if (isPublicInvitation && !asDraft) {
        // Construct temporary project object to pass to share modal
        const tempProject: ProjectContract = {
          id: createdId,
          title,
          description,
          category,
          client: clientData,
          freelancer: freelancerData,
          totalBudget: totalMilestonesSum,
          totalPaid: 0,
          escrowFunded: 0,
          escrowReleased: 0,
          currency: "USD",
          createdAt: "Just now",
          targetDeadline,
          status: "awaiting_acceptance",
          milestones: formattedMilestones,
          activityLog: [],
          initiatedBy: role,
          proposalStatus: "awaiting_acceptance",
          isPublicInvitation: true,
          invitationToken: invToken,
          invitationStatus: "active",
        };
        setCreatedShareProject(tempProject);
        setShareModalOpen(true);
      } else {
        onClose();
      }
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[92vh] flex flex-col transition-all">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[11px] font-bold text-[#0070BA] dark:text-sky-400 block mb-0.5">
                  {initialProject ? "Mutual Agreement Revision" : isClient ? "Client Project Initiation" : "Freelancer Project Proposal"}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {initialProject ? "Revise & Resubmit Project Proposal" : isClient ? "Create Project Proposal" : "Propose New Project"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Define project scope, deliverables, budget, and acceptance criteria before work begins.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Form Error Banner */}
              {formError && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="font-medium">{formError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormError(null)}
                    className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* TWO INITIATION METHODS TABS (NEW) */}
              {!initialProject && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-white block">
                      Choose How to Connect with the Other Party:
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      MilestoneOS connects independent parties who already know each other. Select your preferred initiation method.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* METHOD A: FIND BY USER ID */}
                    <button
                      type="button"
                      onClick={() => {
                        setMethod("user_id");
                        setLookupError(null);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        method === "user_id"
                          ? "border-[#0070BA] bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-[#0070BA]/20 shadow-xs"
                          : "border-slate-200 dark:border-white/10 bg-slate-50/40 dark:bg-white/[0.02] hover:bg-slate-100/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-xl ${method === "user_id" ? "bg-[#0070BA] text-white" : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300"}`}>
                            <Search className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            Find by User ID
                          </span>
                        </div>
                        {method === "user_id" && (
                          <span className="h-2 w-2 rounded-full bg-[#0070BA]" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Enter the other person's MilestoneOS ID to verify their account and send the proposal directly.
                      </p>
                    </button>

                    {/* METHOD B: SHARE PROPOSAL LINK */}
                    <button
                      type="button"
                      onClick={() => {
                        setMethod("share_link");
                        setLookupError(null);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        method === "share_link"
                          ? "border-[#0070BA] bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-[#0070BA]/20 shadow-xs"
                          : "border-slate-200 dark:border-white/10 bg-slate-50/40 dark:bg-white/[0.02] hover:bg-slate-100/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-xl ${method === "share_link" ? "bg-[#0070BA] text-white" : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300"}`}>
                            <Share2 className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            Share Proposal Link
                          </span>
                        </div>
                        {method === "share_link" && (
                          <span className="h-2 w-2 rounded-full bg-[#0070BA]" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Prepare your proposal and generate a private invitation link to send via WhatsApp, email, or message.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* METHOD A DETAIL: FIND BY USER ID SEARCH & PREVIEW */}
              {method === "user_id" && !initialProject && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 dark:text-white">
                      {isClient ? "Find Freelancer by MilestoneOS ID *" : "Find Client by MilestoneOS ID *"}
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Format: MSO-XXXXXX</span>
                  </div>

                  {!selectedUser ? (
                    <div className="space-y-2.5">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={milestoneIdInput}
                            onChange={(e) => {
                              setMilestoneIdInput(e.target.value.toUpperCase());
                              if (lookupError) setLookupError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleLookupUserId();
                              }
                            }}
                            placeholder={isClient ? "e.g. MSO-2W8L41" : "e.g. MSO-7K4P92"}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white dark:border-white/15 dark:bg-[#131C31] text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:border-[#0070BA] focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleLookupUserId()}
                          disabled={isSearching}
                          className="px-4 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs shrink-0 flex items-center gap-1.5"
                        >
                          {isSearching ? "Searching..." : "Lookup Account"}
                        </button>
                      </div>

                      {/* Error notice */}
                      {lookupError && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{lookupError}</span>
                        </p>
                      )}

                      {/* Quick demo helper chips */}
                      <div className="pt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                          Quick Demo Accounts to Connect:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {isClient ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleLookupUserId("MSO-2W8L41")}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 text-[11px] text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                              >
                                + Rohan Verma (<span className="font-mono font-bold text-[#0070BA]">MSO-2W8L41</span>)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLookupUserId("MSO-9B4T72")}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 text-[11px] text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                              >
                                + Elena Rostova (<span className="font-mono font-bold text-[#0070BA]">MSO-9B4T72</span>)
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleLookupUserId("MSO-7K4P92")}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 text-[11px] text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                              >
                                + Sarah Chen (<span className="font-mono font-bold text-[#0070BA]">MSO-7K4P92</span>)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLookupUserId("MSO-3X9M55")}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 text-[11px] text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                              >
                                + David Kim (<span className="font-mono font-bold text-[#0070BA]">MSO-3X9M55</span>)
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Confirmed Account Preview Card */
                    <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                          {selectedUser.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                              {selectedUser.name}
                            </h4>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              <span>{selectedUser.role === "client" ? "Verified Client" : "Verified Freelancer"}</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {selectedUser.role === "client" ? selectedUser.company : selectedUser.title} • MilestoneOS ID:{" "}
                            <strong className="font-mono text-slate-900 dark:text-white font-bold">{selectedUser.milestoneOSId}</strong>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedUser(null)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-white/10 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD B DETAIL: SHAREABLE INVITATION BANNER */}
              {method === "share_link" && !initialProject && (
                <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                    <Share2 className="h-4 w-4 text-[#0070BA]" />
                    <span>Unassigned Recipient • Shareable Invitation Link</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                    You can create this proposal right now without selecting a recipient upfront. After submission, you will receive a secure invitation link to share via WhatsApp, email, or chat.
                  </p>
                  <div className="pt-1 flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    <span>Recipient must authenticate on MilestoneOS to review and accept the agreement.</span>
                  </div>
                </div>
              )}

              {/* SECTION: PROJECT SCOPE & OVERVIEW */}
              <div className="space-y-3.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-400">
                  Project Scope & Overview
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
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      placeholder="e.g. Custom Web Application & Checkout Flow"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
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
                      placeholder="e.g. Web Development, Design, Writing"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Project Description & Deliverables Summary *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Describe the agreed project deliverables, specifications, and scope..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Proposed Project Budget ($ USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min={100}
                        step={100}
                        value={proposedBudget}
                        onChange={(e) => {
                          setProposedBudget(Number(e.target.value) || 0);
                          if (formError) setFormError(null);
                        }}
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Completion Date
                    </label>
                    <input
                      type="text"
                      value={targetDeadline}
                      onChange={(e) => setTargetDeadline(e.target.value)}
                      placeholder="e.g. Dec 25, 2026"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: MILESTONES & ACCEPTANCE CRITERIA */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-400">
                      Project Milestones ({milestones.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Break down work into verifiable stages with explicit acceptance criteria.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#0070BA] hover:bg-blue-100 dark:bg-white/10 dark:text-sky-300 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Stage</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {milestones.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          Stage 0{mIdx + 1}
                        </span>
                        {milestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(mIdx)}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                            title="Remove stage"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                            Milestone Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={m.title}
                            onChange={(e) => handleUpdateMilestone(mIdx, "title", e.target.value)}
                            placeholder="Stage Name"
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-white/10 dark:bg-[#131C31] dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                            Amount ($ USD) *
                          </label>
                          <input
                            type="number"
                            min={10}
                            step={50}
                            required
                            value={m.amount}
                            onChange={(e) => handleUpdateMilestone(mIdx, "amount", Number(e.target.value) || 0)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:border-white/10 dark:bg-[#131C31] dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                            Description & Scope
                          </label>
                          <input
                            type="text"
                            value={m.description}
                            onChange={(e) => handleUpdateMilestone(mIdx, "description", e.target.value)}
                            placeholder="Deliverables included in this stage"
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-white/10 dark:bg-[#131C31] dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                            Due Date
                          </label>
                          <input
                            type="text"
                            value={m.dueDate}
                            onChange={(e) => handleUpdateMilestone(mIdx, "dueDate", e.target.value)}
                            placeholder="e.g. Dec 10, 2026"
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-white/10 dark:bg-[#131C31] dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Acceptance Criteria */}
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Agreed Acceptance Criteria ({m.criteria.length})
                        </label>

                        <div className="space-y-1">
                          {m.criteria.map((crit, cIdx) => (
                            <div
                              key={cIdx}
                              className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-[#131C31] border border-slate-200 dark:border-white/10 text-xs"
                            >
                              <span className="truncate pr-2 text-slate-800 dark:text-slate-200">
                                • {crit}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCriterion(mIdx, cIdx)}
                                className="text-slate-400 hover:text-rose-500 cursor-pointer p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-1.5 pt-1">
                          <input
                            type="text"
                            value={newCriteriaText[mIdx] || ""}
                            onChange={(e) =>
                              setNewCriteriaText({ ...newCriteriaText, [mIdx]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCriterion(mIdx);
                              }
                            }}
                            placeholder="Add specific requirement (e.g. mobile responsive, test passes)"
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 dark:border-white/10 dark:bg-[#131C31] dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCriterion(mIdx)}
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

              {/* BUDGET VALIDATION & SUMMARY BOX */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  budgetMatches
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                    : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Total Milestones Calculation:
                    </span>
                    {budgetMatches ? (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Budget Matches Exactly
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Mismatch ($
                        {Math.abs(proposedBudget - totalMilestonesSum).toLocaleString()}{" "}
                        difference)
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                    ${totalMilestonesSum.toLocaleString()} USD
                  </span>
                  <span className="text-[11px] text-slate-500 ml-2">
                    ({milestones.length} stage{milestones.length === 1 ? "" : "s"})
                  </span>
                </div>

                {!budgetMatches && (
                  <button
                    type="button"
                    onClick={() => setProposedBudget(totalMilestonesSum)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold cursor-pointer transition-colors shrink-0 shadow-2xs"
                  >
                    Adjust Budget to ${totalMilestonesSum.toLocaleString()} USD
                  </button>
                )}
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
                  {method === "share_link" ? (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Create & Generate Link</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>
                        {initialProject
                          ? "Resend Proposal"
                          : isClient
                          ? `Send to ${selectedUser?.name ? selectedUser.name.split(" ")[0] : "Freelancer"}`
                          : `Propose to ${selectedUser?.name ? selectedUser.name.split(" ")[0] : "Client"}`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shareable Link Modal after Method B submission */}
      <ShareInvitationModal
        project={createdShareProject}
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setCreatedShareProject(null);
          onClose();
        }}
      />
    </>
  );
}
