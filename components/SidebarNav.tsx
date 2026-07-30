"use client";

import {
  LayoutDashboard,
  FolderHeart,
  GitBranch,
  Tag,
  Mail,
  ShieldCheck,
  Users,
  BookOpen,
  Lock,
} from "lucide-react";

interface SidebarNavProps {
  activeTab?: string;
  onNavigate?: (tab: string) => void;
}

export function SidebarNav({ activeTab = "overview", onNavigate }: SidebarNavProps) {
  const handleSelect = (id: string) => {
    if (onNavigate) onNavigate(id);
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard style={{ width: 15, height: 15 }} /> },
    { id: "encounters", label: "Encounters", icon: <FolderHeart style={{ width: 15, height: 15 }} /> },
    { id: "differentials", label: "Differential Dx", icon: <GitBranch style={{ width: 15, height: 15 }} /> },
    { id: "icd10", label: "ICD-10 Codes", icon: <Tag style={{ width: 15, height: 15 }} /> },
    { id: "followup", label: "Patient Follow-Up", icon: <Mail style={{ width: 15, height: 15 }} /> },
    { id: "patients", label: "Patients", icon: <Users style={{ width: 15, height: 15 }} /> },
    { id: "notelibrary", label: "Note library", icon: <BookOpen style={{ width: 15, height: 15 }} /> },
  ];

  const workspaceItems = [
    { id: "safety", label: "Safety protocols", icon: <ShieldCheck style={{ width: 15, height: 15 }} /> },
  ];

  return (
    <aside style={{
      width: 240,
      flexShrink: 0,
      background: "#111113",
      borderRight: "1px solid #242427",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      padding: "20px 16px",
      gap: 20,
      zIndex: 20,
    }}>
      {/* Brand Logo with Generated Emblem */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 6 }}>
        <img
          src="/logo.png"
          alt="Clinica Logo"
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            objectFit: "cover",
            border: "1px solid rgba(45,212,191,0.4)",
            boxShadow: "0 2px 8px rgba(45,212,191,0.2)",
          }}
        />
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>Clinica</h2>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#71717a", letterSpacing: "0.1em", textTransform: "uppercase" }}>NOTE ENGINE</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#ffffff" : "#a1a1aa",
                background: isActive ? "#222226" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ color: isActive ? "#2dd4bf" : "#71717a", display: "flex" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}

        {/* Workspace Section Header */}
        <div style={{ padding: "14px 12px 6px" }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#52525b" }}>
            WORKSPACE
          </span>
        </div>

        {workspaceItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#ffffff" : "#a1a1aa",
                background: isActive ? "#222226" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ color: isActive ? "#2dd4bf" : "#71717a", display: "flex" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom HIPAA Security Card */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{
          background: "#161618",
          border: "1px solid #242427",
          borderRadius: 8,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Lock style={{ width: 12, height: 12, color: "#2dd4bf" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#ffffff" }}>HIPAA-ready workspace</span>
          </div>
          <p style={{ fontSize: 9, color: "#71717a", margin: 0, lineHeight: 1.4 }}>
            Protected health data is encrypted at rest and in transit. Zero-retention AI pipeline.
          </p>
        </div>
      </div>
    </aside>
  );
}
