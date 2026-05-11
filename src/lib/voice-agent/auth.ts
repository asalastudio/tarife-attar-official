import { NextResponse } from 'next/server';

const HEADER_NAME = 'x-webhook-secret';

export function getVoiceAgentWebhookSecret(): string | undefined {
  return process.env.VOICE_AGENT_WEBHOOK_SECRET || process.env.SHOWROOM_WEBHOOK_SECRET;
}

export function verifyVoiceAgentAuth(
  req: Request,
  context = 'voice-agent-auth'
): NextResponse | null {
  const expectedSecrets = [
    process.env.VOICE_AGENT_WEBHOOK_SECRET,
    process.env.SHOWROOM_WEBHOOK_SECRET,
  ].filter((value): value is string => !!value);

  if (expectedSecrets.length === 0) {
    console.error(
      `[${context}] VOICE_AGENT_WEBHOOK_SECRET or SHOWROOM_WEBHOOK_SECRET is not set`
    );
    return NextResponse.json(
      { success: false, error: 'Server misconfigured. Contact support.' },
      { status: 500 }
    );
  }

  const provided = req.headers.get(HEADER_NAME);
  if (!provided) {
    return NextResponse.json(
      { success: false, error: 'Missing authentication header.' },
      { status: 401 }
    );
  }

  if (!expectedSecrets.some((expected) => safeEqual(expected, provided))) {
    return NextResponse.json(
      { success: false, error: 'Invalid authentication.' },
      { status: 401 }
    );
  }

  return null;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
