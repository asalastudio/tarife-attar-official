# THE OPEN ATLAS — 40% Flash Sale Strategy

**Campaign:** The Open Atlas — a 24-hour flash opening of the archive. 40% off every Atlas waypoint.
**Window:** LIVE NOW — Monday Aug 10, 2026, ending tonight at 11:59 PM PT
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
- **The Traveler Set** (10-piece set, $95, 17 in stock) is the AOV weapon: $57 at 40% off.
- **Relic collection:** effectively out of stock ($40–65 items, all zero inventory) — excluding it from the sale costs nothing and protects the vault's collector positioning.

**The three constraints that shape everything below:**

1. **Cold list.** A first-ever send that is a pure discount blast to a 7-month-old imported list risks spam-foldering the whole campaign (Gmail/Yahoo bulk-sender rules: complaint rate must stay under ~0.3%). We warm the list for two days with story sends — conveniently, the unsent WARM-UP drafts are exactly this — then open the sale.
2. **A sale needs a believable reason** or it reads as desperation and trains the list to wait for discounts. We have a perfect one: **the rebrand is complete.** 28 scents renamed, four territories mapped. The Open Atlas is the inaugural event of the new brand — a celebration, not a clearance.
3. **Brand voice prohibits hard-sell** (no fake timers, no "only 3 left!!" fakery, banned words include *buy, purchase, smell, strong, cheap*). Everything below uses **honest urgency**: a real deadline, stated plainly, and only true scarcity ("DAMASCUS is in its final units" — verified true before send).

---

## 2. The offer

| Decision | Call | Notes |
|---|---|---|
| Discount | **40% off all four Atlas territories + Gift Sets** | Collections: `ember`, `tidal`, `petal`, `terra`, `gift-sets` |
| The Traveler Set | **Included** — $95 → $57 | Star of Email 3; biggest basket-builder |
| Relic | **Excluded** | All OOS anyway; "The Relic vault remains at archive pricing" is one elegant line of fine print |
| Mechanism | **Automatic discount at checkout** + code **`VOYAGE40`** | Automatic = zero friction on site; the code exists for social/word-of-mouth attribution and anyone who types it |
| Stacking | Does not combine with other discounts; no usage limit per customer | Let people stock up — 3ml minis at ~$14 are an easy multi-item basket |
| End | **Tonight, 11:59 PM PT — no extensions, ever** | The first event sets the precedent. If deadlines are real, the *next* sale converts harder |

**Margin sanity check:** 40% off $28–$55 oils nets $16.80–$33 per unit. Perfume-oil COGS is typically well under 30% of retail; confirm your landed cost per bottle is under ~$10 and the discount is comfortably profitable. If any SKU is thinner than that, exclude it rather than shrinking the discount.

