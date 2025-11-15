// components/ManualVsZenith.tsx
const manual = ["Multiple sheets", "Hidden clashes", "Last-minute fixes"];
const zenith = ["Single source", "Live conflicts", "Safe experiments"];

export default function ManualVsZenith() {
  return (
    <section className="grid gap-8 lg:grid-cols-2 items-stretch mt-4">
      {/* Manual side */}
      <div className="rounded-3xl bg-white border border-slate-200 px-6 sm:px-8 py-8 flex flex-col justify-between shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Before
          </p>
          <h3 className="text-xl font-semibold text-slate-900">
            Manual scheduling
          </h3>
          <p className="text-sm text-slate-600">
            Fragile timetables built on Excel, email threads and guesswork.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {manual.map((item) => (
            <span
              key={item}
              className="rounded-full bg-slate-50 px-3 py-1.5 text-[12px] text-slate-700 border border-slate-200"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Zenith side */}
      <div className="relative rounded-3xl bg-[#020617] px-6 sm:px-8 py-8 overflow-hidden shadow-[0_24px_90px_rgba(15,23,42,0.9)]">
        <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-[#2563eb]/50 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl" />

        <div className="relative space-y-3 mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#a5b4fc]">
            After Zenith
          </p>
          <h3 className="text-xl font-semibold text-white">
            An engine that keeps up.
          </h3>
          <p className="text-sm text-slate-300">
            Generate, test and lock clash-free timetables without breaking a
            sweat.
          </p>
        </div>

        <div className="relative flex flex-wrap gap-2 mb-6">
          {zenith.map((item) => (
            <span
              key={item}
              className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] text-slate-100 border border-white/15"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Big mini-timetable */}
        <div className="relative rounded-2xl bg-slate-900/80 border border-slate-700 px-3 py-3">
          <div className="flex items-center justify-between mb-2 text-[11px] text-slate-400">
            <span>CS – Sem 4</span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              ● clash-free
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1 text-[9px]">
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
              <div
                key={d}
                className="rounded-md bg-slate-800 px-1.5 py-1 flex flex-col gap-1"
              >
                <span className="text-[9px] text-slate-400 mb-0.5">{d}</span>
                <span className="truncate rounded-sm bg-[#2563eb]/60 px-1 py-0.5">
                  DSA • 9:00
                </span>
                <span className="truncate rounded-sm bg-emerald-500/50 px-1 py-0.5">
                  Lab • 11:00
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
