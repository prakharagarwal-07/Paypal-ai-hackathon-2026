"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/dashboard-store";
import { Milestone, ProjectContract } from "@/lib/dashboard-data";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  FileCode,
  ArrowRight,
  RefreshCw,
  Search,
} from "lucide-react";
import { GitHubIcon } from "./icons";

interface AIAuditCenterProps {
  onOpenAudit: (project: ProjectContract, milestone: Milestone) => void;
}

export default function AIAuditCenter({ onOpenAudit }: AIAuditCenterProps) {
  const { projects, searchQuery, setSearchQuery } = useDashboard();

  // Find all milestones that have an audit report or submission
  const auditedMilestones = projects.flatMap((p) =>
    p.milestones
      .filter((m) => m.latestAudit || m.submissions.length > 0)
      .map((m) => ({ project: p, milestone: m, audit: m.latestAudit || m.submissions[m.submissions.length - 1]?.aiAssessment }))
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Serious Evaluation Architecture */}
      <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-sky-50/30 to-white dark:border-blue-500/20 dark:from-[#0D182E] dark:via-[#091124] dark:to-[#070B14] p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-400/10 dark:text-sky-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Gemini 2.5 Flash Automated Work-Assessment Architecture</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            AI Work-Assessment Hub
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            MilestoneOS evaluates code pull requests, live staging responses, and unit test suites against contract acceptance criteria before funds are disbursed.
          </p>

          {/* Demonstration Notice */}
          <div className="p-3.5 rounded-2xl border border-amber-300/80 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                DEMONSTRATION ASSESSMENT (SIMULATED GEMINI 2.5 FLASH EVALUATION)
              </span>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                This environment showcases the structured rubrics and verification logic produced by Gemini. In production, live multimodal endpoints audit live Git diffs and staging URLs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Audits List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Milestone Audit Reports ({auditedMilestones.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Ground Truth Verification Engine
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {auditedMilestones.map(({ project, milestone, audit }) => {
            const score = audit?.overallScore || 94;
            const criteria = audit?.criteria || milestone.acceptanceCriteria;
            const satisfied = criteria.filter((c) => c.status === "satisfied").length;
            const missing = criteria.filter((c) => c.status === "missing").length;
            const needsVerif = criteria.filter((c) => c.status === "needs_verification").length;

            return (
              <div
                key={milestone.id}
                className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#0D1527] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#0070BA]/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Stage 0{milestone.stageNumber} • {project.title}
                    </span>
                    <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0070BA] dark:bg-blue-900/40 dark:text-sky-300">
                      Score: {score}%
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {milestone.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {audit?.summary || milestone.description}
                  </p>
                </div>

                {/* Score Breakdown Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block uppercase">
                      Satisfied
                    </span>
                    <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                      {satisfied}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20">
                    <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block uppercase">
                      Missing
                    </span>
                    <span className="text-sm font-black text-rose-800 dark:text-rose-300">
                      {missing}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block uppercase">
                      Manual Verif
                    </span>
                    <span className="text-sm font-black text-amber-800 dark:text-amber-300">
                      {needsVerif}
                    </span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Escrow: ${milestone.amount.toLocaleString()} USD
                  </span>

                  <button
                    type="button"
                    onClick={() => onOpenAudit(project, milestone)}
                    className="btn-gradient-glow inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#004C8F] to-[#0070BA] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Open Scorecard</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
