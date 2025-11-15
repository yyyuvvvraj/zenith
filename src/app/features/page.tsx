"use client";

import { motion, easeOut } from "framer-motion";
import {
  CalendarRange,
  Brain,
  Sparkles,
  Radar,
  Activity,
  Users,
  LayoutDashboard,
  Clock,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: easeOut },
  viewport: { once: true, margin: "-80px" },
});

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6faff] via-[#eef5ff] to-[#e6f0ff] text-slate-900">
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20 space-y-16">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="relative text-center flex flex-col items-center gap-6"
        >
          {/* glow blobs */}
          <div className="pointer-events-none absolute -top-20 right-10 h-40 w-40 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-0 h-32 w-32 rounded-full bg-pink-300/30 blur-3xl" />

          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm border border-slate-100">
            <Sparkles className="h-4 w-4 text-blue-500" />
            Features that actually fix timetable chaos.
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="text-blue-600">design calm schedules</span>.
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Zenith takes care of constraints, clashes, rooms, loads and
              electives—so you can focus on teaching and learning instead of
              firefighting timetables.
            </p>
          </div>
        </motion.div>

        {/* PRIMARY FEATURE CARDS */}
        <motion.div {...fadeUp(0.05)} className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Brain,
              title: "AI timetable engine",
              desc: "Generate multiple timetable options that respect faculty constraints, room capacity, labs and electives.",
              tag: "Core engine",
            },
            {
              icon: CalendarRange,
              title: "True conflict detection",
              desc: "Instantly flag overlapping classes, overbooked rooms, and impossible loads across departments.",
              tag: "Clash-aware",
            },
            {
              icon: LayoutDashboard,
              title: "Role-based dashboards",
              desc: "Different views for admins, course heads, and faculty—on top of the same single source of truth.",
              tag: "Multi-role ready",
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
              >
                <Card className="border-none bg-white/90 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-transparent to-pink-50/70 opacity-80 pointer-events-none" />
                  <CardContent className="relative p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge className="rounded-full bg-white/80 text-slate-700 border-slate-200 text-[10px]">
                        {f.tag}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {f.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* HOW ZENITH THINKS GRID */}
        <motion.div
          {...fadeUp(0.08)}
          className="grid gap-10 lg:grid-cols-[1.2fr,1fr] items-center"
        >
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              How Zenith thinks about scheduling
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Under the hood, Zenith treats every timetable as a set of
              constraints, priorities, and tradeoffs. You tell it how your
              campus actually works, and it builds schedules that respect that
              reality.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl bg-white/90 border border-slate-100 p-4 space-y-2">
                <p className="text-[11px] font-semibold text-slate-900">
                  Constraints first
                </p>
                <p className="text-[11px] text-slate-600">
                  Teaching loads, faculty availability, room capacities, lab
                  dependencies, electives—Zenith keeps all of them in mind.
                </p>
              </div>
              <div className="rounded-2xl bg-white/90 border border-slate-100 p-4 space-y-2">
                <p className="text-[11px] font-semibold text-slate-900">
                  Then optimization
                </p>
                <p className="text-[11px] text-slate-600">
                  It doesn&apos;t just "fit" classes—it optimizes for balance,
                  room usage, and student experience.
                </p>
              </div>
            </div>
          </div>

          {/* MINI SYSTEM CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: easeOut }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 via-pink-200/40 to-indigo-200/40 blur-3xl rounded-[2.25rem]" />
            <div className="relative rounded-[2rem] bg-slate-900 text-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.75)] overflow-hidden">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-500/30 blur-3xl" />
              <div className="absolute -bottom-14 left-10 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl" />

              <div className="relative space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px]">
                    <Workflow className="h-3 w-3" /> Zenith Flow
                  </span>
                  <span className="text-[10px] text-slate-300">
                    Simulating timetable…
                  </span>
                </div>

                <div className="rounded-xl bg-black/40 border border-white/10 p-3 space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-200">
                    <span>Inputs locked</span>
                    <span>⏱ 3.4s</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {["Faculty", "Rooms", "Batches", "Electives"].map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-slate-100"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-2">
                    <p className="text-[9px] text-slate-300">Clash score</p>
                    <p className="text-sm font-semibold">0.03</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-2">
                    <p className="text-[9px] text-slate-300">Utilization</p>
                    <p className="text-sm font-semibold">86%</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-2">
                    <p className="text-[9px] text-slate-300">Balance</p>
                    <p className="text-sm font-semibold">Good</p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Radar className="h-3 w-3" />
                    Ready for review
                  </span>
                  <span>Draft 2 of 4</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* FEATURE GRID – REAL-TIME + ROLES + ANALYTICS */}
        <motion.div {...fadeUp(0.12)} className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">
            Real-time, role-aware, analytics-friendly
          </h2>
          <p className="text-sm sm:text-base text-slate-600 text-center max-w-2xl mx-auto">
            Zenith is designed to feel alive: when reality changes, your
            timetable reacts, not rigidly break.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Clock,
                title: "Live updates",
                desc: "Faculty leave? Room suddenly unavailable? Push changes, and Zenith ripples updates through the timetable.",
              },
              {
                icon: Users,
                title: "Role-based guardrails",
                desc: "Admins control constraints, course heads approve structures, faculty see what they actually teach.",
              },
              {
                icon: Activity,
                title: "Scheduling analytics",
                desc: "Spot overloaded faculty, underused rooms, and fragile parts of the timetable before they become issues.",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <Card
                  key={f.title}
                  className="border-none bg-white/90 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                >
                  <CardHeader className="pb-2 flex flex-row items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      {f.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-slate-600">
                    {f.desc}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* MANUAL VS ZENITH MINI COMPARISON */}
        <motion.div
          {...fadeUp(0.16)}
          className="grid gap-6 lg:grid-cols-2 items-start"
        >
          <Card className="border-none bg-white/90 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">
                Without Zenith
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-2">
              <ul className="space-y-1.5">
                <li>• Timetable drafts live in scattered Excel sheets.</li>
                <li>
                  • Faculty and rooms get double-booked at the last minute.
                </li>
                <li>
                  • Every change feels like breaking a delicate structure.
                </li>
                <li>• No clear view of who is overloaded or underutilized.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none bg-slate-900 text-white rounded-2xl shadow-[0_18px_60px_rgba(15,23,42,0.7)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,#60a5fa,transparent_55%),radial-gradient(circle_at_100%_100%,#f472b6,transparent_55%)] opacity-40" />
            <CardHeader className="pb-2 relative z-10 flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                With Zenith
              </CardTitle>
              <Badge className="bg-white/10 text-white border-white/20 text-[10px] rounded-full">
                Recommended
              </Badge>
            </CardHeader>
            <CardContent className="text-xs text-slate-100 space-y-2 relative z-10">
              <ul className="space-y-1.5">
                <li>• Single, live timetable source of truth.</li>
                <li>• Clash detection baked into every change.</li>
                <li>• Multiple optimized drafts before publishing.</li>
                <li>• Clear dashboards for workloads & utilization.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* SECURITY / RELIABILITY BLURB */}
        <motion.div
          {...fadeUp(0.18)}
          className="mt-4 rounded-3xl bg-white/90 border border-slate-100 shadow-[0_18px_45px_rgba(15,23,42,0.06)] px-5 py-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
        >
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                Built to be a long-term scheduling brain, not a one-off hack.
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                As you expand Zenith, you can layer in auth, role-based access,
                real databases and analytics—this feature layout is ready to
                grow into a full product page.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
