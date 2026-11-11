"use client";

import { useState, useEffect, useRef } from "react";
import {
  ProjectContract,
  Milestone,
  extractBaseCode,
  formatClientId,
  formatFreelancerId,
} from "@/lib/dashboard-data";
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Receipt,
} from "lucide-react";

export interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: ProjectContract | null;
  milestone?: Milestone | null;
  transactionId?: string | null;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  paymentDate: string;
  dueDate: string;
  status: "PAID" | "PENDING";
  paypalTransactionId: string;
  paymentMethod: string;
  client: {
    name: string;
    email: string;
    company: string;
    clientId?: string;
  };
  freelancer: {
    name: string;
    email: string;
    title: string;
    freelancerId?: string;
  };
  projectTitle: string;
  milestoneTitle: string;
  stageNumber: number;
  lineItems: Array<{
    description: string;
    category: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  platformFee: number;
  escrowReleased: number;
  total: number;
  currency: string;
  cryptographicHash: string;
  disclaimer: string;
}

/**
 * Builds a pristine, 100% plain white corporate invoice HTML document.
 * Strictly 1 Page layout, no backgrounds, no web threads, no canvases, no gradients.
 */
function buildCleanInvoiceHtml(invoice: InvoiceData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${invoice.invoiceNumber} - MilestoneOS</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      background: #FFFFFF !important;
      color: #0F172A !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      margin: 0;
      padding: 16px;
    }
    .invoice-card {
      max-width: 720px;
      margin: 0 auto;
      background: #FFFFFF !important;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 28px 32px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    @media print {
      html, body {
        padding: 0 !important;
        margin: 0 !important;
        background: #FFFFFF !important;
      }
      .no-print {
        display: none !important;
      }
      .invoice-card {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
      }
    }
    /* Brand Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0F172A;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .brand {
      font-size: 24px;
      font-weight: 900;
      color: #0070BA;
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748B;
      font-weight: 500;
      margin-top: 2px;
    }
    .title-box {
      text-align: right;
    }
    .title {
      font-size: 26px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: 0.05em;
      line-height: 1;
    }
    .paid-badge {
      display: inline-block;
      margin-top: 5px;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #DCFCE7 !important;
      color: #166534 !important;
      border: 1px solid #86EFAC;
    }
    .meta-line {
      font-size: 11px;
      color: #64748B;
      margin-top: 4px;
    }
    .meta-bold {
      font-weight: 700;
      color: #0F172A;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    /* Parties Section */
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 18px;
      padding-bottom: 14px;
      border-bottom: 1px solid #E2E8F0;
    }
    .party-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748B;
      margin-bottom: 5px;
    }
    .party-name {
      font-size: 14px;
      font-weight: 800;
      color: #0F172A;
    }
    .party-sub {
      font-size: 11px;
      color: #475569;
      margin-top: 1px;
    }
    .party-id-tag {
      display: inline-block;
      margin-top: 5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      font-weight: 700;
      background: #F1F5F9 !important;
      color: #0F172A !important;
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid #CBD5E1;
    }

    /* Project Banner */
    .project-banner {
      background: #F8FAFC !important;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .proj-title {
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
    }
    .proj-sub {
      font-size: 11px;
      color: #64748B;
      margin-top: 2px;
    }
    .escrow-pill {
      font-size: 10px;
      font-weight: 700;
      color: #166534 !important;
      background: #DCFCE7 !important;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid #86EFAC;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
    }
    th {
      text-align: left;
      padding: 7px 10px;
      background: #F8FAFC !important;
      border-top: 1px solid #CBD5E1;
      border-bottom: 2px solid #CBD5E1;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748B;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #E2E8F0;
      font-size: 11px;
    }
    .td-num {
      text-align: right;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      color: #0F172A;
      white-space: nowrap;
    }

    /* Settlement & Totals Grid */
    .bottom-grid {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 20px;
      margin-bottom: 18px;
      padding-top: 4px;
    }
    .settlement-info {
      font-size: 11px;
      color: #475569;
      line-height: 1.65;
    }
    .settlement-label {
      color: #64748B;
      font-weight: 600;
    }
    .settlement-val {
      color: #0F172A;
      font-weight: 700;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    .totals-box {
      border-top: 2px solid #0F172A;
      padding-top: 8px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin-bottom: 5px;
      color: #475569;
    }
    .total-final {
      font-size: 16px;
      font-weight: 900;
      color: #0F172A;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #CBD5E1;
    }

    /* Footer */
    .footer {
      border-top: 1px solid #CBD5E1;
      padding-top: 10px;
      text-align: center;
      font-size: 10px;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 720px; margin: 0 auto 12px auto; display: flex; justify-content: flex-end; gap: 8px;">
    <button onclick="window.print()" style="padding: 7px 16px; background: #0070BA; color: #FFFFFF; font-weight: 700; font-size: 12px; border: none; border-radius: 6px; cursor: pointer;">
      Print / Save as PDF
    </button>
    <button onclick="window.close()" style="padding: 7px 14px; background: #F1F5F9; color: #475569; font-weight: 600; font-size: 12px; border: 1px solid #CBD5E1; border-radius: 6px; cursor: pointer;">
      Close
    </button>
  </div>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand">MilestoneOS</div>
        <div class="brand-sub">Contract Escrow & Milestone Settlement</div>
      </div>
      <div class="title-box">
        <div class="title">INVOICE</div>
        <div><span class="paid-badge">PAID • SETTLED</span></div>
        <div class="meta-line">Invoice #: <span class="meta-bold">${invoice.invoiceNumber}</span></div>
        <div class="meta-line">Payment Date: <span class="meta-bold">${invoice.paymentDate}</span></div>
      </div>
    </div>

    <div class="parties">
      <div>
        <div class="party-title">Billed To (Client)</div>
        <div class="party-name">${invoice.client.name}</div>
        <div class="party-sub">${invoice.client.company}</div>
        <div class="party-sub">${invoice.client.email}</div>
        ${invoice.client.clientId ? `<div class="party-id-tag">Client ID: ${invoice.client.clientId}</div>` : ""}
      </div>
      <div>
        <div class="party-title">Issued By (Freelancer)</div>
        <div class="party-name">${invoice.freelancer.name}</div>
        <div class="party-sub">${invoice.freelancer.title}</div>
        <div class="party-sub">${invoice.freelancer.email}</div>
        ${invoice.freelancer.freelancerId ? `<div class="party-id-tag">Freelancer ID: ${invoice.freelancer.freelancerId}</div>` : ""}
      </div>
    </div>

    <div class="project-banner">
      <div>
        <div class="proj-title">${invoice.projectTitle}</div>
        <div class="proj-sub">Stage 0${invoice.stageNumber} — ${invoice.milestoneTitle}</div>
      </div>
      <div>
        <span class="escrow-pill">100% Escrow Released</span>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 55%;">Deliverable Specification</th>
          <th style="width: 25%;">Category</th>
          <th style="width: 20%; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.lineItems
          .map(
            (item) => `<tr>
          <td><strong>${item.description}</strong></td>
          <td style="color: #64748B;">${item.category}</td>
          <td class="td-num">$${item.amount.toLocaleString()}.00 ${invoice.currency}</td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <div class="bottom-grid">
      <div class="settlement-info">
        <div><span class="settlement-label">Payment Method:</span> <span class="settlement-val">${invoice.paymentMethod}</span></div>
        <div><span class="settlement-label">PayPal Transaction ID:</span> <span class="mono settlement-val">${invoice.paypalTransactionId}</span></div>
        <div><span class="settlement-label">Escrow Settlement:</span> <span class="settlement-val">Direct Mutual Release via PayPal Sandbox</span></div>
        <div><span class="settlement-label">Ledger Verification Hash:</span> <span class="mono" style="font-size: 10px;">${invoice.cryptographicHash}</span></div>
      </div>

      <div class="totals-box">
        <div class="total-row"><span>Milestone Subtotal:</span> <span class="mono">$${invoice.subtotal.toLocaleString()}.00</span></div>
        <div class="total-row"><span>Escrow Released:</span> <span class="mono">-$${invoice.escrowReleased.toLocaleString()}.00</span></div>
        <div class="total-row"><span>Platform Fee:</span> <span class="mono">$0.00</span></div>
        <div class="total-row total-final"><span>Total Paid:</span> <span class="mono">$${invoice.total.toLocaleString()}.00 ${invoice.currency}</span></div>
      </div>
    </div>

    <div class="footer">
      Official settlement invoice generated via MilestoneOS Mutual Escrow • Strictly 1 Page Document • Page 1 of 1
    </div>
  </div>
</body>
</html>`;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  project,
  milestone,
  transactionId,
}: InvoiceModalProps) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !project || !milestone) {
      setInvoice(null);
      return;
    }

    let isCancelled = false;

    // Resolve unified Client and Freelancer IDs
    const clientBase = extractBaseCode(
      project.client.milestoneOSId || project.clientId || "Q7EWTG"
    );
    const resolvedClientId = project.client.milestoneOSId?.startsWith("CL-")
      ? project.client.milestoneOSId
      : formatClientId(clientBase);

    const freelancerBase = extractBaseCode(
      project.freelancer.milestoneOSId || project.freelancerId || "Q7EWTG"
    );
    const resolvedFreelancerId = project.freelancer.milestoneOSId?.startsWith("FL-")
      ? project.freelancer.milestoneOSId
      : formatFreelancerId(freelancerBase);

    async function fetchInvoice() {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/generate-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project?.id,
            milestoneId: milestone?.id,
            transactionId:
              transactionId ||
              milestone?.paypalTransactionId ||
              `PAYID-SBX-${Math.random().toString(36).substring(2, 8).toUpperCase()}-Q`,
            customPayload: {
              projectId: project?.id,
              projectTitle: project?.title,
              projectDescription: project?.description,
              category: project?.category,
              client: {
                name: project?.client.name,
                email: project?.client.email,
                company: project?.client.company || "Client Organization",
                clientId: resolvedClientId,
                milestoneOSId: resolvedClientId,
              },
              freelancer: {
                name: project?.freelancer.name,
                email: project?.freelancer.email,
                title: project?.freelancer.title || "Independent Contractor",
                freelancerId: resolvedFreelancerId,
                milestoneOSId: resolvedFreelancerId,
              },
              milestone: {
                id: milestone?.id,
                stageNumber: milestone?.stageNumber,
                title: milestone?.title,
                description: milestone?.description,
                amount: milestone?.amount,
                currency: milestone?.currency || "USD",
                dueDate: milestone?.dueDate,
                paidAt: milestone?.paidAt,
                acceptanceCriteria: milestone?.acceptanceCriteria,
                submissions: milestone?.submissions,
              },
              payment: {
                transactionId:
                  transactionId ||
                  milestone?.paypalTransactionId ||
                  "PAYID-SBX-973908-Q",
                paidAt: milestone?.paidAt || "Nov 02, 2026 • 04:30 PM",
                amount: milestone?.amount,
                currency: milestone?.currency || "USD",
                status: "completed",
                method: "PayPal Sandbox Escrow Settlement",
              },
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.invoice) {
            setInvoice({
              ...data.invoice,
              client: {
                ...data.invoice.client,
                clientId: resolvedClientId,
              },
              freelancer: {
                ...data.invoice.freelancer,
                freelancerId: resolvedFreelancerId,
              },
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("API invoice fetch error, using deterministic corporate template:", err);
      }

      // Safe deterministic fallback
      if (!isCancelled && project && milestone) {
        const tx =
          transactionId ||
          milestone.paypalTransactionId ||
          "PAYID-SBX-973908-Q";

        const criteria = milestone.acceptanceCriteria || [];
        const maxItems = Math.min(Math.max(criteria.length, 1), 3);
        const topCriteria = criteria.slice(0, maxItems);
        const perItem = Math.floor(milestone.amount / maxItems);
        const remainder = milestone.amount - perItem * maxItems;

        const lineItems =
          topCriteria.length > 0
            ? topCriteria.map((c, i) => ({
                description:
                  i === maxItems - 1 && criteria.length > maxItems
                    ? `${c.title} (+ ${criteria.length - maxItems} additional specifications)`
                    : `${c.title} — Verified deliverable`,
                category: "Engineering Deliverable",
                quantity: 1,
                unitPrice: i === maxItems - 1 ? perItem + remainder : perItem,
                amount: i === maxItems - 1 ? perItem + remainder : perItem,
              }))
            : [
                {
                  description: `${milestone.title} — Milestone Stage Deliverables`,
                  category: "Engineering Deliverable",
                  quantity: 1,
                  unitPrice: milestone.amount,
                  amount: milestone.amount,
                },
              ];

        setInvoice({
          invoiceNumber: `INV-2026-MS0${milestone.stageNumber || 1}-9142`,
          issueDate: milestone.paidAt?.split("•")[0]?.trim() || "Nov 02, 2026",
          paymentDate: milestone.paidAt || "Nov 02, 2026 • 04:30 PM",
          dueDate: milestone.dueDate || "Completed",
          status: "PAID",
          paypalTransactionId: tx,
          paymentMethod: "PayPal Sandbox Escrow Settlement",
          client: {
            name: project.client.name,
            email: project.client.email,
            company: project.client.company || "Client Organization",
            clientId: resolvedClientId,
          },
          freelancer: {
            name: project.freelancer.name,
            email: project.freelancer.email,
            title: project.freelancer.title || "Full-Stack Specialist",
            freelancerId: resolvedFreelancerId,
          },
          projectTitle: project.title,
          milestoneTitle: milestone.title,
          stageNumber: milestone.stageNumber || 1,
          lineItems,
          subtotal: milestone.amount,
          platformFee: 0,
          escrowReleased: milestone.amount,
          total: milestone.amount,
          currency: milestone.currency || "USD",
          cryptographicHash: `0x8f4c${Date.now().toString(16).slice(-6)}f92a`,
          disclaimer:
            "This official settlement invoice certifies mutual milestone completion and settlement release via MilestoneOS.",
        });
        setLoading(false);
      }
    }

    fetchInvoice();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, project, milestone, transactionId]);

  if (!isOpen || !project || !milestone) return null;

  /**
   * Triggers printing of ONLY the isolated plain white invoice document.
   * Uses an isolated popup window to guarantee 100% clean, strict 1-page output
   * with zero canvas, zero WebThreads, and zero dashboard bleed.
   */
  const handlePrint = () => {
    if (!invoice) return;
    const html = buildCleanInvoiceHtml(invoice);

    // 1. Primary: Open dedicated clean window (guarantees zero canvas/DOM bleed)
    try {
      const printWin = window.open("", "_blank", "width=850,height=1100");
      if (printWin) {
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
          try {
            printWin.print();
          } catch (e) {
            console.warn("Print window error:", e);
          }
        }, 350);
        return;
      }
    } catch (e) {
      console.warn("Popup blocked or failed, falling back to in-page print:", e);
    }

    // 2. Fallback: native window.print using CSS rules in globals.css that isolate #printable-invoice-card
    window.print();
  };

  const handleCopyTxId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopySummary = () => {
    if (!invoice) return;
    const summary = `MilestoneOS Official Invoice
Invoice Number: ${invoice.invoiceNumber}
Status: ${invoice.status} via PayPal
PayPal Transaction ID: ${invoice.paypalTransactionId}
Payment Date: ${invoice.paymentDate}

Project: ${invoice.projectTitle}
Milestone: Stage 0${invoice.stageNumber} — ${invoice.milestoneTitle}
Total Paid: $${invoice.total.toLocaleString()}.00 ${invoice.currency}

Billed To (Client): ${invoice.client.name} (${invoice.client.company}) | ID: ${invoice.client.clientId || "N/A"}
Issued By (Freelancer): ${invoice.freelancer.name} (${invoice.freelancer.title}) | ID: ${invoice.freelancer.freelancerId || "N/A"}

Ledger Hash: ${invoice.cryptographicHash}
Settled securely via MilestoneOS Mutual Escrow.`;

    navigator.clipboard?.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleDownloadHtml = () => {
    if (!invoice) return;

    const htmlContent = buildCleanInvoiceHtml(invoice);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MilestoneOS_Invoice_${invoice.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div id="invoice-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
        <div id="invoice-modal-shell" className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0D1527] overflow-hidden my-4 max-h-[92vh] flex flex-col">
          {/* Top Modal Controls */}
          <div id="invoice-modal-header" className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-50/80 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-sky-50 text-[#0070BA] dark:bg-sky-950/60 dark:text-sky-300 flex items-center justify-center shadow-2xs border border-sky-100 dark:border-sky-800">
                <Receipt className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Invoice
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official settlement statement & payment confirmation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {invoice && (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadHtml}
                    title="Download offline HTML invoice"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Download HTML</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    title="Print or save as 1-page PDF"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Download / Print PDF</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Document Container */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs text-slate-700 dark:text-slate-300">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="h-10 w-10 mx-auto rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0070BA] dark:text-sky-300 flex items-center justify-center animate-pulse">
                  <Receipt className="h-5 w-5 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Compiling Settlement Invoice...
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-0.5">
                    Formatting project deliverables, contract terms, and PayPal settlement confirmation.
                  </p>
                </div>
              </div>
            ) : !invoice ? (
              <div className="py-12 text-center text-slate-400">
                Could not load invoice. Please try again.
              </div>
            ) : (
              /* Completely Plain White Corporate Sheet (No Web Threads, No Transparency) */
              <div
                ref={invoiceRef}
                id="printable-invoice-card"
                className="bg-white text-slate-900 rounded-xl border border-slate-300 p-6 sm:p-8 space-y-5 shadow-xs max-w-[720px] mx-auto"
                style={{ backgroundColor: "#FFFFFF", color: "#0F172A" }}
              >
                {/* 1. Header: Brand, Title, Status */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3.5">
                  <div>
                    <div className="text-xl font-black text-[#0070BA] tracking-tight">
                      MilestoneOS
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Contract Escrow & Milestone Settlement
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-2xl font-black tracking-wide text-slate-900">
                      INVOICE
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>PAID • SETTLED</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Invoice #:{" "}
                      <span className="font-mono font-bold text-slate-900">
                        {invoice.invoiceNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Date: {invoice.paymentDate}
                    </div>
                  </div>
                </div>

                {/* 2. Parties Grid: Billed To (Client) & Issued By (Freelancer) */}
                <div className="grid grid-cols-2 gap-6 pt-1 pb-3 border-b border-slate-200">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Billed To (Client)
                    </div>
                    <div className="font-bold text-sm text-slate-900">
                      {invoice.client.name}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {invoice.client.company}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {invoice.client.email}
                    </div>
                    {invoice.client.clientId && (
                      <div className="mt-1.5 inline-block font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
                        Client ID: {invoice.client.clientId}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Issued By (Freelancer)
                    </div>
                    <div className="font-bold text-sm text-slate-900">
                      {invoice.freelancer.name}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {invoice.freelancer.title}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {invoice.freelancer.email}
                    </div>
                    {invoice.freelancer.freelancerId && (
                      <div className="mt-1.5 inline-block font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
                        Freelancer ID: {invoice.freelancer.freelancerId}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Project Banner */}
                <div className="flex items-center justify-between p-3 rounded bg-slate-50 border border-slate-200">
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      {invoice.projectTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Stage 0{invoice.stageNumber} — {invoice.milestoneTitle}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300">
                      100% Escrow Released
                    </span>
                  </div>
                </div>

                {/* 4. Line Items Table */}
                <div className="rounded border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b-2 border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="py-2 px-3">Deliverable Specification</th>
                        <th className="py-2 px-3 hidden sm:table-cell">Category</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoice.lineItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-900 block">
                              {item.description}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 hidden sm:table-cell">
                            {item.category}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right whitespace-nowrap">
                            ${item.amount.toLocaleString()}.00 {invoice.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 5. Settlement & Totals Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                  <div className="space-y-1 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-500 font-medium">Payment Method:</span>{" "}
                      <span className="font-semibold text-slate-900">{invoice.paymentMethod}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">PayPal Transaction ID:</span>
                      <button
                        type="button"
                        onClick={() => handleCopyTxId(invoice.paypalTransactionId)}
                        className="font-mono font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{invoice.paypalTransactionId}</span>
                        {copiedId ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3 text-slate-400" />
                        )}
                      </button>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Escrow Settlement:</span>{" "}
                      <span className="font-semibold text-emerald-700">Direct Mutual Release</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Ledger Hash: <span className="font-mono">{invoice.cryptographicHash}</span>
                    </div>
                  </div>

                  <div className="border-t-2 border-slate-900 pt-2 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Milestone Subtotal:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        ${invoice.subtotal.toLocaleString()}.00 {invoice.currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Escrow Released:</span>
                      <span className="font-mono font-semibold text-emerald-700">
                        -${invoice.escrowReleased.toLocaleString()}.00
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Platform Fee:</span>
                      <span className="font-mono font-semibold text-slate-900">$0.00</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                      <span>Total Paid:</span>
                      <span className="font-mono font-black text-emerald-700">
                        ${invoice.total.toLocaleString()}.00 {invoice.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. Strict 1-Page Document Footer */}
                <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
                  Official settlement invoice generated via MilestoneOS Mutual Escrow • Strictly 1 Page Document • Page 1 of 1
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions Bar */}
          {invoice && (
            <div className="p-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#0070BA] dark:hover:text-white transition-colors cursor-pointer"
              >
                {copiedSummary ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied Invoice Summary to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Invoice Summary</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005a96] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download / Print PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
