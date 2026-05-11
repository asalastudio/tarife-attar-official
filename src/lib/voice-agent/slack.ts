export type SlackRoute = 'alerts' | 'sales' | 'summaries' | 'vip';

export interface SlackPostResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
}

export interface SlackMessage {
  text: string;
  blocks?: Array<Record<string, unknown>>;
}

const routeEnv: Record<SlackRoute, string> = {
  alerts: 'SLACK_VOICE_ALERTS_WEBHOOK_URL',
  sales: 'SLACK_VOICE_SALES_WEBHOOK_URL',
  summaries: 'SLACK_VOICE_SUMMARIES_WEBHOOK_URL',
  vip: 'SLACK_VIP_CUSTOMERS_WEBHOOK_URL',
};

export async function postSlackMessage(
  route: SlackRoute,
  message: SlackMessage
): Promise<SlackPostResult> {
  const envName = routeEnv[route];
  const url = process.env[envName];

  if (!url) {
    return { ok: false, skipped: true, reason: `${envName} is not set` };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('[voice-agent/slack] Slack post failed:', route, res.status, text);
      return { ok: false, reason: `Slack post failed with ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    console.warn(
      '[voice-agent/slack] Slack post failed:',
      route,
      err instanceof Error ? err.message : String(err)
    );
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

export function section(text: string): Record<string, unknown> {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text,
    },
  };
}

export function contextLine(text: string): Record<string, unknown> {
  return {
    type: 'context',
    elements: [{ type: 'mrkdwn', text }],
  };
}

export function divider(): Record<string, unknown> {
  return { type: 'divider' };
}
