// src/app/org/create/page.tsx
"use client";

import { useState } from "react";

// ---------- Types ----------
type OrgSummary = {
  id: string;
  name: string;
  category: string;
};

type Room = {
  id: number;
  name: string;
  capacity: number;
  type: string;
};

type Batch = {
  id: number;
  name: string;
  size: number;
  semester: string;
  department: string;
};

type Subject = {
  id: number;
  code: string;
  name: string;
  semester: string;
  classesPerWeek: number;
};

type Faculty = {
  id: number;
  name: string;
  department: string;
  maxLoadPerWeek: number;
  availability: string;
};

type TimetableOption = {
  id: number;
  title: string;
  description: string;
  focus: string;
};

// ---------- Admin Dashboard ----------
function AdminDashboard({ org }: { org: OrgSummary }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomForm, setRoomForm] = useState({
    name: "",
    capacity: "",
    type: "Classroom",
  });

  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchForm, setBatchForm] = useState({
    name: "",
    size: "",
    semester: "",
    department: "",
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectForm, setSubjectForm] = useState({
    code: "",
    name: "",
    semester: "",
    classesPerWeek: "",
  });

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [facultyForm, setFacultyForm] = useState({
    name: "",
    department: "",
    maxLoadPerWeek: "",
    availability: "",
  });

  const [timetableOptions, setTimetableOptions] = useState<TimetableOption[]>(
    []
  );
  const [clashNotes, setClashNotes] = useState<string[]>([]);
  const [dynamicNotes, setDynamicNotes] = useState<string[]>([]);

  const totalRoomCapacity = rooms.reduce(
    (sum, r) => sum + (Number.isFinite(r.capacity) ? r.capacity : 0),
    0
  );
  const totalBatchSize = batches.reduce(
    (sum, b) => sum + (Number.isFinite(b.size) ? b.size : 0),
    0
  );
  const totalWeeklyClasses = subjects.reduce(
    (sum, s) =>
      sum + (Number.isFinite(s.classesPerWeek) ? s.classesPerWeek : 0),
    0
  );
  const totalFacultyMaxLoad = faculties.reduce(
    (sum, f) =>
      Number.isFinite(f.maxLoadPerWeek) ? sum + f.maxLoadPerWeek : sum,
    0
  );

  const roomUtilizationHint =
    totalRoomCapacity > 0
      ? `${Math.min(
          100,
          Math.round((totalBatchSize / totalRoomCapacity) * 100)
        )}% potential occupancy`
      : "Add rooms & batches to see occupancy";

  const facultyLoadHint =
    totalFacultyMaxLoad > 0
      ? `${Math.round(
          (totalWeeklyClasses / totalFacultyMaxLoad) * 100
        )}% of total faculty capacity`
      : "Add faculties & subjects to see load";

  function addRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!roomForm.name || !roomForm.capacity) return;
    const capacity = Number(roomForm.capacity);
    if (Number.isNaN(capacity)) return;
    setRooms((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: roomForm.name,
        capacity,
        type: roomForm.type,
      },
    ]);
    setRoomForm({ name: "", capacity: "", type: "Classroom" });
  }

  function addBatch(e: React.FormEvent) {
    e.preventDefault();
    if (!batchForm.name || !batchForm.size) return;
    const size = Number(batchForm.size);
    if (Number.isNaN(size)) return;
    setBatches((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: batchForm.name,
        size,
        semester: batchForm.semester || "Unknown",
        department: batchForm.department || "General",
      },
    ]);
    setBatchForm({ name: "", size: "", semester: "", department: "" });
  }

  function addSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.classesPerWeek) return;
    const classesPerWeek = Number(subjectForm.classesPerWeek);
    if (Number.isNaN(classesPerWeek)) return;
    setSubjects((prev) => [
      ...prev,
      {
        id: Date.now(),
        code: subjectForm.code || `SUB-${prev.length + 1}`,
        name: subjectForm.name,
        semester: subjectForm.semester || "Unknown",
        classesPerWeek,
      },
    ]);
    setSubjectForm({
      code: "",
      name: "",
      semester: "",
      classesPerWeek: "",
    });
  }

  function addFaculty(e: React.FormEvent) {
    e.preventDefault();
    if (!facultyForm.name || !facultyForm.maxLoadPerWeek) return;
    const maxLoadPerWeek = Number(facultyForm.maxLoadPerWeek);
    if (Number.isNaN(maxLoadPerWeek)) return;
    setFaculties((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: facultyForm.name,
        department: facultyForm.department || "General",
        maxLoadPerWeek,
        availability: facultyForm.availability || "Not set",
      },
    ]);
    setFacultyForm({
      name: "",
      department: "",
      maxLoadPerWeek: "",
      availability: "",
    });
  }

  function handleGenerateTimetable() {
    const options: TimetableOption[] = [
      {
        id: 1,
        title: "Balanced Load (AI Option A)",
        description:
          "Distributes classes evenly across the week, minimizing heavy back-to-back slots.",
        focus: "Faculty load balance",
      },
      {
        id: 2,
        title: "Room Utilization Max (AI Option B)",
        description:
          "Packs sessions into high-capacity rooms, reducing idle time and underutilization.",
        focus: "Room utilization & clash reduction",
      },
    ];
    setTimetableOptions(options);
    runClashAnalysis();
  }

  function runClashAnalysis() {
    const notes: string[] = [];

    if (batches.length > rooms.length) {
      notes.push(
        "Potential room clash: more batches than rooms. Consider adding rooms or staggering slots."
      );
    }

    if (totalFacultyMaxLoad > 0 && totalWeeklyClasses > totalFacultyMaxLoad) {
      notes.push(
        "Faculty overload risk: total required classes exceed combined faculty capacity."
      );
    }

    if (subjects.length > 0 && batches.length > 0) {
      notes.push(
        "Check elective overlaps: verify that elective subjects don’t clash for shared batches."
      );
    }

    if (notes.length === 0) {
      notes.push("No obvious clashes based on current high-level data.");
    }

    setClashNotes(notes);
  }

  function handleFacultyLeave() {
    setDynamicNotes((prev) => [
      ...prev,
      "Faculty leave: AI should reassign affected classes to alternates and suggest free slots.",
    ]);
  }

  function handleRoomUnavailable() {
    setDynamicNotes((prev) => [
      ...prev,
      "Room unavailable: AI should move sessions to spare rooms or reschedule to low-load periods.",
    ]);
  }

  function handleEventScheduling() {
    setDynamicNotes((prev) => [
      ...prev,
      "Event scheduled: AI should block room/time, then reshuffle affected lectures around it.",
    ]);
  }

  return (
    <div className="mt-8 space-y-6 w-full max-w-5xl">
      {/* Header */}
      <section className="bg-white border rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Admin Dashboard – {org.name}
            </h2>
            <p className="text-xs text-neutral-500">
              Type: <span className="font-medium">{org.category}</span> · Org
              ID:{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                {org.id}
              </code>
            </p>
            <p className="text-xs text-neutral-500 mt-2">
              Configure institute data, generate optimized timetables, and
              handle dynamic scheduling changes here.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1 text-xs">
            <span className="font-semibold text-neutral-700">
              Snap Analytics
            </span>
            <span className="text-neutral-500">
              Room utilization: {roomUtilizationHint}
            </span>
            <span className="text-neutral-500">
              Faculty load: {facultyLoadHint}
            </span>
          </div>
        </div>
      </section>

      {/* Data entry modules */}
      <section className="grid md:grid-cols-2 gap-4">
        {/* Rooms */}
        <div className="bg-white border rounded-2xl shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold">Rooms & Infrastructure</h3>
          <p className="text-xs text-neutral-500">
            Define classrooms, labs, and special rooms with capacities.
          </p>
          <form onSubmit={addRoom} className="space-y-2">
            <div className="flex gap-2">
              <input
                required
                value={roomForm.name}
                onChange={(e) =>
                  setRoomForm((f) => ({ ...f, name: e.target.value }))
                }
                className="flex-1 px-2 py-1.5 border rounded-md text-xs"
                placeholder="Room name (e.g., C-101)"
              />
              <input
                required
                value={roomForm.capacity}
                onChange={(e) =>
                  setRoomForm((f) => ({ ...f, capacity: e.target.value }))
                }
                className="w-20 px-2 py-1.5 border rounded-md text-xs"
                placeholder="Cap."
              />
            </div>
            <select
              value={roomForm.type}
              onChange={(e) =>
                setRoomForm((f) => ({ ...f, type: e.target.value }))
              }
              className="w-full px-2 py-1.5 border rounded-md text-xs"
            >
              <option value="Classroom">Classroom</option>
              <option value="Lab">Lab</option>
              <option value="Seminar Hall">Seminar Hall</option>
              <option value="Auditorium">Auditorium</option>
            </select>
            <button
              type="submit"
              className="w-full py-1.5 rounded-md bg-black text-white text-xs"
            >
              Add Room
            </button>
          </form>
          {rooms.length > 0 && (
            <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto text-xs">
              {rooms.map((r) => (
                <li
                  key={r.id}
                  className="flex justify-between border rounded-md px-2 py-1"
                >
                  <span>
                    {r.name} · {r.type}
                  </span>
                  <span>Cap: {r.capacity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Batches */}
        <div className="bg-white border rounded-2xl shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold">Student Batches</h3>
          <p className="text-xs text-neutral-500">
            Configure batches per department, semester and size.
          </p>
          <form onSubmit={addBatch} className="space-y-2">
            <input
              required
              value={batchForm.name}
              onChange={(e) =>
                setBatchForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full px-2 py-1.5 border rounded-md text-xs"
              placeholder="Batch name (e.g., CSE A, CSE B)"
            />
            <div className="flex gap-2">
              <input
                required
                value={batchForm.size}
                onChange={(e) =>
                  setBatchForm((f) => ({ ...f, size: e.target.value }))
                }
                className="w-24 px-2 py-1.5 border rounded-md text-xs"
                placeholder="Size"
              />
              <input
                value={batchForm.semester}
                onChange={(e) =>
                  setBatchForm((f) => ({ ...f, semester: e.target.value }))
                }
                className="flex-1 px-2 py-1.5 border rounded-md text-xs"
                placeholder="Semester (e.g., 3)"
              />
            </div>
            <input
              value={batchForm.department}
              onChange={(e) =>
                setBatchForm((f) => ({ ...f, department: e.target.value }))
              }
              className="w-full px-2 py-1.5 border rounded-md text-xs"
              placeholder="Department (e.g., CSE, ECE)"
            />
            <button
              type="submit"
              className="w-full py-1.5 rounded-md bg-black text-white text-xs"
            >
              Add Batch
            </button>
          </form>
          {batches.length > 0 && (
            <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto text-xs">
              {batches.map((b) => (
                <li
                  key={b.id}
                  className="flex justify-between border rounded-md px-2 py-1"
                >
                  <span>
                    {b.name} · {b.department} · Sem {b.semester}
                  </span>
                  <span>Size: {b.size}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        {/* Subjects */}
        <div className="bg-white border rounded-2xl shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold">Subjects & Load</h3>
          <p className="text-xs text-neutral-500">
            Define subjects and how many classes per week they require.
          </p>
          <form onSubmit={addSubject} className="space-y-2">
            <input
              value={subjectForm.code}
              onChange={(e) =>
                setSubjectForm((f) => ({ ...f, code: e.target.value }))
              }
              className="w-full px-2 py-1.5 border rounded-md text-xs"
              placeholder="Subject code (optional, e.g., CS301)"
            />
            <input
              required
              value={subjectForm.name}
              onChange={(e) =>
                setSubjectForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full px-2 py-1.5 border rounded-md text-xs"
              placeholder="Subject name"
            />
            <div className="flex gap-2">
              <input
                value={subjectForm.semester}
                onChange={(e) =>
                  setSubjectForm((f) => ({ ...f, semester: e.target.value }))
                }
                className="flex-1 px-2 py-1.5 border rounded-md text-xs"
                placeholder="Semester"
              />
              <input
                required
                value={subjectForm.classesPerWeek}
                onChange={(e) =>
                  setSubjectForm((f) => ({
                    ...f,
                    classesPerWeek: e.target.value,
                  }))
                }
                className="w-28 px-2 py-1.5 border rounded-md text-xs"
                placeholder="Classes/week"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 rounded-md bg-black text-white text-xs"
            >
              Add Subject
            </button>
          </form>
          {subjects.length > 0 && (
            <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto text-xs">
              {subjects.map((s) => (
                <li
                  key={s.id}
                  className="flex justify-between border rounded-md px-2 py-1"
                >
                  <span>
                    {s.code ? `${s.code} · ` : ""}
                    {s.name} (Sem {s.semester})
                  </span>
                  <span>{s.classesPerWeek}/week</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Faculties */}
        <div className="bg-white border rounded-2xl shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold">Faculty & Availability</h3>
          <p className="text-xs text-neutral-500">
            Capture faculty load limits and available time windows.
          </p>
          <form onSubmit={addFaculty} className="space-y-2">
            <input
              required
              value={facultyForm.name}
              onChange={(e) =>
                setFacultyForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full px-2 py-1.5 border rounded-md text-xs"
              placeholder="Faculty name"
            />
            <input
              value={facultyForm.department}
              onChange={(e) =>
                setFacultyForm((f) => ({ ...f, department: e.target.value }))
              }
              className="w-full px-2 py-1.5 border rounded-md text-xs"
              placeholder="Department (e.g., CSE)"
            />
            <div className="flex gap-2">
              <input
                required
                value={facultyForm.maxLoadPerWeek}
                onChange={(e) =>
                  setFacultyForm((f) => ({
                    ...f,
                    maxLoadPerWeek: e.target.value,
                  }))
                }
                className="w-32 px-2 py-1.5 border rounded-md text-xs"
                placeholder="Max load/week"
              />
              <input
                value={facultyForm.availability}
                onChange={(e) =>
                  setFacultyForm((f) => ({
                    ...f,
                    availability: e.target.value,
                  }))
                }
                className="flex-1 px-2 py-1.5 border rounded-md text-xs"
                placeholder="Availability (e.g., Mon–Fri 9–4)"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 rounded-md bg-black text-white text-xs"
            >
              Add Faculty
            </button>
          </form>
          {faculties.length > 0 && (
            <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto text-xs">
              {faculties.map((f) => (
                <li
                  key={f.id}
                  className="flex justify-between border rounded-md px-2 py-1"
                >
                  <span>
                    {f.name} · {f.department}
                  </span>
                  <span>{f.maxLoadPerWeek}/week</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Timetable & dynamic stuff */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold">Timetable Generation (AI)</h3>
            <button
              onClick={handleGenerateTimetable}
              className="px-3 py-1.5 rounded-md bg-black text-white text-xs"
            >
              Generate Options
            </button>
          </div>
          <p className="text-xs text-neutral-500">
            Uses your inputs (rooms, batches, subjects, faculties) to propose
            optimized timetable candidates.
          </p>
          {timetableOptions.length > 0 && (
            <ul className="mt-2 space-y-2 text-xs">
              {timetableOptions.map((opt) => (
                <li
                  key={opt.id}
                  className="border rounded-md px-3 py-2 bg-slate-50"
                >
                  <div className="font-semibold">{opt.title}</div>
                  <div className="text-neutral-600 mt-1">{opt.description}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-neutral-500">
                    Focus: {opt.focus}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold">
            Clash Detection & Workload Imbalance
          </h3>
          <p className="text-xs text-neutral-500">
            Highlights conflicts before finalizing the timetable.
          </p>
          {clashNotes.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs">
              {clashNotes.map((note, idx) => (
                <li
                  key={idx}
                  className="border rounded-md px-2 py-1 bg-red-50 text-red-700"
                >
                  {note}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-neutral-400">
              Click “Generate Options” to run clash analysis.
            </p>
          )}
        </div>
      </section>

      <section className="bg-white border rounded-2xl shadow-sm p-4 space-y-3 mb-4">
        <h3 className="text-sm font-semibold">
          Dynamic Inputs & Adaptive Rescheduling
        </h3>
        <p className="text-xs text-neutral-500">
          Simulate disruptions and see what the AI should do.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={handleFacultyLeave}
            className="px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50"
          >
            Faculty Leave
          </button>
          <button
            onClick={handleRoomUnavailable}
            className="px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50"
          >
            Room Unavailable
          </button>
          <button
            onClick={handleEventScheduling}
            className="px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50"
          >
            Event Scheduling
          </button>
        </div>
        {dynamicNotes.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs">
            {dynamicNotes.map((note, idx) => (
              <li
                key={idx}
                className="border rounded-md px-2 py-1 bg-blue-50 text-blue-700"
              >
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ---------- Create Organisation Page (pure front-end) ----------
export default function CreateOrganisationPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [createdOrg, setCreatedOrg] = useState<OrgSummary | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !description.trim()) return;

    const fakeId = Math.random().toString(36).slice(2, 10).toUpperCase();

    const newOrg: OrgSummary = {
      id: fakeId,
      name: name.trim(),
      category,
    };

    setCreatedOrg(newOrg);
    // You can keep the form filled or clear it. I'll clear it:
    setName("");
    setDescription("");
    setCategory("Engineering");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white border rounded-2xl shadow-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold">Create Organisation</h1>
        <p className="text-xs text-neutral-500">
          This sets up your{" "}
          <span className="font-medium">
            Intelligent Timetable Optimization &amp; Scheduling Assistant
          </span>{" "}
          space. All timetables and scheduling logic will live under this
          organisation.
        </p>

        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-xs mb-1 text-neutral-700">
              Organisation Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border text-sm"
              placeholder="e.g. Zenith Institute of Technology"
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-neutral-700">
              Description
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-md border text-sm"
              placeholder="Short description of your institution / organisation"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-neutral-700">
              Type / Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-md border text-sm"
            >
              <option value="Engineering">Engineering</option>
              <option value="Medical">Medical</option>
              <option value="Science">Science</option>
              <option value="Commerce">Commerce</option>
              <option value="Arts">Arts</option>
              <option value="Polytechnic">Polytechnic</option>
              <option value="School">School</option>
              <option value="Other">Other / Multidisciplinary</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-md bg-black text-white text-sm"
          >
            Create Organisation
          </button>
        </form>
      </div>

      {/* Admin dashboard appears after creation */}
      {createdOrg && <AdminDashboard org={createdOrg} />}
    </div>
  );
}
