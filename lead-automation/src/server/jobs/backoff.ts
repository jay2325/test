export function computeBackoffMs(attemptsAfterFailure: number) {
  const baseMs = 30_000; // 30s
  const maxMs = 60 * 60_000; // 60m
  const ms = baseMs * Math.pow(2, Math.max(0, attemptsAfterFailure - 1));
  return Math.min(maxMs, ms);
}

