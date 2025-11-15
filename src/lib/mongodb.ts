import "server-only";
// src/lib/mongodb.ts
import "server-only";
import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;

if (!uri || typeof uri !== "string" || uri.trim() === "") {
  throw new Error(
    "MONGODB_URI is not set or is empty. Set it in .env.local (e.g. mongodb+srv://user:pass@cluster.mongodb.net/dbname)."
  );
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // ensure global cache for dev HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise!;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
