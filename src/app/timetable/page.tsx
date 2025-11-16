"use client";

import React, { useMemo, useState, useEffect } from "react";

type SubjectConfig = {
  id: number;
  name: string;
  classesPerWeek: number;
  faculty: string;
};

export type TimetableSlot = {
  day: string;
  time: string;
  classroom: string;
  batch: string;
  subject: string;
  faculty: string;
};

type ClassSession = {
  id: number;
  batch: string;
  subject: SubjectConfig;
};

type Slot = {
  day: string;
  time: string;
  room: string;
};

type Chromosome = number[]; // gene = index into allSlots
type WhatIfMode = "move" | "extra";
type Role = "student" | "faculty" | "courseHead" | "admin";
type CalendarViewMode = "all" | "batch" | "faculty" | "room";

type EventType = "Holiday" | "Exam Week" | "Fest";

type AcademicEvent = {
  id: number;
  label: string;
  type: EventType;
  day: string; // one of DAYS (Mon–Fri) if you want GA to care
  affects: "all" | "batch";
  batch?: string;
  blocksTeaching: boolean;
  date?: string; // full date for monthly planner (YYYY-MM-DD)
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]; // teaching days only

// Timings: 8:30 to 5:30 (1 hour slots)
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

// Map time → index to detect gaps and span in a day
const TIME_INDEX: Record<string, number> = TIME_SLOTS.reduce(
  (acc, t, i) => ({ ...acc, [t]: i }),
  {} as Record<string, number>
);
const DEFAULT_ORG_CODE = "DEFAULT_ORG";

function getCurrentOrgCode(): string {
  if (typeof window === "undefined") return DEFAULT_ORG_CODE;
  const raw = window.localStorage.getItem("currentUserRole");
  if (!raw) return DEFAULT_ORG_CODE;

  try {
    const parsed = JSON.parse(raw);
    return parsed.orgCode || DEFAULT_ORG_CODE;
  } catch {
    return DEFAULT_ORG_CODE;
  }
}

// ==== Monthly calendar helpers ====
const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const JS_WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function buildMonthMatrix(year: number, month: number): (number | null)[][] {
  // month: 0–11
  const firstDay = new Date(year, month, 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7; // JS Sunday=0 → Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let day = 1 - firstWeekday;

  for (let w = 0; w < 6; w++) {
    const week: (number | null)[] = [];
    for (let d = 0; d < 7; d++) {
      if (day < 1 || day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day);
      }
      day++;
    }
    weeks.push(week);
  }

  return weeks;
}

