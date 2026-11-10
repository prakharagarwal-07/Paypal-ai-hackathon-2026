"use client";

import { useState } from "react";
import { X, Save, User, Mail, Building2, Briefcase, Copy, Check, ShieldCheck, IdCard } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { role, userProfiles, updateUserProfile } = useDashboard();
  const currentProfile = userProfiles[role];

  const [name, setName] = useState(currentProfile.name);
  const [email, setEmail] = useState(currentProfile.email);
  const [extra, setExtra] = useState(
    role === "client"
      ? (currentProfile as any).company || ""
      : (currentProfile as any).title || ""
  );
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const handleCopyId = () => {
    if (currentProfile.milestoneOSId) {
      navigator.clipboard.writeText(currentProfile.milestoneOSId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(role, {
      name,
      email,
      ...(role === "client" ? { company: extra } : { title: extra }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="h-4 w-4 text-[#0070BA] dark:text-sky-400" />
              <span>{role === "client" ? "Client Profile" : "Freelancer Profile"}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your identity across proposals, contracts, and payment receipts.
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

        {/* MilestoneOS ID Card */}
        <div className="p-5 pb-0">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-sky-50/60 dark:from-blue-950/30 dark:to-sky-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-[#0070BA] text-white flex items-center justify-center font-bold text-xs">
                  {currentProfile.avatar}
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block">
                    Permanent MilestoneOS ID
                  </span>
                  <span className="font-mono font-black text-sm text-[#0070BA] dark:text-sky-300">
                    {currentProfile.milestoneOSId || (role === "client" ? "MSO-7K4P92" : "MSO-2W8L41")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 cursor-pointer transition-colors"
              >
                {copiedId ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Share this ID with counterparties so they can find you directly and initiate project proposals. This ID is permanent and never changes.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@domain.com"
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {role === "client" ? "Company / Organization" : "Professional Title"}
            </label>
            <div className="relative">
              {role === "client" ? (
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              ) : (
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              )}
              <input
                type="text"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder={role === "client" ? "e.g. TechCorp Labs" : "e.g. Senior Frontend Engineer"}
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
