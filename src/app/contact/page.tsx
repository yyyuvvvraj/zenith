"use client";

import { motion, easeOut } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Send,
  Clock,
  MessageCircle,
} from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: easeOut },
  viewport: { once: true, margin: "-80px" },
});

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6faff] via-[#eef5ff] to-[#e6f0ff] text-slate-900">
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20 space-y-12">
        {/* Top hero */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative text-center flex flex-col items-center gap-5"
        >
          {/* glow blobs */}
          <div className="pointer-events-none absolute -top-20 right-10 h-40 w-40 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-0 h-32 w-32 rounded-full bg-pink-300/30 blur-3xl" />

          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm border border-slate-100">
            <Sparkles className="h-4 w-4 text-blue-500" />
            Let’s talk about your timetable chaos.
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Contact <span className="text-blue-600">Zenith</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Have questions about scheduling, clashes, or how Zenith can fit
              your institution? Send us a message — we usually respond within a
              day.
            </p>
          </div>
        </motion.div>

        {/* Main grid: form + details */}
        <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr] items-start">
          {/* FORM CARD */}
          <motion.div {...fadeUp(0.05)} className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 via-pink-200/40 to-indigo-200/40 blur-3xl rounded-[2.25rem]" />
            <div className="relative rounded-[2rem] bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)] border border-slate-100 px-6 py-7 sm:px-8 sm:py-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
                  Tell us what you&apos;re planning
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Share a bit about your institution and the scheduling
                  challenges you&apos;re facing.
                </p>
              </div>

              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  // later: hook into API / email service
                }}
              >
                {/* Name + Email */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">
                      Full name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Ananya Sharma"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">
                      Work email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@institution.edu"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                    />
                  </div>
                </div>

                {/* Role + Org */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">
                      Your role
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select role
                      </option>
                      <option>Faculty</option>
                      <option>Course coordinator</option>
                      <option>Head of department</option>
                      <option>Timetable in-charge</option>
                      <option>Administrator</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">
                      Institution / organization
                    </label>
                    <input
                      type="text"
                      placeholder="Zenith Institute of Technology"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                    />
                  </div>
                </div>

                {/* Topic */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">
                    What do you want to talk about?
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      "Pilot for our college",
                      "Timetable conflicts",
                      "Room capacity issues",
                      "Electives & labs",
                      "General questions",
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your current scheduling process, tools you use, and where it breaks down…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 resize-none"
                  />
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                  <button
                    type="submit"
                    className="
                      inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm 
                      bg-gradient-to-r from-[#b6daff] to-[#ffd6e9]
                      hover:shadow-md hover:brightness-105
                      transition-all duration-300
                    "
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send message
                  </button>
                  <p className="text-[11px] text-slate-500">
                    No spam. We&apos;ll only use your details to respond to your
                    query.
                  </p>
                </div>
              </form>
            </div>
          </motion.div>

          {/* INFO / SIDE CARD */}
          <motion.div {...fadeUp(0.12)} className="space-y-5">
            <div className="rounded-3xl bg-slate-900 text-white shadow-[0_22px_60px_rgba(15,23,42,0.8)] p-6 sm:p-7 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,#60a5fa,transparent_55%),radial-gradient(circle_at_100%_100%,#f472b6,transparent_55%)] opacity-40" />
              <div className="relative space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white text-slate-900 flex items-center justify-center font-semibold shadow-md">
                    Z
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Reach the team</h2>
                    <p className="text-[11px] text-slate-200">
                      We&apos;re usually fast on email.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-100">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-[2px]" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-slate-200">
                        contact@zenith-scheduling.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MessageCircle className="h-4 w-4 mt-[2px]" />
                    <div>
                      <p className="font-medium">Ideal messages</p>
                      <p className="text-slate-200 text-[11px]">
                        Pilot requests, collaboration, or detailed scheduling
                        challenges you&apos;d like us to look at.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-[2px]" />
                    <div>
                      <p className="font-medium">Response time</p>
                      <p className="text-slate-200 text-[11px]">
                        Typically within 24 hours on weekdays.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-[2px]" />
                    <div>
                      <p className="font-medium">Based in</p>
                      <p className="text-slate-200 text-[11px]">
                        Built for institutions everywhere, crafted from India.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small info cards */}
            <motion.div
              {...fadeUp(0.18)}
              className="grid gap-4 sm:grid-cols-2 text-xs"
            >
              <div className="rounded-2xl bg-white/90 border border-slate-100 shadow-sm px-4 py-3 space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-900">
                  Already using Zenith?
                </p>
                <p className="text-[11px] text-slate-600">
                  Reach out if you&apos;d like a custom flow for faculty, course
                  heads, or administrators. We can tune the system for your
                  structure.
                </p>
              </div>
              <div className="rounded-2xl bg-white/90 border border-slate-100 shadow-sm px-4 py-3 space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-900">
                  Want a live demo?
                </p>
                <p className="text-[11px] text-slate-600">
                  Mention &quot;demo&quot; in your message and we&apos;ll share
                  a walkthrough link tailored to your college setup.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
