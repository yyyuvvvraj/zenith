// src/components/register/register.tsx
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export default function RegisterCard({ onRegistered }: { onRegistered?: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }
    // TODO: call your API / firebase here
    console.log("Register data:", form);
    if (onRegistered) onRegistered();
  }

  return (
    <Card className="max-w-md w-full">
      <CardContent>
        <h2 className="text-2xl font-semibold mb-4">Create an account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input name="email" value={form.email} onChange={handleChange} type="email" className="w-full px-3 py-2 rounded-lg border" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input name="password" value={form.password} onChange={handleChange} type="password" className="w-full px-3 py-2 rounded-lg border" />
          </div>

          <div>
            <Button type="submit" className="w-full">Register</Button>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
