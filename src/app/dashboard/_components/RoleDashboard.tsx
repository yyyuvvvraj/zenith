"use client";

import React, { useMemo, useState, useEffect } from "react";
import { db } from "@/firebase/clientApp";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

type RoleKey = "admin" | "faculty" | "areaHead";

interface RoleDashboardProps {
  role: RoleKey;
}

type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

type SessionType = "Lecture" | "Lab";

type WeekSession = {
  id: string;
  day: DayKey;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  subject: string;
  batch: string;
  room: string;
  type: SessionType;
  faculty: string;
};

type FacultyCredential = {
  id: string;
  name: string;
  username: string;
  password: string;
};

const ROLE_LABEL: Record<RoleKey, string> = {
  admin: "Admin",
  faculty: "Faculty",
  areaHead: "Area Head",
};

const ROLE_TAGLINE: Record<RoleKey, string> = {
  faculty: "Your teaching schedule and load for this week.",
  admin: "Institute-wide snapshot of this week’s teaching activity.",
  areaHead: "Department-level view of teaching, load, and utilization.",
};

const ROLE_BADGE: Record<RoleKey, string> = {
  faculty: "My Week",
  admin: "Organisation View",
  areaHead: "Department View",
};

const DAY_ORDER: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY_LABEL: Record<DayKey, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

const FACULTY_CRED_KEY = "facultyCredentials";

// ---------- Shared base dashboard ----------
interface BaseDashboardProps {
  role: RoleKey;
  facultyName?: string | null;
}

