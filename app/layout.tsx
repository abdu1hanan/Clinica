import type { Metadata } from "next";
import "./globals.css";
import { UsageBanner } from "@/components/UsageBanner";

export const metadata: Metadata = {
  title: "Clinica — Clinical Documentation & Triage Platform",
  description: "Enterprise-grade clinical SOAP documentation, differential diagnosis, ICD-10 coding, and patient care instruction engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }} suppressHydrationWarning>
        <UsageBanner />
        {children}
      </body>
    </html>
  );
}
