import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  findShopifyOrderByNumber,
  orderContactMatches,
  VoiceOrder,
} from '@/lib/shopify/admin';
import { verifyVoiceAgentAuth } from '@/lib/voice-agent/auth';
import { redactEmail, redactPhone } from '@/lib/voice-agent/contact';
import { logVoiceAgentEvent } from '@/lib/voice-agent/events';
import { contextLine, postSlackMessage, section } from '@/lib/voice-agent/slack';

export const maxDuration = 20;

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
  const authFail = verifyVoiceAgentAuth(req, 'voice/order-status');
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
        eventType: 'order_lookup_unverified',
        channel: 'voice',
        conversationId: payload.conversation_id,
        toolName: 'get_order_status',
        status: 'failed',
        orderNumber: payload.order_number,
        customerEmail: payload.customer_email,
        customerPhone: payload.customer_phone,
        summary: 'Order lookup failed verification',
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

    const responseBody = buildOrderStatusResponse(order);

    await Promise.allSettled([
      postSlackMessage('summaries', {
        text: `Order status looked up: ${order.name}`,
        blocks: [
          section(
            `*Order status looked up*\n*Order:* ${order.name}\n*Status:* ${responseBody.fulfillment_status}\n*Customer:* ${order.customerName || 'Unknown'}`
          ),
          contextLine(`Via Nida voice agent${payload.conversation_id ? ` · ${payload.conversation_id}` : ''}`),
        ],
      }),
      logVoiceAgentEvent({
        eventType: 'order_lookup_verified',
        channel: 'voice',
        conversationId: payload.conversation_id,
        toolName: 'get_order_status',
        status: 'success',
        orderNumber: order.name,
        customerEmail: payload.customer_email,
        customerPhone: payload.customer_phone,
        summary: responseBody.summary_message,
        metadata: {
          fulfillment_status: order.fulfillmentStatus || null,
          financial_status: order.financialStatus || null,
          tracking_count: order.tracking.length,
        },
      }),
    ]);

    return NextResponse.json(responseBody);
  } catch (err) {
    console.error('[voice/order-status] error:', err);
    await Promise.allSettled([
      postSlackMessage('alerts', {
        text: 'Voice order lookup failed',
        blocks: [
          section(`*Voice order lookup failed*\n*Order:* ${payload.order_number}`),
          contextLine(err instanceof Error ? err.message : String(err)),
        ],
      }),
      logVoiceAgentEvent({
        eventType: 'order_lookup_error',
        channel: 'voice',
        conversationId: payload.conversation_id,
        toolName: 'get_order_status',
        status: 'failed',
        orderNumber: payload.order_number,
        customerEmail: payload.customer_email,
        customerPhone: payload.customer_phone,
        summary: 'Internal error during order lookup',
        metadata: { error: err instanceof Error ? err.message : String(err) },
      }),
    ]);

    return NextResponse.json(
      {
        success: false,
        error: 'I am having trouble reaching the order system right now.',
        next_action: 'Offer to escalate this to the Tarife Attar team.',
      },
      { status: 500 }
    );
  }
}

function buildOrderStatusResponse(order: VoiceOrder) {
  const tracking = order.tracking.map((item) => ({
    company: item.company,
    number: item.number,
    url: item.url,
  }));
  const fulfillment = humanizeStatus(order.fulfillmentStatus || 'unknown');
  const trackingLine = tracking.find((item) => item.url)?.url
    ? 'A tracking link is available.'
    : 'Tracking is not available yet.';

  return {
    success: true,
    order_number: order.name,
    customer_name: order.customerName,
    customer_email_redacted: redactEmail(order.email),
    customer_phone_redacted: redactPhone(order.phone || order.shippingAddress?.phone),
    processed_at: order.processedAt,
    fulfillment_status: fulfillment,
    financial_status: humanizeStatus(order.financialStatus || 'unknown'),
    items: order.lineItems.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      variant: item.variantTitle || undefined,
    })),
    tracking,
    summary_message: `I found ${order.name}. Its fulfillment status is ${fulfillment}. ${trackingLine}`,
  };
}

function humanizeStatus(status: string): string {
  return status.toLowerCase().replace(/_/g, ' ');
}

function emptyToUndefined(value: unknown) {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}
