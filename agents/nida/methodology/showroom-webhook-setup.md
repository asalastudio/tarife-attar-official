# Nida — Showroom Webhook Setup

**Agent:** Nida (ElevenAgents voice agent)  
**Purpose:** Lets Nida check real-time availability and book Private Showroom Consultations on `jordan@tarifeattar.com`'s Google Calendar during a live call.

---

## Architecture

```
Caller → Nida (ElevenAgents) → Server Tool → /api/showroom/availability
                                            → /api/showroom/book
                                                     ↓
                                            Google Calendar v3 API
                                            (jordan@tarifeattar.com primary calendar)
```

The two Next.js API routes authenticate with a shared secret (`SHOWROOM_WEBHOOK_SECRET`) and write directly to Google Calendar via OAuth refresh token. Google auto-sends the calendar invite to the caller's email.

---

## Showroom Rules (baked into the slot engine)

| Rule | Value |
|------|-------|
| Available days | Mon – Thu only |
| Hours | 11:00 AM – 5:00 PM Pacific |
| Slot start times | 11:00, 12:15, 1:30, 2:45, 4:00 PM |
| Appointment length | 60 minutes |
| Max bookings per day | 3 |
| Minimum lead time | 2 hours from now |
| Maximum booking window | 60 days out |
| Location | 31080 Union City Blvd, Suite 211, Union City, CA 94587 |

---

## Step 1 — Google OAuth Bootstrap (one-time)

### 1a. Create credentials in Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select or create a project (e.g. `tarife-attar-showroom`)
3. Enable the **Google Calendar API** (`APIs & Services → Library → Google Calendar API → Enable`)
4. Go to `APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID`
5. Application type: **Desktop app**
6. Name: `Nida Showroom (local bootstrap)`
7. Download the JSON or note the **Client ID** and **Client Secret**

### 1b. Run the bootstrap script

```bash
cd /path/to/Tarife-Attar-Site-Redesign

export GOOGLE_OAUTH_CLIENT_ID="xxxxxxxxxxxx.apps.googleusercontent.com"
export GOOGLE_OAUTH_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxx"

node scripts/get-google-refresh-token.mjs
```

Sign in as `jordan@tarifeattar.com` when the browser opens. Grant **Calendar Events** access.

The terminal will print:

```
refresh_token (save this to Vercel as GOOGLE_OAUTH_REFRESH_TOKEN):

  1//0gXXXXXXXXXXXXXX...
```

### 1c. Add env vars to Vercel (and .env.local for local dev)

| Variable | Where to get it |
|----------|----------------|
| `GOOGLE_OAUTH_CLIENT_ID` | Google Cloud Console |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google Cloud Console |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Output of bootstrap script |
| `SHOWROOM_WEBHOOK_SECRET` | Generate: `openssl rand -hex 32` |
| `SHOWROOM_CALENDAR_ID` | Optional — defaults to `primary` |
| `SHOWROOM_TIMEZONE` | Optional — defaults to `America/Los_Angeles` |

> **Refresh tokens do not expire** as long as they are used at least once every 6 months. If the token is ever revoked, re-run the bootstrap script.

---

## Step 2 — ElevenAgents Server Tool Configuration

Add **two Server Tools** to Nida's agent in ElevenAgents. In the ElevenAgents agent editor, go to **Tools → Add Tool → Server Tool** and paste the JSON schemas below.

Both tools require the same custom header for auth. The app now prefers
`VOICE_AGENT_WEBHOOK_SECRET` and falls back to the original
`SHOWROOM_WEBHOOK_SECRET` so existing published tools keep working:

```
Header name:  x-webhook-secret
Header value: 0da531e02325211812b58c055625c2c4f49aae75d1cc5076920580ad82bba9e1
```

Successful bookings also post an internal Slack notification when
`SLACK_VOICE_SALES_WEBHOOK_URL` is configured and write a redacted event to
Supabase when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.

---

### Tool 1: `check_showroom_availability`

**Paste this JSON schema into ElevenAgents:**

```json
{
  "name": "check_showroom_availability",
  "description": "Check available Private Showroom Consultation slots within a date range. Call this when the caller wants to book a consultation and you need to show them open times. Always call this before asking for the caller's contact info.",
  "url": "https://www.tarifeattar.com/api/showroom/availability",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "x-webhook-secret": "0da531e02325211812b58c055625c2c4f49aae75d1cc5076920580ad82bba9e1"
  },
  "parameters": {
    "type": "object",
    "properties": {
      "date_range_start": {
        "type": "string",
        "description": "Start of the date window to search. ISO 8601 with Pacific Time offset, e.g. '2026-05-13T00:00:00-07:00'. Use midnight of the first day the caller mentioned."
      },
      "date_range_end": {
        "type": "string",
        "description": "End of the date window to search. ISO 8601 with Pacific Time offset, e.g. '2026-05-16T23:59:59-07:00'. If the caller is vague, search the next 7 days."
      },
      "max_slots": {
        "type": "integer",
        "description": "Maximum number of slots to return. Default 5 — read at most 3 options aloud to the caller.",
        "minimum": 1,
        "maximum": 10
      }
    },
    "required": ["date_range_start", "date_range_end"]
  }
}
```

**Response (success):**

```json
{
  "slots": [
    {
      "start_iso": "2026-05-13T14:45:00-07:00",
      "end_iso": "2026-05-13T15:45:00-07:00",
      "display_label": "Wednesday, May 13 at 2:45 PM PDT"
    }
  ],
  "count": 1,
  "showroom_hours": "Mon-Thu 11AM-5PM PT",
  "showroom_address": "31080 Union City Blvd, Suite 211, Union City, CA 94587"
}
```

---

### Tool 2: `book_showroom_consultation`

**Paste this JSON schema into ElevenAgents:**

