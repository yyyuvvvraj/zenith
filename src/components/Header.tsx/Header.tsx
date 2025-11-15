"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold shadow-sm">
            Z
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900">
            Zenith
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-900">
          <a href="#features" className="hover:text-slate-600 transition">
            Features
          </a>
          <a href="#about" className="hover:text-slate-600 transition">
            About
          </a>
        </nav>

        {/* CTA Button */}
        <button
          className="
            hidden md:inline-flex rounded-xl px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm 
            bg-gradient-to-r from-[#b6daff] to-[#b6daff] 
            bg-[length:200%_200%] bg-left 
            hover:bg-right hover:from-[#b6daff] hover:to-[#ffd6e9]
            transition-all duration-500 ease-out
          "
        >
          Login
        </button>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-slate-900"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden px-6 py-4 bg-white/70 backdrop-blur-xl border-t border-slate-200 space-y-3 text-sm font-medium">
          <a href="#features" className="block">
            Features
          </a>
          <a href="#about" className="block">
            About
          </a>
          <button
            className="
              w-full rounded-xl px-4 py-2 font-semibold shadow-sm text-slate-900
              bg-gradient-to-r from-[#b6daff] to-[#b6daff]
              bg-[length:200%_200%] bg-left
              hover:bg-right hover:from-[#b6daff] hover:to-[#ffd6e9]
              transition-all duration-500 ease-out
            "
          >
            Login
          </button>
        </div>
      )}
    </header>
  );
}
