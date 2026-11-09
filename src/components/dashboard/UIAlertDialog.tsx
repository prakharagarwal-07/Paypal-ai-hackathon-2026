"use client";

import { useEffect } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export interface AlertDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function UIAlertDialog({
  isOpen,
  title,
  message,
  type = "warning",
  confirmText = "OK",
  cancelText = "Cancel",
  isConfirm = false,
  isDestructive = false,
  onConfirm,
  onCancel,
}: AlertDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isConfirm && onCancel) onCancel();
        else onConfirm();
      } else if (e.key === "Enter") {
        onConfirm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isConfirm, onConfirm, onCancel]);

  if (!isOpen) return null;

  const icon =
    type === "error" || isDestructive ? (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
        <AlertCircle className="h-5 w-5" />
      </div>
    ) : type === "warning" ? (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 shrink-0">
        <AlertTriangle className="h-5 w-5" />
      </div>
    ) : type === "success" ? (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
        <CheckCircle2 className="h-5 w-5" />
      </div>
    ) : (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-[#0070BA] dark:bg-blue-950/60 dark:text-sky-400 shrink-0">
        <Info className="h-5 w-5" />
      </div>
    );

  const defaultTitle =
    title ||
    (type === "error" || isDestructive
      ? "Attention Required"
      : type === "warning"
      ? "Notice"
      : type === "success"
      ? "Success"
      : "Information");

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-[#0D1527]/95 backdrop-blur-xl animate-in zoom-in-95 duration-200 transition-all text-slate-900 dark:text-white"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          {icon}

          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {defaultTitle}
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={isConfirm && onCancel ? onCancel : onConfirm}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-white/5">
          {isConfirm && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 hover:shadow-rose-600/25"
                : "bg-[#0070BA] hover:bg-[#005a96] hover:shadow-blue-600/25"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
