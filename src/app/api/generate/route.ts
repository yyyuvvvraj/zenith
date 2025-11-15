import { NextResponse } from "next/server";
import { ParsedTimetable, TimetableVersion } from "@/types/timetable";

export async function POST(req: Request) {
  const body = await req.json();

  const parsed: ParsedTimetable = body.parsed;

  const versions: TimetableVersion[] = [
    { id: 1, tqi: Math.random() * 10, timetable: parsed.rows.slice(0, 10) },
    { id: 2, tqi: Math.random() * 10, timetable: parsed.rows.slice(10, 20) },
    { id: 3, tqi: Math.random() * 10, timetable: parsed.rows.slice(20, 30) },
  ];

  return NextResponse.json({ versions });
}