const TimetableGAPlatform: React.FC = () => {
  // ========= ROLE & USER CONTEXT =========
  const [role, setRole] = useState<Role>("admin");
  const [actingFaculty, setActingFaculty] = useState<string>("");

  const isStudent = role === "student";
  const isFaculty = role === "faculty";
  const isCourseHead = role === "courseHead";
  const isAdmin = role === "admin";

  const canEditGlobal = isAdmin || isCourseHead;
  const canRunGA = canEditGlobal;
  const canUseWhatIf = !isStudent; // faculty, courseHead, admin

  // ========= CORE CONFIG =========
  const [numClassrooms, setNumClassrooms] = useState<number>(4);
  const [numBatches, setNumBatches] = useState<number>(3);
  const [numSubjects, setNumSubjects] = useState<number>(3);
  const [numFaculties, setNumFaculties] = useState<number>(4);

  const [subjects, setSubjects] = useState<SubjectConfig[]>([
    {
      id: 1,
      name: "Data Structures",
      classesPerWeek: 3,
      faculty: "Dr. Sharma",
    },
    {
      id: 2,
      name: "Operating Systems",
      classesPerWeek: 2,
      faculty: "Prof. Singh",
    },
    {
      id: 3,
      name: "Discrete Mathematics",
      classesPerWeek: 3,
      faculty: "Dr. Rao",
    },
  ]);

  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // AI-style constraint toggles
  const [avoidFacultyClash, setAvoidFacultyClash] = useState(true);
  const [avoidBatchClash, setAvoidBatchClash] = useState(true);
  const [maximizeRoomUse, setMaximizeRoomUse] = useState(true);

  // "Comfort" constraints (to avoid hectic schedules)
  const [maxSessionsPerDayBatch, setMaxSessionsPerDayBatch] = useState(5);
  const [maxSessionsPerDayFaculty, setMaxSessionsPerDayFaculty] = useState(5);

  const [gaStats, setGaStats] = useState<{
    bestPenalty: number;
    generations: number;
  }>({ bestPenalty: 0, generations: 0 });

  const [authRole, setAuthRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    email?: string;
    name?: string;
    username?: string;
    role?: Role;
  } | null>(null);

  // Academic events (admin-only to modify)
  const [events, setEvents] = useState<AcademicEvent[]>([
    {
      id: 1,
      label: "College Fest",
      type: "Fest",
      day: "Friday",
      affects: "all",
      blocksTeaching: false,
      // date optional; just to show example:
      // date: "2025-02-21",
    },
  ]);

  // New event editor state (admin)
  const [newEventLabel, setNewEventLabel] = useState("");
  const [newEventType, setNewEventType] = useState<EventType>("Holiday");
  const [newEventDay, setNewEventDay] = useState<string>(DAYS[0]);
  const [newEventAffects, setNewEventAffects] = useState<"all" | "batch">(
    "all"
  );
  const [newEventBatch, setNewEventBatch] = useState<string>("Batch-1");
  const [newEventBlocksTeaching, setNewEventBlocksTeaching] =
    useState<boolean>(true);

  // JSON output of timetable
  const jsonOutput = useMemo(
    () => JSON.stringify(timetable, null, 2),
    [timetable]
  );

  // ========= WHAT-IF RESCHEDULING STATE =========
  const [whatIfMode, setWhatIfMode] = useState<WhatIfMode>("move");

  // Move-existing-class state
  const [adjustFaculty, setAdjustFaculty] = useState<string>("");
  const [adjustDay, setAdjustDay] = useState<string>(DAYS[0]);
  const [adjustTime, setAdjustTime] = useState<string>(TIME_SLOTS[0]);

  // Extra-class state
  const uiBatchNames = useMemo(
    () => Array.from({ length: numBatches }, (_, i) => `Batch-${i + 1}`),
    [numBatches]
  );
  const [extraBatch, setExtraBatch] = useState<string>("Batch-1");
  const [extraSubjectId, setExtraSubjectId] = useState<number | "">("");
  const [extraDay, setExtraDay] = useState<string>(DAYS[0]);
  const [extraTime, setExtraTime] = useState<string>(TIME_SLOTS[0]);

  const [whatIfResult, setWhatIfResult] = useState<string>("");

  // Pending change that can be applied
  const [pendingTimetable, setPendingTimetable] = useState<
    TimetableSlot[] | null
  >(null);
  const [pendingChangeDescription, setPendingChangeDescription] =
    useState<string>("");

  const uniqueFaculties = useMemo(
    () =>
      Array.from(
        new Set(
          subjects.map((s) => s.faculty).filter((f) => f && f.trim().length > 0)
        )
      ),
    [subjects]
  );

  const uniqueBatches = useMemo(
    () => Array.from(new Set(timetable.map((t) => t.batch))).sort(),
    [timetable]
  );

  const uniqueRooms = useMemo(
    () => Array.from(new Set(timetable.map((t) => t.classroom))).sort(),
    [timetable]
  );

  // When in faculty mode, force adjustFaculty / actingFaculty to be linked
  const effectiveFacultyForActions = isFaculty ? actingFaculty : adjustFaculty;

  // Calendar view filters
  const [calendarView, setCalendarView] = useState<CalendarViewMode>("all");
  const [calendarBatch, setCalendarBatch] = useState<string>("");
  const [calendarFaculty, setCalendarFaculty] = useState<string>("");
  const [calendarRoom, setCalendarRoom] = useState<string>("");

  // Events by day for weekly view
  const eventsByDay = useMemo(() => {
    const map: Record<string, AcademicEvent[]> = {};
    DAYS.forEach((d) => (map[d] = []));
    events.forEach((e) => {
      if (!map[e.day]) map[e.day] = [];
      map[e.day].push(e);
    });
    return map;
  }, [events]);

  // ========= MONTHLY EVENT PLANNER STATE =========
  const today = new Date();
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth()); // 0–11

  const monthMatrix = useMemo(
    () => buildMonthMatrix(calendarYear, calendarMonth),
    [calendarYear, calendarMonth]
  );

  // Load timetable + events for this org on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const orgCode = getCurrentOrgCode();

    const storedTimetable = window.localStorage.getItem(`timetable_${orgCode}`);
    if (storedTimetable) {
      try {
        const parsed = JSON.parse(storedTimetable) as TimetableSlot[];
        if (Array.isArray(parsed)) {
          setTimetable(parsed);
        }
      } catch {
        // ignore parse error
      }
    }

    const storedEvents = window.localStorage.getItem(`events_${orgCode}`);
    if (storedEvents) {
      try {
        const parsed = JSON.parse(storedEvents) as AcademicEvent[];
        if (Array.isArray(parsed)) {
          setEvents(parsed);
        }
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(new Date(calendarYear, calendarMonth, 1)),
    [calendarYear, calendarMonth]
  );

  // ========= SUBJECT HANDLING =========
  const syncSubjectsWithCount = (count: number) => {
    setSubjects((prev) => {
      const next = [...prev];
      if (count > next.length) {
        const toAdd = count - next.length;
        for (let i = 0; i < toAdd; i++) {
          const id = Date.now() + i;
          next.push({
            id,
            name: `Subject ${next.length + 1}`,
            classesPerWeek: 2,
            faculty: `Faculty ${
              ((next.length + 1) % Math.max(numFaculties, 1)) + 1
            }`,
          });
        }
      } else if (count < next.length) {
        next.length = count;
      }
      return next;
    });
  };

  const handleSubjectChange = (
    id: number,
    field: keyof Omit<SubjectConfig, "id">,
    value: string
  ) => {
    if (!canEditGlobal) return;
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              [field]:
                field === "classesPerWeek"
                  ? Math.max(1, Number(value) || 1)
                  : value,
            }
          : s
      )
    );
  };

  // ========= GENETIC ALGORITHM CORE =========

  const computePenalty = (
    chromosome: Chromosome,
    sessions: ClassSession[],
    allSlots: Slot[]
  ): number => {
    let penalty = 0;

    const roomUsage = new Map<string, number>();
    const facultySlotUsage = new Map<string, number>();
    const batchSlotUsage = new Map<string, number>();

    const batchDayCount: Record<string, Record<string, number>> = {};
    const facultyDayCount: Record<string, Record<string, number>> = {};
    const batchDayTimes: Record<string, Record<string, Set<string>>> = {};

    for (let i = 0; i < sessions.length; i++) {
      const gene = chromosome[i];
      const session = sessions[i];

      if (gene == null || gene < 0 || gene >= allSlots.length) {
        penalty += 1000;
        continue;
      }

      const slot = allSlots[gene];
      const faculty = session.subject.faculty || "Unassigned";
      const batch = session.batch;

      const roomKey = `${slot.day}-${slot.time}-${slot.room}`;
      const facultyKey = `${slot.day}-${slot.time}-${faculty}`;
      const batchKey = `${slot.day}-${slot.time}-${batch}`;

      roomUsage.set(roomKey, (roomUsage.get(roomKey) || 0) + 1);
      facultySlotUsage.set(
        facultyKey,
        (facultySlotUsage.get(facultyKey) || 0) + 1
      );
      batchSlotUsage.set(batchKey, (batchSlotUsage.get(batchKey) || 0) + 1);

      // per-day usage
      if (!batchDayCount[batch]) batchDayCount[batch] = {};
      if (!batchDayCount[batch][slot.day]) batchDayCount[batch][slot.day] = 0;
      batchDayCount[batch][slot.day]++;

      if (!facultyDayCount[faculty]) facultyDayCount[faculty] = {};
      if (!facultyDayCount[faculty][slot.day])
        facultyDayCount[faculty][slot.day] = 0;
      facultyDayCount[faculty][slot.day]++;

      if (!batchDayTimes[batch]) batchDayTimes[batch] = {};
      if (!batchDayTimes[batch][slot.day])
        batchDayTimes[batch][slot.day] = new Set();
      batchDayTimes[batch][slot.day].add(slot.time);
    }

    // Hard conflicts
    roomUsage.forEach((count) => {
      if (count > 1) penalty += (count - 1) * 80;
    });

    if (avoidFacultyClash) {
      facultySlotUsage.forEach((count) => {
        if (count > 1) penalty += (count - 1) * 150;
      });
    }

    if (avoidBatchClash) {
      batchSlotUsage.forEach((count) => {
        if (count > 1) penalty += (count - 1) * 150;
      });
    }

    // Hectic days
    Object.values(batchDayCount).forEach((days) => {
      Object.values(days).forEach((count) => {
        if (count > maxSessionsPerDayBatch)
          penalty += (count - maxSessionsPerDayBatch) * 10;
      });
    });
    Object.values(facultyDayCount).forEach((days) => {
      Object.values(days).forEach((count) => {
        if (count > maxSessionsPerDayFaculty)
          penalty += (count - maxSessionsPerDayFaculty) * 10;
      });
    });

    // Gaps
    Object.values(batchDayTimes).forEach((days) => {
      Object.values(days).forEach((timeSet) => {
        const idxs = Array.from(timeSet)
          .map((t) => TIME_INDEX[t])
          .sort((a, b) => a - b);
        if (idxs.length <= 1) return;
        const span = idxs[idxs.length - 1] - idxs[0] + 1;
        const gaps = span - idxs.length;
        if (gaps > 0) penalty += gaps * 5;
      });
    });

    // Room utilization
    if (maximizeRoomUse) {
      const usedSlots = roomUsage.size;
      const maxSlots =
        DAYS.length * TIME_SLOTS.length * Math.max(numClassrooms, 1);
      const utilization = usedSlots / maxSlots;
      const ideal = 0.7;
      const diff = Math.abs(utilization - ideal);
      penalty += diff * 50;
    }

    return penalty;
  };

  const selectParent = (
    population: Chromosome[],
    fitnesses: number[]
  ): Chromosome => {
    const tournamentSize = 3;
    let bestIndex = -1;
    let bestFitness = -Infinity;

    for (let i = 0; i < tournamentSize; i++) {
      const idx = Math.floor(Math.random() * population.length);
      if (fitnesses[idx] > bestFitness) {
        bestFitness = fitnesses[idx];
        bestIndex = idx;
      }
    }

    return population[bestIndex].slice();
  };

  const crossover = (
    parent1: Chromosome,
    parent2: Chromosome,
    rate: number
  ): Chromosome => {
    if (Math.random() > rate || parent1.length !== parent2.length) {
      return parent1.slice();
    }
    const point = 1 + Math.floor(Math.random() * (parent1.length - 1));
    return [...parent1.slice(0, point), ...parent2.slice(point)];
  };

  const mutate = (
    chromosome: Chromosome,
    mutationRate: number,
    slotCount: number
  ): void => {
    for (let i = 0; i < chromosome.length; i++) {
      if (Math.random() < mutationRate) {
        chromosome[i] = Math.floor(Math.random() * slotCount);
      }
    }
  };

  const runGeneticAlgorithm = (
    sessions: ClassSession[],
    allSlots: Slot[]
  ): {
    bestChromosome: Chromosome;
    bestPenalty: number;
    generations: number;
  } => {
    const populationSize = 40;
    const generations = 80;
    const crossoverRate = 0.7;
    const mutationRate = 0.05;

    if (allSlots.length === 0 || sessions.length === 0) {
      return { bestChromosome: [], bestPenalty: 0, generations: 0 };
    }

    let population: Chromosome[] = [];
    for (let i = 0; i < populationSize; i++) {
      const chrom: Chromosome = [];
      for (let s = 0; s < sessions.length; s++) {
        chrom.push(Math.floor(Math.random() * allSlots.length));
      }
      population.push(chrom);
    }

    let bestChromosome = population[0].slice();
    let bestPenalty = computePenalty(bestChromosome, sessions, allSlots);

    for (let gen = 0; gen < generations; gen++) {
      const penalties = population.map((chrom) =>
        computePenalty(chrom, sessions, allSlots)
      );
      const fitnesses = penalties.map((p) => 1 / (1 + p));

      for (let i = 0; i < population.length; i++) {
        if (penalties[i] < bestPenalty) {
          bestPenalty = penalties[i];
          bestChromosome = population[i].slice();
        }
      }

      const newPopulation: Chromosome[] = [];
      while (newPopulation.length < populationSize) {
        const parent1 = selectParent(population, fitnesses);
        const parent2 = selectParent(population, fitnesses);
        const child = crossover(parent1, parent2, crossoverRate);
        mutate(child, mutationRate, allSlots.length);
        newPopulation.push(child);
      }

      population = newPopulation;
    }

    return { bestChromosome, bestPenalty, generations };
  };

  // ========= PENALTY DIRECTLY FROM TIMETABLE (for what-if) =========

  const computePenaltyFromTimetable = (slots: TimetableSlot[]): number => {
    let penalty = 0;

    const roomUsage = new Map<string, number>();
    const facultySlotUsage = new Map<string, number>();
    const batchSlotUsage = new Map<string, number>();

    const batchDayCount: Record<string, Record<string, number>> = {};
    const facultyDayCount: Record<string, Record<string, number>> = {};
    const batchDayTimes: Record<string, Record<string, Set<string>>> = {};

    for (const s of slots) {
      const roomKey = `${s.day}-${s.time}-${s.classroom}`;
      const facultyKey = `${s.day}-${s.time}-${s.faculty}`;
      const batchKey = `${s.day}-${s.time}-${s.batch}`;

      roomUsage.set(roomKey, (roomUsage.get(roomKey) || 0) + 1);
      facultySlotUsage.set(
        facultyKey,
        (facultySlotUsage.get(facultyKey) || 0) + 1
      );
      batchSlotUsage.set(batchKey, (batchSlotUsage.get(batchKey) || 0) + 1);

      if (!batchDayCount[s.batch]) batchDayCount[s.batch] = {};
      if (!batchDayCount[s.batch][s.day]) batchDayCount[s.batch][s.day] = 0;
      batchDayCount[s.batch][s.day]++;

      if (!facultyDayCount[s.faculty]) facultyDayCount[s.faculty] = {};
      if (!facultyDayCount[s.faculty][s.day])
        facultyDayCount[s.faculty][s.day] = 0;
      facultyDayCount[s.faculty][s.day]++;

      if (!batchDayTimes[s.batch]) batchDayTimes[s.batch] = {};
      if (!batchDayTimes[s.batch][s.day])
        batchDayTimes[s.batch][s.day] = new Set();
      batchDayTimes[s.batch][s.day].add(s.time);
    }

    roomUsage.forEach((count) => {
      if (count > 1) penalty += (count - 1) * 80;
    });
    if (avoidFacultyClash) {
      facultySlotUsage.forEach((count) => {
        if (count > 1) penalty += (count - 1) * 150;
      });
    }
    if (avoidBatchClash) {
      batchSlotUsage.forEach((count) => {
        if (count > 1) penalty += (count - 1) * 150;
      });
    }

    Object.values(batchDayCount).forEach((days) => {
      Object.values(days).forEach((count) => {
        if (count > maxSessionsPerDayBatch)
          penalty += (count - maxSessionsPerDayBatch) * 10;
      });
    });
    Object.values(facultyDayCount).forEach((days) => {
      Object.values(days).forEach((count) => {
        if (count > maxSessionsPerDayFaculty)
          penalty += (count - maxSessionsPerDayFaculty) * 10;
      });
    });

    Object.values(batchDayTimes).forEach((days) => {
      Object.values(days).forEach((timeSet) => {
        const idxs = Array.from(timeSet)
          .map((t) => TIME_INDEX[t])
          .sort((a, b) => a - b);
        if (idxs.length <= 1) return;
        const span = idxs[idxs.length - 1] - idxs[0] + 1;
        const gaps = span - idxs.length;
        if (gaps > 0) penalty += gaps * 5;
      });
    });

    if (maximizeRoomUse) {
      const usedSlots = roomUsage.size;
      const maxSlots =
        DAYS.length * TIME_SLOTS.length * Math.max(numClassrooms, 1);
      const utilization = usedSlots / maxSlots;
      const ideal = 0.7;
      const diff = Math.abs(utilization - ideal);
      penalty += diff * 50;
    }

    return penalty;
  };

  // ========= METRICS FOR BATCH / FACULTY =========

  const computeBatchMetrics = (slots: TimetableSlot[], batch: string) => {
    const dayTimes: Record<string, string[]> = {};
    const dayCounts: Record<string, number> = {};

    for (const s of slots.filter((x) => x.batch === batch)) {
      if (!dayTimes[s.day]) dayTimes[s.day] = [];
      if (!dayCounts[s.day]) dayCounts[s.day] = 0;
      dayTimes[s.day].push(s.time);
      dayCounts[s.day]++;
    }

    let totalGaps = 0;
    let overloadDays = 0;

    Object.entries(dayTimes).forEach(([day, times]) => {
      const idxs = times.map((t) => TIME_INDEX[t]).sort((a, b) => a - b);
      if (idxs.length > 1) {
        const span = idxs[idxs.length - 1] - idxs[0] + 1;
        const gaps = span - idxs.length;
        totalGaps += Math.max(0, gaps);
      }
      if ((dayCounts[day] || 0) > maxSessionsPerDayBatch) overloadDays++;
    });

    return { totalGaps, overloadDays };
  };

  const computeFacultyMetrics = (slots: TimetableSlot[], faculty: string) => {
    const dayCounts: Record<string, number> = {};
    let totalSessions = 0;

    for (const s of slots.filter((x) => x.faculty === faculty)) {
      if (!dayCounts[s.day]) dayCounts[s.day] = 0;
      dayCounts[s.day]++;
      totalSessions++;
    }

    let overloadDays = 0;
    Object.values(dayCounts).forEach((c) => {
      if (c > maxSessionsPerDayFaculty) overloadDays++;
    });

    return { totalSessions, overloadDays };
  };

  // ========= CORE: GENERATE TIMETABLE WITH GA =========

  const generateOptimizedTimetable = async () => {
    if (!canRunGA) return;

    setIsGenerating(true);
    setTimetable([]);
    setGaStats({ bestPenalty: 0, generations: 0 });
    setWhatIfResult("");
    setPendingTimetable(null);
    setPendingChangeDescription("");

    await new Promise((resolve) => setTimeout(resolve, 200));

    const totalClassrooms = Math.max(1, numClassrooms);
    const totalBatches = Math.max(1, numBatches);

    const classroomNames = Array.from(
      { length: totalClassrooms },
      (_, i) => `CR-${i + 1}`
    );
    const batchNames = Array.from(
      { length: totalBatches },
      (_, i) => `Batch-${i + 1}`
    );

    // Blocked teaching days (global) from admin events
    const blockedDays = events
      .filter((e) => e.blocksTeaching && e.affects === "all")
      .map((e) => e.day);

    const teachingDays = DAYS.filter((d) => !blockedDays.includes(d));

    // Search space
    const allSlots: Slot[] = [];
    for (const day of teachingDays) {
      for (const time of TIME_SLOTS) {
        for (const room of classroomNames) {
          allSlots.push({ day, time, room });
        }
      }
    }

    // Required sessions
    const sessions: ClassSession[] = [];
    let sessionId = 1;
    for (const batch of batchNames) {
      for (const subject of subjects) {
        const count = Math.max(1, subject.classesPerWeek);
        for (let i = 0; i < count; i++) {
          sessions.push({ id: sessionId++, batch, subject });
        }
      }
    }

    const { bestChromosome, bestPenalty, generations } = runGeneticAlgorithm(
      sessions,
      allSlots
    );

    const generated: TimetableSlot[] = [];
    for (let i = 0; i < sessions.length; i++) {
      const gene = bestChromosome[i];
      const session = sessions[i];
      const slot = allSlots[gene];
      if (!slot) continue;

      generated.push({
        day: slot.day,
        time: slot.time,
        classroom: slot.room,
        batch: session.batch,
        subject: session.subject.name || `Subject ${session.subject.id}`,
        faculty: session.subject.faculty || "Faculty?",
      });
    }

    // After setTimetable(generated);
    setTimetable(generated);

    // Persist timetable per-organisation
    if (typeof window !== "undefined") {
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

      window.localStorage.setItem(
        `timetable_${orgCode}`,
        JSON.stringify(generated)
      );
    }

    setGaStats({ bestPenalty, generations });
    setIsGenerating(false);
  };

  // ========= WHAT-IF: MOVE EXISTING CLASS (PREPONE/POSTPONE) =========

  const handleMoveWhatIf = (direction: "prepone" | "postpone") => {
    if (!canUseWhatIf) return;

    setWhatIfResult("");
    setPendingTimetable(null);
    setPendingChangeDescription("");

    if (!timetable.length) {
      setWhatIfResult(
        "Generate a timetable first before running what-if analysis."
      );
      return;
    }

    const facultyName = effectiveFacultyForActions;
    if (!facultyName) {
      setWhatIfResult(
        isFaculty
          ? "Select yourself from the faculty dropdown at the top."
          : "Select a faculty for rescheduling analysis."
      );
      return;
    }

    const slotIndex = timetable.findIndex(
      (s) =>
        s.faculty === facultyName &&
        s.day === adjustDay &&
        s.time === adjustTime
    );

    if (slotIndex === -1) {
      setWhatIfResult(
        "No class found for this faculty at the selected day & time."
      );
      return;
    }

    const currentSlot = timetable[slotIndex];
    const currentTimeIdx = TIME_SLOTS.indexOf(currentSlot.time);
    if (currentTimeIdx === -1) {
      setWhatIfResult("Internal error with time slot index.");
      return;
    }

    const newIdx =
      direction === "prepone" ? currentTimeIdx - 1 : currentTimeIdx + 1;

    if (newIdx < 0 || newIdx >= TIME_SLOTS.length) {
      setWhatIfResult(
        `Cannot ${
          direction === "prepone" ? "prepone" : "postpone"
        } further — out of timetable bounds.`
      );
      return;
    }

    const newTime = TIME_SLOTS[newIdx];

    // Room availability check
    const classroomNames = Array.from(
      { length: numClassrooms },
      (_, i) => `CR-${i + 1}`
    );

    const isRoomFree = (room: string) =>
      !timetable.some(
        (s, idx) =>
          idx !== slotIndex &&
          s.day === adjustDay &&
          s.time === newTime &&
          s.classroom === room
      );

    const isBatchBusy = () =>
      timetable.some(
        (s, idx) =>
          idx !== slotIndex &&
          s.day === adjustDay &&
          s.time === newTime &&
          s.batch === currentSlot.batch
      );

    const isFacultyBusy = () =>
      timetable.some(
        (s, idx) =>
          idx !== slotIndex &&
          s.day === adjustDay &&
          s.time === newTime &&
          s.faculty === currentSlot.faculty
      );

    const sameRoomFree = isRoomFree(currentSlot.classroom);
    const freeRooms = classroomNames.filter(isRoomFree);
    const batchClash = isBatchBusy();
    const facultyClash = isFacultyBusy();

    if (!freeRooms.length) {
      setWhatIfResult(
        `No classroom is free on ${adjustDay} at ${newTime}. This slot is not feasible for any room.`
      );
      return;
    }

    const chosenRoom = sameRoomFree ? currentSlot.classroom : freeRooms[0];

    const newTimetable = timetable.map((s, idx) =>
      idx === slotIndex ? { ...s, time: newTime, classroom: chosenRoom } : s
    );

    const currentPenalty = computePenaltyFromTimetable(timetable);
    const newPenalty = computePenaltyFromTimetable(newTimetable);

    const batch = currentSlot.batch;
    const faculty = currentSlot.faculty;

    const batchBefore = computeBatchMetrics(timetable, batch);
    const batchAfter = computeBatchMetrics(newTimetable, batch);

    const facultyBefore = computeFacultyMetrics(timetable, faculty);
    const facultyAfter = computeFacultyMetrics(newTimetable, faculty);

    const lines: string[] = [];

    if (batchClash) {
      lines.push(
        `Warning: At ${newTime}, Batch ${batch} already has another class. Moving will create a batch clash.`
      );
    }
    if (facultyClash) {
      lines.push(
        `Warning: At ${newTime}, ${faculty} is already teaching another class. Moving will double-book the faculty.`
      );
    }

    if (sameRoomFree) {
      lines.push(
        `Room status: Existing room ${currentSlot.classroom} is free at ${newTime}.`
      );
    } else {
      lines.push(
        `Room status: ${currentSlot.classroom} is busy at ${newTime}. Suggested alternative free room: ${chosenRoom}.`
      );
    }

    const ratio = newPenalty / (currentPenalty || 1);
    if (ratio < 0.97) {
      lines.push(
        "Global impact: This move improves the overall timetable quality."
      );
    } else if (ratio > 1.03) {
      lines.push(
        "Global impact: This move worsens the overall timetable (more strain/conflicts)."
      );
    } else {
      lines.push(
        "Global impact: This move is mostly neutral for the overall timetable."
      );
    }
    lines.push(
      `Penalty score: ${currentPenalty.toFixed(1)} → ${newPenalty.toFixed(
        1
      )} (lower is better).`
    );

    if (batchAfter.overloadDays !== batchBefore.overloadDays) {
      lines.push(
        `Students (${batch}): overloaded days ${batchBefore.overloadDays} → ${batchAfter.overloadDays}.`
      );
    }
    if (batchAfter.totalGaps !== batchBefore.totalGaps) {
      lines.push(
        `Students (${batch}): free-period gaps ${batchBefore.totalGaps} → ${batchAfter.totalGaps}.`
      );
    }

    if (facultyAfter.overloadDays !== facultyBefore.overloadDays) {
      lines.push(
        `Faculty (${faculty}): overloaded teaching days ${facultyBefore.overloadDays} → ${facultyAfter.overloadDays}.`
      );
    }

    lines.push(
      "You can apply this change to the live timetable below if it looks acceptable."
    );

    setWhatIfResult(lines.join(" "));
    setPendingTimetable(newTimetable);
    setPendingChangeDescription(
      `Move class of ${faculty} on ${adjustDay} from ${adjustTime} to ${newTime} (room ${chosenRoom}).`
    );
  };

  // ========= WHAT-IF: EXTRA CLASS =========

  const handleExtraClassWhatIf = () => {
    if (!canUseWhatIf) return;

    setWhatIfResult("");
    setPendingTimetable(null);
    setPendingChangeDescription("");

    if (!timetable.length) {
      setWhatIfResult(
        "Generate a timetable first before simulating extra classes."
      );
      return;
    }
    if (!extraBatch) {
      setWhatIfResult("Select a batch for the extra class.");
      return;
    }
    if (!extraSubjectId) {
      setWhatIfResult("Select a subject for the extra class.");
      return;
    }

    const subject = subjects.find((s) => s.id === extraSubjectId);
    if (!subject) {
      setWhatIfResult("Invalid subject selection.");
      return;
    }

    const faculty = subject.faculty || "Faculty?";

    // In faculty mode, ensure they can only add extra classes for their subjects
    if (isFaculty && actingFaculty && faculty !== actingFaculty) {
      setWhatIfResult(
        `As ${actingFaculty}, you can only add extra classes for subjects you teach. Selected subject is taught by ${faculty}.`
      );
      return;
    }

    const classroomNames = Array.from(
      { length: numClassrooms },
      (_, i) => `CR-${i + 1}`
    );

    const isRoomFree = (room: string) =>
      !timetable.some(
        (s) =>
          s.day === extraDay && s.time === extraTime && s.classroom === room
      );

    const freeRooms = classroomNames.filter(isRoomFree);
    const batchClash = timetable.some(
      (s) =>
        s.day === extraDay && s.time === extraTime && s.batch === extraBatch
    );
    const facultyClash = timetable.some(
      (s) => s.day === extraDay && s.time === extraTime && s.faculty === faculty
    );

    const lines: string[] = [];

    if (!freeRooms.length) {
      lines.push(
        `Room status: No classroom is free on ${extraDay} at ${extraTime}. Extra class cannot be scheduled in this slot.`
      );
      setWhatIfResult(lines.join(" "));
      return;
    }

    lines.push(
      `Room status: Free rooms available at ${extraDay} ${extraTime}: ${freeRooms.join(
        ", "
      )}.`
    );
    const chosenRoom = freeRooms[0];

    if (batchClash) {
      lines.push(
        `Warning: Batch ${extraBatch} already has a class in this slot. Extra class will clash for students.`
      );
    }
    if (facultyClash) {
      lines.push(
        `Warning: ${faculty} is already teaching at this time. Extra class will double-book the faculty.`
      );
    }

    const newSlot: TimetableSlot = {
      day: extraDay,
      time: extraTime,
      classroom: chosenRoom,
      batch: extraBatch,
      subject: subject.name || "Subject",
      faculty,
    };

    const newTimetable = [...timetable, newSlot];

    const currentPenalty = computePenaltyFromTimetable(timetable);
    const newPenalty = computePenaltyFromTimetable(newTimetable);

    const batchBefore = computeBatchMetrics(timetable, extraBatch);
    const batchAfter = computeBatchMetrics(newTimetable, extraBatch);

    const facultyBefore = computeFacultyMetrics(timetable, faculty);
    const facultyAfter = computeFacultyMetrics(newTimetable, faculty);

    const ratio = newPenalty / (currentPenalty || 1);
    if (ratio < 0.97) {
      lines.push(
        "Global impact: Surprisingly, this extra class improves the timetable quality."
      );
    } else if (ratio > 1.03) {
      lines.push(
        "Global impact: This extra class makes the timetable heavier / more conflict-prone."
      );
    } else {
      lines.push("Global impact: This extra class is almost neutral globally.");
    }
    lines.push(
      `Penalty score: ${currentPenalty.toFixed(1)} → ${newPenalty.toFixed(
        1
      )} (lower is better).`
    );

    if (batchAfter.overloadDays !== batchBefore.overloadDays) {
      lines.push(
        `Students (${extraBatch}): overloaded days ${batchBefore.overloadDays} → ${batchAfter.overloadDays}.`
      );
    }
    if (batchAfter.totalGaps !== batchBefore.totalGaps) {
      lines.push(
        `Students (${extraBatch}): free-period gaps ${batchBefore.totalGaps} → ${batchAfter.totalGaps}.`
      );
    }

    if (facultyAfter.overloadDays !== facultyBefore.overloadDays) {
      lines.push(
        `Faculty (${faculty}): overloaded teaching days ${facultyBefore.overloadDays} → ${facultyAfter.overloadDays}.`
      );
    }
    if (facultyAfter.totalSessions !== facultyBefore.totalSessions) {
      lines.push(
        `Faculty (${faculty}): total sessions ${facultyBefore.totalSessions} → ${facultyAfter.totalSessions}.`
      );
    }

    lines.push(
      "You can apply this extra class to the live timetable below if the trade-offs look acceptable."
    );

    setWhatIfResult(lines.join(" "));
    setPendingTimetable(newTimetable);
    setPendingChangeDescription(
      `Add extra class for ${extraBatch} - ${subject.name} on ${extraDay} at ${extraTime} (room ${chosenRoom}).`
    );
  };

  // ========= APPLY PENDING CHANGE (respecting roles) =========

  const canApplyPendingChange = useMemo(() => {
    if (!pendingTimetable) return false;
    if (isStudent) return false;
    if (isAdmin || isCourseHead) return true;

    // Faculty: ensure all differences only involve their own classes
    if (isFaculty && actingFaculty) {
      const oldMap = new Map<string, TimetableSlot>();
      timetable.forEach((s, idx) => {
        oldMap.set(`${idx}`, s);
      });

      const changedSlots: TimetableSlot[] = [];
      pendingTimetable.forEach((s, idx) => {
        const old = oldMap.get(`${idx}`);
        if (!old) {
          changedSlots.push(s);
        } else if (
          old.day !== s.day ||
          old.time !== s.time ||
          old.classroom !== s.classroom ||
          old.batch !== s.batch ||
          old.subject !== s.subject ||
          old.faculty !== s.faculty
        ) {
          changedSlots.push(s);
        }
      });

      return changedSlots.every((s) => s.faculty === actingFaculty);
    }

    return false;
  }, [
    pendingTimetable,
    timetable,
    isStudent,
    isAdmin,
    isCourseHead,
    isFaculty,
    actingFaculty,
  ]);

  const applyPendingChange = () => {
    if (!canApplyPendingChange || !pendingTimetable) return;
    setTimetable(pendingTimetable);
    setPendingTimetable(null);
    setWhatIfResult(
      `✔ Change applied to live timetable: ${pendingChangeDescription}`
    );
    setPendingChangeDescription("");
  };

  // ========= CALENDAR FILTERED VIEW =========

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

  const insights = useMemo(() => {
    const totalSessions = timetable.length;
    const totalTimeSlots =
      DAYS.length * TIME_SLOTS.length * Math.max(numClassrooms, 1);
    const utilization =
      totalSessions > 0 ? (totalSessions / totalTimeSlots) * 100 : 0;

    const facultyLoad: Record<string, number> = {};
    const batchLoad: Record<string, number> = {};

    timetable.forEach((slot) => {
      facultyLoad[slot.faculty] = (facultyLoad[slot.faculty] || 0) + 1;
      batchLoad[slot.batch] = (batchLoad[slot.batch] || 0) + 1;
    });

    const busiestFaculty = Object.entries(facultyLoad).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const busiestBatch = Object.entries(batchLoad).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      totalSessions,
      utilization: utilization.toFixed(1),
      busiestFaculty: busiestFaculty
        ? `${busiestFaculty[0]} (${busiestFaculty[1]} sessions)`
        : "N/A",
      busiestBatch: busiestBatch
        ? `${busiestBatch[0]} (${busiestBatch[1]} sessions)`
        : "N/A",
    };
  }, [timetable, numClassrooms]);

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      alert("Timetable JSON copied to clipboard!");
    } catch {
      alert("Unable to copy JSON. Please copy manually.");
    }
  };

  // ========= ACADEMIC EVENTS (ADMIN ONLY TO MODIFY) =========

  const handleAddEvent = () => {
    if (!isAdmin) return;
    if (!newEventLabel.trim()) return;

    const event: AcademicEvent = {
      id: Date.now(),
      label: newEventLabel.trim(),
      type: newEventType,
      day: newEventDay,
      affects: newEventAffects,
      batch: newEventAffects === "batch" ? newEventBatch : undefined,
      blocksTeaching: newEventBlocksTeaching,
    };

    setEvents((prev) => {
      const next = [...prev, event];

      if (typeof window !== "undefined") {
        const orgCode = getCurrentOrgCode();
        window.localStorage.setItem(`events_${orgCode}`, JSON.stringify(next));
      }

      return next;
    });

    setNewEventLabel("");
  };

  const handleDeleteEvent = (id: number) => {
    if (!isAdmin) return;
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      if (typeof window !== "undefined") {
        const orgCode = getCurrentOrgCode();
        window.localStorage.setItem(`events_${orgCode}`, JSON.stringify(next));
      }
      return next;
    });
  };

  // Add event by clicking date in monthly calendar
  const handleAddEventOnDate = (dayOfMonth: number) => {
    if (!isAdmin) return;

    const date = new Date(calendarYear, calendarMonth, dayOfMonth);
    const jsWeekday = date.getDay(); // 0=Sun ... 6=Sat
    const weekdayName = JS_WEEKDAY_NAMES[jsWeekday]; // may be Sat/Sun
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(
      2,
      "0"
    )}-${String(dayOfMonth).padStart(2, "0")}`;

    const event: AcademicEvent = {
      id: Date.now(),
      label: newEventLabel.trim() || `${newEventType} (${weekdayName})`,
      type: newEventType,
      day: weekdayName, // GA uses only if in DAYS (Mon–Fri)
      affects: newEventAffects,
      batch: newEventAffects === "batch" ? newEventBatch : undefined,
      blocksTeaching: newEventBlocksTeaching,
      date: dateStr,
    };

    setEvents((prev) => [...prev, event]);
    setNewEventLabel("");
  };

  // ========= RENDER =========

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-7xl rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="border-b border-slate-800 px-6 sm:px-10 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Zenith GA Timetable Orchestrator
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Role-aware AI platform that evolves conflict-free timetables
              (Mon–Fri, 08:30–17:30) with views for batches, faculty, rooms, and
              admin-planned events (holidays, exams, fests).
            </p>
          </div>

          {/* Role selector */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            {authRole ? (
              <>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Signed in as:</span>
                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] font-medium">
                    {authRole === "admin"
                      ? "Admin"
                      : authRole === "faculty"
                      ? "Faculty"
                      : "Student"}
                  </span>
                </div>

                {authRole === "faculty" && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-400">Faculty identity:</span>
                    <select
                      value={actingFaculty}
                      onChange={(e) => {
                        setActingFaculty(e.target.value);
                        setAdjustFaculty(e.target.value);
                      }}
                      className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                    >
                      <option value="">Select your name</option>
                      {uniqueFaculties.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* fallback demo mode when not logged in */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">View as:</span>
                  <select
                    value={role}
                    onChange={(e) => {
                      const nextRole = e.target.value as Role;
                      setRole(nextRole);
                      setWhatIfResult("");
                      setPendingTimetable(null);
                      setPendingChangeDescription("");
                    }}
                    className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="courseHead">Course Head</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-[11px] font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Genetic Scheduler Online
            </span>
          </div>
        </header>

        <div
          className={`grid ${
            isStudent ? "grid-cols-1" : "xl:grid-cols-[1.25fr,1.75fr]"
          } gap-0`}
        >
          {/* Left: Control panel (hidden for pure student view) */}
          {!isStudent && (
            <section className="border-r border-slate-800 bg-slate-950/60 px-6 sm:px-8 py-6 space-y-6">
              <h2 className="text-lg font-semibold">AI & Admin Controls</h2>

              {/* Core parameters */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-slate-400 mb-1">
                    Classrooms
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={numClassrooms}
                    onChange={(e) =>
                      canEditGlobal &&
                      setNumClassrooms(Math.max(1, Number(e.target.value) || 1))
                    }
                    disabled={!canEditGlobal}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none disabled:opacity-60 focus:ring-2 focus:ring-emerald-500/60"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">
                    Batches / Sections
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={numBatches}
                    onChange={(e) =>
                      canEditGlobal &&
                      setNumBatches(Math.max(1, Number(e.target.value) || 1))
                    }
                    disabled={!canEditGlobal}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none disabled:opacity-60 focus:ring-2 focus:ring-emerald-500/60"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Subjects</label>
                  <input
                    type="number"
                    min={1}
                    value={numSubjects}
                    onChange={(e) => {
                      if (!canEditGlobal) return;
                      const next = Math.max(1, Number(e.target.value) || 1);
                      setNumSubjects(next);
                      syncSubjectsWithCount(next);
                    }}
                    disabled={!canEditGlobal}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none disabled:opacity-60 focus:ring-2 focus:ring-emerald-500/60"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Faculties</label>
                  <input
                    type="number"
                    min={1}
                    value={numFaculties}
                    onChange={(e) =>
                      canEditGlobal &&
                      setNumFaculties(Math.max(1, Number(e.target.value) || 1))
                    }
                    disabled={!canEditGlobal}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none disabled:opacity-60 focus:ring-2 focus:ring-emerald-500/60"
                  />
                </div>
              </div>

              {/* Constraints & comfort */}
              <div className="space-y-2 text-sm">
                <h3 className="font-medium">Hard & Soft Constraints</h3>
                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-3 text-xs">
                  <label className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-slate-200">
                        Avoid faculty clashes
                      </span>
                      <span className="block text-slate-500">
                        A faculty is never double-booked in the same slot.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={avoidFacultyClash}
                      onChange={(e) =>
                        canEditGlobal && setAvoidFacultyClash(e.target.checked)
                      }
                      disabled={!canEditGlobal}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 disabled:opacity-60"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-slate-200">
                        Avoid batch clashes
                      </span>
                      <span className="block text-slate-500">
                        A batch attends at most one class per slot.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={avoidBatchClash}
                      onChange={(e) =>
                        canEditGlobal && setAvoidBatchClash(e.target.checked)
                      }
                      disabled={!canEditGlobal}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 disabled:opacity-60"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-slate-200">
                        Maximize room utilization
                      </span>
                      <span className="block text-slate-500">
                        Penalize overly sparse or overly dense usage.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={maximizeRoomUse}
                      onChange={(e) =>
                        canEditGlobal && setMaximizeRoomUse(e.target.checked)
                      }
                      disabled={!canEditGlobal}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 disabled:opacity-60"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                    <p className="text-slate-200 mb-1">
                      Max sessions/day (batch)
                    </p>
                    <input
                      type="number"
                      min={1}
                      value={maxSessionsPerDayBatch}
                      onChange={(e) =>
                        canEditGlobal &&
                        setMaxSessionsPerDayBatch(
                          Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      disabled={!canEditGlobal}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none disabled:opacity-60 focus:ring-2 focus:ring-emerald-500/60"
                    />
                    <p className="mt-1 text-[10px] text-slate-500">
                      Prevents overloaded days for students.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                    <p className="text-slate-200 mb-1">
                      Max sessions/day (faculty)
                    </p>
                    <input
                      type="number"
                      min={1}
                      value={maxSessionsPerDayFaculty}
                      onChange={(e) =>
                        canEditGlobal &&
                        setMaxSessionsPerDayFaculty(
                          Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      disabled={!canEditGlobal}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none disabled:opacity-60 focus:ring-2 focus:ring-emerald-500/60"
                    />
                    <p className="mt-1 text-[10px] text-slate-500">
                      Avoids hectic teaching days for faculty.
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">
                    Subject & Faculty Matrix
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!canEditGlobal) return;
                      const next = numSubjects + 1;
                      setNumSubjects(next);
                      syncSubjectsWithCount(next);
                    }}
                    disabled={!canEditGlobal}
                    className="text-xs px-3 py-1 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 disabled:opacity-40 transition"
                  >
                    + Add Subject
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {subjects.map((subject, index) => (
                    <div
                      key={subject.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-3 flex flex-col gap-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Subject {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!canEditGlobal) return;
                            if (subjects.length <= 1) return;
                            const next = subjects.filter(
                              (s) => s.id !== subject.id
                            );
                            setSubjects(next);
                            setNumSubjects(next.length);
                          }}
                          disabled={!canEditGlobal}
                          className="hover:text-red-400 disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block mb-1 text-slate-400">
                            Subject name
                          </label>
                          <input
                            value={subject.name}
                            onChange={(e) =>
                              handleSubjectChange(
                                subject.id,
                                "name",
                                e.target.value
                              )
                            }
                            disabled={!canEditGlobal}
                            placeholder="Eg. Database Management Systems"
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 outline-none disabled:opacity-60 focus:ring-2 focus:ring-emerald-500/60"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-slate-400">
                            Classes / week
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={subject.classesPerWeek}
                            onChange={(e) =>
                              handleSubjectChange(
                                subject.id,
                                "classesPerWeek",
                                e.target.value
                              )
                            }
                            disabled={!canEditGlobal}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 outline-none disabled:opacity-60 focus:ring-2 focus:ring-emerald-500/60"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">
                          Assigned faculty
                        </label>
                        <input
                          value={subject.faculty}
                          onChange={(e) =>
                            handleSubjectChange(
                              subject.id,
                              "faculty",
                              e.target.value
                            )
                          }
                          disabled={!canEditGlobal}
                          placeholder={`Eg. Faculty ${
                            (index % Math.max(numFaculties, 1)) + 1
                          }`}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 outline-none disabled:opacity-60 focus:ring-2 focus:ring-emerald-500/60"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GA button + snapshot */}
              <div className="pt-3 border-t border-slate-800 space-y-3 text-xs">
                <button
                  type="button"
                  onClick={generateOptimizedTimetable}
                  disabled={!canRunGA || isGenerating}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-[0.98] transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGenerating ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                      Evolving timetable with GA…
                    </>
                  ) : (
                    <>
                      <span className="h-3 w-3 rounded-full bg-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                      Run Genetic Algorithm
                    </>
                  )}
                </button>
                {!canRunGA && (
                  <p className="text-[11px] text-amber-300">
                    Only Course Head/Admin can regenerate the global timetable.
                  </p>
                )}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                  <p className="text-slate-300 font-medium mb-1">GA Snapshot</p>
                  <p className="text-slate-400">
                    Generations:{" "}
                    <span className="text-emerald-300 font-semibold">
                      {gaStats.generations}
                    </span>
                    , best penalty:{" "}
                    <span className="text-emerald-300 font-semibold">
                      {gaStats.bestPenalty.toFixed(1)}
                    </span>{" "}
                    (lower = fewer clashes & smoother days).
                  </p>
                  <p className="mt-1 text-slate-400">
                    Sessions scheduled:{" "}
                    <span className="text-emerald-300 font-semibold">
                      {insights.totalSessions}
                    </span>
                    , room utilization:{" "}
                    <span className="text-emerald-300 font-semibold">
                      {insights.utilization}%
                    </span>
                    , busiest faculty:{" "}
                    <span className="text-sky-300 font-semibold">
                      {insights.busiestFaculty}
                    </span>
                    , busiest batch:{" "}
                    <span className="text-sky-300 font-semibold">
                      {insights.busiestBatch}
                    </span>
                    .
                  </p>
                </div>
              </div>

              {/* Academic events (Admin-only editing) */}
              <div className="pt-3 border-t border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Academic Events (Holidays / Exams / Fests)
                  </h3>
                  {!isAdmin && (
                    <span className="text-[10px] text-slate-500">
                      View-only (Admin manages)
                    </span>
                  )}
                </div>

                {/* Existing events */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {events.length === 0 && (
                    <p className="text-[11px] text-slate-500">
                      No events added yet. Admin can add holidays, exam weeks,
                      or fest days here.
                    </p>
                  )}
                  {events.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-start justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2"
                    >
                      <div>
                        <p className="text-slate-200 font-medium">
                          {e.label}{" "}
                          <span className="text-[10px] text-emerald-300">
                            ({e.type})
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Day: <span className="text-slate-200">{e.day}</span> ·
                          Affects:{" "}
                          <span className="text-slate-200">
                            {e.affects === "all"
                              ? "All batches"
                              : `Batch ${e.batch}`}
                          </span>{" "}
                          · Blocks teaching:{" "}
                          <span
                            className={
                              e.blocksTeaching
                                ? "text-rose-300"
                                : "text-slate-300"
                            }
                          >
                            {e.blocksTeaching
                              ? "Yes (no classes scheduled)"
                              : "No (just flagged)"}
                          </span>
                          {e.date && (
                            <>
                              {" "}
                              · Date:{" "}
                              <span className="text-slate-200">{e.date}</span>
                            </>
                          )}
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(e.id)}
                          className="text-[11px] text-rose-300 hover:text-rose-400"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add new event (admin only) */}
                {isAdmin && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3 space-y-2">
                    <p className="text-[11px] text-slate-300 mb-1">
                      Quick event form. If &quot;Blocks teaching&quot; +
                      &quot;All batches&quot;, GA will skip that weekday when
                      scheduling.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="block mb-1 text-slate-400">
                          Label
                        </label>
                        <input
                          value={newEventLabel}
                          onChange={(e) => setNewEventLabel(e.target.value)}
                          placeholder="Eg. Mid-Sem Exam, Diwali Holiday"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">
                          Type
                        </label>
                        <select
                          value={newEventType}
                          onChange={(e) =>
                            setNewEventType(e.target.value as EventType)
                          }
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                        >
                          <option value="Holiday">Holiday</option>
                          <option value="Exam Week">Exam Week</option>
                          <option value="Fest">Fest</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">
                          Weekday
                        </label>
                        <select
                          value={newEventDay}
                          onChange={(e) => setNewEventDay(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                        >
                          {DAYS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">
                          Affects
                        </label>
                        <select
                          value={newEventAffects}
                          onChange={(e) =>
                            setNewEventAffects(
                              e.target.value as "all" | "batch"
                            )
                          }
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                        >
                          <option value="all">All batches</option>
                          <option value="batch">Specific batch</option>
                        </select>
                      </div>
                      {newEventAffects === "batch" && (
                        <div>
                          <label className="block mb-1 text-slate-400">
                            Batch
                          </label>
                          <select
                            value={newEventBatch}
                            onChange={(e) => setNewEventBatch(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                          >
                            {uiBatchNames.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="col-span-2 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-slate-300">
                          <input
                            type="checkbox"
                            checked={newEventBlocksTeaching}
                            onChange={(e) =>
                              setNewEventBlocksTeaching(e.target.checked)
                            }
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                          />
                          <span className="text-[11px]">
                            Blocks teaching (no classes if &quot;All
                            batches&quot;)
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAddEvent}
                          className="px-3 py-1 rounded-full border border-emerald-500 text-[11px] text-emerald-300 hover:bg-emerald-500/10 transition"
                        >
                          Add Event
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Monthly event planner */}
                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-200">
                      Monthly Holiday / Exam / Fest Planner
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCalendarMonth((prev) => {
                            if (prev === 0) {
                              setCalendarYear((y) => y - 1);
                              return 11;
                            }
                            return prev - 1;
                          });
                        }}
                        className="px-2 py-1 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 text-[10px] transition"
                      >
                        ◀
                      </button>
                      <span className="text-[11px] text-slate-300">
                        {monthLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCalendarMonth((prev) => {
                            if (prev === 11) {
                              setCalendarYear((y) => y + 1);
                              return 0;
                            }
                            return prev + 1;
                          });
                        }}
                        className="px-2 py-1 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 text-[10px] transition"
                      >
                        ▶
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Admin picks{" "}
                    <span className="text-emerald-300">
                      Type / Affects / Blocks teaching
                    </span>{" "}
                    above, then{" "}
                    <span className="text-emerald-300">clicks on a date</span>{" "}
                    to attach an event.
                  </p>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-3">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 text-[10px] text-center text-slate-400 mb-1">
                      {WEEKDAY_HEADERS.map((h) => (
                        <div key={h} className="py-1">
                          {h}
                        </div>
                      ))}
                    </div>

                    {/* Date cells */}
                    <div className="grid grid-cols-7 gap-1 text-[11px]">
                      {monthMatrix.map((week, wi) =>
                        week.map((dayNum, di) => {
                          if (!dayNum) {
                            return (
                              <div
                                key={`${wi}-${di}`}
                                className="h-8 rounded-lg bg-slate-900/40"
                              />
                            );
                          }

                          const dateStr = `${calendarYear}-${String(
                            calendarMonth + 1
                          ).padStart(2, "0")}-${String(dayNum).padStart(
                            2,
                            "0"
                          )}`;

                          const dayEvents = events.filter(
                            (e) => e.date === dateStr
                          );

                          const hasBlockingEvent = dayEvents.some(
                            (e) => e.blocksTeaching && e.affects === "all"
                          );

                          const weekdayName =
                            JS_WEEKDAY_NAMES[
                              new Date(
                                calendarYear,
                                calendarMonth,
                                dayNum
                              ).getDay()
                            ];
                          const isWeekend =
                            weekdayName === "Saturday" ||
                            weekdayName === "Sunday";

                          return (
                            <button
                              key={`${wi}-${di}`}
                              type="button"
                              onClick={() => {
                                if (!isAdmin) return;
                                handleAddEventOnDate(dayNum);
                              }}
                              className={`h-16 rounded-xl border text-left px-1.5 py-1.5 flex flex-col gap-0.5
                                ${
                                  isWeekend
                                    ? "border-slate-800 bg-slate-900/50 text-slate-500"
                                    : "border-slate-800 bg-slate-950/60 text-slate-200"
                                }
                                ${
                                  hasBlockingEvent
                                    ? "ring-1 ring-rose-400/80 ring-offset-1 ring-offset-slate-950"
                                    : ""
                                }
                                hover:border-emerald-500/70 hover:bg-slate-900/80 transition`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold">
                                  {dayNum}
                                </span>
                                {hasBlockingEvent && (
                                  <span className="text-[9px] text-rose-300">
                                    Blocked
                                  </span>
                                )}
                              </div>
                              <div className="mt-0.5 space-y-0.5">
                                {dayEvents.slice(0, 2).map((e) => (
                                  <div
                                    key={e.id}
                                    className={`rounded-full px-1.5 py-0.5 text-[9px] truncate ${
                                      e.type === "Holiday"
                                        ? "bg-rose-500/20 text-rose-200 border border-rose-500/40"
                                        : e.type === "Exam Week"
                                        ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                                        : "bg-sky-500/20 text-sky-200 border border-sky-500/40"
                                    }`}
                                  >
                                    {e.label}
                                  </div>
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="text-[9px] text-slate-400">
                                    +{dayEvents.length - 2} more
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Right: Calendar + JSON + What-if */}
          <section className="px-4 sm:px-6 xl:px-8 py-6 space-y-4">
            {/* Calendar header & view filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Weekly Calendar View</h2>
                <p className="text-xs text-slate-400">
                  Monday–Friday · 08:30–17:30 · View as: all / specific batch /
                  faculty / room
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

            {timetable.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/40">
                <div className="text-center max-w-xs text-sm text-slate-400">
                  <p className="mb-2">No timetable yet.</p>
                  {!isStudent && (
                    <p>
                      Configure subjects, faculties, and constraints, then click{" "}
                      <span className="text-emerald-300 font-medium">
                        “Run Genetic Algorithm”
                      </span>
                      .
                    </p>
                  )}
                  {isStudent && (
                    <p>
                      Ask admin/faculty to publish the timetable. Once
                      generated, you’ll see it here.
                    </p>
                  )}
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

            {/* JSON Output (hidden for student) */}
            {!isStudent && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Timetable JSON Output
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyJSON}
                    disabled={!timetable.length}
                    className="text-[11px] px-3 py-1 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 disabled:opacity-40 transition"
                  >
                    Copy JSON
                  </button>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 max-h-52 overflow-auto text-[11px] font-mono text-slate-200">
                  {timetable.length === 0 ? (
                    <span className="text-slate-500">
                      // JSON timetable will appear here after running the
                      Genetic Algorithm
                    </span>
                  ) : (
                    <pre>{jsonOutput}</pre>
                  )}
                </div>
              </div>
            )}

            {/* What-if rescheduling & extra class (not for students) */}
            {canUseWhatIf && (
              <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-200">
                    What-if: Faculty Adjustments
                  </h3>
                  <div className="inline-flex rounded-full border border-slate-700 bg-slate-950 p-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        setWhatIfMode("move");
                        setWhatIfResult("");
                        setPendingTimetable(null);
                        setPendingChangeDescription("");
                      }}
                      className={`px-2 py-0.5 rounded-full ${
                        whatIfMode === "move"
                          ? "bg-emerald-500 text-slate-950"
                          : "text-slate-300"
                      }`}
                    >
                      Move class
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWhatIfMode("extra");
                        setWhatIfResult("");
                        setPendingTimetable(null);
                        setPendingChangeDescription("");
                      }}
                      className={`px-2 py-0.5 rounded-full ${
                        whatIfMode === "extra"
                          ? "bg-emerald-500 text-slate-950"
                          : "text-slate-300"
                      }`}
                    >
                      Extra class
                    </button>
                  </div>
                </div>

                {whatIfMode === "move" ? (
                  <>
                    <div className="grid sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block mb-1 text-slate-400">
                          Faculty
                        </label>
                        <select
                          value={isFaculty ? actingFaculty : adjustFaculty}
                          onChange={(e) => {
                            if (isFaculty) {
                              setActingFaculty(e.target.value);
                              setAdjustFaculty(e.target.value);
                            } else {
                              setAdjustFaculty(e.target.value);
                            }
                          }}
                          disabled={isFaculty} // faculty is fixed to themselves
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60"
                        >
                          {!isFaculty && (
                            <option value="">Select faculty</option>
                          )}
                          {uniqueFaculties.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                        {isFaculty && (
                          <p className="mt-1 text-[10px] text-slate-500">
                            As faculty, you can only move your own classes.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">Day</label>
                        <select
                          value={adjustDay}
                          onChange={(e) => setAdjustDay(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                        >
                          {DAYS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">
                          Class time
                        </label>
                        <select
                          value={adjustTime}
                          onChange={(e) => setAdjustTime(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                        >
                          {TIME_SLOTS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleMoveWhatIf("prepone")}
                        className="px-3 py-1.5 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 text-[11px] transition"
                      >
                        Simulate Prepone (← earlier slot)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveWhatIf("postpone")}
                        className="px-3 py-1.5 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 text-[11px] transition"
                      >
                        Simulate Postpone (→ later slot)
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block mb-1 text-slate-400">
                          Batch
                        </label>
                        <select
                          value={extraBatch}
                          onChange={(e) => setExtraBatch(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                        >
                          {uiBatchNames.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block mb-1 text-slate-400">
                          Subject
                        </label>
                        <select
                          value={extraSubjectId}
                          onChange={(e) =>
                            setExtraSubjectId(
                              e.target.value ? Number(e.target.value) : ""
                            )
                          }
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                        >
                          <option value="">Select subject</option>
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.faculty || "Faculty?"})
                            </option>
                          ))}
                        </select>
                        {isFaculty && (
                          <p className="mt-1 text-[10px] text-slate-500">
                            You can only schedule extra classes for subjects you
                            teach.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">Day</label>
                        <select
                          value={extraDay}
                          onChange={(e) => setExtraDay(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                        >
                          {DAYS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">
                          Time
                        </label>
                        <select
                          value={extraTime}
                          onChange={(e) => setExtraTime(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500/60"
                        >
                          {TIME_SLOTS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        type="button"
                        onClick={handleExtraClassWhatIf}
                        className="px-3 py-1.5 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 text-[11px] transition"
                      >
                        Simulate Extra Class (room + impact)
                      </button>
                    </div>
                  </>
                )}

                {/* What-if Analysis + Apply Button */}
                <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 min-h-[60px] text-[11px] text-slate-200 space-y-2">
                  <div>
                    {whatIfResult
                      ? whatIfResult
                      : "Use the controls above to move an existing class or simulate an extra class. The AI will check room availability and tell you if it’s good or bad for students and faculty."}
                  </div>
                  {pendingTimetable && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400">
                        Pending change: {pendingChangeDescription}
                      </span>
                      <button
                        type="button"
                        onClick={applyPendingChange}
                        disabled={!canApplyPendingChange}
                        className="ml-2 px-3 py-1 rounded-full border border-emerald-500 text-[11px] text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-40 disabled:border-slate-700 disabled:text-slate-500 transition"
                      >
                        Apply this change
                      </button>
                    </div>
                  )}
                  {pendingTimetable && !canApplyPendingChange && (
                    <p className="text-[10px] text-amber-300">
                      You don&apos;t have permission to apply this change (it
                      affects classes beyond your scope). Ask a Course Head or
                      Admin.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TimetableGAPlatform;
