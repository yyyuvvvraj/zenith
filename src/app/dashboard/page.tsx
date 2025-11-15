// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/firebase/clientApp";
import { onAuthStateChanged, signOut as firebaseSignOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) {
        // if not authenticated, go to signup/login
        router.replace("/signup");
      }
    });
    return () => unsub();
  }, [router]);

  async function handleSignOut() {
    await firebaseSignOut(auth);
    router.replace("/signup");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-start justify-center py-12 px-6">
      {/* top decorative bar (matches screenshots) */}
      <div className="w-full max-w-5xl">
        <header className="mb-8 rounded-t-lg overflow-hidden">
          <div className="h-16 bg-gradient-to-r from-[#2b35a8] to-[#4e64d6]" />
        </header>

        <main className="bg-white rounded-b-lg shadow-md -mt-8 p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                  {user?.photoURL ? (
                    // show user photo when available
                    // if external domain, ensure next.config.js allows it; otherwise show placeholder
                    // fallback to initials
                    <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-lg text-neutral-600 font-semibold">
                      {user?.displayName ? user.displayName.slice(0,1).toUpperCase() : user?.email?.slice(0,1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xl font-semibold">{user?.displayName || "Welcome"}</div>
                  <div className="text-sm text-neutral-500">{user?.email}</div>
                </div>
              </div>

              <div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-md bg-red-600 text-white shadow-sm"
                >
                  Sign out
                </button>
              </div>
            </div>

            {/* Content: central card similar to your screenshots */}
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Dashboard</h2>
              <p className="text-sm text-neutral-600 mb-4">
                This is your app dashboard. Replace this with your real dashboard widgets, stats, or navigation.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md">
                  <div className="text-sm text-neutral-500">Account</div>
                  <div className="mt-2 text-sm">{user?.displayName ?? "—"}</div>
                  <div className="mt-1 text-xs text-neutral-400">{user?.email ?? "—"}</div>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="text-sm text-neutral-500">Next steps</div>
                  <ul className="mt-2 text-sm list-disc ml-5 text-neutral-700">
                    <li>Customize your profile</li>
                    <li>Connect additional services</li>
                    <li>Add app-specific widgets</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* end central card */}
          </div>
        </main>
      </div>
    </div>
  );
}
