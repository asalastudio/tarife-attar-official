/**
 * POST /api/showroom/book
 *
 * Books a Private Showroom Consultation on the showroom calendar
 * (jordan@tarifeattar.com primary calendar) and sends the caller an
 * auto-invite from Google.
 *
 * Auth: shared secret in X-Webhook-Secret header.
 *
 * Request body:
 *   {
 *     "slot_start_iso":  "2026-05-13T14:45:00-07:00",
 *     "slot_end_iso":    "2026-05-13T15:45:00-07:00",
 *     "caller_name":     "Jane Smith",
 *     "caller_email":    "jane@example.com",
 *     "caller_phone":    "+1 415 555 0123",                // optional
 *     "intent":          "gift_shopping"                    // optional: gift_shopping | scent_exploration | custom_commission | other
 *   }
 *
 * Response body (success):
 *   {
 *     "success": true,
 *     "event_id": "...",
 *     "html_link": "https://calendar.google.com/event?eid=...",
 *     "summary": "Private Showroom Consultation — Jane Smith",
 *     "start_iso": "2026-05-13T14:45:00-07:00",
 *     "end_iso":   "2026-05-13T15:45:00-07:00",
 *     "confirmation_message": "Booked — Wednesday, May 13 at 2:45 PM. Invite sent to jane@example.com."
 *   }
 *
 * Response body (slot taken / invalid):
 *   {
 *     "success": false,
 *     "reason":  "Slot is already booked.",
 *     "next_action": "Suggest a different slot to the caller."
 *   }
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyWebhookAuth } from '@/lib/showroom/auth';
import { isSlotAvailable } from '@/lib/showroom/slots';
import { bookShowroomEvent } from '@/lib/showroom/calendar';
import { logVoiceAgentEvent } from '@/lib/voice-agent/events';
import { contextLine, postSlackMessage, section } from '@/lib/voice-agent/slack';

const Body = z.object({
  slot_start_iso: z.string().min(20),
  slot_end_iso: z.string().min(20),
  caller_name: z.string().min(1).max(200),
  caller_email: z.string().email(),
  caller_phone: z.string().max(40).optional(),
  intent: z.string().max(100).optional(),
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
        success: false,
        error: 'Invalid request body.',
        details: err instanceof z.ZodError ? err.issues : String(err),
      },
      { status: 400 }
    );
  }

  // Sanity check on the timestamps
  const start = new Date(payload.slot_start_iso);
  const end = new Date(payload.slot_end_iso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json(
      {
        success: false,
        error:
          'slot_start_iso and slot_end_iso must be valid ISO 8601 timestamps with timezone offset (e.g. "-07:00").',
      },
      { status: 400 }
    );
  }

  if (end <= start) {
    return NextResponse.json(
      {
        success: false,
        error: 'slot_end_iso must be after slot_start_iso.',
      },
      { status: 400 }
    );
  }

  try {
    // Re-validate that the slot is still bookable (defends against race condition)
    const availability = await isSlotAvailable(
      payload.slot_start_iso,
      payload.slot_end_iso
    );

    if (!availability.available) {
      return NextResponse.json(
        {
          success: false,
          reason: availability.reason || 'Slot is no longer available.',
          next_action: 'Suggest a different slot to the caller.',
        },
        { status: 409 }
      );
    }

    // Create the event
    const result = await bookShowroomEvent({
      startIso: payload.slot_start_iso,
      endIso: payload.slot_end_iso,
      callerName: payload.caller_name,
      callerEmail: payload.caller_email,
      callerPhone: payload.caller_phone,
      intent: payload.intent,
    });

    // Human-readable confirmation for Nida to read back to the caller
    const displayFmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const displayWhen = displayFmt.format(start);
    const responseBody = {
      success: true,
      event_id: result.eventId,
      html_link: result.htmlLink,
      summary: result.summary,
      start_iso: result.startIso,
      end_iso: result.endIso,
      confirmation_message: `Booked — ${displayWhen}. Invite sent to ${payload.caller_email}.`,
    };

    await Promise.allSettled([
      postSlackMessage('sales', {
        text: `New showroom consultation booked: ${payload.caller_name} — ${displayWhen}`,
        blocks: [
          section(`*New showroom consultation booked*\n*When:* ${displayWhen}\n*Customer:* ${payload.caller_name}\n*Email:* ${payload.caller_email}`),
          section(
            [
              payload.caller_phone ? `*Phone:* ${payload.caller_phone}` : null,
              payload.intent ? `*Intent:* ${payload.intent}` : null,
              result.htmlLink ? `*Calendar:* <${result.htmlLink}|Open event>` : null,
            ]
              .filter(Boolean)
              .join('\n')
          ),
          contextLine('Booked via Nida voice agent'),
        ],
      }),
      logVoiceAgentEvent({
        eventType: 'showroom_booking_created',
        channel: 'voice',
        toolName: 'book_showroom_consultation',
        status: 'success',
        customerEmail: payload.caller_email,
        customerPhone: payload.caller_phone,
        summary: `Showroom consultation booked for ${displayWhen}`,
        metadata: {
          event_id: result.eventId,
          start_iso: result.startIso,
          end_iso: result.endIso,
          intent: payload.intent || null,
        },
      }),
    ]);

    return NextResponse.json(responseBody);
  } catch (err) {
    console.error('[showroom/book] error:', err);
    await Promise.allSettled([
      postSlackMessage('alerts', {
        text: 'Showroom booking failed',
        blocks: [
          section(
            `*Showroom booking failed*\n*Customer:* ${payload.caller_name}\n*Email:* ${payload.caller_email}\n*Slot:* ${payload.slot_start_iso}`
          ),
          contextLine(err instanceof Error ? err.message : String(err)),
        ],
      }),
      logVoiceAgentEvent({
        eventType: 'showroom_booking_failed',
        channel: 'voice',
        toolName: 'book_showroom_consultation',
        status: 'failed',
        customerEmail: payload.caller_email,
        customerPhone: payload.caller_phone,
        summary: 'Internal error creating showroom event',
        metadata: {
          start_iso: payload.slot_start_iso,
          end_iso: payload.slot_end_iso,
          error: err instanceof Error ? err.message : String(err),
        },
      }),
    ]);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal error creating event.',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
