import {
  CalendarCheck,
  LayoutDashboard,
  BarChart3,
  Workflow,
  Rocket,
} from "lucide-react";

export const timetableFlow = [
  {
    id: 1,
    title: "Input & Constraints",
    date: "Now",
    content:
      "Upload faculty availability, room capacity, departments & workload rules.",
    icon: CalendarCheck,
    relatedIds: [2],
    status: "completed",
    score: 95,
  },
  {
    id: 2,
    title: "AI Optimization",
    date: "Ongoing",
    content:
      "Zenith generates optimized schedules using real-time constraints.",
    icon: Workflow,
    relatedIds: [1, 3],
    status: "in-progress",
    score: 80,
  },
  {
    id: 3,
    title: "Conflict Simulation",
    date: "Next",
    content: "Run impact tests for faculty leaves & room adjustments.",
    icon: LayoutDashboard,
    relatedIds: [2, 4],
    status: "in-progress",
    score: 60,
  },
  {
    id: 4,
    title: "Review & Approval",
    date: "Soon",
    content: "HOD & faculty review schedule with conflict warnings.",
    icon: BarChart3,
    relatedIds: [3, 5],
    status: "pending",
    score: 40,
  },
  {
    id: 5,
    title: "Publish Timetable",
    date: "Release",
    content: "Timetable published to students & staff in one click.",
    icon: Rocket,
    relatedIds: [4],
    status: "pending",
    score: 10,
  },
];
