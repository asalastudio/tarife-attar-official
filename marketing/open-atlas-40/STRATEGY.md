# THE OPEN ATLAS — 30% Flash Sale Strategy

**Campaign:** The Open Atlas — a six-day opening of the archive. 30% off every Atlas waypoint.
**Window:** Tuesday Aug 11 → Sunday Aug 16, 2026, 11:59 PM PT (warm-up sends today, Mon Aug 10)
**Goal:** Maximum revenue in a compressed window without damaging the brand's no-hard-sell positioning or the sender reputation of a never-mailed list.

**Files in this folder:**

| File | What it is |
|------|-----------|
| `STRATEGY.md` | This document — the full plan |
| `EMAIL_SEQUENCE.md` | Copy deck: every send (subjects A/B, preheaders, full body), popup, banner, SMS note, Instagram captions |
| `SHOPIFY_EMAIL_BUILD.md` | How to assemble these emails in Shopify Messaging (formerly Shopify Email), incl. audience + segments |
| `emails/01-the-atlas-opens.html` | Production HTML for the announcement email |
| `emails/05-final-hours.html` | Production HTML for the closing-night email (dark variant) |

---

## 1. Where we actually stand (pulled live, Aug 10)

These numbers came from the connected Shopify store (`vasana-perfumes.myshopify.com`) and Omnisend account ("Tarifé Attär") today:

- **Baseline (last 90 days):** 114 orders, $6,399 gross, **AOV $52.89** (~$2,100/mo, ~1.3 orders/day)
- **Top sellers (90d):** GRANADA (27 orders), SAANA (19), MEDINA (19), then MALABAR / SICILY / HAVANA / HUDSON / DAMASCUS (~7 each)
- **The email list has never been sent a campaign.** Contacts were imported from Klaviyo in late January 2026. Six drafts exist in Omnisend (WARM-UP 1–5 rebrand arc + Welcome W1) — none were ever sent. No segments exist.
- **Inventory (live):** 21 of 28 waypoints in stock. **Out of stock: ASTORIA, BAHIA, BEIRUT, CARMEL, MEISHAN, TARIFA, TIGRIS.** Nearly depleted: MANALI (1 unit), KANDY (5), DAMASCUS (6), RIYADH (8, 6ml only). Deep stock in 3ml minis: BIG SUR (99), SICILY (88), SAMARKAND (80), TOBAGO (79), HUDSON (70).
- **The Traveler Set** (10-piece set, $95, 17 in stock) is the AOV weapon: $66.50 at 30% off.
- **Relic collection:** effectively out of stock ($40–65 items, all zero inventory) — excluding it from the sale costs nothing and protects the vault's collector positioning.

**The three constraints that shape everything below:**

1. **Cold list.** A first-ever send that is a pure discount blast to a 7-month-old imported list risks spam-foldering the whole campaign (Gmail/Yahoo bulk-sender rules: complaint rate must stay under ~0.3%). We warm the list for two days with story sends — conveniently, the unsent WARM-UP drafts are exactly this — then open the sale.
2. **A sale needs a believable reason** or it reads as desperation and trains the list to wait for discounts. We have a perfect one: **the rebrand is complete.** 28 scents renamed, four territories mapped. The Open Atlas is the inaugural event of the new brand — a celebration, not a clearance.
3. **Brand voice prohibits hard-sell** (no fake timers, no "only 3 left!!" fakery, banned words include *buy, purchase, smell, strong, cheap*). Everything below uses **honest urgency**: a real deadline, stated plainly, and only true scarcity ("DAMASCUS is in its final units" — verified true before send).

---

## 2. The offer

| Decision | Call | Notes |
|---|---|---|
| Discount | **30% off all four Atlas territories + Gift Sets** | Collections: `ember`, `tidal`, `petal`, `terra`, `gift-sets` |
| The Traveler Set | **Included** — $95 → $66.50 | Star of Email 3; biggest basket-builder |
| Relic | **Excluded** | All OOS anyway; "The Relic vault remains at archive pricing" is one elegant line of fine print |
| Mechanism | **Automatic discount at checkout** + code **`VOYAGE30`** | Automatic = zero friction on site; the code exists for social/word-of-mouth attribution and anyone who types it |
| Stacking | Does not combine with other discounts; no usage limit per customer | Let people stock up — 3ml minis at ~$14 are an easy multi-item basket |
| End | **Sunday Aug 16, 11:59 PM PT — no extensions, ever** | The first event sets the precedent. If deadlines are real, the *next* sale converts harder |

