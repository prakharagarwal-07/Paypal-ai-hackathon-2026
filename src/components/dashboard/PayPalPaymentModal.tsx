"use client";

import { useState } from "react";
import {
  X,
  CheckCircle2,
  RefreshCw,
  Receipt,
  FolderGit2,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Info,
} from "lucide-react";
import { Milestone, ProjectContract } from "@/lib/dashboard-data";
import { PayPalIcon } from "./icons";
import { useDashboard } from "@/lib/dashboard-store";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalPaymentModalProps {
  project: ProjectContract;
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
  onOpenInvoice?: (project: ProjectContract, milestone: Milestone, transactionId?: string) => void;
}

type PaymentState = "idle" | "awaiting_capture" | "paid" | "failed" | "cancelled";

interface VerifiedReceipt {
  captureId: string;
  orderId: string;
  amount: number;
  currency: string;
  payerEmail?: string;
  payerName?: string;
  timestamp: string;
}

export default function PayPalPaymentModal({
  project,
  milestone,
  isOpen,
  onClose,
  onOpenInvoice,
}: PayPalPaymentModalProps) {
  const { makePayment } = useDashboard();
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedReceipt, setVerifiedReceipt] = useState<VerifiedReceipt | null>(null);

  if (!isOpen) return null;

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
  const isConfigured = Boolean(
    clientId && clientId !== "your_paypal_sandbox_client_id_here"
  );

  const rawCurrency = (milestone.currency || project.currency || "USD").toUpperCase();
  const isINR = rawCurrency === "INR";
  const inrContractAmount = milestone.amount;
  const usdAuthEquivalent = Math.max(1, Math.round((inrContractAmount / 85) * 100) / 100);

  const resetToIdle = () => {
    setPaymentState("idle");
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1527] space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <PayPalIcon className="h-5 w-5" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              PayPal Sandbox Checkout
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isCapturing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content View Based on Payment State */}
        {paymentState === "paid" && verifiedReceipt ? (
          /* 1. Verified Payment Completed Screen */
          <div className="text-center py-2 space-y-4">
            <div className="h-14 w-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified PayPal Capture Completed
              </span>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
                {isINR ? `₹${inrContractAmount.toLocaleString()} INR` : `$${verifiedReceipt.amount.toLocaleString()}.00 ${verifiedReceipt.currency}`}
              </h4>
              {isINR && (
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 block font-semibold mt-0.5">
                  PayPal Settled: ${verifiedReceipt.amount.toFixed(2)} USD (at ₹85/USD)
                </span>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Settled to {project.freelancer.name} via PayPal Sandbox Escrow
              </p>
            </div>

            {/* Genuine Receipt Details */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Capture ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px] truncate max-w-[210px]">
                  {verifiedReceipt.captureId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                  {verifiedReceipt.orderId}
                </span>
              </div>
              {verifiedReceipt.payerEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Buyer Account:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {verifiedReceipt.payerEmail}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Milestone:</span>
                <span className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                  {milestone.title}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Project:</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40 truncate max-w-[210px]">
                  <FolderGit2 className="h-3 w-3 text-[#0070BA] dark:text-sky-400 shrink-0" />
                  {project.title}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenInvoice) {
                    onOpenInvoice(project, milestone, verifiedReceipt.captureId);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Receipt className="h-4 w-4" />
                <span>View & Download Invoice</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : paymentState === "awaiting_capture" ? (
          /* 2. Awaiting Backend Capture Screen */
          <div className="text-center py-6 space-y-4">
            <div className="h-14 w-14 mx-auto rounded-full bg-blue-50 dark:bg-sky-950/40 text-[#0070BA] dark:text-sky-400 flex items-center justify-center animate-pulse">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Authorized by Buyer • Capturing Payment...
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Executing server-side capture on PayPal Sandbox REST API and verifying escrow release.
              </p>
            </div>
          </div>
        ) : (
          /* 3. Pre-Payment Review / Interactive Checkout Buttons */
          <div className="space-y-4 text-xs">
            {/* Milestone Contract Scope Overview */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Milestone:</span>
                <span className="font-bold text-slate-900 dark:text-white">{milestone.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Project:</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#0070BA]/10 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 border border-[#0070BA]/20 dark:border-sky-800/40 truncate max-w-[220px]">
                  <FolderGit2 className="h-3 w-3 text-[#0070BA] dark:text-sky-400 shrink-0" />
                  {project.title}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Payee (Freelancer):</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {project.freelancer.name}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Milestone Contract Amount:</span>
                  <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                    {isINR ? `₹${inrContractAmount.toLocaleString()} INR` : `$${milestone.amount.toLocaleString()}.00 USD`}
                  </span>
                </div>
                {isINR && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>PayPal Sandbox Authorization:</span>
                    <span className="font-mono font-medium">~${usdAuthEquivalent.toFixed(2)} USD (at ₹85/USD)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message Alert (Payment Failed) */}
            {paymentState === "failed" && errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>Payment Failed</span>
                </div>
                <p className="text-[11px] leading-relaxed pl-6">{errorMessage}</p>
                <div className="pt-2 pl-6">
                  <button
                    type="button"
                    onClick={resetToIdle}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 cursor-pointer transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Cancellation Message Alert (Buyer Cancelled) */}
            {paymentState === "cancelled" && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Checkout Cancelled</span>
                </div>
                <p className="text-[11px] leading-relaxed pl-6">
                  The checkout window was closed before completion. No funds were debited, and the milestone remains unpaid.
                </p>
                <div className="pt-2 pl-6">
                  <button
                    type="button"
                    onClick={resetToIdle}
                    className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-500 cursor-pointer transition-colors"
                  >
                    Restart Checkout
                  </button>
                </div>
              </div>
            )}

            {/* Live PayPal SDK Buttons Container */}
            {paymentState === "idle" && (
              <div className="space-y-3 pt-1">
                {isINR && (
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 text-sky-900 dark:text-sky-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Info className="h-4 w-4 text-[#0070BA] dark:text-sky-400 shrink-0" />
                      <span>Currency Conversion Notice</span>
                    </div>
                    <p className="text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed">
                      Agreed contract price is <strong className="font-semibold text-slate-900 dark:text-white">₹{inrContractAmount.toLocaleString()} INR</strong>. PayPal Sandbox settles in USD: converted to approximately <strong className="font-mono font-semibold text-slate-900 dark:text-white">${usdAuthEquivalent.toFixed(2)} USD</strong> (exchange rate: 1 USD ≈ ₹85 INR). The seller/freelancer receives funds in USD.
                    </p>
                  </div>
                )}

                {isConfigured ? (
                  <PayPalScriptProvider
                    options={{
                      clientId,
                      currency: isINR ? "USD" : (milestone.currency || "USD"),
                      intent: "capture",
                    }}
                  >
                    <div className="w-full relative z-10">
                      <PayPalButtons
                        style={{
                          layout: "vertical",
                          shape: "rect",
                          color: "gold",
                          height: 46,
                          tagline: false,
                        }}
                        disabled={isCapturing}
                        createOrder={async () => {
                          setErrorMessage(null);
                          try {
                            const res = await fetch("/api/paypal/create-order", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                projectId: project.id,
                                milestoneId: milestone.id,
                              }),
                            });
                            const data = await res.json();
                            if (!res.ok || !data.success || !data.order?.orderId) {
                              const msg = data.error || "Failed to create PayPal Sandbox order.";
                              setErrorMessage(msg);
                              setPaymentState("failed");
                              throw new Error(msg);
                            }
                            return data.order.orderId;
                          } catch (err: any) {
                            setPaymentState("failed");
                            setErrorMessage(err.message || "Failed to initiate PayPal order.");
                            throw err;
                          }
                        }}
                        onApprove={async (data) => {
                          // Payer approved in PayPal popup -> trigger backend capture
                          setPaymentState("awaiting_capture");
                          setIsCapturing(true);
                          setErrorMessage(null);

                          try {
                            const res = await fetch("/api/paypal/capture-order", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                orderId: data.orderID,
                                projectId: project.id,
                                milestoneId: milestone.id,
                              }),
                            });

                            const captureData = await res.json();

                            if (
                              !res.ok ||
                              !captureData.success ||
                              captureData.capture?.status !== "COMPLETED"
                            ) {
                              const errorMsg =
                                captureData.error ||
                                `PayPal capture failed with status: ${captureData.capture?.status || "UNKNOWN"}`;
                              setPaymentState("failed");
                              setErrorMessage(errorMsg);
                              return;
                            }

                            // Genuine verified capture from PayPal Sandbox REST API!
                            const verified = captureData.capture;
                            const captureId = verified.captureId;

                            // Update frontend client state ONLY after confirmed backend success
                            makePayment(project.id, milestone.id, captureId, verified.timestamp);

                            setVerifiedReceipt({
                              captureId,
                              orderId: data.orderID,
                              amount: verified.amount,
                              currency: verified.currency,
                              payerEmail: verified.payerEmail,
                              payerName: verified.payerName,
                              timestamp: verified.timestamp,
                            });
                            setPaymentState("paid");
                          } catch (err: any) {
                            console.error("Capture API Error:", err);
                            setPaymentState("failed");
                            setErrorMessage(
                              err.message || "Network error while completing payment capture."
                            );
                          } finally {
                            setIsCapturing(false);
                          }
                        }}
                        onCancel={() => {
                          setPaymentState("cancelled");
                          setErrorMessage("You closed the PayPal Sandbox checkout window. No payment was made.");
                        }}
                        onError={(err) => {
                          console.error("PayPal SDK Error:", err);
                          setPaymentState("failed");
                          setErrorMessage(
                            "PayPal checkout encountered an issue. Ensure you are using your PayPal Sandbox buyer account."
                          );
                        }}
                      />
                    </div>
                  </PayPalScriptProvider>
                ) : (
                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>PayPal Client ID Missing</span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      Please define <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> in <code>.env.local</code> to render genuine PayPal checkout buttons.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                  <Info className="h-3.5 w-3.5" />
                  <span>Log in with your Sandbox Personal buyer account to approve.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
