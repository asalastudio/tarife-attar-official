/**
 * Showroom Webhook Auth
 *
 * Verifies the shared secret sent by ElevenAgents (or any caller) in the
 * `X-Webhook-Secret` header. Without this, anyone discovering the endpoint
 * URL could spam the booking system.
 *
 * Env var: VOICE_AGENT_WEBHOOK_SECRET — set in Vercel.
 * Backward compatible fallback: SHOWROOM_WEBHOOK_SECRET.
 * ElevenAgents Server Tool config must send the same value in a custom header.
 */

import { NextResponse } from 'next/server';
import { verifyVoiceAgentAuth } from '@/lib/voice-agent/auth';

export function verifyWebhookAuth(req: Request): NextResponse | null {
  return verifyVoiceAgentAuth(req, 'showroom-auth');
}
