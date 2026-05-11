import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  buildOrderStatusMessage,
  findShopifyOrderByNumber,
  getOrderDestinationPhone,
  orderContactMatches,
} from '@/lib/shopify/admin';
import { verifyVoiceAgentAuth } from '@/lib/voice-agent/auth';
import { redactPhone } from '@/lib/voice-agent/contact';
import { logVoiceAgentEvent } from '@/lib/voice-agent/events';
import { postSlackMessage, section, contextLine } from '@/lib/voice-agent/slack';
import { sendTransactionalSms } from '@/lib/voice-agent/twilio';

export const maxDuration = 25;

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().trim().email().optional()
);
const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(200).optional()
);

const Body = z.object({
  order_number: z.string().trim().min(2).max(80),
  customer_email: optionalEmail,
  customer_phone: optionalString,
  conversation_id: optionalString,
});

export async function POST(req: Request) {
  const authFail = verifyVoiceAgentAuth(req, 'voice/send-tracking-sms');
  if (authFail) return authFail;

  let payload: z.infer<typeof Body>;
  try {
    payload = Body.parse(await req.json());
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

  if (!payload.customer_email && !payload.customer_phone) {
    return NextResponse.json(
      {
        success: false,
        error: 'Please provide the order number and either the order email or order phone number.',
      },
      { status: 400 }
    );
  }

  try {
    const order = await findShopifyOrderByNumber(payload.order_number);

    if (
      !order ||
      !orderContactMatches(order, {
        email: payload.customer_email,
        phone: payload.customer_phone,
      })
    ) {
      await logVoiceAgentEvent({
        eventType: 'tracking_sms_unverified',
        channel: 'voice',
        conversationId: payload.conversation_id,
        toolName: 'send_tracking_sms',
        status: 'failed',
        orderNumber: payload.order_number,
        customerEmail: payload.customer_email,
        customerPhone: payload.customer_phone,
        summary: 'Tracking SMS blocked because order/contact verification failed',
      });

      return NextResponse.json(
        {
          success: false,
          reason: 'I could not verify that order with the contact information provided.',
          next_action:
            'Ask the caller to confirm the order number and the email or phone number used at checkout.',
        },
        { status: 404 }
      );
    }

    const destination = getOrderDestinationPhone(order);
    if (!destination) {
      return NextResponse.json(
        {
          success: false,
          reason: 'There is no deliverable phone number on that order.',
          next_action: 'Offer to read the tracking status aloud or escalate to the team.',
        },
        { status: 409 }
      );
    }

    const smsBody = buildOrderStatusMessage(order);
    const sms = await sendTransactionalSms({ to: destination, body: smsBody });

    await Promise.allSettled([
      postSlackMessage('summaries', {
        text: `Tracking SMS sent for ${order.name}`,
        blocks: [
          section(`*Tracking SMS sent*\n*Order:* ${order.name}\n*To:* ${redactPhone(destination)}`),
          contextLine(`Twilio message ${sms.sid || 'queued'} · Via Nida voice agent`),
        ],
      }),
      logVoiceAgentEvent({
        eventType: 'tracking_sms_sent',
        channel: 'voice',
        conversationId: payload.conversation_id,
        toolName: 'send_tracking_sms',
        status: 'success',
        orderNumber: order.name,
        customerEmail: payload.customer_email,
        customerPhone: destination,
        summary: `Tracking SMS sent for ${order.name}`,
        metadata: {
          twilio_sid: sms.sid,
          twilio_status: sms.status,
          tracking_count: order.tracking.length,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      order_number: order.name,
      sent_to: redactPhone(destination),
      sms_status: sms.status,
      confirmation_message: `I sent the order update by text to the phone number on ${order.name}.`,
    });
  } catch (err) {
    console.error('[voice/send-tracking-sms] error:', err);
    await Promise.allSettled([
      postSlackMessage('alerts', {
        text: 'Tracking SMS failed',
        blocks: [
          section(`*Tracking SMS failed*\n*Order:* ${payload.order_number}`),
          contextLine(err instanceof Error ? err.message : String(err)),
        ],
      }),
      logVoiceAgentEvent({
        eventType: 'tracking_sms_error',
        channel: 'voice',
        conversationId: payload.conversation_id,
        toolName: 'send_tracking_sms',
        status: 'failed',
        orderNumber: payload.order_number,
        customerEmail: payload.customer_email,
        customerPhone: payload.customer_phone,
        summary: 'Internal error sending tracking SMS',
        metadata: { error: err instanceof Error ? err.message : String(err) },
      }),
    ]);

    return NextResponse.json(
      {
        success: false,
        error: 'I could not send the text message right now.',
        next_action: 'Read the tracking status aloud and offer to escalate to the team.',
      },
      { status: 500 }
    );
  }
}

function emptyToUndefined(value: unknown) {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}
