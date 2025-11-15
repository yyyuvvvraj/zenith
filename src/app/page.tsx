import Hero from "@/components/HomeHero.tsx/Hero";
import MetricsStrip from "@/components/TimelineSection/TimelineSection";
import FeatureGrid from "@/components/FeatureGrid/FeatureGrid";
import ManualVsZenith from "@/components/ManualVsZenith/ManualVsZenith";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f4f7ff] via-[#edf3ff] to-[#e6f0ff]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 sm:space-y-12">
        <Hero />
        <MetricsStrip />
        <FeatureGrid />
        <ManualVsZenith />
      </div>
    </main>
  );
}
