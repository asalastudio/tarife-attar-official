import "server-only";
import { createClient, type SanityClient } from "@sanity/client";

/**
 * Sanity client with write access. Server only: the token must never reach
 * the browser. Throws if the token is missing so callers fail loudly rather
 * than silently dropping a customer's request.
 */
let cached: SanityClient | null = null;

export function getWriteClient(): SanityClient {
  if (cached) return cached;

  const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN;
  if (!token) {
    throw new Error("SANITY_API_WRITE_TOKEN is not configured");
  }

  cached = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "8h5l91ut",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
    token,
    useCdn: false,
  });
  return cached;
}
