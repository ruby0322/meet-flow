export type WallTime = {
  year: number; // full year, e.g. 2026
  month: number; // 0-11
  day: number; // 1-31
  hour: number; // 0-23
  minute?: number; // 0-59
  second?: number; // 0-59
};

export function detectBrowserTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

function parseGmtOffsetToMinutes(raw: string): number | null {
  // Examples: "GMT+8", "GMT+08:00", "UTC-05", "UTC-05:00"
  const m = raw.match(/^(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  if (!m) return null;
  const sign = m[1] === "-" ? -1 : 1;
  const hours = Number(m[2]);
  const mins = m[3] ? Number(m[3]) : 0;
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) return null;
  return sign * (hours * 60 + mins);
}

export function getTimeZoneOffsetMinutes(
  timeZone: string,
  at: Date
): number | null {
  // Positive means the zone is ahead of UTC (e.g. Asia/Taipei = +480).
  try {
    // Prefer shortOffset/longOffset if supported (modern browsers).
    for (const timeZoneName of ["shortOffset", "longOffset"] as const) {
      try {
        const parts = new Intl.DateTimeFormat("en-US", {
          timeZone,
          timeZoneName,
          hour: "2-digit",
        }).formatToParts(at);
        const name = parts.find((p) => p.type === "timeZoneName")?.value;
        if (!name) continue;
        const parsed = parseGmtOffsetToMinutes(name.replace(" ", ""));
        if (parsed != null) return parsed;
      } catch {
        // continue
      }
    }

    // Fallback: compute offset by comparing "wall time as UTC" vs actual UTC.
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(at);

    const read = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value);
    const y = read("year");
    const mo = read("month");
    const d = read("day");
    const h = read("hour");
    const mi = read("minute");
    const s = read("second");
    if (![y, mo, d, h, mi, s].every(Number.isFinite)) return null;

    const asUtc = Date.UTC(y, mo - 1, d, h, mi, s);
    return Math.round((asUtc - at.getTime()) / 60000);
  } catch {
    return null;
  }
}

export function zonedWallTimeToUtcDate(
  wall: WallTime,
  timeZone: string
): Date | null {
  // Converts a local wall time *in a specific IANA time zone* into a UTC Date.
  // Iterative approach handles DST transitions reasonably well.
  const minute = wall.minute ?? 0;
  const second = wall.second ?? 0;
  let utcMs = Date.UTC(
    wall.year,
    wall.month,
    wall.day,
    wall.hour,
    minute,
    second
  );

  for (let i = 0; i < 3; i++) {
    const offset = getTimeZoneOffsetMinutes(timeZone, new Date(utcMs));
    if (offset == null) return null;
    const corrected = Date.UTC(
      wall.year,
      wall.month,
      wall.day,
      wall.hour,
      minute,
      second
    );
    const nextUtcMs = corrected - offset * 60_000;
    if (Math.abs(nextUtcMs - utcMs) < 1) break;
    utcMs = nextUtcMs;
  }

  return new Date(utcMs);
}

export function formatInTimeZone(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
  locale = "zh-TW"
): string {
  return new Intl.DateTimeFormat(locale, { timeZone, ...options }).format(date);
}

