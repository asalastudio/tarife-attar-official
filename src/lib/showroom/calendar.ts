/**
 * Tarife Attar — Showroom Google Calendar Client
 *
 * Authenticated Google Calendar v3 client using OAuth refresh token.
 * Reads/writes events on the showroom calendar (defaults to the
 * authenticated user's primary calendar — jordan@tarifeattar.com).
 *
 * Env vars (set in Vercel):
 * - GOOGLE_OAUTH_CLIENT_ID
 * - GOOGLE_OAUTH_CLIENT_SECRET
 * - GOOGLE_OAUTH_REFRESH_TOKEN
 * - SHOWROOM_CALENDAR_ID (optional; defaults to 'primary')
 * - SHOWROOM_TIMEZONE (optional; defaults to 'America/Los_Angeles')
 */

import { google, calendar_v3 } from 'googleapis';

export const SHOWROOM_LOCATION =
  '31080 Union City Blvd, Suite 211, Union City, CA 94587';

export const SHOWROOM_TIMEZONE =
  process.env.SHOWROOM_TIMEZONE || 'America/Los_Angeles';

export const SHOWROOM_CALENDAR_ID =
  process.env.SHOWROOM_CALENDAR_ID || 'primary';

let cachedClient: calendar_v3.Calendar | null = null;

export function getCalendarClient(): calendar_v3.Calendar {
  if (cachedClient) return cachedClient;

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing Google OAuth env vars. Required: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN.'
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });

  cachedClient = google.calendar({ version: 'v3', auth: oauth2 });
  return cachedClient;
}

/**
 * List events on the showroom calendar between two ISO 8601 timestamps.
 * IMPORTANT: pass timestamps WITH timezone offset (e.g. `-07:00` for PDT,
 * `-08:00` for PST), not UTC `Z`, to avoid the UTC-window-misses-local-day
 * pitfall flagged in Composio's own tool docs.
 */
export async function listEventsBetween(
  startIso: string,
  endIso: string
): Promise<calendar_v3.Schema$Event[]> {
  const cal = getCalendarClient();

  const res = await cal.events.list({
    calendarId: SHOWROOM_CALENDAR_ID,
    timeMin: startIso,
    timeMax: endIso,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
    timeZone: SHOWROOM_TIMEZONE,
  });

  return res.data.items || [];
}

export interface BookEventInput {
  startIso: string;
  endIso: string;
  callerName: string;
  callerEmail: string;
  callerPhone?: string;
  intent?: string;
}

export interface BookEventResult {
  eventId: string;
  htmlLink: string | undefined;
  hangoutLink: string | undefined;
  summary: string | undefined;
  startIso: string | undefined;
  endIso: string | undefined;
}

/**
 * Create a Private Showroom Consultation event with the caller as an attendee.
 * Google auto-sends the calendar invite via `sendUpdates: 'all'`.
 */
export async function bookShowroomEvent(
  input: BookEventInput
): Promise<BookEventResult> {
  const cal = getCalendarClient();

  const summary = `Private Showroom Consultation — ${input.callerName}`;
  const descriptionLines = [
    `Caller: ${input.callerName}`,
    `Email: ${input.callerEmail}`,
    input.callerPhone ? `Phone: ${input.callerPhone}` : null,
    input.intent ? `What brings them in: ${input.intent}` : null,
    '',
    'Booked via Nida (Tarife Attar voice agent).',
  ].filter(Boolean);

  const res = await cal.events.insert({
    calendarId: SHOWROOM_CALENDAR_ID,
    sendUpdates: 'all',
    requestBody: {
      summary,
      description: descriptionLines.join('\n'),
      location: SHOWROOM_LOCATION,
      start: {
        dateTime: input.startIso,
        timeZone: SHOWROOM_TIMEZONE,
      },
      end: {
        dateTime: input.endIso,
        timeZone: SHOWROOM_TIMEZONE,
      },
      attendees: [{ email: input.callerEmail, displayName: input.callerName }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    },
  });

  const e = res.data;
  return {
    eventId: e.id || '',
    htmlLink: e.htmlLink || undefined,
    hangoutLink: e.hangoutLink || undefined,
    summary: e.summary || undefined,
    startIso: e.start?.dateTime || undefined,
    endIso: e.end?.dateTime || undefined,
  };
}
