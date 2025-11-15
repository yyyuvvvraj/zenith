// src/app/onboarding/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Role = "admin" | "hod" | "faculty" | "student" | null;

function redirectToRoleDashboard(
  router: ReturnType<typeof useRouter>,
  role: Role
) {
  if (role === "admin") {
    router.replace("/dashboard/admin");
  } else if (role === "faculty") {
    router.replace("/dashboard/faculty");
  } else if (role === "hod") {
    router.replace("/dashboard/hod");
  } else if (role === "student") {
    router.replace("/dashboard/student");
  } else {
    router.replace("/dashboard");
  }
}

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // If not authenticated, redirect to signup/signin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signup");
    }
  }, [status, router]);

  // Load existing profile
  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/profile", { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const json = await res.json();
        const p = json.profile;
        if (p) {
          const savedRole: Role = p.role ?? null;
          setRole(savedRole);
          setProfileLoaded(true);
          // if onboarding already complete, forward to role-specific dashboard
          if (p.onboardingComplete) {
            redirectToRoleDashboard(router, savedRole);
            return;
          }
        }
      } catch (err: any) {
        console.error("Load profile failed", err);
        setError(err?.message ?? "Could not load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [status, router]);

  async function handleCompleteOnboarding() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, onboardingComplete: true }),
      });
      if (!res.ok) throw new Error("Failed to update profile");

      // ✅ role-based redirect after saving
      redirectToRoleDashboard(router, role);
    } catch (err: any) {
      console.error("Complete onboarding failed", err);
      setError(err?.message ?? "Failed to complete onboarding");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-3">
          Welcome — complete onboarding
        </h2>

        {status === "loading" || loading ? (
          <div>Loading…</div>
        ) : (
          <>
            {error && <div className="mb-3 text-red-600">{error}</div>}

            <p className="text-sm text-neutral-600 mb-4">
              Hi <strong>{session?.user?.email}</strong>. Select your role so we
              can tailor the experience.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <label
                className={`p-3 border rounded cursor-pointer ${
                  role === "admin" ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  className="hidden"
                  checked={role === "admin"}
                  onChange={() => setRole("admin")}
                />
                <div className="text-sm font-semibold">Admin</div>
                <div className="text-xs text-neutral-500">
                  Full access to system settings
                </div>
              </label>

              <label
                className={`p-3 border rounded cursor-pointer ${
                  role === "hod" ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="hod"
                  className="hidden"
                  checked={role === "hod"}
                  onChange={() => setRole("hod")}
                />
                <div className="text-sm font-semibold">HOD</div>
                <div className="text-xs text-neutral-500">
                  Manage department data & trigger timetables
                </div>
              </label>

              <label
                className={`p-3 border rounded cursor-pointer ${
                  role === "faculty" ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="faculty"
                  className="hidden"
                  checked={role === "faculty"}
                  onChange={() => setRole("faculty")}
                />
                <div className="text-sm font-semibold">Faculty</div>
                <div className="text-xs text-neutral-500">
                  Set availability and view your timetable
                </div>
              </label>

              <label
                className={`p-3 border rounded cursor-pointer ${
                  role === "student" ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="student"
                  className="hidden"
                  checked={role === "student"}
                  onChange={() => setRole("student")}
                />
                <div className="text-sm font-semibold">Student</div>
                <div className="text-xs text-neutral-500">
                  View timetable for your program & semester
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                className="px-4 py-2 bg-black text-white rounded disabled:opacity-60"
                disabled={!role || loading}
                onClick={handleCompleteOnboarding}
              >
                {loading ? "Saving..." : "Complete onboarding"}
              </button>

              <button
                className="px-4 py-2 border rounded"
                onClick={() => redirectToRoleDashboard(router, role)}
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
