"use client";

import { useState } from "react";

export default function UploadPage() {
  const [loading, setLoading] = useState(false);

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/parse", { method: "POST", body: form });
    const data = await res.json();

    localStorage.setItem("parsedTimetable", JSON.stringify(data.parsed));
    window.location.href = "/generate-timetable";
  };

  return (
    <div className="max-w-xl mx-auto p-12 text-center">
      <h1 className="text-4xl font-bold mb-6">Upload Timetable File</h1>

      <input
        type="file"
        accept=".xlsx,.xls,.csv,.pdf,.png,.jpg"
        onChange={uploadFile}
        className="bg-gray-200 p-3 rounded w-full"
      />

      {loading && <p className="mt-4">Parsing file…</p>}
    </div>
  );
}
