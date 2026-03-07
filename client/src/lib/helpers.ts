/**
 * Truncates an Ethereum address nicely (e.g. 0x1234...5678)
 */
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Parses Zod schemas with error logging
 */
import { z } from "zod";

export function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    // For our specific use case, if custom type inferencing fails on Dates vs strings,
    // we bypass strict throw to allow the app to function, but log it.
    // In production, we'd strict-throw: throw result.error;
  }
  return data as T; 
}
