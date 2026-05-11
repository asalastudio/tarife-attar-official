# Nida — Commerce Agent V1

**Scope:** Tarife-first commerce voice tools for ElevenLabs/Nida.
**Architecture:** ElevenLabs → Next.js Tool Gateway → Shopify/Twilio/Slack/Supabase.

All tools use:

- Method: `POST`
- Header name: `x-webhook-secret`
- Header value: `VOICE_AGENT_WEBHOOK_SECRET` (or existing `SHOWROOM_WEBHOOK_SECRET` fallback)
- Content type: `application/json`

## Environment Variables

Required for the full V1 commerce layer:

```bash
VOICE_AGENT_WEBHOOK_SECRET=
SHOPIFY_STORE_DOMAIN=
SHOPIFY_ADMIN_API_ACCESS_TOKEN=
SHOPIFY_ADMIN_API_VERSION=2026-01
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=
SLACK_VOICE_ALERTS_WEBHOOK_URL=
SLACK_VOICE_SALES_WEBHOOK_URL=
SLACK_VOICE_SUMMARIES_WEBHOOK_URL=
SLACK_VIP_CUSTOMERS_WEBHOOK_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional browser voice widget:

```bash
NEXT_PUBLIC_ENABLE_ELEVENLABS_WIDGET=false
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=
```

## Tool 1: `get_order_status`

Ready-to-paste JSON is in:
`agents/nida/tools/commerce-v1/get-order-status.json`

Endpoint:

```txt
POST https://www.tarifeattar.com/api/voice/order-status
```

Body parameters:

```json
{
  "order_number": "#1234",
  "customer_email": "customer@example.com",
  "customer_phone": "+14155550123",
  "conversation_id": "optional-elevenlabs-conversation-id"
}
```

Rules:

- Require `order_number` and at least one of `customer_email` or `customer_phone`.
- The tool only returns order details if the provided email or phone matches the Shopify order.
- If verification fails, Nida should ask the caller to confirm the order number and checkout contact.

## Tool 2: `send_tracking_sms`

Ready-to-paste JSON is in:
`agents/nida/tools/commerce-v1/send-tracking-sms.json`

Endpoint:

```txt
POST https://www.tarifeattar.com/api/voice/send-tracking-sms
```

Body parameters:

```json
{
  "order_number": "#1234",
  "customer_email": "customer@example.com",
  "customer_phone": "+14155550123",
  "conversation_id": "optional-elevenlabs-conversation-id"
}
```

Rules:

- Re-verifies order/contact before sending.
- Sends only to the phone number already on the Shopify order.
- Never accepts an arbitrary destination phone number.
- SMS is transactional only: order status and tracking link when available.

## Tool 3: `escalate_to_human`

Ready-to-paste JSON is in:
`agents/nida/tools/commerce-v1/escalate-to-human.json`

Endpoint:

```txt
POST https://www.tarifeattar.com/api/voice/escalate
```

Body parameters:

```json
{
  "customer_name": "Jane Smith",
  "customer_email": "jane@example.com",
  "customer_phone": "+14155550123",
  "order_number": "#1234",
  "reason": "Customer is upset about delivery timing",
  "urgency": "high",
  "conversation_summary": "Caller asked about order status, verified identity, and needs human follow-up.",
  "conversation_id": "optional-elevenlabs-conversation-id",
  "requested_channel": "alerts"
}
```

`requested_channel` is optional and may be `alerts`, `sales`, `summaries`, or `vip`.
If omitted, the API routes based on urgency and reason.

## Slack Routing

- Showroom bookings and sales-intent moments → `SLACK_VOICE_SALES_WEBHOOK_URL`
- Tool/system failures → `SLACK_VOICE_ALERTS_WEBHOOK_URL`
- Order lookups and SMS sends → `SLACK_VOICE_SUMMARIES_WEBHOOK_URL`
- VIP/collector escalations → `SLACK_VIP_CUSTOMERS_WEBHOOK_URL`

Slack failures are fail-open: they are logged but do not block customer-facing tool responses.

Because ElevenLabs JSON mode has been picky about request header discriminators,
the saved tool JSON files intentionally leave `request_headers` empty. After
each tool saves, switch to Form mode and add:

```txt
Type: Value
Name: x-webhook-secret
Value: <VOICE_AGENT_WEBHOOK_SECRET or existing SHOWROOM_WEBHOOK_SECRET>
```

## Supabase Event Log

Run the migration:

```bash
supabase/migrations/20260511172407_create_voice_agent_events.sql
```

The table stores redacted operational telemetry only. Raw contact details should not be stored in `voice_agent_events`; the API writes a SHA-256 hash in `customer_contact_hash`.

## Browser Voice Widget

When the ElevenLabs public agent is ready and domain allowlisting is configured:

```bash
NEXT_PUBLIC_ENABLE_ELEVENLABS_WIDGET=true
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_xxx
```

The current site layout will render the ElevenLabs ConvAI widget automatically.
