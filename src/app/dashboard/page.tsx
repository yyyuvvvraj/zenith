"use client";

import { useState } from "react";
import {
  CalendarDays,
  Users,
  LayoutTemplate,
  BookOpen,
  Sparkles,
  Bell,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Role = "faculty" | "course-head";

const roleLabel: Record<Role, string> = {
  faculty: "Faculty",
  "course-head": "Course Head",
};

export default function Dashboard() {
  const [role, setRole] = useState<Role>("faculty");

  // 🔹 These can later be replaced with real API data per role.
  const quickStats = {
    faculty: [
      {
        label: "Today’s sessions",
        value: "4",
        icon: CalendarDays,
        hint: "Timetable-linked",
      },
      {
        label: "Batches assigned",
        value: "3",
        icon: Users,
        hint: "Across departments",
      },
      {
        label: "Pending actions",
        value: "2",
        icon: Bell,
        hint: "Approvals / updates",
      },
    ],
    "course-head": [
      {
        label: "Active courses",
        value: "12",
        icon: BookOpen,
        hint: "This semester",
      },
      {
        label: "Faculty mapped",
        value: "18",
        icon: Users,
        hint: "Across sections",
      },
      {
        label: "Conflicts flagged",
        value: "5",
        icon: Activity,
        hint: "Needing review",
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f4f7ff] via-[#edf3ff] to-[#e6f0ff]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top: Greeting + role toggle */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-500" />
              Zenith · Unified Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              Good to see you back.
            </h1>
            <p className="text-sm text-slate-500">
              This layout is a base. Later, you can plug in separate data for{" "}
              <span className="font-semibold">Faculty</span> and{" "}
              <span className="font-semibold">Course Head</span> views.
            </p>
          </div>

          {/* Role toggle – later you can connect this to real auth/role */}
          <div className="flex items-center gap-3 justify-end">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Viewing as:
            </span>
            <div className="inline-flex rounded-full bg-white/80 border border-slate-200 shadow-sm p-1 text-xs">
              <button
                type="button"
                onClick={() => setRole("faculty")}
                className={`px-3 py-1.5 rounded-full transition text-xs sm:text-[13px] ${
                  role === "faculty"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => setRole("course-head")}
                className={`px-3 py-1.5 rounded-full transition text-xs sm:text-[13px] ${
                  role === "course-head"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Course Head
              </button>
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid gap-4 sm:grid-cols-3">
          {quickStats[role].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="border-none bg-white/80 shadow-[0_18px_45px_rgba(15,23,42,0.08)] rounded-2xl relative overflow-hidden"
              >
                {/* subtle decorative wash — LOWER opacity so it doesn't wash content */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-pink-50/40 pointer-events-none" />
                <CardContent className="relative p-4 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-slate-400">{stat.hint}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main layout: left & right */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          {/* LEFT SIDE */}
          <div className="space-y-6">
            {/* Placeholder: timetable / course overview */}
            <Card className="border-none bg-white/80 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    {role === "faculty"
                      ? "Today’s teaching overview"
                      : "Course & section overview"}
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    This block is a placeholder. Connect it later to timetable /
                    course assignment data.
                  </p>
                </div>
                <Badge className="rounded-full bg-blue-50 text-blue-700 border-none text-[10px]">
                  Future integration
                </Badge>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3">
                    <p className="text-[11px] text-slate-500 mb-1">
                      Primary focus
                    </p>
                    <p className="font-semibold text-slate-900">
                      {role === "faculty"
                        ? "Classes & student engagement"
                        : "Course structure & mapping"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3">
                    <p className="text-[11px] text-slate-500 mb-1">
                      What this card should show later
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Think: list of today's classes / sections, or high-level
                      course overview.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3">
                    <p className="text-[11px] text-slate-500 mb-1">
                      Suggested next step
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Add API integration here to pull real timetable /
                      course-allocation data once backend is ready.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Placeholder: Role-specific "actions" panel */}
            <Card className="border-none bg-white/80 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  Quick actions
                  <LayoutTemplate className="h-4 w-4 text-slate-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1 text-xs space-y-2">
                <p className="text-slate-500 text-[11px] mb-1">
                  These buttons don't do anything yet — later, you can wire them
                  to real pages or modals.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-slate-200 bg-white text-[11px]"
                  >
                    {role === "faculty"
                      ? "View my timetable"
                      : "View course map"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-slate-200 bg-white text-[11px]"
                  >
                    {role === "faculty"
                      ? "Mark attendance (future)"
                      : "Assign faculty (future)"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-slate-200 bg-white text-[11px]"
                  >
                    {role === "faculty"
                      ? "View student list"
                      : "View departments"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            {/* === Improved Activity & signals card === */}
            <Card className="relative overflow-hidden rounded-2xl shadow-[0_25px_60px_rgba(2,6,23,0.12)]">
              {/* Dark base gradient (makes card pop) */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-pink-300" />

              {/* Very low-opacity radial colour washes for tint (keeps content readable) */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 0% 0%, rgba(96,165,250,0.06) 0%, transparent 35%), radial-gradient(circle at 100% 100%, rgba(244,114,182,0.06) 0%, transparent 40%)",
                }}
              />

              {/* subtle dark overlay to soften top area */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/6 to-transparent opacity-10" />

              {/* Card content on top */}
              <div className="relative z-10 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    Activity & signals
                    <Badge className="bg-white/10 text-white border-white/20 text-[10px] rounded-full">
                      Generic placeholder
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 text-sm">
                  <p className="text-white/90 text-[13px]">
                    Later, this can show timetable conflicts, pending approvals,
                    room-capacity warnings, or upcoming deadlines.
                  </p>

                  <div className="space-y-3">
                    <div className="rounded-xl bg-white/6 border border-white/8 px-3 py-2">
                      <p className="text-[12px] font-semibold text-white/95">
                        Example signal
                      </p>
                      <p className="text-[12px] text-white/80">
                        “Timetable conflict alerts” or “Unassigned subjects”
                        could live here per role.
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/4 border border-white/8 px-3 py-2">
                      <p className="text-[12px] font-semibold text-white/95">
                        Suggested integration
                      </p>
                      <p className="text-[12px] text-white/80">
                        Hook this into your scheduling engine once ready and
                        stream problems/resolutions here.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full border-white/20 text-white/95 hover:bg-white/6"
                    >
                      Design activity API later
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Placeholder: role explanation / dev notes */}
            <Card className="border-none bg-white/80 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  How to extend this dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-slate-600">
                <p className="text-[11px]">
                  This dashboard is intentionally generic. You can split it
                  later into:
                </p>
                <ul className="list-disc list-inside text-[11px] space-y-1">
                  <li>
                    <span className="font-semibold">Faculty dashboard:</span>{" "}
                    connect to individual timetable, class lists, attendance,
                    and performance summaries.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Course Head dashboard:
                    </span>{" "}
                    connect to course mappings, faculty assignments, room
                    utilization, and conflict analytics.
                  </li>
                </ul>
                <p className="text-[11px]">
                  You&apos;ll mostly be swapping the placeholder sections with
                  real charts, tables, and interactive components.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
