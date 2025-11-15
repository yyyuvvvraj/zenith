// src/app/signup/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { auth, googleProvider } from "@/firebase/clientApp";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Page() {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const router = useRouter();

  // If user is already signed in, send them to dashboard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) router.replace("/dashboard");
    });
    return () => unsub();
  }, [router]);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      if (auth.currentUser && form.name) {
        await updateProfile(auth.currentUser, { displayName: form.name });
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-6">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-center rounded-2xl p-8 bg-gradient-to-b from-[#071028] to-[#051027]">
          <div className="mb-6">
            <div className="text-sm text-white/80 mb-3">Art</div>
            <div className="w-full rounded-lg overflow-hidden shadow-inner">
              <Image
                src="/images/hero-art.jpg"
                alt="Hero art"
                width={520}
                height={420}
                className="object-cover w-full h-72"
                priority
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/60 text-white rounded-lg p-4">
              <h4 className="font-semibold text-sm">Securely verify your identity</h4>
              <p className="text-xs text-white/70 mt-1">We will only ask for what's needed.</p>
            </div>
            <div className="bg-black/60 text-white rounded-lg p-4">
              <h4 className="font-semibold text-sm">Retrieve your email info</h4>
              <p className="text-xs text-white/70 mt-1">Used for account recovery.</p>
            </div>
            <div className="bg-black/60 text-white rounded-lg p-4">
              <h4 className="font-semibold text-sm">Access basic profile</h4>
              <p className="text-xs text-white/70 mt-1">Display name and avatar.</p>
            </div>
            <div className="bg-black/60 text-white rounded-lg p-4">
              <h4 className="font-semibold text-sm">Maintain session</h4>
              <p className="text-xs text-white/70 mt-1">Keep you signed in securely.</p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl border p-8 shadow-sm">
            <div className="text-center mb-4">
              <div className="text-xs uppercase text-neutral-400 tracking-wider">Log in to your app</div>
            </div>

            <div className="flex justify-center mb-4">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-3 px-6 py-3 rounded-full border shadow-sm bg-black text-white hover:opacity-95 disabled:opacity-60"
                disabled={loading}
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 533.5 544.3" aria-hidden>
                  <path fill="#4285F4" d="M533.5 278.4c0-17.6-1.6-35.5-4.9-52.8H272v99.9h146.9c-6.4 34.8-25.9 64.3-55.4 84v69.7h89.5c52.4-48.2 82.5-119.1 82.5-200.8z"/>
                  <path fill="#34A853" d="M272 544.3c74.4 0 136.9-24.6 182.6-66.8l-89.5-69.7c-24.9 16.8-57 26.7-93.1 26.7-71.6 0-132.4-48.3-154.2-113.2H29.9v71.1C75 479.7 167 544.3 272 544.3z"/>
                  <path fill="#FBBC05" d="M117.8 327.6c-9.8-29-9.8-60.6 0-89.6V167H29.9c-39 77.6-39 169.4 0 247l87.9-86.4z"/>
                  <path fill="#EA4335" d="M272 107.1c39.4-.6 77.4 13.6 106.3 39.3l79.6-79.6C407.9 24.4 344.9 0 272 0 167 0 75 64.6 29.9 167l87.9 71.1C139.6 155.4 200.4 107.1 272 107.1z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="text-center text-xs text-neutral-400 mb-4">or continue with email</div>

            {mode === "register" ? (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-xs mb-1 text-neutral-600">Name</label>
                  <input required value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))}
                    className="w-full px-3 py-2 rounded-md border text-sm" />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-neutral-600">Email</label>
                  <input required type="email" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))}
                    className="w-full px-3 py-2 rounded-md border text-sm" />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-neutral-600">Password</label>
                  <input required type="password" value={form.password} onChange={(e)=>setForm(f=>({...f,password:e.target.value}))}
                    className="w-full px-3 py-2 rounded-md border text-sm" />
                </div>

                <div>
                  <button type="submit" disabled={loading} className="w-full py-2 rounded-md bg-black text-white">
                    {loading ? "Creating..." : "Create account"}
                  </button>
                </div>

                <div className="text-center">
                  <button type="button" onClick={()=>{ setMode("login"); setError(null); }} className="underline text-sm">
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs mb-1 text-neutral-600">Email</label>
                  <input required type="email" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))}
                    className="w-full px-3 py-2 rounded-md border text-sm" />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-neutral-600">Password</label>
                  <input required type="password" value={form.password} onChange={(e)=>setForm(f=>({...f,password:e.target.value}))}
                    className="w-full px-3 py-2 rounded-md border text-sm" />
                </div>

                <div>
                  <button type="submit" disabled={loading} className="w-full py-2 rounded-md bg-black text-white">
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>

                <div className="text-center">
                  <button type="button" onClick={()=>{ setMode("register"); setError(null); }} className="underline text-sm">
                    New here? Create account
                  </button>
                </div>
              </form>
            )}

            {error && <div className="mt-3 text-center text-sm text-red-600">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
