"use client";

import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { timetableFlow } from "@/data/timetable-flow";

export default function RadialOrbitalTimelineDemo() {
  return <RadialOrbitalTimeline timelineData={timetableFlow as any} />;
}
