"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { auth } from "@/firebase/clientApp";
import GoogleSignInButton from "@/components/GoogleSignInButton/GoogleSignInButton";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { useRouter } from "next/navigation";

const CRED_KEY = "facultyCredentials"; // faculty + course head credentials generated in admin dashboard
const STUDENT_CRED_KEY = "studentCredentials"; // student credentials generated in admin dashboard
const ORGS_KEY = "zenithOrgs"; // list of organisations (multi-tenant)

type TabKey = "admin" | "courseHead" | "faculty" | "student";

type Org = {
  id: string;
  name: string;
  code: string;
  adminEmail: string;
};

function generateOrgCode() {
  // Example: ZEN-AB12CD
  return `ZEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function getOrgsFromStorage(): Org[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ORGS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Org[];
  } catch {
    return [];
  }
}

function saveOrgsToStorage(orgs: Org[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORGS_KEY, JSON.stringify(orgs));
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabKey>("admin");
  const [mode, setMode] = useState<"register" | "login">("register"); // for admin only
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    orgName: "",
  });

  // faculty login
  const [facultyLogin, setFacultyLogin] = useState({
    username: "",
    password: "",
  });
  const [facultyError, setFacultyError] = useState<string | null>(null);

  // course head login
  const [courseHeadLogin, setCourseHeadLogin] = useState({
    username: "",
    password: "",
  });
  const [courseHeadError, setCourseHeadError] = useState<string | null>(null);

  // student login
  const [studentLogin, setStudentLogin] = useState({
    username: "",
    password: "",
  });
  const [studentOrgCode, setStudentOrgCode] = useState("");
  const [studentError, setStudentError] = useState<string | null>(null);

  // org creation feedback
  const [createdOrgCode, setCreatedOrgCode] = useState<string | null>(null);
  const [createdOrgName, setCreatedOrgName] = useState<string | null>(null);

  // existing admin without org: prompt for org
  const [orgSetupNeeded, setOrgSetupNeeded] = useState(false);
  const [pendingAdminEmail, setPendingAdminEmail] = useState<string | null>(
    null
  );
  const [orgNameForExistingAdmin, setOrgNameForExistingAdmin] = useState("");

  const router = useRouter();

  // If user is already signed in with Firebase (admin), send them to timetable page
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        // If they already have org & role in localStorage, timetable page will pick that.
        router.replace("/timetable");
      }
    });
    return () => unsub();
  }, [router]);

  // ---------- help: create org for admin ----------
  function createOrgForAdmin(email: string, orgName: string): Org {
    const trimmedName = orgName.trim();
    const orgCode = generateOrgCode();

    const orgs = getOrgsFromStorage();
    const newOrg: Org = {
      id: Date.now().toString(),
      name: trimmedName || "My Organisation",
      code: orgCode,
      adminEmail: email,
    };
    orgs.push(newOrg);
    saveOrgsToStorage(orgs);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("currentOrgCode", newOrg.code);
      window.localStorage.setItem(
        "currentUserRole",
        JSON.stringify({
          role: "admin",
          email,
          orgCode: newOrg.code,
          orgName: newOrg.name,
        })
      );
    }

    setCreatedOrgCode(newOrg.code);
    setCreatedOrgName(newOrg.name);
    setOrgSetupNeeded(false);
    setPendingAdminEmail(null);

    return newOrg;
  }

  // ---------- ADMIN SIGNUP ----------

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedOrgCode(null);
    setCreatedOrgName(null);

    try {
      if (!form.orgName.trim()) {
        setError("Please enter your organisation / university name.");
        setLoading(false);
        return;
      }

      await createUserWithEmailAndPassword(auth, form.email, form.password);
      if (auth.currentUser && form.name) {
        await updateProfile(auth.currentUser, { displayName: form.name });
      }

      // Create org + code on first sign up
      const org = createOrgForAdmin(form.email, form.orgName);

      // Also remember admin basic info
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "currentUserRole",
          JSON.stringify({
            role: "admin",
            email: form.email,
            name: form.name,
            orgCode: org.code,
            orgName: org.name,
          })
        );
        window.localStorage.setItem("currentOrgCode", org.code);
      }

      // DO NOT auto-redirect – show org code first
      // Admin can click "Go to Timetable" button after noting the code
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  // ---------- ADMIN LOGIN ----------

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedOrgCode(null);
    setCreatedOrgName(null);
    setOrgSetupNeeded(false);
    setPendingAdminEmail(null);

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);

      const orgs = getOrgsFromStorage();
      const existingOrg = orgs.find((o) => o.adminEmail === form.email);

      if (!existingOrg) {
        // First login of an admin who does not yet have an org
        setOrgSetupNeeded(true);
        setPendingAdminEmail(form.email);
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "currentUserRole",
          JSON.stringify({
            role: "admin",
            email: form.email,
            orgCode: existingOrg.code,
            orgName: existingOrg.name,
          })
        );
        window.localStorage.setItem("currentOrgCode", existingOrg.code);
      }

      router.push("/timetable");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function handleExistingAdminOrgCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingAdminEmail) return;
    if (!orgNameForExistingAdmin.trim()) {
      setError("Please enter an organisation name.");
      return;
    }
    const org = createOrgForAdmin(pendingAdminEmail, orgNameForExistingAdmin);
    // After creation, send them to timetable
    router.push("/timetable");
  }

  // ---------- FACULTY LOGIN (username/password) ----------

  function handleFacultyLogin(e: React.FormEvent) {
    e.preventDefault();
    setFacultyError(null);

    if (typeof window === "undefined") {
      setFacultyError("Faculty login not available in this environment.");
      return;
    }

    const raw = window.localStorage.getItem(CRED_KEY);
    if (!raw) {
      setFacultyError(
        "No faculty credentials have been generated yet. Ask your admin for your username and password."
      );
      return;
    }

    let creds: { username: string; password: string; name: string }[] = [];
    try {
      creds = JSON.parse(raw);
    } catch {
      setFacultyError("Unable to read stored faculty credentials.");
      return;
    }

    const found = creds.find(
      (c) =>
        c.username === facultyLogin.username.trim() &&
        c.password === facultyLogin.password
    );

    if (!found) {
      setFacultyError("Invalid username or password for faculty login.");
      return;
    }

    // For now, faculty just attaches to last/active orgCode in localStorage (or admin sets it earlier).
    // You can also tie faculty to org explicitly when generating creds.
    let orgCode = "DEFAULT_ORG";
    const orgs = getOrgsFromStorage();
    if (orgs.length > 0) {
      orgCode = orgs[0].code;
    }

    window.localStorage.setItem(
      "currentFacultyUser",
      JSON.stringify({
        name: found.name,
        username: found.username,
        role: "faculty",
        orgCode,
      })
    );
    window.localStorage.setItem(
      "currentUserRole",
      JSON.stringify({
        role: "faculty",
        username: found.username,
        orgCode,
      })
    );
    window.localStorage.setItem("currentOrgCode", orgCode);

    // ✅ Faculty lands on timetable as well
    router.push("/timetable");
  }

  // ---------- COURSE HEAD LOGIN (username/password -> role: courseHead) ----------

  function handleCourseHeadLogin(e: React.FormEvent) {
    e.preventDefault();
    setCourseHeadError(null);

    if (typeof window === "undefined") {
      setCourseHeadError(
        "Course Head login not available in this environment."
      );
      return;
    }

    const raw = window.localStorage.getItem(CRED_KEY);
    if (!raw) {
      setCourseHeadError(
        "No course head/faculty credentials have been generated yet. Ask your admin for your username and password."
      );
      return;
    }

    let creds: { username: string; password: string; name: string }[] = [];
    try {
      creds = JSON.parse(raw);
    } catch {
      setCourseHeadError("Unable to read stored course head credentials.");
      return;
    }

    const found = creds.find(
      (c) =>
        c.username === courseHeadLogin.username.trim() &&
        c.password === courseHeadLogin.password
    );

    if (!found) {
      setCourseHeadError("Invalid username or password for course head login.");
      return;
    }

    // Attach course head to same org selection logic as faculty for now.
    let orgCode = "DEFAULT_ORG";
    const orgs = getOrgsFromStorage();
    if (orgs.length > 0) {
      orgCode = orgs[0].code;
    }

    window.localStorage.setItem(
      "currentCourseHeadUser",
      JSON.stringify({
        name: found.name,
        username: found.username,
        role: "courseHead",
        orgCode,
      })
    );
    window.localStorage.setItem(
      "currentUserRole",
      JSON.stringify({
        role: "courseHead",
        username: found.username,
        orgCode,
      })
    );
    window.localStorage.setItem("currentOrgCode", orgCode);

    // ✅ Course Head lands on timetable with elevated controls
    router.push("/timetable");
  }

  // ---------- STUDENT LOGIN (username/password + org code) ----------

  function handleStudentLogin(e: React.FormEvent) {
    e.preventDefault();
    setStudentError(null);

    if (typeof window === "undefined") {
      setStudentError("Student login not available in this environment.");
      return;
    }

    if (!studentOrgCode.trim()) {
      setStudentError("Please enter your organisation code.");
      return;
    }

    // 1) check student credentials
    const rawCreds = window.localStorage.getItem(STUDENT_CRED_KEY);
    if (!rawCreds) {
      setStudentError(
        "No student credentials have been generated yet. Ask your admin for your username and password."
      );
      return;
    }

    let creds: { username: string; password: string; name: string }[] = [];
    try {
      creds = JSON.parse(rawCreds);
    } catch {
      setStudentError("Unable to read stored student credentials.");
      return;
    }

    const found = creds.find(
      (c) =>
        c.username === studentLogin.username.trim() &&
        c.password === studentLogin.password
    );

    if (!found) {
      setStudentError("Invalid username or password for student login.");
      return;
    }

    // 2) check org code
    const enteredCode = studentOrgCode.trim().toUpperCase();
    const orgs = getOrgsFromStorage();
    const org = orgs.find((o) => o.code.toUpperCase() === enteredCode);

    if (!org) {
      setStudentError("Invalid organisation code. Please verify with admin.");
      return;
    }

    // Mock login for student: store in localStorage and redirect.
    window.localStorage.setItem(
      "currentStudentUser",
      JSON.stringify({
        name: found.name,
        username: found.username,
        role: "student",
        orgCode: org.code,
        orgName: org.name,
      })
    );
    window.localStorage.setItem(
      "currentUserRole",
      JSON.stringify({
        role: "student",
        username: found.username,
        orgCode: org.code,
        orgName: org.name,
      })
    );
    window.localStorage.setItem("currentOrgCode", org.code);

    // ✅ Student lands on timetable (student view)
    router.push("/timetable");
  }

  // ---------- Tab Button ----------

  function TabButton({
    tab,
    label,
    description,
  }: {
    tab: TabKey;
    label: string;
    description: string;
  }) {
    const active = activeTab === tab;
    return (
      <button
        type="button"
        onClick={() => {
          setActiveTab(tab);
          setError(null);
          setFacultyError(null);
          setCourseHeadError(null);
          setStudentError(null);
          setCreatedOrgCode(null);
          setCreatedOrgName(null);
          setOrgSetupNeeded(false);
          setPendingAdminEmail(null);
        }}
        className={`flex-1 px-3 py-2 rounded-xl text-left border text-xs transition ${
          active
            ? "bg-black text-white border-black shadow-sm"
            : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
        }`}
      >
        <div className="font-semibold text-[11px] uppercase tracking-wide">
          {label}
        </div>
        <div className="text-[10px] text-neutral-500 mt-0.5">{description}</div>
      </button>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-6">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-center rounded-2xl p-8 bg-gradient-to-b from-[#071028] to-[#051027]">
          <div className="mb-6">
            <div className="text-sm text-white/80 mb-3">Zenith Scheduler</div>
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
              <h4 className="font-semibold text-sm">Admin-first access</h4>
              <p className="text-xs text-white/70 mt-1">
                Institute admins sign up with secure email accounts.
              </p>
            </div>
            <div className="bg-black/60 text-white rounded-lg p-4">
              <h4 className="font-semibold text-sm">
                Faculty & students use IDs
              </h4>
              <p className="text-xs text-white/70 mt-1">
                Credentials generated and distributed by the admin.
              </p>
            </div>
            <div className="bg-black/60 text-white rounded-lg p-4">
              <h4 className="font-semibold text-sm">
                Role-based timetable views
              </h4>
              <p className="text-xs text-white/70 mt-1">
                Admin manages, course heads coordinate, faculty edits, students
                view only.
              </p>
            </div>
            <div className="bg-black/60 text-white rounded-lg p-4">
              <h4 className="font-semibold text-sm">Multi-org ready</h4>
              <p className="text-xs text-white/70 mt-1">
                Each admin manages their own organisation/university.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl border p-8 shadow-sm">
            <div className="text-center mb-4">
              <div className="text-[11px] uppercase text-neutral-400 tracking-wider">
                Zenith – Intelligent Timetable Assistant
              </div>
              <br />
              <div className="flex justify-center mb-4">
                <GoogleSignInButton />
              </div>
              <div className="mt-2 text-sm font-semibold">
                Choose your role to continue
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              <TabButton
                tab="admin"
                label="Admin"
                description="Sign up or login as university admin"
              />
              <TabButton
                tab="courseHead"
                label="Course Head"
                description="Department / course coordinator access"
              />
              <TabButton
                tab="faculty"
                label="Faculty"
                description="Login with institute-provided credentials"
              />
              <TabButton
                tab="student"
                label="Student"
                description="View-only timetable access"
              />
            </div>

            {/* Active Tab Content */}
            {activeTab === "admin" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold">Admin Access</h2>
                  <span className="text-[11px] text-neutral-500">
                    Manage organisations & timetables
                  </span>
                </div>

                {/* Show org code if just created */}
                {createdOrgCode && createdOrgName && (
                  <div className="mb-3 rounded-md border border-emerald-500/70 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900">
                    <div className="font-semibold text-xs mb-1">
                      Organisation created
                    </div>
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {createdOrgName}
                    </div>
                    <div>
                      <span className="font-medium">Org Code:</span>{" "}
                      <span className="font-mono">{createdOrgCode}</span>
                    </div>
                    <div className="mt-1">
                      Share this code with faculty and students so they can join
                      your timetable.
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/timetable")}
                      className="mt-2 w-full py-1.5 rounded-md bg-black text-white text-xs"
                    >
                      Go to Timetable
                    </button>
                  </div>
                )}

                {/* If existing admin logged in but has no org yet */}
                {orgSetupNeeded && !createdOrgCode ? (
                  <form
                    onSubmit={handleExistingAdminOrgCreate}
                    className="space-y-3"
                  >
                    <div className="text-xs text-neutral-600 mb-1">
                      Welcome! Before using Zenith, please create your
                      organisation and get an org code to share.
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-neutral-600">
                        Organisation / University Name
                      </label>
                      <input
                        required
                        value={orgNameForExistingAdmin}
                        onChange={(e) =>
                          setOrgNameForExistingAdmin(e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-md border text-sm"
                        placeholder="e.g., Zenith Institute of Technology"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 rounded-md bg-black text-white text-sm"
                    >
                      Create organisation & get code
                    </button>
                  </form>
                ) : mode === "register" ? (
                  <>
                    {/* ADMIN REGISTRATION */}
                    <form onSubmit={handleRegister} className="space-y-3">
                      <div>
                        <label className="block text-xs mb-1 text-neutral-600">
                          Admin Name
                        </label>
                        <input
                          required
                          value={form.name}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, name: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-md border text-sm"
                          placeholder="e.g., Dr. Admin"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-neutral-600">
                          Admin Email
                        </label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, email: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-md border text-sm"
                          placeholder="admin@university.edu"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-neutral-600">
                          Organisation / University Name
                        </label>
                        <input
                          required
                          value={form.orgName}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, orgName: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-md border text-sm"
                          placeholder="e.g., Zenith Institute of Technology"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-neutral-600">
                          Password
                        </label>
                        <input
                          required
                          type="password"
                          value={form.password}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              password: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-md border text-sm"
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-2 rounded-md bg-black text-white text-sm"
                        >
                          {loading
                            ? "Creating admin..."
                            : "Create admin account & org"}
                        </button>
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setMode("login");
                            setError(null);
                          }}
                          className="underline text-sm"
                        >
                          Already an admin? Sign in
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    {/* ADMIN LOGIN */}
                    <form onSubmit={handleLogin} className="space-y-3">
                      <div>
                        <label className="block text-xs mb-1 text-neutral-600">
                          Admin Email
                        </label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, email: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-md border text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-neutral-600">
                          Password
                        </label>
                        <input
                          required
                          type="password"
                          value={form.password}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              password: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-md border text-sm"
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-2 rounded-md bg-black text-white text-sm"
                        >
                          {loading ? "Signing in..." : "Admin sign in"}
                        </button>
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setMode("register");
                            setError(null);
                          }}
                          className="underline text-sm"
                        >
                          New admin? Create account
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {error && (
                  <div className="mt-2 text-center text-xs text-red-600">
                    {error}
                  </div>
                )}
              </div>
            )}

            {activeTab === "courseHead" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold">Course Head Login</h2>
                  <span className="text-[11px] text-neutral-500">
                    Department / course coordinator access
                  </span>
                </div>

                <form onSubmit={handleCourseHeadLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1 text-neutral-600">
                      Course Head Username
                    </label>
                    <input
                      value={courseHeadLogin.username}
                      onChange={(e) =>
                        setCourseHeadLogin((f) => ({
                          ...f,
                          username: e.target.value,
                        }))
                      }
                      placeholder="e.g., cse.coordinator"
                      className="w-full px-3 py-2 rounded-md border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-neutral-600">
                      Course Head Password
                    </label>
                    <input
                      type="password"
                      value={courseHeadLogin.password}
                      onChange={(e) =>
                        setCourseHeadLogin((f) => ({
                          ...f,
                          password: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-md border text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-md border bg-white text-sm hover:bg-neutral-50"
                  >
                    Login as Course Head
                  </button>
                  {courseHeadError && (
                    <div className="mt-2 text-center text-xs text-red-600">
                      {courseHeadError}
                    </div>
                  )}
                </form>
              </div>
            )}

            {activeTab === "faculty" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold">Faculty Login</h2>
                  <span className="text-[11px] text-neutral-500">
                    Edit and manage your assigned timetable
                  </span>
                </div>

                <form onSubmit={handleFacultyLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1 text-neutral-600">
                      Faculty Username
                    </label>
                    <input
                      value={facultyLogin.username}
                      onChange={(e) =>
                        setFacultyLogin((f) => ({
                          ...f,
                          username: e.target.value,
                        }))
                      }
                      placeholder="e.g., sujal.kishore"
                      className="w-full px-3 py-2 rounded-md border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-neutral-600">
                      Faculty Password
                    </label>
                    <input
                      type="password"
                      value={facultyLogin.password}
                      onChange={(e) =>
                        setFacultyLogin((f) => ({
                          ...f,
                          password: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-md border text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-md border bg-white text-sm hover:bg-neutral-50"
                  >
                    Login as Faculty
                  </button>
                  {facultyError && (
                    <div className="mt-2 text-center text-xs text-red-600">
                      {facultyError}
                    </div>
                  )}
                </form>
              </div>
            )}

            {activeTab === "student" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold">Student Login</h2>
                  <span className="text-[11px] text-neutral-500">
                    View-only timetable access
                  </span>
                </div>

                <form onSubmit={handleStudentLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1 text-neutral-600">
                      Student Username
                    </label>
                    <input
                      value={studentLogin.username}
                      onChange={(e) =>
                        setStudentLogin((f) => ({
                          ...f,
                          username: e.target.value,
                        }))
                      }
                      placeholder="e.g., cse.sem3.batchA"
                      className="w-full px-3 py-2 rounded-md border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-neutral-600">
                      Student Password
                    </label>
                    <input
                      type="password"
                      value={studentLogin.password}
                      onChange={(e) =>
                        setStudentLogin((f) => ({
                          ...f,
                          password: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-md border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-neutral-600">
                      Organisation Code
                    </label>
                    <input
                      value={studentOrgCode}
                      onChange={(e) => setStudentOrgCode(e.target.value)}
                      placeholder="e.g., ZEN-AB12CD"
                      className="w-full px-3 py-2 rounded-md border text-sm font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 rounded-md border bg-white text-sm hover:bg-neutral-50"
                  >
                    Login as Student
                  </button>
                  {studentError && (
                    <div className="mt-2 text-center text-xs text-red-600">
                      {studentError}
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
