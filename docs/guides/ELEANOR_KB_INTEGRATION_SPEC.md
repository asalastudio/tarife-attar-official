# Eleanor Knowledge Base Integration Spec

## What We're Building

A self-learning knowledge base pipeline where:

1. Customers ask questions via the Tarife Attar chat widget
2. Conversations are logged and analyzed for recurring themes
3. New KB articles are auto-drafted by AI when patterns emerge
4. An evaluation script scores each draft for relevance, accuracy, and brand alignment
5. Approved articles are published to Eleanor's Convex DB
6. The Tarife Attar Help Desk page renders them in real-time

---

## What We Need From You

### 1. Convex Schema (CRITICAL)

Go to your Convex Dashboard:
**https://dashboard.convex.dev/t/asala-team/elennor-96409/admired-duck-737/data**

We need the **table names and field structures** for:

#### A) Knowledge Base Table
- What is the table name? (e.g., `knowledgeBase`, `articles`, `knowledge`)
- Paste one full row as JSON so we can see every field

Example of what we're looking for:
```json
{
  "_id": "abc123",
  "_creationTime": 1706000000,
  "brandId": "tarife-attar",
  "title": "Return Policy",
  "content": "We accept returns within 14 days...",
  "category": "policies",
  "status": "published",
  "source": "manual"
}
```

#### B) Tickets / Conversations Table
- What is the table name? (e.g., `tickets`, `conversations`)
- Paste one full row as JSON

#### C) Messages Table
- What is the table name? (e.g., `messages`, `ticketMessages`)
- Paste one full row as JSON

#### D) Constitution / Brand Config Table (if separate)
- Where is the brand story, tone, and return policy stored?
- Is it a separate table or part of the knowledge base?

---

### 2. Convex Function Names

We need the exact function paths for these operations.
Go to **Dashboard > Functions** tab and look for:

| Purpose                        | Function name we need                          |
|--------------------------------|------------------------------------------------|
| List KB articles by brand      | e.g., `knowledgeBase:list` or `knowledge:getByBrand` |
| Get single KB article          | e.g., `knowledgeBase:get`                      |
| Create new KB article          | e.g., `knowledgeBase:create`                   |
| Update existing KB article     | e.g., `knowledgeBase:update`                   |
| List tickets by brand          | e.g., `tickets:list`                           |
| Get messages for a ticket      | e.g., `tickets:getMessages`                    |
| List all message history       | e.g., `messages:list` or similar               |

---

### 3. Knowledge Base Categories

What categories do you want articles organized into? Here's a suggested starting set:

- **Product Care** — How to apply, store, and preserve perfume oils
- **Returns & Exchanges** — Return windows, conditions, process
- **Shipping** — Timelines, tracking, international
- **Product Info** — Ingredients, concentrations, territories
- **Orders** — Modifications, cancellations, status
- **Brand Story** — The Atlas philosophy, Two Roads, territories
- **Fragrance Guidance** — Scent recommendations, layering, occasions

Confirm or adjust these.

---

### 4. Evaluation Criteria

The evaluation script will score auto-generated articles before publishing.
Confirm or adjust these quality gates:

| Criterion              | Weight | Description                                                |
|------------------------|--------|------------------------------------------------------------|
| Relevance              | 25%    | Does it answer a real, recurring customer question?        |
| Brand Alignment        | 25%    | Does it match Tarife Attar's tone (curator, not salesman)? |
| Accuracy               | 25%    | Are product details, policies, and facts correct?          |
| Uniqueness             | 15%    | Does it cover something not already in the KB?             |
| Clarity                | 10%    | Is it concise and well-structured?                         |

**Minimum score to auto-publish:** 80/100
**Score 60-79:** Flagged for human review
**Score below 60:** Rejected

---

### 5. Constitution / Brand Rules

We already have the Atlas system prompt in `src/app/api/chat/route.ts`.
Does Eleanor have its own separate "constitution" document?

