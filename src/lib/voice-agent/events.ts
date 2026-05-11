import { hashContact } from './contact';

export type VoiceAgentEventStatus = 'success' | 'failed' | 'skipped';

export interface VoiceAgentEventInput {
  eventType: string;
  channel?: string;
  conversationId?: string;
  toolName?: string;
  status: VoiceAgentEventStatus;
  orderNumber?: string;
  customerEmail?: string;
  customerPhone?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
}

export interface VoiceAgentEventResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
}

export async function logVoiceAgentEvent(
  input: VoiceAgentEventInput
): Promise<VoiceAgentEventResult> {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { ok: false, skipped: true, reason: 'Supabase event log env vars missing' };
  }

  const body = {
    brand_slug: 'tarife-attar',
    event_type: input.eventType,
    channel: input.channel || 'voice',
    conversation_id: input.conversationId || null,
    tool_name: input.toolName || null,
    status: input.status,
    order_number: input.orderNumber || null,
    customer_contact_hash:
      hashContact({ email: input.customerEmail, phone: input.customerPhone }) || null,
    summary: input.summary || null,
    metadata: input.metadata || {},
  };

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/voice_agent_events`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('[voice-agent/events] Supabase insert failed:', res.status, text);
      return { ok: false, reason: `Supabase insert failed with ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    console.warn(
      '[voice-agent/events] Supabase insert failed:',
      err instanceof Error ? err.message : String(err)
    );
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}
