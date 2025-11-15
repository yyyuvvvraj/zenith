// components/Hero.tsx
import Image from "next/image";

export default function Hero() {
  return (
    <section className="rounded-3xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] px-6 sm:px-10 py-10 sm:py-12 lg:py-14 flex flex-col lg:flex-row gap-10 lg:gap-12 items-center">
      {/* Left: text */}
      <div className="flex-1 space-y-5">
        <span className="inline-flex items-center rounded-full bg-[#e0ecff] px-3 py-1 text-xs font-medium text-[#2563eb]">
          Intelligent Scheduling Platform
        </span>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-slate-900">
          Smart Timetable{" "}
          <span className="block text-[#2563eb]">Optimization</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl">
          Automatically generate conflict-free academic timetables with
          AI-powered optimization. Maximize room utilization, balance faculty
          workload, and eliminate scheduling conflicts across your institution.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button className="rounded-lg bg-[#2563eb] px-5 sm:px-6 py-2.5 text-sm font-medium text-white shadow-md hover:bg-[#1d4ed8] transition">
            Get Started
          </button>
          <button className="rounded-lg border border-[#e2e8f0] bg-white px-5 sm:px-6 py-2.5 text-sm font-medium text-slate-800 hover:border-[#cbd5f5] hover:bg-[#f8fafc] transition">
            Learn More
          </button>
        </div>
      </div>

      {/* Right: screenshot / mock image */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.30)]">
          {/* Replace src with your actual image path */}
          <Image
            src="/images/dashboard-mock.png"
            alt="Zenith timetable analytics dashboard"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
