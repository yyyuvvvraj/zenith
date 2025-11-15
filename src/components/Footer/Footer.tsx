"use client";

import { motion } from "framer-motion";
import { Github, Mail, Linkedin, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-white">
      {/* Gradient Lighting */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(96,165,250,0.25),transparent_65%)]" />

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-12 relative z-10">
        {/* Top Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white text-slate-900 flex items-center justify-center font-bold text-lg shadow-xl">
              Z
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">Zenith</h3>
          </div>

          <p className="text-center md:text-right text-slate-300 text-sm max-w-lg">
            Reimagining academic timetabling. From chaos to clarity—powered by
            intelligent optimization.
          </p>
        </motion.div>

        {/* Link Grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid gap-8 sm:grid-cols-3 text-sm"
        >
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Product</h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <a href="/about" className="hover:text-white transition">
                  About
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition">
                  Features
                </a>
              </li>
              <li>
                <a href="/signup" className="hover:text-white transition">
                  Get started
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white">Resources</h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <a href="#" className="hover:text-white transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Roadmap
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white">Connect</h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2 hover:text-white transition cursor-pointer">
                <Mail size={16} /> contact@zenith.ai
              </li>
              <li className="flex items-center gap-2 hover:text-white transition cursor-pointer">
                <Linkedin size={16} /> Linkedin
              </li>
              <li className="flex items-center gap-2 hover:text-white transition cursor-pointer">
                <Github size={16} /> Github
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Bottom Small Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[12px] text-slate-400"
        >
          <p>© {new Date().getFullYear()} Zenith. All rights reserved.</p>

          <motion.div
            className="flex items-center gap-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={14} /> built to make schedules smarter.
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
