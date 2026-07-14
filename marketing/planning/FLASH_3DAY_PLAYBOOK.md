# Tarife Attär — 3-Day Reactivation Flash Playbook

**Created:** July 14, 2026
**Goal:** Maximum cash in 72 hours after the Etsy closure, by reactivating the 4,734 consented past customers who were stranded outside the email tool.
**Honest target:** ~$4,000–$8,000 (stretch ~$10k). Not $25k in 3 days — that list/history won't support it safely — but this same machine rebuilds a channel that can replace Etsy's monthly volume within weeks.

---

## The Offer

**A free surprise 3ml waypoint with every order. No minimum. Through Friday 11:59pm PT.**

- A random 3ml vial (glass wand applicator), chosen by us, one of the 28 Atlas waypoints.
- On-brand (a "mystery waypoint" fits the cartographer story), margin-friendly (no discount), and a genuine reason to open + act now.

### Mechanics (works on Basic plan, no app needed)
- No discount code. The gift is added at fulfillment.
- **Fulfillment instruction for the flash window:** *"Every order placed July 14–17 gets one random 3ml waypoint vial added to the package. Vary the waypoint. Do not include a scent the customer already ordered if it's obvious."*
- **Before launch:** confirm you have enough 3ml stock to cover expected order volume (assume 150–300 orders across the flash).

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
**Preheader:** A free surprise 3ml travels with every order through Friday.

> You may know us as Vasana. The name is now Tarife Attär. The oils are the same ones you reached for, and this week we are sending you back to them with something extra.
>
> Through Friday, every order carries a free surprise: a 3ml waypoint in a glass wand applicator, chosen for you, sealed and unnamed until you open it. One of twenty-eight.
>
> Your favorites are still here, wearing new names:
> - **GRANADA** (once Granada Amber) — warm amber and resin, a long golden hour
> - **MEDINA** (once Musk Tahara) — clean white musk, soft and close to the skin
> - **SAANA** (once Honey Oud) — honey drawn over oud, dark and quiet
>
> Return to the one you have been missing. We will tuck a surprise beside it.
>
> **[ Return to your waypoint → ]**  (https://tarifeattar.com)
>
> Tarife Attär (formerly Vasana)

**Resend subject (Wed, to non-openers):** the surprise is still traveling

---

### WAVE 2 — Lapsed Buyers (send Wed)

**Subject:** it has been a while (there is a gift)
**Preheader:** Your old favorite has a new name, and a companion this week.

> It has been a while. A few things changed while you were away. Vasana is now Tarife Attär. The 28 oils were renamed for the places they carry you to. The oils themselves did not change.
>
> This week is a good week to come back. Every order through Friday leaves with a free surprise 3ml waypoint, chosen for you, one of the twenty-eight, sealed until you open it.
>
> Start where you left off. **GRANADA** (once Granada Amber), **MEDINA** (once Musk Tahara), and **SAANA** (once Honey Oud) are still the ones people reach for first.
>
> **[ Find your waypoint again → ]**  (https://tarifeattar.com)
>
> Tarife Attär (formerly Vasana)

---

### WAVE 3 — Subscribers, No Purchase (send Thu)

**Subject:** your first waypoint comes with a second, free
**Preheader:** Two oils, one order. Through Friday only.

> You signed up. You never chose your first waypoint. This is the week to fix that.
>
> Through Friday, every order carries a free surprise 3ml, chosen for you, one of twenty-eight scents in glass wand applicators. You choose one. We choose your second. You leave with two.
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

**Subject:** the surprise ends tonight
**Preheader:** Midnight PT. Then the free waypoint is gone.

> This is the last of it. Every order placed before midnight tonight carries a free 3ml waypoint, sealed and unnamed, chosen for you. After that the offer closes.
>
> You came for one. Leave with two.
>
> **[ Claim the surprise → ]**  (https://tarifeattar.com)
>
> Tarife Attär

---

## SMS (to phone-consented contacts)

Send via Shopify (if SMS consent is captured) or your SMS tool. Keep to 2 sends.

- **Launch (Tue/Wed):** Tarife Attär: for a few days, a free surprise waypoint travels with every order. One of 28, chosen for you. → https://tarifeattar.com  Reply STOP to opt out.
- **Last call (Fri PM):** Tarife Attär: the free surprise waypoint ends at midnight tonight. You came for one, leave with two → https://tarifeattar.com  STOP to opt out.

---

## Site Banner (announcement bar)

Add to the storefront for the flash window:

> **Free surprise 3ml with every order. Through Friday.** A waypoint chosen for you, one of the 28.

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