If so, paste the contents or tell us where it lives in Convex so the evaluation
script can cross-reference it when scoring brand alignment.

---

### 6. Environment / Access

Confirm we have what we need:

- [x] Convex deployment URL: `https://admired-duck-737.convex.site`
- [ ] Convex Deploy Key (for server-side mutations from our scripts)
      → Found in Dashboard > Settings > Deploy Key
      → We need this to create articles from our evaluation script
- [x] Google Gemini API Key (already configured)
- [ ] Any authentication/API tokens Eleanor requires for write operations?

---

## Architecture Overview

Once you provide the above, here is what we will build:

```
┌─────────────────────────────────────────────────────────┐
│                    CUSTOMER JOURNEY                      │
│                                                         │
│  Customer asks question → Chat Widget (Gemini + KB)     │
│                              │                          │
│                              ▼                          │
│                     Conversation logged                  │
│                     to Convex (tickets)                  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              ANALYSIS PIPELINE (Cron / Manual)           │
│                                                         │
│  Step 1: Pull all recent conversations from Convex      │
│  Step 2: Cluster by theme (Gemini embeddings)           │
│  Step 3: Identify unanswered or recurring questions     │
│  Step 4: Generate draft KB articles (Gemini)            │
│  Step 5: Evaluate each draft (scoring rubric)           │
│  Step 6: Auto-publish if score ≥ 80                     │
│          Flag for review if 60-79                        │
│          Reject if < 60                                  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 KNOWLEDGE BASE (Convex)                  │
│                                                         │
│  Articles live in Convex → Real-time sync to:           │
│  • Tarife Attar Help Desk page (live query)             │
│  • Chat Guide system prompt (contextual injection)      │
│  • Eleanor dashboard (elennor.work/knowledge)           │
└─────────────────────────────────────────────────────────┘
```

---

## Deliverables (What We Will Build)

1. **`/api/chat/route.ts`** — Enhanced to pull relevant KB articles
   into the Gemini system prompt before each response

2. **`/src/app/(site)/help-desk/page.tsx`** — Wired to live Convex
   query instead of mock data; auto-updates when KB changes

3. **`/scripts/kb-analyze.mjs`** — Analysis script that:
   - Pulls recent conversations from Convex
   - Clusters questions by semantic similarity
   - Identifies gaps (questions with no matching KB article)

4. **`/scripts/kb-generate.mjs`** — Generation script that:
   - Takes identified gaps and drafts new articles
   - Runs the evaluation rubric on each draft
   - Publishes approved articles to Convex

5. **`/scripts/kb-evaluate.mjs`** — Standalone evaluation module:
   - Scores articles against the rubric
   - Checks brand alignment against the constitution
   - Checks for duplicate/overlapping content
   - Returns pass/review/reject verdict

---

## What's Been Built

| Deliverable | File | Status |
|-------------|------|--------|
| Live Help Desk | `src/app/(site)/help-desk/page.tsx` | DONE — wired to `knowledge:listPublished` with category filters |
| Smart Chat | `src/app/api/chat/route.ts` | DONE — injects KB + constitution into Gemini context |
| Analysis Script | `scripts/kb-analyze.mjs` | DONE — clusters conversations, finds gaps |
| Evaluation Script | `scripts/kb-evaluate.mjs` | DONE — 5-factor scoring rubric |
| Generation Script | `scripts/kb-generate.mjs` | DONE — drafts, evaluates, publishes |

## How to Run the Pipeline

```bash
# Step 1: Analyze recent conversations for recurring themes
GOOGLE_GENERATIVE_AI_API_KEY=your-key node scripts/kb-analyze.mjs --days 30

# Step 2: Generate + evaluate articles from identified gaps
GOOGLE_GENERATIVE_AI_API_KEY=your-key node scripts/kb-generate.mjs

# Step 3: Publish approved articles to Eleanor
GOOGLE_GENERATIVE_AI_API_KEY=your-key node scripts/kb-generate.mjs --publish
```
