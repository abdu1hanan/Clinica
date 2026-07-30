"use client";

import { ChevronDown } from "lucide-react";

export function HeaderBar() {
  return (
    <header style={{
      height: 56,
      background: "#09090b",
      borderBottom: "1px solid #27272a",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: "0 28px",
      position: "sticky",
      top: 0,
      zIndex: 15,
    }}>
      {/* User Profile Dropdown: Abdul Hanan */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 10px",
        borderRadius: 8,
        cursor: "pointer",
        background: "#18181b",
        border: "1px solid #27272a",
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(45,212,191,0.15)",
          border: "1px solid rgba(45,212,191,0.3)",
          color: "#2dd4bf",
          fontSize: 10,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          AH
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#f4f4f5" }}>Abdul Hanan</span>
        <ChevronDown style={{ width: 14, height: 14, color: "#71717a" }} />
      </div>
    </header>
  );
}
