"use client";

import { useState, useRef } from "react";
import {
  X,
  ExternalLink,
  Video,
  FileText,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Check,
  AlertTriangle,
  FolderGit2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Palette,
  Cloud,
  Globe,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Info,
  Upload,
  Paperclip,
  Eye,
} from "lucide-react";
import { Milestone, ProjectContract, DeliverableLink, DeliverableAttachment } from "@/lib/dashboard-data";
import { GitHubIcon } from "./icons";
import { useDashboard } from "@/lib/dashboard-store";

interface SubmissionModalProps {
  project: ProjectContract;
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
}

const DELIVERABLE_TYPE_OPTIONS = [
  { value: "photo", label: "Photos / Artwork", icon: ImageIcon },
  { value: "design", label: "Design / Mockup", icon: Palette },
  { value: "document", label: "Document / PDF", icon: FileText },
  { value: "cloud", label: "Cloud Drive / Folder", icon: Cloud },
  { value: "demo", label: "Live Preview / Demo", icon: Globe },
  { value: "repo", label: "Source Code", icon: GitHubIcon },
  { value: "other", label: "Other Asset", icon: LinkIcon },
] as const;

export default function SubmissionModal({
  project,
  milestone,
  isOpen,
  onClose,
}: SubmissionModalProps) {
  const { submitMilestoneDeliverables } = useDashboard();
  const isRevision =
    milestone.status === "changes_requested" || milestone.status === "revision_requested";

  const latestSubmission = milestone.submissions[milestone.submissions.length - 1];
  const revisionFeedback = latestSubmission?.revisionRequest;

  // Files uploaded directly from PC
  const [uploadedFiles, setUploadedFiles] = useState<DeliverableAttachment[]>(
    latestSubmission?.attachments || []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  // Generalized deliverable links
  const [deliverableLinks, setDeliverableLinks] = useState<DeliverableLink[]>(
    latestSubmission?.deliverableLinks && latestSubmission.deliverableLinks.length > 0
      ? latestSubmission.deliverableLinks
      : []
  );

  // Optional technical developer links
  const [demoUrl, setDemoUrl] = useState(latestSubmission?.demoUrl || "");
  const [githubRepo, setGithubRepo] = useState(latestSubmission?.githubRepo || "");
  const [loomVideo, setLoomVideo] = useState(latestSubmission?.loomVideo || "");
  const [showTechFields, setShowTechFields] = useState(
    Boolean(latestSubmission?.githubRepo || latestSubmission?.demoUrl || latestSubmission?.loomVideo)
  );

  // General notes & completion overview
  const [notes, setNotes] = useState(latestSubmission?.notes || "");

  const [formError, setFormError] = useState<string | null>(null);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [checkPassed, setCheckPassed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);

    fileList.forEach((file) => {
      const reader = new FileReader();

      const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
      };

      reader.onload = (uploadEvent) => {
        const result = (uploadEvent.target?.result as string) || "";
        const isImg = file.type.startsWith("image/");

        setUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: formatSize(file.size),
            type: file.type || "application/octet-stream",
            dataUrl: result,
            url: isImg ? result : undefined,
            uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        if (formError) setFormError(null);
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddDeliverableLink = (presetType?: DeliverableLink["type"]) => {
    let title = "";
    if (presetType === "photo") title = "Completed Artwork / Drawing Photos";
    else if (presetType === "cloud") title = "Google Drive / Cloud Folder";
    else if (presetType === "design") title = "Figma / Design Mockups";
    else if (presetType === "document") title = "Final Document / PDF Draft";

    setDeliverableLinks((prev) => [
      ...prev,
      {
        title,
        url: "",
        type: presetType || "photo",
      },
    ]);
  };

  const handleUpdateDeliverableLink = (
    index: number,
    field: keyof DeliverableLink,
    value: string
  ) => {
    setDeliverableLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    if (formError) setFormError(null);
  };

  const handleRemoveDeliverableLink = (index: number) => {
    setDeliverableLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuickCheck = () => {
    setIsRunningCheck(true);
    setTimeout(() => {
      setIsRunningCheck(false);
      setCheckPassed(true);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasFiles = uploadedFiles.length > 0;
    const hasLinks = deliverableLinks.some((l) => l.url.trim().length > 0);
    const hasTechLinks = Boolean(demoUrl.trim() || githubRepo.trim() || loomVideo.trim());
    const hasNotes = notes.trim().length >= 5;

    if (!hasFiles && !hasLinks && !hasTechLinks && !hasNotes) {
      setFormError(
        "Please upload a deliverable file/image from your computer, provide an asset link, or describe the completed work in notes."
      );
      return;
    }

    // Filter out empty rows
    const cleanedLinks = deliverableLinks.filter(
      (l) => l.url.trim().length > 0 || l.title.trim().length > 0
    );

    setIsSubmitting(true);
    setFormError(null);

    try {
      await submitMilestoneDeliverables(
        project.id,
        milestone.id,
        {
          deliverableLinks: cleanedLinks,
          attachments: uploadedFiles,
          demoUrl: demoUrl.trim() || undefined,
          githubRepo: githubRepo.trim() || undefined,
          loomVideo: loomVideo.trim() || undefined,
          notes: notes.trim() || "Milestone deliverables submitted for review.",
        },
        isRevision
      );
      onClose();
    } catch (err: any) {
      setFormError(err.message || "Failed to submit deliverables. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isRevision ? "Resubmit Deliverables" : "Submit Deliverables"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Stage 0{milestone.stageNumber}: {milestone.title} • ${milestone.amount.toLocaleString()} USD
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Changes Requested Banner */}
          {isRevision && revisionFeedback && (
            <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/20 text-slate-700 dark:text-slate-200">
              <span className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-200 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                Revision Feedback from {revisionFeedback.requestedBy}:
              </span>
              <p className="text-[11px] mt-1 pl-5 text-amber-800 dark:text-amber-300">
                "{revisionFeedback.reason}"
              </p>
            </div>
          )}

          {/* Form Error Notice */}
          {formError && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. DELIVERABLE FILES & LINKS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Deliverables (Files & Links)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-[#0070BA] dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload from PC</span>
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => handleAddDeliverableLink()}
                  className="text-xs font-semibold text-[#0070BA] dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Link</span>
                </button>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.zip,.txt,.fig,.psd,.ai"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Clean, compact drag & drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-[#0070BA] dark:border-white/10 dark:hover:border-sky-500 rounded-xl p-3.5 sm:p-4 text-center bg-slate-50/50 hover:bg-blue-50/30 dark:bg-white/[0.02] dark:hover:bg-sky-950/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center gap-2 text-xs">
                <Upload className="h-4 w-4 text-[#0070BA] dark:text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Click to upload files from your PC
                </span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  (photos, drawings, PDFs, or ZIP)
                </span>
              </div>
            </div>

            {/* Uploaded Files Chips */}
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {uploadedFiles.map((file, idx) => {
                  const isImg = file.type.startsWith("image/") || file.dataUrl?.startsWith("data:image");
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131C31] shadow-2xs group"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {isImg && file.dataUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage({ url: file.dataUrl!, name: file.name })}
                            className="h-8 w-8 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 shrink-0 cursor-pointer relative group/img"
                            title="Click to view image"
                          >
                            <img
                              src={file.dataUrl}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Eye className="h-3 w-3" />
                            </div>
                          </button>
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-sky-950/60 text-[#0070BA] dark:text-sky-400 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <span className="text-[10px] text-slate-400 block">
                            {file.size}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors shrink-0"
                        title="Remove file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Attached Links List */}
            {deliverableLinks.length > 0 && (
              <div className="space-y-2 pt-1">
                {deliverableLinks.map((item, index) => (
                  <div
                    key={index}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131C31] space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={item.type || "photo"}
                        onChange={(e) =>
                          handleUpdateDeliverableLink(index, "type", e.target.value as any)
                        }
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                      >
                        {DELIVERABLE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          handleUpdateDeliverableLink(index, "title", e.target.value)
                        }
                        placeholder="Link label (e.g. Google Drive Folder)"
                        className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverableLink(index)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Remove link"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => handleUpdateDeliverableLink(index, "url", e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white font-mono"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. COMPLETION NOTES */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Notes & Comments
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="Describe what was completed or any notes for the client..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white leading-relaxed"
            />
          </div>

          {/* 3. OPTIONAL CODE & DEMO LINKS (QUIET ACCORDION) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowTechFields(!showTechFields)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{showTechFields ? "− Hide" : "+ Add"} live demo or code links (optional)</span>
            </button>

            {showTechFields && (
              <div className="mt-2 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] space-y-2.5 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Live Demo / Preview URL
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://preview.example.com"
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    GitHub or Code Repository
                  </label>
                  <input
                    type="url"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting & Verifying...</span>
                </>
              ) : (
                <span>{isRevision ? "Resubmit Work" : "Submit Work"}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Full Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[85vh] bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
          >
            <div className="p-3 border-b border-white/10 flex items-center justify-between text-white text-xs">
              <span className="font-semibold truncate pr-4">{previewImage.name}</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2 flex-1 overflow-auto flex items-center justify-center bg-black/40">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
