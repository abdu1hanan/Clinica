import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UsageBanner } from "@/components/UsageBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Clinica — Intelligent Patient Intake & SOAP Note Agent",
  description: "A LangGraph-powered Deep Agent Harness automating clinical SOAP documentation, triage flag scanning, and patient communication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} bg-slate-950 text-slate-100 min-h-screen antialiased flex flex-col`}>
        <UsageBanner />
        {children}
      </body>
    </html>
  );
}