function BaseDashboard({ role, facultyName }: BaseDashboardProps) {
  // ------- Timetable state (user-driven) -------
  const [sessions, setSessions] = useState<WeekSession[]>([]);

  const [form, setForm] = useState<{
    day: DayKey;
    startTime: string;
    endTime: string;
    subject: string;
    batch: string;
    room: string;
    type: SessionType;
    faculty: string;
  }>({
    day: "Mon",
    startTime: "",
    endTime: "",
    subject: "",
    batch: "",
    room: "",
    type: "Lecture",
    faculty: "",
  });

  // ------- Faculty credentials (admin only) -------
  const [facultyNameInput, setFacultyNameInput] = useState("");
  const [facultyCreds, setFacultyCreds] = useState<FacultyCredential[]>([]);

  // Load saved credentials from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(FACULTY_CRED_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as FacultyCredential[];
        setFacultyCreds(parsed);
      } catch {
        // ignore parse error
      }
    }
  }, []);

  // Save credentials to localStorage whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(FACULTY_CRED_KEY, JSON.stringify(facultyCreds));
  }, [facultyCreds]);

  function slugifyName(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "."); // "Sujal Kishore" -> "sujal.kishore"
  }

  function generatePassword(length = 8) {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let out = "";
    for (let i = 0; i < length; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  function handleGenerateFacultyCred(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = facultyNameInput.trim();
    if (!cleanName) return;

    const baseUsername = slugifyName(cleanName);
    // Ensure uniqueness in this list
    let username = baseUsername;
    let counter = 1;
    while (facultyCreds.some((c) => c.username === username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const password = generatePassword();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36);

    const cred: FacultyCredential = {
      id,
      name: cleanName,
      username,
      password,
    };

    setFacultyCreds((prev) => [...prev, cred]);
    setFacultyNameInput("");
  }

  function handleDeleteFacultyCred(id: string) {
    setFacultyCreds((prev) => prev.filter((c) => c.id !== id));
  }

  // ------- Week / date labels -------
  const weekLabel = useMemo(() => {
    const today = new Date();
    const day = today.getDay(); // 0 = Sun, 1 = Mon
    const diffToMonday = (day + 6) % 7; // convert so Monday is 0
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    const fmt = (d: Date) =>
      d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

    return `${fmt(monday)} – ${fmt(saturday)}`;
  }, []);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "short",
      }),
    []
  );

  const todayDayKey: DayKey | null = useMemo(() => {
    const d = new Date().getDay(); // 0 Sun, 1 Mon...
    switch (d) {
      case 1:
        return "Mon";
      case 2:
        return "Tue";
      case 3:
        return "Wed";
      case 4:
        return "Thu";
      case 5:
        return "Fri";
      case 6:
        return "Sat";
      default:
        return null; // Sunday – not in teaching week
    }
  }, []);

  // ------- Group sessions by day -------
  const sessionsByDay: Record<DayKey, WeekSession[]> = useMemo(() => {
    const map: Record<DayKey, WeekSession[]> = {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
      Sat: [],
    };
    sessions.forEach((s) => {
      map[s.day].push(s);
    });

    DAY_ORDER.forEach((d) => {
      map[d].sort((a, b) =>
        (a.startTime || "").localeCompare(b.startTime || "")
      );
    });

    return map;
  }, [sessions]);

  // ------- Stats & alerts -------
  const stats = useMemo(() => {
    let totalSessions = sessions.length;
    let labs = 0;
    let lectures = 0;
    const dayCounts: Record<DayKey, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };

    sessions.forEach((s) => {
      if (s.type === "Lab") labs += 1;
      else lectures += 1;
      dayCounts[s.day] += 1;
    });

    const busiestDay: DayKey | null =
      totalSessions === 0
        ? null
        : DAY_ORDER.reduce((best, curr) =>
            dayCounts[curr] > dayCounts[best] ? curr : best
          );

    return {
      totalSessions,
      labs,
      lectures,
      busiestDay,
      dayCounts,
    };
  }, [sessions]);

  const alerts = useMemo(() => {
    const notes: string[] = [];

    if (sessions.length === 0) {
      notes.push("No sessions added yet. Start by adding a few for this week.");
      return notes;
    }

    // Heuristic: any day with > 4 sessions is "busy"
    DAY_ORDER.forEach((day) => {
      if (stats.dayCounts[day] > 4) {
        notes.push(
          `Heavy load on ${DAY_LABEL[day]} – ${stats.dayCounts[day]} sessions scheduled.`
        );
      }
    });

    // Simple faculty overload detection
    const facultyCounts: Record<string, number> = {};
    sessions.forEach((s) => {
      if (!s.faculty) return;
      facultyCounts[s.faculty] = (facultyCounts[s.faculty] || 0) + 1;
    });

    Object.entries(facultyCounts).forEach(([name, count]) => {
      if (count > 6) {
        notes.push(
          `Potential overload: ${name} has ${count} sessions this week.`
        );
      }
    });

    if (notes.length === 0) {
      notes.push("No obvious clashes or overloads detected from current data.");
    }

    return notes;
  }, [sessions, stats.dayCounts]);

  // ------- Session form handlers -------
  function handleAddSession(e: React.FormEvent) {
    e.preventDefault();

    if (!form.subject.trim()) return;
    if (!form.startTime || !form.endTime) return;

    const newSession: WeekSession = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36),
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
      subject: form.subject.trim(),
      batch: form.batch.trim() || "Unknown",
      room: form.room.trim() || "TBD",
      type: form.type,
      faculty:
        role === "faculty"
          ? form.faculty.trim() || facultyName || "You"
          : form.faculty.trim() || "Unassigned",
    };

    setSessions((prev) => [...prev, newSession]);

    setForm((prev) => ({
      ...prev,
      subject: "",
      batch: "",
      room: "",
      startTime: "",
      endTime: "",
      faculty: role === "faculty" ? prev.faculty : "",
    }));
  }

  function handleRemoveSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  const todaySessions =
    todayDayKey && sessionsByDay[todayDayKey] ? sessionsByDay[todayDayKey] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-6xl space-y-6">
        {/* Header */}
        <header className="rounded-3xl border border-slate-800/80 bg-slate-900/60 shadow-[0_0_60px_rgba(15,23,42,0.9)] backdrop-blur-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {ROLE_BADGE[role]}
            </span>
            <h1 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
              {ROLE_LABEL[role]} Timetable Dashboard
            </h1>
            <p className="mt-1 text-xs text-slate-400 max-w-xl">
              {ROLE_TAGLINE[role]}
            </p>
            {role === "faculty" && (
              <p className="mt-1 text-[11px] text-slate-400">
                Logged in as{" "}
                <span className="font-medium text-slate-100">
                  {facultyName ?? "Faculty User"}
                </span>
              </p>
            )}
          </div>
          <div className="flex flex-col items-start md:items-end gap-1 text-xs">
            <span className="text-slate-300">
              Current Week:{" "}
              <span className="font-medium text-slate-100">{weekLabel}</span>
            </span>
            <span className="text-slate-500">{todayLabel}</span>
          </div>
        </header>

        {/* Top row: stats + add session / faculty creds for admin */}
        <section className="grid grid-cols-1 lg:grid-cols-[2fr,3fr] gap-4">
          {/* Stats */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-3">
                <p className="text-[10px] uppercase text-slate-500 tracking-wide">
                  Total Sessions
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {stats.totalSessions}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {stats.lectures} Lectures · {stats.labs} Labs
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-3">
                <p className="text-[10px] uppercase text-slate-500 tracking-wide">
                  Busiest Day
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {stats.busiestDay ? DAY_LABEL[stats.busiestDay] : "N/A"}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Based on number of sessions this week.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-3">
                <p className="text-[10px] uppercase text-slate-500 tracking-wide">
                  Week Focus
                </p>
                <p className="mt-1 text-sm font-medium">
                  Load-balanced, clash-aware schedule.
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Uses your inputs for rooms, batches, faculty, and subjects.
                </p>
              </div>
            </div>
          </div>

          {/* Add Session form */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Add Weekly Session</h2>
              <span className="text-[11px] text-slate-500">
                Build this week&apos;s timetable manually.
              </span>
            </div>

            <form
              onSubmit={handleAddSession}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"
            >
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Day
                  </label>
                  <select
                    value={form.day}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        day: e.target.value as DayKey,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {DAY_ORDER.map((d) => (
                      <option key={d} value={d}>
                        {DAY_LABEL[d]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Start
                    </label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, startTime: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      End
                    </label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, endTime: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Subject
                  </label>
                  <input
                    value={form.subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    placeholder="e.g., Data Structures"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Batch
                  </label>
                  <input
                    value={form.batch}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, batch: e.target.value }))
                    }
                    placeholder="e.g., CSE A"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Room
                    </label>
                    <input
                      value={form.room}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, room: e.target.value }))
                      }
                      placeholder="e.g., C-101"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Type
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          type: e.target.value as SessionType,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Lecture">Lecture</option>
                      <option value="Lab">Lab</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Faculty {role === "faculty" && <>(optional)</>}
                  </label>
                  <input
                    value={form.faculty}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, faculty: e.target.value }))
                    }
                    placeholder={
                      role === "faculty"
                        ? "Your name (or leave blank)"
                        : "e.g., Dr. Mehta"
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end mt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-medium text-slate-950 shadow-sm hover:bg-emerald-400 transition"
                >
                  + Add Session
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Admin-only: Faculty credentials generator */}
        {role === "admin" && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">
                Faculty Login Credentials
              </h2>
              <p className="text-[11px] text-slate-500">
                Generate username & password for faculty logins.
              </p>
            </div>

            <form
              onSubmit={handleGenerateFacultyCred}
              className="flex flex-col md:flex-row gap-3 items-stretch md:items-end text-xs mb-3"
            >
              <div className="flex-1">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Faculty Name
                </label>
                <input
                  value={facultyNameInput}
                  onChange={(e) => setFacultyNameInput(e.target.value)}
                  placeholder="e.g., Dr. Sujal Kishore"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="md:w-40 rounded-xl bg-indigo-500 px-4 py-1.5 text-xs font-medium text-slate-950 shadow-sm hover:bg-indigo-400 transition"
              >
                Generate Credentials
              </button>
            </form>

            <p className="text-[11px] text-slate-500 mb-2">
              Share the{" "}
              <span className="font-medium text-slate-200">username</span> and{" "}
              <span className="font-medium text-slate-200">password</span> with
              the faculty. They can log in via the faculty section on the
              signup/login page using this username. (Username is based on their
              name, like{" "}
              <code className="bg-slate-800 px-1 rounded">sujal.kishore</code>)
            </p>

            {facultyCreds.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                No faculty credentials generated yet.
              </p>
            ) : (
              <div className="mt-2 space-y-2 text-xs">
                {facultyCreds.map((cred) => (
                  <div
                    key={cred.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-slate-100">{cred.name}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Username:{" "}
                        <code className="bg-slate-900 px-1.5 py-0.5 rounded">
                          {cred.username}
                        </code>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Password:{" "}
                        <code className="bg-slate-900 px-1.5 py-0.5 rounded">
                          {cred.password}
                        </code>
                      </p>
                    </div>
                    <div className="flex gap-2 md:flex-col md:items-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteFacultyCred(cred.id)}
                        className="text-[11px] text-slate-400 hover:text-red-300 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Middle row: today + alerts */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Today */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold mb-1">
              Today&apos;s Snapshot
            </h2>
            <p className="text-[11px] text-slate-500 mb-3">
              Sessions scheduled for{" "}
              {todayDayKey ? DAY_LABEL[todayDayKey] : "today"}.
            </p>
            <div className="space-y-2 text-xs">
              {todayDayKey === null || todaySessions.length === 0 ? (
                <p className="text-slate-500 text-xs">
                  No sessions added for today yet.
                </p>
              ) : (
                todaySessions.map((slot) => (
                  <div
                    key={slot.id}
                    className="border border-slate-800 rounded-2xl bg-slate-950/60 px-3 py-2 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{slot.subject}</span>
                      <span className="text-[11px] text-slate-400">
                        {slot.startTime} – {slot.endTime}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                      <span>Batch: {slot.batch}</span>
                      <span>Room: {slot.room}</span>
                      <span>Type: {slot.type}</span>
                      {role !== "faculty" && (
                        <span>Faculty: {slot.faculty}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Alerts */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold mb-1">Alerts & Imbalances</h2>
            <p className="text-[11px] text-slate-500 mb-3">
              Simple heuristic warnings from this week&apos;s data.
            </p>
            <div className="space-y-2 text-xs">
              {alerts.map((note, idx) => (
                <div
                  key={idx}
                  className={`border rounded-2xl px-3 py-2 ${
                    idx === 0
                      ? "bg-red-500/10 border-red-500/50 text-red-100"
                      : "bg-sky-500/10 border-sky-500/40 text-sky-100"
                  }`}
                >
                  {note}
                </div>
              ))}
              {role !== "faculty" && sessions.length > 0 && (
                <div className="border rounded-2xl px-3 py-2 bg-amber-500/10 border-amber-500/40 text-amber-100 text-xs">
                  Consider generating alternate timetable options to explore
                  better load distribution and room utilization.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Weekly timetable */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold">
                Weekly Timetable Overview
              </h2>
              <p className="text-[11px] text-slate-500">
                Scroll to view all days and sessions for this week.
              </p>
            </div>
            {sessions.length > 0 && (
              <span className="text-[11px] text-slate-400">
                {sessions.length} session{sessions.length > 1 ? "s" : ""} this
                week
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60">
                  <th className="text-left py-2 px-3 font-semibold w-24 text-slate-300">
                    Day
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-300">
                    Sessions
                  </th>
                </tr>
              </thead>
              <tbody>
                {DAY_ORDER.map((day) => (
                  <tr key={day} className="border-b border-slate-900/60">
                    <td className="align-top py-2 px-3 font-medium text-slate-200">
                      {DAY_LABEL[day]}
                    </td>
                    <td className="py-2 px-3">
                      {sessionsByDay[day].length === 0 ? (
                        <span className="text-slate-500 text-xs">
                          No sessions scheduled.
                        </span>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {sessionsByDay[day].map((slot) => (
                            <div
                              key={slot.id}
                              className="border border-slate-800 rounded-2xl bg-slate-950/60 px-3 py-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-slate-100">
                                  {slot.subject}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {slot.startTime} – {slot.endTime}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 mt-1">
                                <span>Batch: {slot.batch}</span>
                                <span>Room: {slot.room}</span>
                                <span>Type: {slot.type}</span>
                                {role !== "faculty" && (
                                  <span>Faculty: {slot.faculty}</span>
                                )}
                              </div>
                              <div className="mt-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSession(slot.id)}
                                  className="text-[10px] text-slate-400 hover:text-red-300 transition"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------- Exported role-specific components ----------

// For admin pages
export function AdminDashboard() {
  return <BaseDashboard role="admin" />;
}

// For faculty pages – reads name from localStorage.currentFacultyUser
export function FacultyDashboard() {
  const [facultyName, setFacultyName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("currentFacultyUser");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.name || parsed?.username) {
        setFacultyName(parsed.name || parsed.username);
      }
    } catch {
      // ignore
    }
  }, []);

  return <BaseDashboard role="faculty" facultyName={facultyName} />;
}

// Backwards compatibility: still expose RoleDashboard if you use it elsewhere
export function RoleDashboard({ role }: RoleDashboardProps) {
  return <BaseDashboard role={role} />;
}
