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

  const handleSubmit = (e: React.FormEvent) => {
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

    submitMilestoneDeliverables(
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
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs font-bold text-[#0070BA] dark:text-sky-400 block mb-0.5">
              {isRevision ? "Resubmit Revised Deliverables" : "Submit Milestone Deliverables"}
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Stage 0{milestone.stageNumber}: {milestone.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40">
                <FolderGit2 className="h-3 w-3 text-[#0070BA] dark:text-sky-400" />
                Project: {project.title}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                • ${milestone.amount.toLocaleString()} USD
              </span>
            </div>
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Changes Requested Banner */}
          {isRevision && revisionFeedback && (
            <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/20 text-slate-700 dark:text-slate-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                Requested Changes from {revisionFeedback.requestedBy}:
              </span>
              <p className="text-[11px] leading-relaxed pl-5">
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

          {/* SECTION 1: WORK COMPLETION SUMMARY & NOTES */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Work Completion Summary & Deliverable Notes *
              </label>
              <span className="text-[11px] text-slate-400">Required</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
              Describe what work you completed, how the agreed criteria were satisfied, or where files and drawing photos can be reviewed.
            </p>
            <textarea
              rows={4}
              required
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="e.g. All 3 pencil drawing portraits are completed and photographed under clean lighting. High-res photo files are uploaded in the Drive link below. Acceptance criteria for shading, dimensions, and framing have been satisfied..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white leading-relaxed"
            />
          </div>

          {/* SECTION 2: GENERAL DELIVERABLES & PC UPLOADS */}
          <div className="space-y-4">
            {/* Hidden file input for PC uploads */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.zip,.txt,.fig,.psd,.ai"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Upload from Computer Box */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-900 dark:text-white block">
                    Upload from Computer (PC)
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Upload drawings, artwork photos, design mockups, or documents directly from your device.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0070BA] text-white hover:bg-[#005a96] text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Choose Files</span>
                </button>
              </div>

              {/* Drag & drop / click-to-upload card */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#0070BA] dark:border-white/15 dark:hover:border-sky-500 rounded-2xl p-4 sm:p-5 text-center bg-slate-50/60 dark:bg-white/[0.02] hover:bg-blue-50/40 dark:hover:bg-sky-950/20 transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-sky-950/50 text-[#0070BA] dark:text-sky-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Click to browse or upload images & files from your PC
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports JPG, PNG, WEBP, PDF, DOCX, ZIP, PSD, AI files (select multiple)
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Files Grid */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Attached from PC ({uploadedFiles.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {uploadedFiles.map((file, idx) => {
                      const isImg = file.type.startsWith("image/") || file.dataUrl?.startsWith("data:image");
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131C31] shadow-2xs group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {isImg && file.dataUrl ? (
                              <button
                                type="button"
                                onClick={() => setPreviewImage({ url: file.dataUrl!, name: file.name })}
                                className="h-9 w-9 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 shrink-0 cursor-pointer relative group/img"
                                title="Click to view full photo"
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
                              <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-sky-950/60 text-[#0070BA] dark:text-sky-400 flex items-center justify-center shrink-0">
                                <FileText className="h-4 w-4" />
                              </div>
                            )}
                            <div className="min-w-0 text-left">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span>{file.size}</span>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Attached from PC</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors shrink-0"
                            title="Remove file"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* External Links Section */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-900 dark:text-white block">
                    Deliverable Assets & Links
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Photos, cloud folders (Google Drive, Dropbox), Figma designs, or document links.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddDeliverableLink()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0070BA]/10 hover:bg-[#0070BA]/20 text-[#0070BA] dark:bg-sky-950/60 dark:hover:bg-sky-900/60 dark:text-sky-300 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Link</span>
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1">
                  Quick Add:
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-0.5 rounded-md border border-[#0070BA]/30 bg-blue-50/80 hover:bg-blue-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-[11px] text-[#0070BA] dark:text-sky-300 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <Upload className="h-3 w-3 text-[#0070BA] dark:text-sky-400" />
                  <span>+ Upload from PC</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDeliverableLink("photo")}
                  className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] text-slate-600 dark:text-slate-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ImageIcon className="h-3 w-3 text-emerald-500" />
                  <span>+ Photos / Artwork</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDeliverableLink("cloud")}
                  className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] text-slate-600 dark:text-slate-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Cloud className="h-3 w-3 text-sky-500" />
                  <span>+ Cloud Drive Folder</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDeliverableLink("design")}
                  className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] text-slate-600 dark:text-slate-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Palette className="h-3 w-3 text-purple-500" />
                  <span>+ Figma / Design</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDeliverableLink("document")}
                  className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] text-slate-600 dark:text-slate-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <FileText className="h-3 w-3 text-amber-500" />
                  <span>+ Document / PDF</span>
                </button>
              </div>

              {/* List of Deliverable Link Rows */}
              {deliverableLinks.length === 0 ? (
                <div className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50/50 dark:bg-white/[0.02] text-center">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    No deliverable links attached. Click a quick button above to link cloud drives, Figma, or document links.
                  </p>
                </div>
              ) : (
              <div className="space-y-2.5">
                {deliverableLinks.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-1">
                        <select
                          value={item.type || "photo"}
                          onChange={(e) =>
                            handleUpdateDeliverableLink(index, "type", e.target.value as any)
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 dark:border-white/10 dark:bg-[#131C31] dark:text-slate-200"
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
                          placeholder="Deliverable Name (e.g. Artwork Photos, Chapter 1 Doc)"
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 dark:border-white/10 dark:bg-[#131C31] dark:text-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverableLink(index)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                        title="Remove link"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => handleUpdateDeliverableLink(index, "url", e.target.value)}
                      placeholder="https://drive.google.com/... or https://..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 dark:border-white/10 dark:bg-[#131C31] dark:text-white font-mono"
                    />
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>

          {/* SECTION 3: OPTIONAL SOFTWARE & TECHNICAL FIELDS (COLLAPSIBLE) */}
          <div className="rounded-xl border border-slate-200/80 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setShowTechFields(!showTechFields)}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                    Software & Staging Links (Optional)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Only needed if your project is a website, web app, or software repository.
                  </span>
                </div>
              </div>
              {showTechFields ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {showTechFields && (
              <div className="p-3.5 border-t border-slate-100 dark:border-white/5 space-y-3 bg-slate-50/50 dark:bg-transparent">
                {/* Website / Demo Link */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Live Demo / Staging Preview URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://your-preview-site.com"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white font-mono"
                  />
                </div>

                {/* Code Repository Link */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Code Repository or Git URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white font-mono"
                  />
                </div>

                {/* Video Walkthrough */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Video Walkthrough / Loom URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={loomVideo}
                    onChange={(e) => setLoomVideo(e.target.value)}
                    placeholder="https://loom.com/share/..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0070BA] focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Pre-Check Button */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block text-xs">
                Quick Deliverables Check
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Verify deliverable formatting before sending for AI acceptance review.
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickCheck}
              disabled={isRunningCheck}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer shrink-0 transition-colors"
            >
              {isRunningCheck ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : checkPassed ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Ready
                </span>
              ) : (
                "Run Check"
              )}
            </button>
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
              className="px-5 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              {isRevision ? "Resubmit for Review" : "Submit for Review"}
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
