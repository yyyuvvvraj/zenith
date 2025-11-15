// src/lib/utils.ts
// tiny className helper — safe for client components
export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}
