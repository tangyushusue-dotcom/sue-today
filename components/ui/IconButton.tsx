"use client";

import type { ReactNode } from "react";

export function IconButton({
  children,
  onClick,
  label,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid h-9 w-9 place-items-center rounded-2xl bg-white/70 text-muted shadow-card transition hover:text-ink ${className}`}
    >
      {children}
    </button>
  );
}
