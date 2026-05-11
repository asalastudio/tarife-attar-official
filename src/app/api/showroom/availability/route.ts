/**
 * POST /api/showroom/availability
 *
 * Returns open Private Showroom Consultation slots within a date range.
 * Called by Nida (ElevenAgents Server Tool) when a caller wants to book.
 *
 * Auth: shared secret in X-Webhook-Secret header.
 *
 * Request body:
 *   {
 *     "date_range_start": "2026-05-12T00:00:00-07:00",  // ISO 8601 with PT offset
 *     "date_range_end":   "2026-05-15T23:59:59-07:00",
 *     "max_slots": 5                                     // optional, default 10
 *   }
 *
 * Response body:
 *   {
 *     "slots": [
 *       {
 *         "start_iso":     "2026-05-13T14:45:00-07:00",
 *         "end_iso":       "2026-05-13T15:45:00-07:00",
 *         "display_label": "Wednesday, May 13 at 2:45 PM PDT"
 *       },
 *       ...
 *     ],
 *     "count": 3,
 *     "showroom_hours": "Mon-Thu 11AM-5PM PT",
 *     "showroom_address": "31080 Union City Blvd, Suite 211, Union City, CA 94587"
 *   }
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyWebhookAuth } from '@/lib/showroom/auth';
import { getAvailableSlots } from '@/lib/showroom/slots';
import { SHOWROOM_LOCATION } from '@/lib/showroom/calendar';

const Body = z.object({
  date_range_start: z.string().min(10),
  date_range_end: z.string().min(10),
  max_slots: z.number().int().positive().max(20).optional(),
});

export async function POST(req: Request) {
  // Auth gate
  const authFail = verifyWebhookAuth(req);
  if (authFail) return authFail;

  // Body parse + validate
  let payload: z.infer<typeof Body>;
  try {
    const json = await req.json();
    payload = Body.parse(json);
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Invalid request body.',
        details: err instanceof z.ZodError ? err.issues : String(err),
      },
      { status: 400 }
    );
  }

  // Sanity: ensure timestamps parse to a real date
  const start = new Date(payload.date_range_start);
  const end = new Date(payload.date_range_end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json(
      {
        error:
          'date_range_start and date_range_end must be valid ISO 8601 timestamps with timezone offset (e.g. "-07:00").',
      },
      { status: 400 }
    );
  }

  try {
    const slots = await getAvailableSlots(
      payload.date_range_start,
      payload.date_range_end,
      payload.max_slots ?? 10
    );

    return NextResponse.json({
      slots: slots.map((s) => ({
        start_iso: s.startIso,
        end_iso: s.endIso,
        display_label: s.displayLabel,
      })),
      count: slots.length,
      showroom_hours: 'Mon-Thu 11AM-5PM PT',
      showroom_address: SHOWROOM_LOCATION,
    });
  } catch (err) {
    console.error('[showroom/availability] error:', err);
    return NextResponse.json(
      {
        error: 'Internal error checking availability.',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
