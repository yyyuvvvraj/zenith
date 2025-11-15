// src/components/auth/GoogleButton.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export default function GoogleButton({ onClick }: { onClick: () => Promise<void> | void }) {
  return (
    <Button onClick={onClick} className="flex items-center justify-center gap-3 px-6 py-3 rounded-full">
      <svg width="18" height="18" viewBox="0 0 533.5 544.3" aria-hidden>
        <path fill="#4285F4" d="M533.5 278.4c0-17.6-1.6-35.5-4.9-52.8H272v99.9h146.9c-6.4 34.8-25.9 64.3-55.4 84v69.7h89.5c52.4-48.2 82.5-119.1 82.5-200.8z"/>
        <path fill="#34A853" d="M272 544.3c74.4 0 136.9-24.6 182.6-66.8l-89.5-69.7c-24.9 16.8-57 26.7-93.1 26.7-71.6 0-132.4-48.3-154.2-113.2H29.9v71.1C75 479.7 167 544.3 272 544.3z"/>
        <path fill="#FBBC05" d="M117.8 327.6c-9.8-29-9.8-60.6 0-89.6V167H29.9c-39 77.6-39 169.4 0 247l87.9-86.4z"/>
        <path fill="#EA4335" d="M272 107.1c39.4-.6 77.4 13.6 106.3 39.3l79.6-79.6C407.9 24.4 344.9 0 272 0 167 0 75 64.6 29.9 167l87.9 71.1C139.6 155.4 200.4 107.1 272 107.1z"/>
      </svg>
      Continue with Google
    </Button>
  );
}
