"use client";

import {
  Stethoscope,
  LayoutDashboard,
  FolderHeart,
  GitBranch,
  Tag,
  Mail,
  ShieldCheck,
  FileCode2,
  Users,
  BookOpen,
  HelpCircle,
  Settings,
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
    { id: "templates", label: "AI templates", icon: <FileCode2 style={{ width: 15, height: 15 }} /> },
    { id: "safety", label: "Safety protocols", icon: <ShieldCheck style={{ width: 15, height: 15 }} /> },
  ];

  const bottomItems = [
    { id: "help", label: "Help & support", icon: <HelpCircle style={{ width: 15, height: 15 }} /> },
    { id: "settings", label: "Settings", icon: <Settings style={{ width: 15, height: 15 }} /> },
  ];

  return (
    <aside style={{
      width: 240,
      flexShrink: 0,
      background: "#121215",
      borderRight: "1px solid #27272a",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      padding: "20px 16px",
      gap: 20,
      zIndex: 20,
    }}>
      {/* Brand Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 6 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
          boxShadow: "0 2px 8px rgba(20,184,166,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Stethoscope style={{ width: 16, height: 16, color: "#ffffff" }} />
        </div>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#f4f4f5", margin: 0, letterSpacing: "-0.02em" }}>Clinica</h2>
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
                background: isActive ? "#27272a" : "transparent",
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
                background: isActive ? "#27272a" : "transparent",
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

      {/* Bottom Section & HIPAA Badge */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {bottomItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                color: "#71717a",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ color: "#52525b", display: "flex" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* HIPAA Badge Card */}
        <div style={{
          background: "#18181b",
          border: "1px solid #27272a",
          borderRadius: 8,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Lock style={{ width: 12, height: 12, color: "#2dd4bf" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#f4f4f5" }}>HIPAA-ready workspace</span>
          </div>
          <p style={{ fontSize: 9, color: "#71717a", margin: 0, lineHeight: 1.4 }}>
            Protected health data is encrypted at rest and in transit.
          </p>
        </div>
      </div>
    </aside>
  );
}
