// src/app/dashboard/faculty/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";
import { RoleDashboard } from "../_components/RoleDashboard";

type Org = {
  id: string;
  name: string;
  type: string;
  joinCode?: string;
};

type FacultySession = {
  name?: string;
  username?: string;
  role?: "faculty";
  orgId?: string;
};

export default function FacultyDashboardPage() {
  const router = useRouter();

  const [faculty, setFaculty] = useState<FacultySession | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadFacultyData = async () => {
      try {
        const raw = window.localStorage.getItem("currentFacultyUser");
        if (!raw) {
          router.replace("/signup");
          return;
        }

        const parsed = JSON.parse(raw) as FacultySession;
        if (!parsed.role || parsed.role !== "faculty") {
          router.replace("/signup");
          return;
        }

        setFaculty(parsed);

        if (!parsed.orgId) {
          setError(
            "No organisation is linked to this faculty account. Ask your admin to regenerate your login."
          );
          setLoading(false);
          return;
        }

        // Debug: Log the orgId we're trying to fetch
        console.log("Attempting to fetch organization with ID:", parsed.orgId);

        setLoading(true);
        setError(null);

        try {
          const orgRef = doc(db, "organizations", parsed.orgId);
          const snap = await getDoc(orgRef);

          // Debug: Log the snapshot result
          console.log("Firestore snapshot exists:", snap.exists());
          console.log("Firestore snapshot data:", snap.data());

          if (!snap.exists()) {
            setError(
              `Organisation not found (ID: ${parsed.orgId}). This could be due to: 1) The organisation was deleted, 2) Incorrect organisation ID, or 3) Insufficient permissions to read this data.`
            );
            setLoading(false);
            return;
          }

          const data = snap.data() as {
            name: string;
            type: string;
            joinCode?: string;
          };

          setOrg({
            id: snap.id,
            name: data.name,
            type: data.type,
            joinCode: data.joinCode,
          });
        } catch (err: any) {
          console.error("Failed to load organisation for faculty", err);

          // More specific error message based on error code
          if (err.code === "permission-denied") {
            setError(
              "Permission denied: Your account doesn't have access to read organisation data. Please contact your administrator to update Firebase security rules."
            );
          } else {
            setError(
              err?.message ??
                "Failed to load organisation. Check console for details."
            );
          }
        } finally {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to parse faculty session", err);
        router.replace("/signup");
      }
    };

    loadFacultyData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-sm text-slate-300">
          Loading your faculty dashboard…
        </div>
      </div>
    );
  }

  if (!faculty) {
    return null;
  }

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
        <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl p-6 space-y-3 text-sm">
          <h1 className="text-lg font-semibold">
            Welcome, {faculty.name || faculty.username || "Faculty"}
          </h1>
          <p className="text-xs text-slate-400">
            We couldn&apos;t find the organisation linked to your account.
          </p>
          {error && (
            <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="font-semibold mb-1">Error:</div>
              <div className="font-mono text-[10px] leading-relaxed">
                {error}
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400">
            Please ask your admin to confirm your login credentials or
            regenerate your faculty account.
          </p>

          {/* Debug info */}
          {faculty.orgId && (
            <div className="text-[10px] text-slate-500 bg-slate-800/50 rounded p-2 font-mono">
              <div>Org ID: {faculty.orgId}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="mb-4 rounded-3xl border border-slate-800 bg-slate-900/70 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Organisation
            </div>
            <div className="mt-1 text-lg font-semibold">{org.name}</div>
            <div className="text-[11px] text-slate-400">
              Type:{" "}
              <span className="font-medium text-slate-200">{org.type}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Logged in as{" "}
              <span className="font-medium text-slate-200">
                {faculty.name || faculty.username || "Faculty"}
              </span>
            </div>
          </div>
          {org.joinCode && (
            <div className="text-xs md:text-right">
              <div className="text-slate-400 mb-1">Organisation join code</div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-3 py-1.5 font-mono text-sm tracking-widest">
                {org.joinCode}
              </div>
            </div>
          )}
        </div>
      </div>

      <RoleDashboard role="faculty" />
    </div>
  );
}
