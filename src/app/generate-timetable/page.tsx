"use client";

import { useState } from "react";

export default function Home() {
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/parse", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!data || !data.parsed) {
        throw new Error("Parsing failed");
      }

      // Save parsed result
      localStorage.setItem("parsedTimetable", JSON.stringify(data.parsed));

      // Redirect to generator page
      window.location.href = "/generate-timetable";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Upload failed");
      } else {
        setError(String(err) || "Upload failed");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">

        {/* Main Hero UI */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Timetable Generator
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Create optimized academic schedules with TQI scoring
          </p>

          {/* Features */}
          <div className="space-y-4 mb-12">
            {[
              "Intelligent Scheduling",
              "TQI Quality Metrics",
              "Conflict-Free Schedules"
            ].map((f) => (
              <div key={f} className="flex items-center justify-center space-x-2">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{f}</span>
              </div>
            ))}

          </div>

          {/* Upload Button */}
          <button
            onClick={() => setShowUpload(true)}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Generate Timetable →
          </button>
        </div>

        {/* Cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600 mb-2">Fast</div>
            <p className="text-gray-600">Generate schedules in seconds</p>
          </div>

          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600 mb-2">Smart</div>
            <p className="text-gray-600">AI-powered optimization</p>
          </div>

          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600 mb-2">Flexible</div>
            <p className="text-gray-600">Customizable constraints</p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Upload Timetable File
            </h2>

            <input
              type="file"
              accept=".pdf,.csv,.xlsx,.xls,.png,.jpg"
              onChange={handleFileUpload}
              className="w-full p-3 border rounded-lg bg-gray-100"
            />

            {loading && <p className="mt-4 text-center">Processing…</p>}
            {error && <p className="mt-4 text-center text-red-500">{error}</p>}

            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowUpload(false)}
                className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
