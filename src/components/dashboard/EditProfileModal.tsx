"use client";

import { useState } from "react";
import {
  X,
  Save,
  User,
  Mail,
  Building2,
  Briefcase,
  Copy,
  Check,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { extractBaseCode, formatClientId, formatFreelancerId } from "@/lib/dashboard-data";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { role, userProfiles, updateUserProfile, authUser } = useDashboard();

  const baseCode =
    authUser?.baseCode ||
    extractBaseCode(userProfiles[role]?.milestoneOSId) ||
    "USER01";

  const clientId = userProfiles.client.clientId || formatClientId(baseCode);
  const freelancerId = userProfiles.freelancer.freelancerId || formatFreelancerId(baseCode);

  // Shared account name and email (Name is identical for both client & freelancer)
  const [name, setName] = useState(authUser?.name || userProfiles[role]?.name || "");
  const [email, setEmail] = useState(authUser?.email || userProfiles[role]?.email || "");

  // Freelancer-specific fields - do NOT auto-assume professions
  const rawTitle = authUser?.title || (userProfiles.freelancer as any)?.title || "";
  const [freelancerTitle, setFreelancerTitle] = useState(
    rawTitle === "Specialist Freelancer" ? "" : rawTitle
  );

  // Client-specific fields
  const rawCompany = authUser?.company || (userProfiles.client as any)?.company || "";
  const [clientCompany, setClientCompany] = useState(
    rawCompany === "Client Organization" ? "" : rawCompany
  );

  const [copiedRole, setCopiedRole] = useState<"client" | "freelancer" | null>(null);

  if (!isOpen) return null;

  const handleCopy = (idText: string, type: "client" | "freelancer") => {
    navigator.clipboard.writeText(idText);
    setCopiedRole(type);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateUserProfile("both", {
      name: name.trim() || authUser?.name || "User",
      email: email.trim() || authUser?.email,
      title: freelancerTitle.trim(),
      company: clientCompany.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      {/* Spacious 3XL modal container - large, modern, and clear */}
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#0070BA] dark:bg-blue-950/60 dark:text-sky-400 flex items-center justify-center font-bold shadow-2xs border border-blue-100 dark:border-blue-900/50">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Profile & Identity Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your name is shared across both profiles, while your Freelancer designation and Client company are configured separately.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Account IDs Bar */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                MilestoneOS Base Account ID:
              </span>
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200">
                {baseCode}
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Freelancer ID */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Freelancer ID:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{freelancerId}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(freelancerId, "freelancer")}
                  className="p-1 rounded text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 cursor-pointer ml-1"
                  title="Copy Freelancer ID"
                >
                  {copiedRole === "freelancer" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Client ID */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/30 text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Client ID:</span>
                <span className="font-mono font-bold text-[#0070BA] dark:text-sky-300">{clientId}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(clientId, "client")}
                  className="p-1 rounded text-[#0070BA] hover:text-[#005a96] dark:text-sky-400 cursor-pointer ml-1"
                  title="Copy Client ID"
                >
                  {copiedRole === "client" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* 2. Personal Information (Shared) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-white/5">
              <User className="h-4 w-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Personal Account Details (Shared)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chris Doe"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Your real name is identical across both Client and Freelancer activities.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 dark:bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs text-slate-700 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:text-slate-300 font-mono"
                  />
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Linked account email for notifications and settlements.
                </span>
              </div>
            </div>
          </div>

          {/* 3. Distinct Role-Specific Profiles: Side-by-side or Stacked */}
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* FREELANCER SECTION */}
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                        Freelancer Identity
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Active when delivering projects
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    {freelancerId}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Profession / Role / Designation
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={freelancerTitle}
                      onChange={(e) => setFreelancerTitle(e.target.value)}
                      placeholder="e.g. Full-Stack Developer, UI/UX Designer, Artist"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-white/10 dark:bg-[#131C31] dark:text-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Enter your custom title or specialty so clients know what services you offer.
                  </p>
                </div>
              </div>

              {/* CLIENT SECTION */}
              <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-blue-50/30 dark:bg-blue-950/10 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-[#0070BA] dark:text-sky-300 flex items-center justify-center">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-blue-900 dark:text-sky-300">
                        Client Identity
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Active when hiring & funding work
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-sky-300">
                    {clientId}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Company / Organization / Hiring Label
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder="e.g. Acme Corp, Design Studio, or Individual Client"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-[#131C31] dark:text-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    The hiring company or personal entity shown on contracts and milestone payments.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
