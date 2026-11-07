import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MilestoneOS — Verified Freelance Milestones & PayPal Payouts",
  description:
    "Work completed. Progress verified. Payments made with confidence. The friendly milestone escrow platform for freelancers and clients.",
  keywords: [
    "Milestone Payments",
    "Freelance Payment Protection",
    "AI Project Verification",
    "Freelancer Escrow",
    "PayPal Integration",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${jakartaSans.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-white text-slate-900 antialiased selection:bg-emerald-500/20 selection:text-emerald-700 dark:bg-[#0B0F19] dark:text-slate-100 dark:selection:text-emerald-300 transition-colors duration-200`}
      >
        {children}
      </body>
    </html>
  );
}
