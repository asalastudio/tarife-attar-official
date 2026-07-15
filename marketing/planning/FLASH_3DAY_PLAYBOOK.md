# Tarife Attär — 3-Day Reactivation Flash Playbook

**Created:** July 14, 2026
**Goal:** Maximum cash in 72 hours after the Etsy closure, by reactivating the 4,734 consented past customers who were stranded outside the email tool.
**Honest target:** ~$4,000–$8,000 (stretch ~$10k). Not $25k in 3 days — that list/history won't support it safely — but this same machine rebuilds a channel that can replace Etsy's monthly volume within weeks.

---

## The Offer

**Spend $50, get a free 3ml — a discovery vial, chosen for you. While they last. Through Friday 11:59pm PT.**

- A $50 threshold (AOV is $48.51) nudges order value up and rations the gift so limited 3ml stock stretches further.
- Margin-friendly (no discount), honest, and a real reason to act now.

### Inventory reality (checked July 14)
- **Only ~99 pre-filled 3ml exist, across 2 scents:** HUDSON (70) and MARRAKESH (29). Every other waypoint sells only in 6ml/12ml.
- So the gift is framed as "a free 3ml, chosen for you, while they last" — **not** "surprise waypoint / one of 28" (that would overpromise with only 2 scents).
- **~99 covers Wave 1 and part of Wave 2.** If it converts well you run dry — restock 3ml, fill from bulk, or cap at "first 99 orders."
- Also flagged: ~11 waypoints are fully sold out (BEIRUT, TARIFA, MEISHAN, CARMEL, ASTORIA, BAHIA, TIGRIS + Relic oils). Featured heroes GRANADA/MEDINA/SAANA are in stock. Restock review after the flash.

### Mechanics (works on Basic plan, no app needed)
- No discount code. The gift is added at fulfillment.
- **Fulfillment instruction for the flash window:** *"Any order of $50 or more placed July 14–17 gets one free 3ml (HUDSON or MARRAKESH) added to the package, while the ~99 vials last."*
- If you can hand-fill 3ml from bulk oil, you can lift the ~99 cap and widen the scent choice — upgrade the copy to "a surprise waypoint" if so.

---

## The Audience (3 Shopify segments, already created)

Sending is **ramped by engagement** to protect deliverability — your store has never sent a campaign, so we start with the warmest names and expand only if delivery stays clean.

| Wave | Segment | Size | Shopify Segment ID |
|------|---------|------|--------------------|
| 1 | Flash Wave 1 - Recent Buyers 12mo | ~372 | 658706301210 |
| 2 | Flash Wave 2 - Lapsed Buyers | ~1,920 | 658706333978 |
| 3 | Flash Wave 3 - Subscribers No Purchase | ~2,442 | 658706366746 |

All three are `email_subscription_status = SUBSCRIBED` (legally emailable). Unsubscribed (1,404) and never-opted-in (1,897) are correctly excluded.

---

## Send Schedule (via Shopify Email)

**Why Shopify Email, not Omnisend:** your customers + their opt-ins already live in Shopify, and Shopify sends from established shared infrastructure. Firing your first-ever campaign from a cold Omnisend domain would land in spam and burn the domain. Shopify Email is free up to 10k sends/month on your plan. (Omnisend gets fixed separately for the long-term rebuild — see last section.)

| Day | Send | Audience | Purpose |
|-----|------|----------|---------|
| **Tue 7/14 (today)** | Wave 1 | Recent Buyers (~372) | Warm-up + highest-converting. Watch bounce/complaint rates. |
| **Wed 7/15** | Wave 2 | Lapsed Buyers (~1,920) | Main volume. Only send if Wave 1 bounce rate < 3% and complaints < 0.1%. |
| **Wed 7/15 PM** | Wave 1 resend | Wave 1 non-openers | New subject line, same body. |
| **Thu 7/16** | Wave 3 | Subscribers, No Purchase (~2,442) | Widest reach. Hold back if Wave 2 delivery degraded. |
| **Fri 7/17** | Last call | Everyone who opened or clicked | Urgency: gift ends tonight. |

### How to send each wave in Shopify Email
1. Shopify admin → **Marketing** → **Create campaign** → **Shopify Email** (add the free app if prompted).
2. **To:** choose the segment for that wave (by name above).
3. Paste the subject, preheader, and body from the wave copy below.
4. Set sender to **journey@tarifeattar.com** (or support@tarifeattar.com) with sender name **"Jordan at Tarife Attär"**.
5. Send a **test to yourself first**, confirm links + gift message render, then **Send** (or Schedule).

### Deliverability guardrails (do not skip)
- Ramp in the order above. Do **not** blast all 4,734 at once.
- After each wave, check **bounce rate** and **spam-complaint rate** in the campaign report.
  - Bounce < 3% and complaints < 0.1% → proceed to next wave.
  - Higher → pause, and only send to the more recent slice of the next segment.
- Keep sending from one consistent sender address.

---

## Email Copy

> Voice: warm, worldly, direct. No em dashes. Avoids banned words (buy, purchase, smell, nice, strong, cheap, good, etc.). Product format: "glass wand applicator." Links point to https://tarifeattar.com (swap in deep product links if you confirm the slugs resolve).

### WAVE 1 — Recent Buyers (send today)

