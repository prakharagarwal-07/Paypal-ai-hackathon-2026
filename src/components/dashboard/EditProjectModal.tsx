"use client";

import { useState } from "react";
import { X, Save, Archive, Trash2 } from "lucide-react";
import { ProjectContract } from "@/lib/dashboard-data";
import { useDashboard } from "@/lib/dashboard-store";

interface EditProjectModalProps {
  project: ProjectContract;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProjectModal({ project, isOpen, onClose }: EditProjectModalProps) {
  const { updateProject, archiveProject } = useDashboard();

  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [category, setCategory] = useState(project.category);
  const [targetDeadline, setTargetDeadline] = useState(project.targetDeadline);
  const [status, setStatus] = useState(project.status);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject(project.id, {
      title,
      description,
      category,
      targetDeadline,
      status,
    });
    onClose();
  };

  const handleArchive = () => {
    archiveProject(project.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-8 max-h-[92vh] flex flex-col transition-all">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Edit Project Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Project ID: {project.id}
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:border-white/15 dark:bg-[#131C31] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs text-slate-900 dark:border-white/15 dark:bg-[#131C31] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Deadline
              </label>
              <input
                type="text"
                value={targetDeadline}
                onChange={(e) => setTargetDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs text-slate-900 dark:border-white/15 dark:bg-[#131C31] dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Project Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs text-slate-900 dark:border-white/15 dark:bg-[#131C31] dark:text-white cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Project Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs text-slate-900 dark:border-white/15 dark:bg-[#131C31] dark:text-white"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={handleArchive}
              className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-colors"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Archive Contract</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-gradient-glow px-4 py-2 rounded-xl bg-gradient-to-r from-[#004C8F] to-[#0070BA] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
