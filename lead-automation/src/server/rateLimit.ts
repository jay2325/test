import { LRUCache } from "lru-cache";
import { HttpError } from "@/server/errors";

type Entry = { count: number; resetAtMs: number };

const cache = new LRUCache<string, Entry>({
  max: 10_000,
});

export function rateLimitOrThrow(opts: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const current = cache.get(opts.key);
  if (!current || current.resetAtMs <= now) {
    cache.set(opts.key, { count: 1, resetAtMs: now + opts.windowMs });
    return;
  }

  if (current.count >= opts.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((current.resetAtMs - now) / 1000),
    );
    throw new HttpError("Rate limit exceeded", 429, { retryAfterSeconds });
  }

  current.count += 1;
  cache.set(opts.key, current);
}

