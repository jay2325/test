import { DateTime } from "luxon";

export function isWithinAllowedHours(opts: {
  now: Date;
  timezone: string;
  quietStartHour: number;
  quietEndHour: number;
}) {
  const dt = DateTime.fromJSDate(opts.now, { zone: opts.timezone });
  const hour = dt.hour;
  const start = opts.quietStartHour;
  const end = opts.quietEndHour;

  if (start === end) return true; // interpret as "always allowed"
  if (start < end) return hour >= start && hour < end;
  // wraps midnight
  return hour >= start || hour < end;
}

export function nextAllowedTime(opts: {
  now: Date;
  timezone: string;
  quietStartHour: number;
  quietEndHour: number;
}) {
  const dt = DateTime.fromJSDate(opts.now, { zone: opts.timezone });

  if (
    isWithinAllowedHours({
      now: opts.now,
      timezone: opts.timezone,
      quietStartHour: opts.quietStartHour,
      quietEndHour: opts.quietEndHour,
    })
  ) {
    return opts.now;
  }

  const startHour = opts.quietStartHour;
  let candidate = dt.set({ hour: startHour, minute: 0, second: 0, millisecond: 0 });
  if (candidate <= dt) {
    candidate = candidate.plus({ days: 1 });
  }
  return candidate.toJSDate();
}

