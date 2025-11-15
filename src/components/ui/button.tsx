// src/components/ui/button.tsx
import React from "react";

export function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl shadow-sm border bg-black text-white hover:opacity-90 transition ${className}`}
    >
      {children}
    </button>
  );
}
