"use client";
import React, { useState } from "react";

interface TimetableItem {
  id: string;
  subject: string;
  subject_code: string;
  faculty: string;
  room: string;
  slot: number;
  start: string;
  end: string;
}

export default function GenerateTimetable() {
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateTimetable = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/schedule/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      const data = await res.json();

      if (data.status === "success") {
        setTimetable(data.schedule);
      } else {
        setError(data.message || "Failed to generate timetable.");
      }
    } catch (err) {
      setError("Could not connect to backend.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="w-full p-6">
      
      {/* Header */}
      <h1 className="text-2xl font-bold mb-3">Generate Timetable</h1>

      {/* Generate Button */}
      <button
        onClick={generateTimetable}
        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow"
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-red-600 font-semibold mt-4">{error}</p>
      )}

      {/* Timetable Table */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Timetable Result</h2>

        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-purple-200">
              <th className="p-3">Subject</th>
              <th className="p-3">Faculty</th>
              <th className="p-3">Room</th>
              <th className="p-3">Slot</th>
              <th className="p-3">Start</th>
              <th className="p-3">End</th>
            </tr>
          </thead>

          <tbody>
            {timetable.map((item, i) => (
              <tr key={i} className="border-b text-center">
                <td className="p-2">{item.subject}</td>
                <td className="p-2">{item.faculty}</td>
                <td className="p-2">{item.room}</td>
                <td className="p-2">{item.slot}</td>
                <td className="p-2">{item.start}</td>
                <td className="p-2">{item.end}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {timetable.length === 0 && !loading && (
          <p className="mt-3 text-gray-500">No timetable generated yet.</p>
        )}
      </div>
    </div>
  );
}