**Shopify setup — DONE (both created via API, verified ACTIVE):**
1. ✅ Automatic discount "THE OPEN ATLAS — 40%" — live now, expires tonight 11:59 PM PT, scoped to `ember`, `tidal`, `petal`, `terra`, `gift-sets`.
2. ✅ Code `VOYAGE40` — identical rules and window. (Automatic and code won't stack; the code simply also works.)
3. Re-verify low-stock counts (MANALI/KANDY/DAMASCUS/RIYADH) before the final-hours email — scarcity lines must be true when they send.

---

## 3. Campaign arc — day by day

One day, two sends. All times PT (brand timezone).

| Time | Send | To | Job |
|---|---|---|---|
| **Now** | **E1 — The Atlas, Open** (`emails/01-the-atlas-opens.html`) | Full Email subscribers segment (8,434) | The announcement: 40%, the rebrand reason, the code, featured waypoints, The Traveler Set, quiz. The rebrand story inside E1 does the introduction a warm-up would have — this is the list's first-ever email, so the story matters doubly |
| **~6:00–7:00 PM** | **E5 — Final hours** (`emails/05-final-hours.html`) | Non-purchasers (exclude anyone who ordered today) | Dark-mode closer. Shortest email of the day. 11:59 PM deadline, plainly stated |

**Why two sends:** flash-sale revenue concentrates in the final hours — the evening email typically produces as many orders as the morning one. Don't skip it.

**Cold-list note:** the week-long version of this plan warmed the list with a story send first; the 24-hour format trades that away for speed. Watch the complaint rate after E1 (Shopify Messaging report) — if it's above ~0.2%, send E5 to *clickers of E1 only* instead of all non-purchasers. The unsent WARM-UP drafts in Omnisend stay in reserve for the next opening.

**Purchaser suppression:** anyone who orders during the event stops getting sale emails immediately (segment below) and falls into the post-purchase flow. Nothing reads worse than "last chance!" sent to someone who ordered yesterday.

---

## 4. Audience (Shopify customer segments)

- **E1 (now):** the built-in **Email subscribers** segment — 8,434 verified.
- **E5 (tonight):** `Open Atlas non-purchasers` — build it before the evening send:
  ```
  email_subscription_status = 'SUBSCRIBED' AND (last_order_date = NULL OR last_order_date < 2026-08-10)
  ```
  This excludes everyone who ordered today so nobody who already claimed waypoints gets a "final hours" nudge.

---

## 5. The five marketing functions (the framework from the course you linked, applied here)

*(Nick Saraev's "Claude Code marketing" framing: creative, personalized copy, speed to lead, data, follow-ups — each mapped to this event.)*

### 5.1 Creative (top of funnel)
- Two production HTML templates in `emails/` carry the event's visual identity: alabaster/gold announcement, obsidian close. The week-format emails (E2–E4 in the copy deck) are unused today — kept for the next opening.
- Instagram (@tarifeattar): post + story at launch, story again ~8 PM (captions in `EMAIL_SEQUENCE.md` §10).
- Site: announcement bar + homepage hero swap, copy in `EMAIL_SEQUENCE.md` §7. The bar is the highest-leverage single change — every visitor sees the deadline without a single "SALE!!!" banner.

### 5.2 Personalized copy
- The territory system IS the personalization: E1 routes readers by territory (deep links for the decided, quiz for the undecided).
- Quiz completions during the event get the territory-matched result page; if the quiz-completion automation from `EMAIL_SEQUENCE_MASTER_PROMPT.md` isn't built yet, don't build it this week — the quiz CTA in E1 still routes people to `/atlas?territory=X` deep links.
- Subject lines follow the voice already established in your Omnisend drafts (lowercase, intimate, curiosity-first: "some things weren't meant to last") — the A variants. B variants are the editorial register. A/B test E1's subject if time allows; note the winner for the next opening.

### 5.3 Speed to lead
- **Exit-intent popup** during the event (Omnisend Forms, copy in §5 of the copy deck): captures the 97% who won't order this visit, delivers the code instantly, grows the list *during* the sale. New captures enter the event sequence at whatever send is next.
- **Cart (Satchel) abandonment:** enable Omnisend's abandoned-checkout automation before launch with the event-aware override copy provided (§8 of the copy deck) — 1-hour delay, one email. In a 24-hour window, only the ~1-hour delay lands before the deadline.

### 5.4 Data collection & tracking
- **UTMs on every link** (already baked into both HTML files): `utm_source=omnisend&utm_medium=email&utm_campaign=open-atlas-2026-08&utm_content=e1…e5`.
- **Attribution:** Shopify → Discounts → VOYAGE40 / automatic-discount usage = orders; Omnisend campaign report = clicks; the two together are the whole funnel.
- **Scoreboard** (run tonight and tomorrow morning in Shopify admin → Analytics, or ask Claude):
  - `FROM sales SHOW orders, net_sales, average_order_value SINCE 2026-08-10 UNTIL today`
  - `FROM sales SHOW net_sales, orders GROUP BY product_title ORDER BY net_sales DESC LIMIT 10 SINCE 2026-08-10`
- **Guardrails (check after every send in Shopify Messaging):** bounce <5% on the first send then <2%; unsubscribe <1.5% per send; complaint <0.1%. Breach = pause, clean, shrink the audience to engaged-only before continuing.

### 5.5 Follow-ups (bottom of funnel)
- Purchasers → post-purchase flow (P1–P3 from the master prompt; if not built, at minimum Shopify's order/shipping notifications carry the weight this week).
- **After close, tomorrow (Tue Aug 11):** one quiet note to engaged non-buyers — *"The Atlas is closed. The territories remain."* No discount, quiz CTA. This is the send that teaches the list the deadline was real, which is what makes the *next* event outperform this one.
- Cadence going forward: The Atlas opens **twice a year**, and that's it. Say so in E1 ("The Atlas opens rarely") — scarcity of the event itself is the long-term asset. Between events: story/education sends (the Robert Collier seasonal register: "As autumn approaches, we return to Ember…").

---

## 6. What to honestly expect (projection)

Modeled per **1,000 emailable contacts**, first-ever campaign to a cold imported list, **two sends in one day**, automatic discount on site:

| | Conservative | Base | Stretch |
|---|---|---|---|
| Deliverability | 88% | 93% | 96% |
| Avg open rate (cold list) | 22% | 30% | 38% |
| Unique clickers across both sends | 2.5% | 4% | 6% |
| Site conversion of email clickers (40% offer) | 5% | 8% | 12% |
| Email-attributed orders / 1k contacts | ~1 | ~3 | ~7 |
| Net AOV after discount (baseline AOV $52.89; sets + multi-item baskets offset the discount) | $34 | $42 | $52 |
| **Email revenue / 1k contacts** | **~$35** | **~$125** | **~$365** |

Add non-email channels (site banner + automatic discount catching all traffic, IG, popup, abandonment): typically another 50–100% on top.

**Your audience is 8,434 subscribed customers** (verified live in Shopify). That puts email-attributed revenue at roughly **$300 / $1,050 / $3,100** (conservative/base/stretch) for the day, combined mid-case around **$1,500–$2,500 in 24 hours** — several normal weeks of revenue against a ~$500/week baseline. A one-day flash to a cold list trades some total revenue for speed versus the week-long arc; the three levers that matter most today: (1) send the final-hours email tonight — it usually matches the morning send's orders, (2) Traveler Set attach rate — 2× the AOV of a single bottle even discounted, (3) banner + IG post live all day.

**Inventory ceiling:** ~900 sellable units. Not a realistic constraint, except the four low-stock waypoints — which is why they're the honest-scarcity stars of the final-hours email rather than E1.

---

## 7. Launch checklist

**Now**
- [x] Discounts LIVE: automatic "THE OPEN ATLAS — 40%" + code `VOYAGE40`, active through tonight 11:59 PM PT, scoped to the four territories + gift sets
- [ ] Verify sender `journey@tarifeattar.com` is domain-authenticated in Shopify (Settings → Notifications → Sender email)
- [ ] E1: final pass in the editor (subject, preheader, hero image, prices per copy deck §2) · test-send to yourself · **send to Email subscribers**
- [ ] Site banner + IG post/story live right after the send

**Afternoon**
- [ ] Build the `Open Atlas non-purchasers` segment (§4) · check scoreboard + complaint rate after E1
- [ ] Re-verify low-stock lines (MANALI/KANDY/DAMASCUS/RIYADH) before the evening send

**~6:00–7:00 PM — final hours**
- [ ] E5 to non-purchasers (or E1 clickers only, if complaints ran high) · IG "closes tonight" story ~8 PM
- [ ] Discount auto-expires 11:59 PM — nothing to turn off manually

**Tomorrow — Tuesday Aug 11**
- [ ] Banner down · "the Atlas is closed" note to engaged non-buyers (copy deck §12) · tally the scoreboard · write down what worked for the next opening

---

## 8. Brand guardrails (non-negotiable, from BRAND_BRAIN.md)

- Honest urgency only: real deadline, real stock counts, verified before send. No countdown timers, no evergreen "last chance."
- Sensory Lexicon applies to sale copy too — banned: *smell, nice, strong, cheap, good, buy, purchase, loud, indulge, pamper*. CTAs use ENTER / EXPLORE / CLAIM / SHOP.
- The number "40%" appears in clean typography, never with exclamation marks. The event has a name (The Open Atlas) and a reason (the completed rebrand) — it is an *occasion*, not a markdown.
- Relic is never discounted. One line of fine print, no explanation.
- No extension emails on Monday. Ever.
