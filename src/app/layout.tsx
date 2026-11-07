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
  title: "MilestoneOS — AI-Assisted Project Milestones & PayPal Payouts",
  description:
    "Work completed. Progress verified. Payments made with confidence. The intelligent milestone escrow platform for freelancers and clients.",
  keywords: [
    "PayPal Hackathon 2026",
    "Milestone Payments",
    "AI Project Verification",
    "Freelancer Escrow",
    "Gemini AI",
    "PayPal Sandbox",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${jakartaSans.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-[#080B12] text-slate-100 antialiased selection:bg-[#00E599]/20 selection:text-[#00E599]`}
      >
        {children}
      </body>
    </html>
  );
}
