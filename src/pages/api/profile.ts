// src/pages/api/profile.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { ObjectId } from "mongodb";

/**
 * GET  -> returns the profile for the signed-in user
 * POST -> update profile fields (role, onboardingComplete, other metadata)
 *
 * Body for POST should be JSON like:
 * { role: "faculty", onboardingComplete: true }
 */

// small type guard to ensure session has user with email
function sessionHasEmail(
  session: Session | null | undefined
): session is Session {
  return !!(session && (session as any).user && (session as any).user.email);
}

async function findNextAuthUserByEmail(db: any, email: string) {
  // Try the collection name your app might be using.
  // Historically NextAuth adapters could use "nextauth_users" or "users".
  const candidates = ["nextauth_users", "users", "next-auth.users"];
  for (const col of candidates) {
    try {
      const u = await db.collection(col).findOne({ email });
      if (u) {
        // return found user plus the collection name (useful for debugging)
        return { user: u, collection: col };
      }
    } catch (err) {
      // ignore and continue (collection may not exist)
      console.warn(
        `collection lookup failed for ${col}:`,
        (err as any)?.message ?? err
      );
    }
  }
  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;

    if (!sessionHasEmail(session)) {
      console.warn("/api/profile - session missing or has no email", {
        session,
      });
      return res.status(401).json({ error: "Not authenticated" });
    }

    const email = (session.user as any).email as string;

    const client = await clientPromise;
    const db = client.db();

    // Try to find the next-auth user document (tries a few common collection names)
    const found = await findNextAuthUserByEmail(db, email);
    if (!found) {
      console.error(
        `/api/profile - user not found in nextauth collections for email=${email}`
      );
      return res
        .status(404)
        .json({ error: "User not found in nextauth collections" });
    }

    const { user, collection } = found;
    // normalize to an ObjectId userId
    const userId =
      user._id instanceof ObjectId ? user._id : new ObjectId(user._id);

    if (req.method === "GET") {
      const profile = await db.collection("profiles").findOne({ userId });
      // If profile missing, return empty profile instead of 404 to let client display onboarding form
      if (!profile) {
        return res.status(200).json({
          profile: null,
          message: "Profile not created yet",
          userCollection: collection,
        });
      }
      return res.status(200).json({ profile, userCollection: collection });
    }

    if (req.method === "POST") {
      const { role, onboardingComplete } = req.body ?? {};
      const update: any = {
        $set: {
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      };
      if (typeof role !== "undefined") update.$set.role = role;
      if (typeof onboardingComplete !== "undefined")
        update.$set.onboardingComplete = !!onboardingComplete;

      await db
        .collection("profiles")
        .updateOne({ userId }, update, { upsert: true });
      const profile = await db.collection("profiles").findOne({ userId });
      return res.status(200).json({ profile });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("/api/profile unexpected error:", err);
    return res.status(500).json({
      error: "Internal server error",
      detail: String(err?.message ?? err),
    });
  }
}
