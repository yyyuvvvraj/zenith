"use client";

import React, { useMemo, useState, useEffect } from "react";

export type TimetableSlot = {
  day: string;
  time: string;
  classroom: string;
  batch: string;
  subject: string;
  faculty: string;
};

type CalendarViewMode = "all" | "batch" | "faculty" | "room";

type EventType = "Holiday" | "Exam Week" | "Fest";

type AcademicEvent = {
  id: number;
  label: string;
  type: EventType;
  day: string; // Monday–Friday
  affects: "all" | "batch";
  batch?: string;
  blocksTeaching: boolean;
  date?: string; // YYYY-MM-DD (optional)
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TIME_SLOTS = [
  "08:30–09:30",
  "09:30–10:30",
  "10:30–11:30",
  "11:30–12:30",
  "12:30–13:30",
  "13:30–14:30",
  "14:30–15:30",
  "15:30–16:30",
  "16:30–17:30",
];

const TimetableStudentPage: React.FC = () => {
  // ====== READ-ONLY DATA STATE (STUDENT VIEW) ======
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([
    {
      id: 1,
      label: "College Fest",
      type: "Fest",
      day: "Friday",
      affects: "all",
      blocksTeaching: false,
    },
  ]);

  // In real app, fetch timetable/events from backend here:
  useEffect(() => {
    // Example placeholder: replace with Firestore / API fetch
    // setTimetable(fetchedTimetableFromBackend);
  }, []);

  // ====== DERIVED LISTS ======
  const uniqueBatches = useMemo(
    () => Array.from(new Set(timetable.map((t) => t.batch))).sort(),
    [timetable]
  );

  const uniqueFaculties = useMemo(
    () =>
      Array.from(
        new Set(
          timetable
            .map((t) => t.faculty)
            .filter((f) => f && f.trim().length > 0)
        )
      ).sort(),
    [timetable]
  );

  const uniqueRooms = useMemo(
    () => Array.from(new Set(timetable.map((t) => t.classroom))).sort(),
    [timetable]
  );

  const eventsByDay = useMemo(() => {
    const map: Record<string, AcademicEvent[]> = {};
    DAYS.forEach((d) => (map[d] = []));
    events.forEach((e) => {
      if (!map[e.day]) map[e.day] = [];
      map[e.day].push(e);
    });
    return map;
  }, [events]);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const roleRaw = window.localStorage.getItem("currentUserRole");
    let orgCode = "DEFAULT_ORG";
    try {
      if (roleRaw) {
        const parsed = JSON.parse(roleRaw);
        if (parsed?.orgCode) orgCode = parsed.orgCode;
      }
    } catch {
      // ignore
    }

    const stored = window.localStorage.getItem(`timetable_${orgCode}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TimetableSlot[];
        setTimetable(parsed);
      } catch {
        // ignore parse error
      }
    }
  }, []);

  // ====== CALENDAR FILTERS ======
  const [calendarView, setCalendarView] = useState<CalendarViewMode>("all");
  const [calendarBatch, setCalendarBatch] = useState<string>("");
  const [calendarFaculty, setCalendarFaculty] = useState<string>("");
  const [calendarRoom, setCalendarRoom] = useState<string>("");

  const filteredTimetable = useMemo(() => {
    let data = timetable;

    if (calendarView === "batch" && calendarBatch) {
      data = data.filter((t) => t.batch === calendarBatch);
    } else if (calendarView === "faculty" && calendarFaculty) {
      data = data.filter((t) => t.faculty === calendarFaculty);
    } else if (calendarView === "room" && calendarRoom) {
      data = data.filter((t) => t.classroom === calendarRoom);
    }

    return data;
  }, [timetable, calendarView, calendarBatch, calendarFaculty, calendarRoom]);

  const calendarData = useMemo(() => {
    const map: Record<string, Record<string, TimetableSlot[]>> = {};

    for (const day of DAYS) {
      map[day] = {};
      for (const time of TIME_SLOTS) {
        map[day][time] = [];
      }
    }

    for (const slot of filteredTimetable) {
      if (!map[slot.day]) map[slot.day] = {};
      if (!map[slot.day][slot.time]) map[slot.day][slot.time] = [];
      map[slot.day][slot.time].push(slot);
    }

    return map;
  }, [filteredTimetable]);

  // ====== SIMPLE INSIGHTS (STUDENT-FRIENDLY SUMMARY) ======
  const insights = useMemo(() => {
    const totalSessions = timetable.length;

    const roomsCount = Math.max(uniqueRooms.length || 1, 1);
    const totalTimeSlots = DAYS.length * TIME_SLOTS.length * roomsCount;
    const utilization =
      totalSessions > 0
        ? ((totalSessions / totalTimeSlots) * 100).toFixed(1)
        : "0.0";

    const facultyLoad: Record<string, number> = {};
    const batchLoad: Record<string, number> = {};

    timetable.forEach((slot) => {
      facultyLoad[slot.faculty] = (facultyLoad[slot.faculty] || 0) + 1;
      batchLoad[slot.batch] = (batchLoad[slot.batch] || 0) + 1;
    });

    const busiestFacultyEntry = Object.entries(facultyLoad).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const busiestBatchEntry = Object.entries(batchLoad).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      totalSessions,
      utilization,
      busiestFaculty: busiestFacultyEntry
        ? `${busiestFacultyEntry[0]} (${busiestFacultyEntry[1]} sessions)`
        : "N/A",
      busiestBatch: busiestBatchEntry
        ? `${busiestBatchEntry[0]} (${busiestBatchEntry[1]} sessions)`
        : "N/A",
    };
  }, [timetable, uniqueRooms]);

  // ====== RENDER (PURE STUDENT VIEW) ======
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-7xl rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="border-b border-slate-800 px-6 sm:px-10 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Zenith Timetable — Student View
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Your weekly class schedule (Mon–Fri, 08:30–17:30), with quick
              filters for batch, faculty, and rooms. This is a read-only view
              generated and published by your admin/faculty.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              Viewing as <span className="font-semibold">Student</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-[11px] font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Timetable Published
            </span>
          </div>
        </header>

        {/* Main content – just the right pane from original component */}
        <section className="px-4 sm:px-6 xl:px-8 py-6 space-y-4">
          {/* Calendar header & view filters */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Weekly Calendar View</h2>
              <p className="text-xs text-slate-400">
                Monday–Friday · 08:30–17:30 · Filter by batch, faculty, or room
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Sessions:{" "}
                <span className="text-emerald-300 font-semibold">
                  {insights.totalSessions}
                </span>{" "}
                · Room utilization (approx.):{" "}
                <span className="text-emerald-300 font-semibold">
                  {insights.utilization}%
                </span>{" "}
                · Busiest batch:{" "}
                <span className="text-sky-300 font-semibold">
                  {insights.busiestBatch}
                </span>{" "}
                · Busiest faculty:{" "}
                <span className="text-sky-300 font-semibold">
                  {insights.busiestFaculty}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 items-center text-[11px]">
              <span className="text-slate-400">Calendar view:</span>
              <select
                value={calendarView}
                onChange={(e) => {
                  setCalendarView(e.target.value as CalendarViewMode);
                  setCalendarBatch("");
                  setCalendarFaculty("");
                  setCalendarRoom("");
                }}
                className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
              >
                <option value="all">All classes</option>
                <option value="batch">By batch/section</option>
                <option value="faculty">By faculty</option>
                <option value="room">By room</option>
              </select>

              {calendarView === "batch" && (
                <select
                  value={calendarBatch}
                  onChange={(e) => setCalendarBatch(e.target.value)}
                  className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                >
                  <option value="">Choose batch</option>
                  {uniqueBatches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              )}

              {calendarView === "faculty" && (
                <select
                  value={calendarFaculty}
                  onChange={(e) => setCalendarFaculty(e.target.value)}
                  className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                >
                  <option value="">Choose faculty</option>
                  {uniqueFaculties.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              )}

              {calendarView === "room" && (
                <select
                  value={calendarRoom}
                  onChange={(e) => setCalendarRoom(e.target.value)}
                  className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                >
                  <option value="">Choose room</option>
                  {uniqueRooms.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Weekly calendar */}
          {timetable.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/40">
              <div className="text-center max-w-sm text-sm text-slate-400">
                <p className="mb-2 font-medium text-slate-200">
                  Timetable not published yet.
                </p>
                <p>
                  Once your admin or course coordinator publishes the timetable,
                  your full weekly schedule will appear here automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-3 sm:p-4 overflow-auto">
              <div className="min-w-[900px]">
                {/* Header: days + events */}
                <div className="grid grid-cols-6 mb-2 text-xs sm:text-sm">
                  <div />
                  {DAYS.map((day) => {
                    const dayEvents = eventsByDay[day] || [];
                    const blocking = dayEvents.some(
                      (e) => e.blocksTeaching && e.affects === "all"
                    );
                    return (
                      <div
                        key={day}
                        className="px-2 py-1 text-center font-medium text-slate-200"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{day}</span>
                          {dayEvents.length > 0 && (
                            <div className="space-y-1 w-full">
                              {dayEvents.map((e) => (
                                <div
                                  key={e.id}
                                  className={`mx-auto w-full rounded-full border px-2 py-0.5 text-[10px] ${
                                    e.type === "Holiday"
                                      ? "border-rose-400/60 text-rose-200 bg-rose-900/20"
                                      : e.type === "Exam Week"
                                      ? "border-amber-400/60 text-amber-200 bg-amber-900/20"
                                      : "border-sky-400/60 text-sky-200 bg-sky-900/20"
                                  }`}
                                >
                                  {e.label}
                                  {e.affects === "batch" && e.batch
                                    ? ` · ${e.batch}`
                                    : ""}
                                </div>
                              ))}
                            </div>
                          )}
                          {blocking && (
                            <span className="text-[9px] text-rose-300">
                              No classes (blocked)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Body: time rows */}
                <div className="space-y-1">
                  {TIME_SLOTS.map((time) => (
                    <div
                      key={time}
                      className="grid grid-cols-6 border-t border-slate-800/70 text-[11px] sm:text-xs"
                    >
                      {/* Time label */}
                      <div className="px-2 py-3 sticky left-0 bg-slate-950 z-10 text-slate-300 font-medium border-r border-slate-800/70">
                        {time}
                      </div>

                      {/* Day cells */}
                      {DAYS.map((day) => {
                        const slots = calendarData[day]?.[time] || [];
                        const blocking = (eventsByDay[day] || []).some(
                          (e) => e.blocksTeaching && e.affects === "all"
                        );
                        return (
                          <div
                            key={day}
                            className={`px-1 py-2 min-h-[56px] border-r border-slate-800/40 ${
                              blocking ? "bg-slate-900/80" : ""
                            }`}
                          >
                            {slots.length === 0 ? (
                              <div
                                className={`h-full w-full rounded-xl border border-dashed ${
                                  blocking
                                    ? "border-rose-500/40 bg-rose-950/10"
                                    : "border-slate-800/40 bg-slate-900/40"
                                }`}
                              />
                            ) : (
                              <div className="space-y-1">
                                {slots.map((slot, idx) => (
                                  <div
                                    key={`${slot.batch}-${slot.subject}-${idx}`}
                                    className="rounded-xl bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-emerald-500/20 border border-emerald-500/40 px-2 py-1 leading-tight shadow-sm"
                                  >
                                    <div className="flex justify-between items-center gap-2">
                                      <span className="font-semibold text-[11px] sm:text-xs text-slate-50">
                                        {slot.subject}
                                      </span>
                                      <span className="text-[10px] text-emerald-200">
                                        {slot.classroom}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-slate-200">
                                        {slot.batch}
                                      </span>
                                      <span className="text-[10px] text-sky-200 truncate">
                                        {slot.faculty}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TimetableStudentPage;
