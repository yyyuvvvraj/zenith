// src/components/login/login.tsx
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export default function LoginCard({ onLoggedIn }: { onLoggedIn?: () => void }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.email || !form.password) {
      setError("Email and password required.");
      return;
    }
    // TODO: authenticate with server / firebase
    console.log("Login data:", form);
    if (onLoggedIn) onLoggedIn();
  }

  return (
    <Card className="max-w-md w-full">
      <CardContent>
        <h2 className="text-2xl font-semibold mb-4">Sign in</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input name="email" value={form.email} onChange={handleChange} type="email" className="w-full px-3 py-2 rounded-lg border" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input name="password" value={form.password} onChange={handleChange} type="password" className="w-full px-3 py-2 rounded-lg border" />
          </div>

          <div>
            <Button type="submit" className="w-full">Sign in</Button>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
