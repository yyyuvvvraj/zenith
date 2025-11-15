// components/FeatureGrid.tsx
const features = [
  {
    title: "Live Clash Map",
    subtitle: "See conflicts as you type.",
    icon: "🗺️",
  },
  {
    title: "One-Click Replan",
    subtitle: "Leaves & events auto-handled.",
    icon: "🌀",
  },
  {
    title: "Balanced Days",
    subtitle: "No more 9–5 lecture marathons.",
    icon: "📅",
  },
];

export default function FeatureGrid() {
  return (
    <section
      id="features"
      className="rounded-3xl bg-white shadow-[0_20px_70px_rgba(15,23,42,0.10)] px-6 sm:px-10 py-10 space-y-7"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
          Built for chaotic timetables.
        </h2>
        <span className="hidden sm:inline text-xs text-slate-500">
          Zenith keeps the mess under control.
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 px-5 py-7 flex flex-col justify-between min-h-[190px] shadow-sm hover:shadow-[0_22px_60px_rgba(15,23,42,0.18)] hover:-translate-y-1 transition-all"
          >
            {/* floating glow */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#2563eb33] blur-3xl group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" />

            <div className="relative mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm text-2xl">
                <span className="group-hover:-translate-y-0.5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </span>
              </div>
            </div>

            <div className="relative">
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {f.title}
              </h3>
              <p className="text-sm text-slate-600">{f.subtitle}</p>
            </div>

            {/* sliding accent bar */}
            <div className="relative mt-5 h-1.5 rounded-full bg-white/70 overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-[#2563eb] translate-x-[-60%] group-hover:translate-x-[130%] transition-transform duration-700 ease-out" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
