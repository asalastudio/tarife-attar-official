/**
 * Tarife Attar — Showroom Slot Generation & Availability
 *
 * The showroom is open by appointment only Mon-Thu, 11:00 AM - 5:00 PM Pacific.
 * Five standardized start times per available day: 11:00, 12:15, 1:30, 2:45, 4:00 PM.
 * 60-minute appointments with a 15-minute buffer between slots.
 * Max 3 bookings per day (intentional — preserves the "unhurried" brand voice).
 * Minimum lead time: 2 hours from now.
 * Max booking window: 60 days out.
 */

import { listEventsBetween, SHOWROOM_TIMEZONE } from './calendar';

const APPOINTMENT_DURATION_MINUTES = 60;
const MAX_BOOKINGS_PER_DAY = 3;
const MIN_LEAD_HOURS = 2;
const MAX_BOOKING_WINDOW_DAYS = 60;

const AVAILABLE_DAYS = new Set<number>([1, 2, 3, 4]);

const SLOT_START_TIMES_LOCAL: Array<{ hour: number; minute: number }> = [
  { hour: 11, minute: 0 },
  { hour: 12, minute: 15 },
  { hour: 13, minute: 30 },
  { hour: 14, minute: 45 },
  { hour: 16, minute: 0 },
];

export interface Slot {
  startIso: string;
  endIso: string;
  displayLabel: string;
}

export async function getAvailableSlots(
  dateRangeStartIso: string,
  dateRangeEndIso: string,
  maxSlots = 10
): Promise<Slot[]> {
  const rangeStart = new Date(dateRangeStartIso);
  const rangeEnd = new Date(dateRangeEndIso);
  const now = new Date();
  const earliestAllowed = new Date(now.getTime() + MIN_LEAD_HOURS * 3600 * 1000);
  const latestAllowed = new Date(
    now.getTime() + MAX_BOOKING_WINDOW_DAYS * 86400 * 1000
  );

  if (rangeEnd < rangeStart) return [];
  if (rangeStart > latestAllowed) return [];

  const events = await listEventsBetween(
    rangeStart.toISOString(),
    rangeEnd.toISOString()
  );

  const bookingsPerDay = new Map<string, number>();
  for (const evt of events) {
    const dt = evt.start?.dateTime || evt.start?.date;
    if (!dt) continue;
    const localDate = getPacificDateKey(new Date(dt));
    bookingsPerDay.set(localDate, (bookingsPerDay.get(localDate) || 0) + 1);
  }

  const slots: Slot[] = [];
  const cursor = new Date(rangeStart);
  while (cursor <= rangeEnd && slots.length < maxSlots) {
    const dayOfWeekPT = getPacificDayOfWeek(cursor);
    const dateKey = getPacificDateKey(cursor);

    if (AVAILABLE_DAYS.has(dayOfWeekPT)) {
      const dayBookings = bookingsPerDay.get(dateKey) || 0;
      if (dayBookings < MAX_BOOKINGS_PER_DAY) {
        for (const { hour, minute } of SLOT_START_TIMES_LOCAL) {
          if (slots.length >= maxSlots) break;

          const slotStart = buildPacificDateTime(cursor, hour, minute);
          const slotEnd = new Date(
            slotStart.getTime() + APPOINTMENT_DURATION_MINUTES * 60 * 1000
          );

          if (slotStart < earliestAllowed) continue;
          if (slotStart > latestAllowed) continue;
          if (slotEnd > rangeEnd) continue;

          const conflict = events.some((evt) =>
            slotConflictsWithEvent(slotStart, slotEnd, evt)
          );
          if (conflict) continue;

          slots.push({
            startIso: formatPacificIso(slotStart),
            endIso: formatPacificIso(slotEnd),
            displayLabel: formatDisplayLabel(slotStart),
          });
        }
      }
    }

    cursor.setDate(cursor.getDate() + 1);
    cursor.setHours(0, 0, 0, 0);
  }

  return slots;
}