**Margin sanity check:** 30% off $28–$55 oils nets $19.60–$33 per unit. Perfume-oil COGS is typically well under 30% of retail; confirm your landed cost per bottle is under ~$10 and the discount is comfortably profitable. If any SKU is thinner than that, exclude it rather than shrinking the discount.

**Shopify setup (15 minutes, do Tuesday):**
1. Discounts → Create → **Automatic discount** → "THE OPEN ATLAS — 30%" → 30% off → applies to collections `ember`, `tidal`, `petal`, `terra`, `gift-sets` → active Aug 11 12:00 AM PT → Aug 16 11:59 PM PT.
2. Discounts → Create → **Code** `VOYAGE30`, identical rules and window. (Automatic and code won't stack; the code simply also works.)
3. **Restock check:** if any of the 7 OOS waypoints (especially BAHIA — coconut jasmine in August is a layup) can be restocked by Wednesday, do it. Every OOS product page during the event is a lost click.
4. Re-verify low-stock counts (MANALI/KANDY/DAMASCUS/RIYADH) before Emails 4–5 go out — scarcity lines must be true on the day they send.

---

## 3. Campaign arc — day by day

Seven days, six sends. Story today, event opens tomorrow. All times PT (brand timezone).

| Day | Send | To | Job |
|---|---|---|---|
| **Today — Mon Aug 10, ~11am** | WARM-UP 4 — "your favorite scent has a new name" *(existing draft + one added tease line)* | Full list | First-ever send. The rebrand reveal, story only. Flushes hard bounces, starts sender reputation, and tees up tomorrow: *"Tomorrow morning, for six days only, we're opening the whole Atlas."* |
| **Tue Aug 11, 8am** | **E1 — The Atlas, Open** (`emails/01-the-atlas-opens.html`) | Full list minus bounces/complaints | The announcement. 30%, the reason, the code, four featured waypoints, The Traveler Set, quiz for the undecided |
| **Wed Aug 12** *(optional)* | WARM-UP 2 — "which one are you?" *(existing draft)* | Non-purchasers | Optional non-promo quiz touch to keep engagement up mid-window |
| **Thu Aug 13, 9am** | E2 — Four territories, one decision | Non-purchasers | Territory guide — helps the overwhelmed choose. Deep links to each territory |
| **Sat Aug 15, 9am** | E3 — The Traveler Set + what travelers are claiming | Non-purchasers, weighted to openers | Social proof (real 90-day bestsellers), the $66.50 set, 3ml minis as low-risk entry |
| **Sun Aug 16, 9am** | E4 — Last day | All non-purchasers | Plain statement: closes tonight. Recap + true low-stock notes |
| **Sun Aug 16, 6pm** | **E5 — Final hours** (`emails/05-final-hours.html`) | Non-purchasers who opened ≥1 event email | Dark-mode closer. Shortest email of the arc. 11:59 PM |

**Why this shape:** flash-sale revenue reliably concentrates ~40–50% in the final 24 hours — that's why Sunday gets two sends and the best creative. The single warm-up is not a delay; a story email landing a few hours before the first promo send is the minimum that keeps a never-mailed list out of the spam folder, and the rebrand reveal doubles as the sale's reason.

**Purchaser suppression:** anyone who orders during the event stops getting sale emails immediately (segment below) and falls into the post-purchase flow. Nothing reads worse than "last chance!" sent to someone who ordered yesterday.

---

## 4. Segments to build in Omnisend (there are currently none)

Build Tuesday, in this order:

1. **Emailable** — status subscribed (baseline audience for every send)
2. **Event Engaged** — opened or clicked any campaign in the last 7 days (available from Wed; audience for E5)
3. **Event Purchasers** — placed order in the last 7 days (requires the Shopify↔Omnisend store connection to be live — verify order events are flowing before launch; the brand shows `connected: true` but do a test order or check a recent real order appears on the contact timeline) — **used as an exclusion** on E2–E5
4. **Clicked, no order** — clicked any event email, no order — E4/E5 will hit these hardest; they're your highest-intent group

---

## 5. The five marketing functions (the framework from the course you linked, applied here)

*(Nick Saraev's "Claude Code marketing" framing: creative, personalized copy, speed to lead, data, follow-ups — each mapped to this event.)*

### 5.1 Creative (top of funnel)
- Two production HTML templates in `emails/` carry the event's visual identity: alabaster/gold announcement, obsidian close. E2–E4 reuse the E1 template with swapped hero copy and product blocks (swap map in `EMAIL_SEQUENCE.md`) — no new design work mid-event.
- Instagram (@tarifeattar): 5-post arc + daily stories, captions written in `EMAIL_SEQUENCE.md` §6. Post timing mirrors email sends (same-morning reinforcement).
- Site: announcement bar + homepage hero swap, copy in `EMAIL_SEQUENCE.md` §5. The bar is the highest-leverage single change — every visitor sees the deadline without a single "SALE!!!" banner.

### 5.2 Personalized copy
- The territory system IS the personalization: E2 routes readers by temperament ("You know your territory" → deep links; "You don't" → quiz).
- Quiz completions during the event get the territory-matched result page; if the quiz-completion automation from `EMAIL_SEQUENCE_MASTER_PROMPT.md` isn't built yet, don't build it this week — the quiz CTA in E1/E2 still routes people to `/atlas?territory=X` deep links.
- Subject lines follow the voice already established in your Omnisend drafts (lowercase, intimate, curiosity-first: "some things weren't meant to last") — the A variants. B variants are the editorial register. A/B test E1 only; apply the winner's style to E2–E5.

### 5.3 Speed to lead
- **Exit-intent popup** during the event (Omnisend Forms, copy in §5 of the copy deck): captures the 97% who won't order this visit, delivers the code instantly, grows the list *during* the sale. New captures enter the event sequence at whatever send is next.
- **Cart (Satchel) abandonment:** enable Omnisend's abandoned-checkout automation before launch with the event-aware override copy provided (§7 of the copy deck) — 1-hour delay, one email. During a six-day window, a 24-hour abandonment delay misses the deadline; 1 hour is correct here.

### 5.4 Data collection & tracking
- **UTMs on every link** (already baked into both HTML files): `utm_source=omnisend&utm_medium=email&utm_campaign=open-atlas-2026-08&utm_content=e1…e5`.
- **Attribution:** Shopify → Discounts → VOYAGE30 / automatic-discount usage = orders; Omnisend campaign report = clicks; the two together are the whole funnel.
- **Daily scoreboard** (run each morning in Shopify admin → Analytics, or ask Claude):
  - `FROM sales SHOW orders, net_sales, average_order_value SINCE 2026-08-11 UNTIL today`
  - `FROM sales SHOW net_sales, orders GROUP BY product_title ORDER BY net_sales DESC LIMIT 10 SINCE 2026-08-11`
- **Guardrails (check after every send in Omnisend):** bounce <5% on the first send then <2%; unsubscribe <1.5% per send; complaint <0.1%. Breach = pause, clean, shrink the audience to engaged-only before continuing.

### 5.5 Follow-ups (bottom of funnel)
- Purchasers → post-purchase flow (P1–P3 from the master prompt; if not built, at minimum Shopify's order/shipping notifications carry the weight this week).
- **After close, Monday Aug 17:** one quiet note to engaged non-buyers — *"The Atlas is closed. The territories remain."* No discount, quiz CTA. This is the send that teaches the list the deadline was real, which is what makes the *next* event outperform this one.
- Cadence going forward: The Atlas opens **twice a year**, and that's it. Say so in E1 ("The Atlas opens rarely") — scarcity of the event itself is the long-term asset. Between events: story/education sends (the Robert Collier seasonal register: "As autumn approaches, we return to Ember…").

---

## 6. What to honestly expect (projection)

Modeled per **1,000 emailable contacts**, first-ever campaign to a cold imported list, 5 event sends + 1 warm-up, automatic discount on site. (A 30% offer converts slightly below a 40% one but keeps ~10 points more margin per order — net revenue lands in nearly the same place, more profitably.)

| | Conservative | Base | Stretch |
|---|---|---|---|
| Deliverability after cleaning | 88% | 93% | 96% |
| Avg open rate (cold list) | 22% | 30% | 38% |
| Unique clickers across sequence | 4% | 6.5% | 9% |
| Site conversion of email clickers (30% offer) | 4% | 7% | 10% |
| Email-attributed orders / 1k contacts | ~2 | ~4.5 | ~9 |
| Net AOV after discount (baseline AOV $52.89; sets + multi-item baskets offset the discount) | $37 | $46 | $57 |
| **Email revenue / 1k contacts** | **~$60** | **~$210** | **~$510** |

Add non-email channels (site banner + automatic discount catching organic/social/direct traffic, IG arc, popup captures, abandonment flow): historically these add **50–100% on top of email-attributed revenue** in small-brand flash sales — call it a combined **$100–$1,000 per 1,000 contacts** depending on list quality.

**Your audience is 8,434 subscribed customers** (verified live in Shopify). That puts email-attributed revenue at roughly **$500 / $1,750 / $4,300** (conservative/base/stretch), and the combined mid-case around **$2,500–$3,500** for the week. Against a ~$500/week baseline, that's several normal weeks of revenue in six days — real, but not a lottery ticket. The three levers that move the number most, in order: (1) Sunday execution → never skip E5, (2) Traveler Set attach rate → it's 2× the AOV of a single bottle even discounted, (3) the popup + IG arc → they compound the list during the event.

**Inventory ceiling:** ~900 sellable units. Not a realistic constraint at this list size, except the four low-stock waypoints — which is why they're the honest-scarcity stars of E4/E5 rather than E1.

---

## 7. Launch checklist

**Today — Monday Aug 10**
- [x] Discounts created: automatic "THE OPEN ATLAS — 30%" + code `VOYAGE30`, both scheduled Tue 12:00 AM → Sun 11:59 PM PT, scoped to the four territories + gift sets
- [ ] Verify sender `journey@tarifeattar.com` is domain-authenticated in the sending platform; confirm DMARC exists on tarifeattar.com (any policy, even `p=none`)
- [ ] Send WARM-UP 4 (+ tease line, copy deck §1) ~11 AM PT — plain-text style, from Jordan
- [ ] Load E1, test-send to yourself, check Gmail/iPhone rendering; stage the non-purchaser segment (SHOPIFY_EMAIL_BUILD.md §4)
- [ ] Restock what can be restocked (BAHIA first) · stage banner + popup for morning

**Tuesday Aug 11 — open**
- [ ] E1 8am · site banner live at 7:45 · IG post 1 + story · popup live
- [ ] Evening: check scoreboard + guardrails · suppress hard bounces from both sends

**Wed–Sat** — optional WARM-UP 2 quiz email Wed · E2 9am Thu · E3 9am Sat, IG posts 2–3, monitor, re-verify stock lines for Sunday
**Sunday Aug 16 — close** — E4 9am, E5 6pm, IG "closes tonight" story 8pm, discount auto-expires 11:59pm
**Monday Aug 17** — banner down, "Atlas is closed" note to engaged non-buyers, tally scoreboard, write down what worked for the next opening

---

## 8. Brand guardrails (non-negotiable, from BRAND_BRAIN.md)

- Honest urgency only: real deadline, real stock counts, verified before send. No countdown timers, no evergreen "last chance."
- Sensory Lexicon applies to sale copy too — banned: *smell, nice, strong, cheap, good, buy, purchase, loud, indulge, pamper*. CTAs use ENTER / EXPLORE / CLAIM / SHOP.
- The number "30%" appears in clean typography, never with exclamation marks. The event has a name (The Open Atlas) and a reason (the completed rebrand) — it is an *occasion*, not a markdown.
- Relic is never discounted. One line of fine print, no explanation.
- No extension emails on Monday. Ever.
