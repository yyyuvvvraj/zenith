// src/pages/api/auth/ensureUser.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "./[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * Strong type guard:
 * Ensures session.user and session.user.email are defined.
 */
function hasUserWithEmail(
  session: Session | null | undefined
): session is Session & { user: { email: string } } {
  return Boolean(
    session && session.user && typeof session.user.email === "string"
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const rawSession = await getServerSession(req, res, authOptions as any);
  const session = rawSession as Session | null;

  // --- Type guard check ---
  if (!hasUserWithEmail(session)) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // --- Now fully type-safe: TS KNOWS user.email DEFINITELY exists ---
  const email = session.user.email; // <-- No TS warnings now

  const client = await clientPromise;
  const db = client.db();

  // Find nextauth user
  const user = await db.collection("nextauth_users").findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "User not found in nextauth_users" });
  }

  const userId =
    user._id instanceof ObjectId ? user._id : new ObjectId(user._id);

  const now = new Date();

  const update = {
    $setOnInsert: {
      createdAt: now,
      role: null,
      onboardingComplete: false,
    },
    $set: {
      updatedAt: now,
      email,
      name: session.user.name ?? null,
    },
  };

  await db
    .collection("profiles")
    .updateOne({ userId }, update, { upsert: true });

  const profile = await db.collection("profiles").findOne({ userId });

  return res.status(200).json({
    onboardingComplete: !!profile?.onboardingComplete,
    profile,
  });
}