```json
{
  "name": "book_showroom_consultation",
  "description": "Book a Private Showroom Consultation on the calendar and send the caller a Google Calendar invite. Only call this AFTER: (1) the caller has heard and confirmed a specific slot, (2) you have collected their name and email, and (3) they have said yes to booking.",
  "url": "https://www.tarifeattar.com/api/showroom/book",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "x-webhook-secret": "0da531e02325211812b58c055625c2c4f49aae75d1cc5076920580ad82bba9e1"
  },
  "parameters": {
    "type": "object",
    "properties": {
      "slot_start_iso": {
        "type": "string",
        "description": "Slot start time — use the start_iso value from the check_showroom_availability response exactly as returned."
      },
      "slot_end_iso": {
        "type": "string",
        "description": "Slot end time — use the end_iso value from the check_showroom_availability response exactly as returned."
      },
      "caller_name": {
        "type": "string",
        "description": "Caller's full name as they stated it."
      },
      "caller_email": {
        "type": "string",
        "description": "Caller's email address. Google Calendar invite will be sent here automatically. Confirm spelling aloud before booking."
      },
      "caller_phone": {
        "type": "string",
        "description": "Caller's phone number (optional). Stored in the calendar event description."
      },
      "intent": {
        "type": "string",
        "description": "What brings the caller in.",
        "enum": ["gift_shopping", "scent_exploration", "custom_commission", "other"]
      }
    },
    "required": ["slot_start_iso", "slot_end_iso", "caller_name", "caller_email"]
  }
}
```

**Response (booked):**

```json
{
  "success": true,
  "event_id": "abc123...",
  "html_link": "https://calendar.google.com/event?eid=...",
  "summary": "Private Showroom Consultation — Jane Smith",
  "start_iso": "2026-05-13T14:45:00-07:00",
  "end_iso": "2026-05-13T15:45:00-07:00",
  "confirmation_message": "Booked — Wednesday, May 13 at 2:45 PM. Invite sent to jane@example.com."
}
```

Read the `confirmation_message` value back to the caller verbatim.

**Response (slot taken — HTTP 409):**

```json
{
  "success": false,
  "reason": "Slot is already booked.",
  "next_action": "Suggest a different slot to the caller."
}
```

Call `check_showroom_availability` again with a fresh window and offer new options.

---

## Step 3 — Nida Conversation Flow

### When the caller wants to book

1. **Collect intent first** — understand what brings them in (gift, exploration, commission, other)
2. **Ask for their preferred dates** — "Any days or times that work best for you next week?"
3. **Call `check_showroom_availability`** — use their stated window; default to next 7 days if vague
4. **Read 2–3 options aloud** — use `display_label` from the response
5. **Confirm their choice and collect contact info** — name, email (required), phone (optional)
6. **Call `book_showroom_consultation`** — use `start_iso`/`end_iso` from the slot they chose
7. **Confirm using `confirmation_message`** from the response — e.g. "You're all set — Wednesday, May 13 at 2:45 PM. You'll receive a calendar invite at jane@example.com shortly."

### If `count: 0` (no slots)

> "I'm not seeing any open appointments in that window. Our showroom is open Monday through Thursday, 11 AM to 5 PM Pacific. Would a different week work for you?"

### If booking returns `success: false`

> "It looks like that time was just taken. Let me pull up the next available options for you."
Then call `check_showroom_availability` again with a fresh window.

### Nida's tone on booking

- Never say "appointment" — say "consultation" or "visit"
- Reinforce it's private and unhurried: "We keep the day light — only a few consultations — so the time is entirely yours."
- Mention the address once, clearly: "31080 Union City Boulevard, Suite 211, Union City."

---

## Step 4 — Testing

### Test availability (curl)

```bash
curl -s -X POST https://www.tarifeattar.com/api/showroom/availability \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: 0da531e02325211812b58c055625c2c4f49aae75d1cc5076920580ad82bba9e1" \
  -d '{
    "date_range_start": "2026-05-12T00:00:00-07:00",
    "date_range_end": "2026-05-16T23:59:59-07:00",
    "max_slots": 5
  }' | jq
```

### Test booking (curl)

```bash
curl -s -X POST https://www.tarifeattar.com/api/showroom/book \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: 0da531e02325211812b58c055625c2c4f49aae75d1cc5076920580ad82bba9e1" \
  -d '{
    "slot_start_iso": "2026-05-13T14:45:00-07:00",
    "slot_end_iso":   "2026-05-13T15:45:00-07:00",
    "caller_name":    "Test Caller",
    "caller_email":   "jordan@tarifeattar.com",
    "intent":         "scent_exploration"
  }' | jq
```

### Local dev (with .env.local)

```bash
npm run dev
# Then use http://localhost:3000 as the base URL in the curl commands above
```

---

## Env Var Checklist

```
[x] GOOGLE_OAUTH_CLIENT_ID         — set in .env.local + Vercel
[x] GOOGLE_OAUTH_CLIENT_SECRET     — set in .env.local + Vercel
[x] GOOGLE_OAUTH_REFRESH_TOKEN     — set in .env.local + Vercel
[x] SHOWROOM_WEBHOOK_SECRET        — set in .env.local + Vercel
[ ] SHOWROOM_CALENDAR_ID           — optional (default: primary)
[ ] SHOWROOM_TIMEZONE              — optional (default: America/Los_Angeles)
```

---

## Status

- [x] Google OAuth credentials created (Desktop app)
- [x] Refresh token obtained via `scripts/get-google-refresh-token.mjs`
- [x] All 4 env vars added to `.env.local` and Vercel production
- [x] Deployed to https://www.tarifeattar.com
- [ ] ElevenAgents Server Tools configured (Step 2 above)
- [ ] End-to-end test call with Nida
