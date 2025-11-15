"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/clientApp";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";

type AppSessionUser = {
  displayName: string;
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppSessionUser | null>(null);
  const router = useRouter();

  // Listen for Firebase auth (admins)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
    });
    return () => unsub();
  }, []);

  // Read faculty/student role from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromStorage = () => {
      try {
        const roleRaw = window.localStorage.getItem("currentUserRole");
        const facultyRaw = window.localStorage.getItem("currentFacultyUser");
        const studentRaw = window.localStorage.getItem("currentStudentUser");

        let displayName: string | null = null;

        if (facultyRaw) {
          const f = JSON.parse(facultyRaw);
          displayName = f.name || f.username || "Faculty";
        } else if (studentRaw) {
          const s = JSON.parse(studentRaw);
          displayName = s.name || s.username || "Student";
        } else if (roleRaw) {
          const r = JSON.parse(roleRaw);
          displayName = r.name || r.username || r.email || null;
        }

        if (displayName) {
          setAppUser({ displayName });
        } else {
          setAppUser(null);
        }
      } catch (err) {
        console.error("Failed to read app session from localStorage", err);
        setAppUser(null);
      }
    };

    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  const isLoggedIn = !!firebaseUser || !!appUser;

  const displayName =
    firebaseUser?.displayName ||
    firebaseUser?.email ||
    appUser?.displayName ||
    "User";

  const initial = (displayName || "U").slice(0, 1).toUpperCase();

  async function handleSignOut() {
    try {
      // Firebase admin sign-out
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }

      // Clear custom role logins (faculty/student)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("currentUserRole");
        window.localStorage.removeItem("currentFacultyUser");
        window.localStorage.removeItem("currentStudentUser");
      }

      router.replace("/");
    } catch (err) {
      console.error("Sign out failed", err);
      router.replace("/");
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold shadow-sm">
            Z
          </div>
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-slate-900"
          >
            Zenith
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-900">
          <Link href="/features" className="hover:text-slate-600 transition">
            Features
          </Link>
          <Link href="/contact" className="hover:text-slate-600 transition">
            Contact
          </Link>
          <Link href="/about" className="hover:text-slate-600 transition">
            About
          </Link>
        </nav>

        {/* Right side: CTA or Signout */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* small avatar/initial */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-medium text-slate-700 overflow-hidden">
                  {firebaseUser?.photoURL ? (
                    // use plain <img> to avoid next/image domain issues in header
                    <img
                      src={firebaseUser.photoURL}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>
                <div className="hidden md:block text-sm text-slate-700">
                  {displayName}
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="ml-2 inline-flex items-center rounded-xl px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm 
                  bg-gradient-to-r from-[#b6daff] to-[#ffd6e9] 
                  hover:opacity-95 transition"
                aria-label="Sign out"
                title="Sign out"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="
                  hidden md:inline-flex rounded-xl px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm 
                  bg-gradient-to-r from-[#b6daff] to-[#b6daff] 
                  bg-[length:200%_200%] bg-left 
                  hover:bg-right hover:from-[#b6daff] hover:to-[#ffd6e9]
                  transition-all duration-500 ease-out
                "
              >
                Signup
              </Link>
            </>
          )}

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-slate-900"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden px-6 py-4 bg-white/90 border-t border-slate-200 space-y-3 text-sm font-medium">
          <a href="#features" className="block">
            Features
          </a>
          <a href="#pricing" className="block">
            Pricing
          </a>
          <a href="#about" className="block">
            About
          </a>

          {isLoggedIn ? (
            <button
              onClick={handleSignOut}
              className="w-full rounded-xl px-4 py-2 font-semibold shadow-sm text-slate-900 bg-gradient-to-r from-[#b6daff] to-[#ffd6e9]"
            >
              Sign out
            </button>
          ) : (
            <Link href="/signup" className="block w-full">
              <button className="w-full rounded-xl px-4 py-2 font-semibold shadow-sm text-slate-900 bg-gradient-to-r from-[#b6daff] to-[#ffd6e9]">
                Signup
              </button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
