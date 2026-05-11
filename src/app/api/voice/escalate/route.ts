import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyVoiceAgentAuth } from '@/lib/voice-agent/auth';
import { logVoiceAgentEvent } from '@/lib/voice-agent/events';
import {
  contextLine,
  divider,
  postSlackMessage,
  section,
  SlackRoute,
} from '@/lib/voice-agent/slack';

export const maxDuration = 15;

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().trim().email().optional()
);
const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(1000).optional()
);

const Body = z.object({
  customer_name: optionalString,
  customer_email: optionalEmail,
  customer_phone: optionalString,
  order_number: optionalString,
  reason: z.string().trim().min(3).max(200),
  urgency: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  conversation_summary: z.string().trim().min(5).max(2000),
  conversation_id: optionalString,
  requested_channel: z.enum(['alerts', 'sales', 'summaries', 'vip']).optional(),
});

export async function POST(req: Request) {
  const authFail = verifyVoiceAgentAuth(req, 'voice/escalate');
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

  const route = payload.requested_channel || inferSlackRoute(payload);
  const slack = await postSlackMessage(route, {
    text: `Voice escalation: ${payload.reason}`,
    blocks: [
      section(
        `*Voice escalation*\n*Reason:* ${payload.reason}\n*Urgency:* ${payload.urgency}\n*Customer:* ${payload.customer_name || 'Unknown'}`
      ),
      section(
        [
          payload.order_number ? `*Order:* ${payload.order_number}` : null,
          payload.customer_email ? `*Email:* ${payload.customer_email}` : null,
          payload.customer_phone ? `*Phone:* ${payload.customer_phone}` : null,
        ]
          .filter(Boolean)
          .join('\n') || '*Contact:* Not provided'
      ),
      divider(),
      section(`*Summary*\n${payload.conversation_summary}`),
      contextLine(`Via Nida voice agent${payload.conversation_id ? ` · ${payload.conversation_id}` : ''}`),
    ],
  });

  await logVoiceAgentEvent({
    eventType: 'human_escalation_created',
    channel: 'voice',
    conversationId: payload.conversation_id,
    toolName: 'escalate_to_human',
    status: slack.ok ? 'success' : 'skipped',
    orderNumber: payload.order_number,
    customerEmail: payload.customer_email,
    customerPhone: payload.customer_phone,
    summary: payload.reason,
    metadata: {
      urgency: payload.urgency,
      slack_route: route,
      slack_notified: slack.ok,
      slack_reason: slack.reason || null,
    },
  });

  return NextResponse.json({
    success: true,
    notified: slack.ok,
    escalation_channel: route,
    confirmation_message:
      'I have passed this to the Tarife Attar team with the conversation details.',
  });
}

function inferSlackRoute(payload: z.infer<typeof Body>): SlackRoute {
  const reason = payload.reason.toLowerCase();
  if (payload.urgency === 'critical') return 'alerts';
  if (reason.includes('vip') || reason.includes('collector')) return 'vip';
  if (reason.includes('checkout') || reason.includes('sale') || reason.includes('buy')) {
    return 'sales';
  }
  return payload.urgency === 'high' ? 'alerts' : 'summaries';
}

function emptyToUndefined(value: unknown) {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}
