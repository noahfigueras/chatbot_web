"use client";

import { useState } from "react";

export default function GuideCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-neon-cyan/20 rounded-lg overflow-hidden bg-neon-cyan/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-neon-cyan hover:bg-neon-cyan/5 transition-colors"
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium">{title}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 text-xs text-text-muted space-y-2 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