export async function isSlotAvailable(
  slotStartIso: string,
  slotEndIso: string
): Promise<{ available: boolean; reason?: string }> {
  const start = new Date(slotStartIso);
  const end = new Date(slotEndIso);
  const now = new Date();
  const earliestAllowed = new Date(now.getTime() + MIN_LEAD_HOURS * 3600 * 1000);

  if (start < earliestAllowed) {
    return { available: false, reason: 'Slot is in the past or within lead time.' };
  }

  const dayOfWeekPT = getPacificDayOfWeek(start);
  if (!AVAILABLE_DAYS.has(dayOfWeekPT)) {
    return { available: false, reason: 'Showroom is closed on this day of week.' };
  }

  const hourPT = getPacificHour(start);
  if (hourPT < 11 || hourPT >= 17) {
    return {
      available: false,
      reason: 'Slot is outside showroom hours (11 AM - 5 PM PT).',
    };
  }

  const dayStart = new Date(start);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const events = await listEventsBetween(
    dayStart.toISOString(),
    dayEnd.toISOString()
  );

  const dateKey = getPacificDateKey(start);
  const todayBookings = events.filter((evt) => {
    const dt = evt.start?.dateTime || evt.start?.date;
    if (!dt) return false;
    return getPacificDateKey(new Date(dt)) === dateKey;
  }).length;

  if (todayBookings >= MAX_BOOKINGS_PER_DAY) {
    return { available: false, reason: 'This day is fully booked.' };
  }

  const conflict = events.some((evt) => slotConflictsWithEvent(start, end, evt));
  if (conflict) {
    return { available: false, reason: 'Slot is already booked.' };
  }

  return { available: true };
}

function getPacificDayOfWeek(d: Date): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOWROOM_TIMEZONE,
    weekday: 'short',
  });
  const day = fmt.format(d);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[day] ?? -1;
}

function getPacificHour(d: Date): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOWROOM_TIMEZONE,
    hour: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const hour = parts.find((p) => p.type === 'hour')?.value;
  return hour ? parseInt(hour, 10) : -1;
}

function getPacificDateKey(d: Date): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: SHOWROOM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(d);
}

function buildPacificDateTime(
  refDay: Date,
  pacificHour: number,
  pacificMinute: number
): Date {
  const dateKey = getPacificDateKey(refDay);
  const offset = getPacificOffsetString(refDay);
  const iso = `${dateKey}T${pad(pacificHour)}:${pad(pacificMinute)}:00${offset}`;
  return new Date(iso);
}

function getPacificOffsetString(refDay: Date): string {
  const dateKey = getPacificDateKey(refDay);
  const probe = new Date(`${dateKey}T12:00:00Z`);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOWROOM_TIMEZONE,
    timeZoneName: 'longOffset',
  });
  const parts = fmt.formatToParts(probe);
  const tz = parts.find((p) => p.type === 'timeZoneName')?.value;
  if (tz && tz.startsWith('GMT')) {
    return tz.replace('GMT', '');
  }
  return '-08:00';
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatPacificIso(d: Date): string {
  const dateKey = getPacificDateKey(d);
  const hour = getPacificHour(d);
  const minuteFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOWROOM_TIMEZONE,
    minute: '2-digit',
  });
  const minute = parseInt(minuteFmt.format(d), 10);
  const offset = getPacificOffsetString(d);
  return `${dateKey}T${pad(hour)}:${pad(minute)}:00${offset}`;
}

function formatDisplayLabel(d: Date): string {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOWROOM_TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });
  return fmt.format(d);
}

function slotConflictsWithEvent(
  slotStart: Date,
  slotEnd: Date,
  event: {
    start?: { dateTime?: string | null; date?: string | null } | null;
    end?: { dateTime?: string | null; date?: string | null } | null;
  }
): boolean {
  const evtStartIso = event.start?.dateTime || event.start?.date;
  const evtEndIso = event.end?.dateTime || event.end?.date;
  if (!evtStartIso || !evtEndIso) return false;
  const evtStart = new Date(evtStartIso);
  const evtEnd = new Date(evtEndIso);
  return slotStart < evtEnd && slotEnd > evtStart;
}
