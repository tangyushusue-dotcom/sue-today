import type { ReactNode } from "react";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-4xl border border-white/60 bg-white/75 shadow-card backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}
