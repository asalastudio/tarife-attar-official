export interface SmsSendInput {
  to: string;
  body: string;
}

export interface SmsSendResult {
  sid: string;
  status: string;
}

export async function sendTransactionalSms(input: SmsSendInput): Promise<SmsSendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!accountSid || !authToken || !messagingServiceSid) {
    throw new Error(
      'Twilio SMS env vars are not configured. Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGING_SERVICE_SID.'
    );
  }

  const params = new URLSearchParams({
    To: input.to,
    MessagingServiceSid: messagingServiceSid,
    Body: input.body,
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
      signal: AbortSignal.timeout(10000),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : `Twilio send failed with status ${res.status}`
    );
  }

  return {
    sid: String(data.sid || ''),
    status: String(data.status || 'queued'),
  };
}