**Subject:** your Vasana favorites, with a gift inside
**Preheader:** Spend $50 this week and a free 3ml comes with it.

> You may know us as Vasana. The name is now Tarife Attär. The oils are the same ones you reached for, and this week there is a reason to return.
>
> Through Friday, any order of $50 or more carries a free 3ml — a discovery vial in a glass wand applicator, chosen for you and tucked beside the bottle you came for. While they last.
>
> Your favorites are still here, wearing new names:
> - **GRANADA** (once Granada Amber) — warm amber and resin, a long golden hour
> - **MEDINA** (once Musk Tahara) — clean white musk, soft and close to the skin
> - **SAANA** (once Honey Oud) — honey drawn over oud, dark and quiet
>
> Reach $50 and the gift is yours.
>
> **[ Return to your waypoint → ]**  (https://tarifeattar.com)
>
> Tarife Attär (formerly Vasana)

**Resend subject (Wed, to non-openers):** your gift is still waiting

---

### WAVE 2 — Lapsed Buyers (send Wed)

**Subject:** it has been a while (there is a gift)
**Preheader:** Your old favorite has a new name, and a companion this week.

> It has been a while. A few things changed while you were away. Vasana is now Tarife Attär. The 28 oils were renamed for the places they carry you to. The oils themselves did not change.
>
> This week is a good week to come back. Through Friday, any order of $50 or more leaves with a free 3ml, a discovery vial chosen for you, while they last.
>
> Start where you left off. **GRANADA** (once Granada Amber), **MEDINA** (once Musk Tahara), and **SAANA** (once Honey Oud) are still the ones people reach for first.
>
> **[ Find your waypoint again → ]**  (https://tarifeattar.com)
>
> Tarife Attär (formerly Vasana)

---

### WAVE 3 — Subscribers, No Purchase (send Thu)

**Subject:** your first waypoint, with a gift
**Preheader:** Spend $50 through Friday and a free 3ml comes with it.

> You signed up. You never chose your first waypoint. This is the week to fix that.
>
> Through Friday, any order of $50 or more carries a free 3ml, a discovery vial chosen for you, in a glass wand applicator. While they last.
>
> Where most people begin:
> - **GRANADA** — warm amber and resin
> - **MEDINA** — clean white musk, worn close
> - **SAANA** — honey over oud
>
> **[ Choose your first waypoint → ]**  (https://tarifeattar.com)
>
> Tarife Attär

---

### LAST CALL — Openers + Clickers (send Fri afternoon)

**Subject:** the gift ends tonight
**Preheader:** Midnight PT. Then the free 3ml is gone.

> This is the last of it. Any order of $50 or more placed before midnight tonight carries a free 3ml, chosen for you, while they last. After that the offer closes.
>
> You came for one. Leave with a little more.
>
> **[ Claim the gift → ]**  (https://tarifeattar.com)
>
> Tarife Attär

---

## SMS (to phone-consented contacts)

Send via Shopify (if SMS consent is captured) or your SMS tool. Keep to 2 sends.

- **Launch (Tue/Wed):** Tarife Attär: this week, spend $50 and a free 3ml comes with it, chosen for you, while they last. → https://tarifeattar.com  Reply STOP to opt out.
- **Last call (Fri PM):** Tarife Attär: last call. Orders $50+ get a free 3ml, ends midnight tonight → https://tarifeattar.com  STOP to opt out.

---

## Site Banner (announcement bar)

Add to the storefront for the flash window:

> **Spend $50, get a free 3ml. Through Friday.** A discovery vial chosen for you, while they last.

---

## Ads — Small Budget, Retargeting First (3 days)

Spend where it converts fastest: people who already know you. Do **not** run cold prospecting for a 3-day window.

**Suggested split (scale to your budget; example on ~$600 total):**
- **$400 — Meta retargeting** of past site visitors + a Customer List audience (upload your subscribed customers; Meta hashes the emails). Creative: the free-gift hook + GRANADA. Objective: sales/conversions.
- **$150 — Google Brand search** so anyone searching "Vasana" / "Tarife Attär" finds you, not a dead Etsy link. This also catches your rebrand traffic.
- **$50 — Meta 1% lookalike** of past purchasers, tiny test only.

**Creative angle:** "A free surprise waypoint with every order — through Friday." One image of the hero oil, one line of copy, link to the site. Reuse the email subject lines as ad headlines.

---

## After the Flash — The Real Rebuild (so this isn't a one-off)

The flash buys time. Replacing Etsy's volume is the actual work:
1. **Fix the Omnisend ↔ Shopify integration** so the 4,734 consented customers sync properly (right now the platform link is empty, which is why only ~275 were reachable). Then Omnisend runs the ongoing program.
2. **Turn on core flows:** welcome, abandoned checkout, post-purchase, win-back. Your 6 drafted campaigns are a head start.
3. **Warm the domain over 2–3 weeks** so you can eventually email the full list without Shopify Email's limits.
4. **Rebuild a discovery channel** to replace Etsy's search traffic (paid social, SEO on tarifeattar.com, possibly a new marketplace).

---

*Segments and analytics pulled live from vasana-perfumes.myshopify.com on July 14, 2026. Revenue estimates are ranges, not guarantees; actual results depend on deliverability and offer response.*
