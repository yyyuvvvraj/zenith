"use client";

import { motion, easeOut } from "framer-motion";
import {
  CalendarCheck,
  Brain,
  Sparkles,
  Users,
  Rocket,
  Activity,
  Clock,
  LineChart,
} from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: easeOut },
  viewport: { once: true, margin: "-80px" },
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6faff] via-[#eef5ff] to-[#e6f0ff] text-slate-900">
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20 space-y-20">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="relative text-center flex flex-col items-center gap-6"
        >
          {/* glowing blob */}
          <div className="pointer-events-none absolute -top-20 right-10 h-40 w-40 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-0 h-32 w-32 rounded-full bg-pink-300/30 blur-3xl" />

          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm border border-slate-100">
            <Sparkles className="h-4 w-4 text-blue-500" />
            Built for calm, conflict-free timetables.
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              About <span className="text-blue-600">Us</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600">
              Zenith turns messy Excel sheets and last-minute rescheduling into
              a living, intelligent timetable that adapts to your campus in
              real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 border border-slate-100">
              <Clock className="h-3.5 w-3.5" /> From weeks of planning to
              minutes.
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 border border-slate-100">
              <Activity className="h-3.5 w-3.5" /> Handles clashes, rooms and
              electives automatically.
            </span>
          </div>
        </motion.div>

        {/* METRICS STRIP */}
        <motion.div
          {...fadeUp(0.1)}
          className="grid gap-4 sm:grid-cols-3 bg-white/80 rounded-3xl border border-slate-100 shadow-[0_18px_45px_rgba(15,23,42,0.06)] px-5 py-5 sm:px-8 sm:py-6"
        >
          {[
            {
              label: "Scheduling time saved",
              value: "70%",
              hint: "vs spreadsheets",
            },
            {
              label: "Clash reduction",
              value: "90%",
              hint: "in pilot campuses",
            },
            {
              label: "Room utilization",
              value: "+35%",
              hint: "average improvement",
            },
          ].map((m) => (
            <div
              key={m.label}
              className="flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-[11px] font-medium text-slate-500">
                  {m.label}
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {m.value}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{m.hint}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md text-xs font-mono">
                ζ
              </div>
            </div>
          ))}
        </motion.div>

        {/* WHY ZENITH SECTION */}
        <motion.div
          {...fadeUp(0.15)}
          className="grid gap-10 lg:grid-cols-[1.2fr,1fr] items-center"
        >
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Why Zenith exists
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Every semester, campuses across the world lose days of productive
              time coordinating who teaches where, when, and to whom. Excel
              files are emailed back and forth, room clashes appear at the last
              second, and someone always ends up with an impossible teaching
              load.
            </p>
            <p className="text-sm sm:text-base text-slate-600">
              Zenith was designed to give academic teams a calm control center:
              a place where constraints, preferences, rooms and people come
              together into a timetable that actually works.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-5 rounded-full bg-blue-500" />
                <span>Understand real workloads instead of guessing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-5 rounded-full bg-pink-400" />
                <span>
                  React to changes in minutes: faculty leave, new electives,
                  room closures.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-5 rounded-full bg-indigo-400" />
                <span>Give students clash-free, transparent schedules.</span>
              </li>
            </ul>
          </div>

          {/* Animated "system" card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 via-pink-200/40 to-indigo-200/40 blur-3xl rounded-[2.25rem]" />
            <div className="relative rounded-[2rem] bg-slate-900 text-white p-6 sm:p-7 shadow-[0_24px_70px_rgba(15,23,42,0.75)] overflow-hidden">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-500/30 blur-3xl" />
              <div className="absolute -bottom-14 left-10 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl" />

              <div className="relative z-10 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px]">
                    <Brain className="h-3 w-3" /> Zenith Engine
                  </span>
                  <span className="text-[10px] text-slate-300">
                    Live · Simulating
                  </span>
                </div>

                <div className="rounded-xl bg-black/40 border border-white/10 p-3 space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-200">
                    <span>Constraints</span>
                    <span>12 active</span>
                  </div>
                  <div className="flex gap-1">
                    {["Faculty load", "Room capacity", "Electives", "Labs"].map(
                      (c) => (
                        <span
                          key={c}
                          className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-slate-100"
                        >
                          {c}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-2">
                    <p className="text-[9px] text-slate-300">Clash risk</p>
                    <p className="text-sm font-semibold">Low</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-2">
                    <p className="text-[9px] text-slate-300">Utilization</p>
                    <p className="text-sm font-semibold">87%</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-2">
                    <p className="text-[9px] text-slate-300">Stability</p>
                    <p className="text-sm font-semibold">High</p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <LineChart className="h-3 w-3" />
                    Auto-optimize enabled
                  </span>
                  <span>v0.1 · Demo mode</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* WHO IT'S FOR */}
        <motion.div {...fadeUp(0.18)} className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">
            Built for everyone on campus
          </h2>
          <p className="text-sm sm:text-base text-slate-600 text-center max-w-2xl mx-auto">
            Zenith isn&apos;t just an admin tool. It gives each role on campus a
            clear, focused view of the same source of truth.
          </p>

          <div className="grid gap-6 md:grid-cols-3 mt-4">
            {[
              {
                icon: Users,
                title: "Faculty",
                points: [
                  "Clear weekly view of classes",
                  "Balanced teaching loads",
                  "Instant updates on changes",
                ],
              },
              {
                icon: CalendarCheck,
                title: "Students",
                points: [
                  "Clash-free timetable",
                  "Real-time updates on room / time",
                  "Aligned with electives & labs",
                ],
              },
              {
                icon: Rocket,
                title: "Course heads & admins",
                points: [
                  "Bird’s-eye view of departments",
                  "Conflict + capacity analytics",
                  "Single place to approve changes",
                ],
              },
            ].map((role, i) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.title}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  className="relative rounded-2xl bg-white shadow-lg border border-slate-100 p-5 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-pink-50/60 opacity-70 pointer-events-none" />
                  <div className="relative space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold">{role.title}</h3>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-600">
                      {role.points.map((p) => (
                        <li key={p} className="flex gap-2">
                          <span className="mt-[6px] h-1 w-1 rounded-full bg-slate-400" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* MINI TIMELINE / STORY */}
        <motion.div {...fadeUp(0.2)} className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">
            How a timetable becomes Zenith-ready
          </h2>
          <p className="text-sm sm:text-base text-slate-600 text-center max-w-2xl mx-auto">
            Under the hood, Zenith follows a simple flow. You can evolve this
            into a full product journey section later.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Map your campus",
                desc: "Import departments, batches, sections, rooms and capacities.",
              },
              {
                step: "02",
                title: "Define rules",
                desc: "Teaching loads, unavailable slots, lab constraints, electives.",
              },
              {
                step: "03",
                title: "Generate drafts",
                desc: "Zenith proposes multiple optimized timetables for review.",
              },
              {
                step: "04",
                title: "Publish & adapt",
                desc: "Share instantly with campus and adjust as reality changes.",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                whileHover={{ y: -3 }}
                className="relative rounded-2xl bg-white shadow-md border border-slate-100 px-4 py-4 text-xs space-y-2"
              >
                <span className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white text-[10px] h-6 w-6">
                  {item.step}
                </span>
                <h3 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* MISSION BLOCK */}
        <motion.div
          {...fadeUp(0.22)}
          className="mt-6 p-10 rounded-3xl bg-slate-900 text-white shadow-xl text-center space-y-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,#60a5fa,transparent_55%),radial-gradient(circle_at_100%_100%,#f472b6,transparent_55%)] opacity-40" />
          <div className="relative space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold">Our mission</h2>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
              To make scheduling invisible. We imagine a world where academic
              teams don&apos;t spend nights debugging Excel sheets, where
              students don&apos;t discover clashes on day one, and where every
              hour of teaching happens in the right room, with the right people,
              at the right time.
            </p>
            <p className="text-[11px] text-slate-300">
              Zenith is still early. But every prototype, every campus trial,
              and every new feature is aimed at that single idea:{" "}
              <span className="font-semibold">
                time on campus should be deliberate, not accidental.
              </span>
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
