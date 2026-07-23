# Tarifé Attär — Flash Sprint Handoff

**Paste this whole document into the new session as your opening prompt.** It is self-contained; the new Claude has none of the prior conversation.

**Live checklist artifact (open first):** https://claude.ai/code/artifact/36873e9b-bb99-4511-85b3-d0dd6cf2f387

---

## Your role

You are continuing an active, time-sensitive revenue sprint for the fragrance brand **Tarifé Attär**. Read this entire document before taking any action. The work is a 3-day email-driven flash to reactivate past customers after the brand's main channel (Etsy) closed permanently.

**Two hard rules:**
1. **Verify the Shopify store before ANY write.** The connectors reshuffle and sometimes point at the wrong store. Run `{ shop { name myshopifyDomain } }` first. It MUST return **Bestbottles is WRONG**; the correct store is **`vasana-perfumes.myshopify.com`** (shop name "Tarifé Attär"). If you're on Bestbottles, stop and have the user reconnect `vasana-perfumes` in their Shopify connector settings.
2. **Protect deliverability.** This list had never been emailed until now. Never blast the full list at once; send in ramped waves by recency and gate each wave on the prior wave's bounce rate.

---

## The situation

- Tarifé Attär is a niche perfume-oil brand (the "Atlas": 28 fragrances / "waypoints" across 4 territories — Ember, Tidal, Petal, Terra; plus a "Relic" line of rarities).
- **Etsy — their main revenue channel — closed for good.** They asked for "$25k in 3 days." The honest, data-backed reality: **that is not safely reachable** from the current list + inventory. Realistic target this weekend is **$4k–$8k** (stretch ~$10k). Do not pretend otherwise. The bigger prize is rebuilding the email channel to replace Etsy over the coming weeks.
- Direct Shopify store does **~$1,400/month**, AOV ~$30–$48, 5,279 lifetime orders.

## The audience (the core asset)

- **8,310 Shopify customers total.** Email-marketing consent breakdown:
  - **4,734 subscribed** (legally emailable) ✅
  - 1,404 unsubscribed (off-limits)
  - 1,897 never opted in (off-limits)
- Only **~275** of the 4,734 are marked subscribed in **Omnisend** — the Klaviyo→Omnisend import (Jan 2026) broke consent mapping. **Fixing the Omnisend↔Shopify sync is the biggest medium-term unlock.**
- Recency of the 4,734: **61** ordered in last 90d, **372** in last 12mo, **2,442** never purchased (newsletter signups).

## The offer

**Spend $50, get a free 3ml (while they last). Through Friday.**
- Framed as a limited "discovery vial," NOT "surprise waypoint" (see inventory constraint below).
- Gift added at fulfillment for orders ≥ $50. Fulfillment rule: *"Any order $50+ gets one free 3ml (HUDSON or MARRAKESH) added, while the ~99 last."*
- ⚠️ **Inventory constraint:** only ~99 pre-filled 3ml exist, across just **2 scents** (HUDSON 70, MARRAKESH 29). Every other product sells only in 6ml/12ml. This gates the gift AND the new Traveler Set (see 3ml task below).

---

## What's been done

- **Wave 1 email SENT** to ~371 recent buyers via **Shopify Email** (custom-code HTML template). Sender: `hello@journey.tarifeattar.com`, name "Tarifé Attär". Subject: *"a little more than you came for."* Hero image + $50/free-3ml offer. File: `marketing/channels/wave1-flash-email.html`.
- **3 Shopify customer segments created** for the ramp:
  - `Flash Wave 1 - Recent Buyers 12mo` — gid `658706301210` — ~372
  - `Flash Wave 2 - Lapsed Buyers` — gid `658706333978` — ~1,920
  - `Flash Wave 3 - Subscribers No Purchase` — gid `658706366746` — ~2,442
- **Full 3-day playbook** written: `marketing/planning/FLASH_3DAY_PLAYBOOK.md` (all wave copy, SMS, banner, ads, fulfillment, deliverability guardrails).
- **New product created: "The Traveler Set"** — $95, 10 assorted 3ml oils. Product gid `10318654701850`, variant gid `52505808994586`, 14 in stock, status ACTIVE. **Direct checkout link (works now):** `https://vasana-perfumes.myshopify.com/cart/52505808994586:1`. NOT visible on the site yet (headless — see architecture note).
- **Hero image (Shopify CDN):** `https://cdn.shopify.com/s/files/1/1989/5889/files/ChatGPT_Image_Jul_14_2026_05_58_06_PM.png?v=1784077337`
- **Chat concierge fix** committed: `src/app/api/chat/route.ts` — capped the legacy Convex knowledge-base call at 2s (it was hanging the bot on "Composing…") and removed a "roll-on" mention that violated brand rules. **On the branch only — needs merge to main + deploy to go live.**
- **Marketing docs reorganized** into `marketing/` (brand/catalog/channels/planning/knowledge-base) with an index at `marketing/README.md`; technical docs into `docs/`.
- **Command-center artifact** published (link at top).

## Where things stand right now (open loops)

1. **Wave 1 report pending.** Email engagement (open/click/bounce/spam) is ONLY in the user's **Shopify Email dashboard** (no API for it). Ask the user for **bounce % and open %**. Benchmarks for this first send to a dormant list: bounce <3% 🟢 / 3–5% 🟡 / >5% 🔴; open 25%+ 🟢 / 12–25% 🟡 / <10% 🔴 (spam).
2. **Wave 2 go/no-go** depends on #1: fire only if bounce <3% and complaints <0.1%. If opens are good but orders weak, drop the gift threshold to ~$40.
3. **Shopify was on the WRONG store (Bestbottles)** at last check — needs `vasana-perfumes` reconnected before pulling revenue or doing the 3ml task.
4. **3ml catalog task (queued, not started)** — see below.

---

## Immediate next actions (in order)

1. **Verify store** (`{ shop { name } }`). If not Tarifé Attär / vasana-perfumes, have the user reconnect it.
2. **Get the Wave 1 report** from the user (bounce %, open %, orders). Give the go/no-go on Wave 2.
3. **Pull orders since the send** (once on the right store) to measure real revenue. Note: Shopify's *session* analytics lag a few hours; use the live orders list, not ShopifyQL sessions.
4. **Run the 3ml catalog fix** (see next section).
5. **Build Wave 2** from the playbook copy, feature The Traveler Set + its checkout link, send if the gate passed.

## The 3ml catalog task (confirmed plan, awaiting execution)

The user wants a **3ml size added to every product** so the gift works for any scent and the Traveler Set is fulfillable.
- Add a "3ml" variant (Size option) to every active Atlas product that lacks one.
- **TOBAGO → set 75 units.** All others → **0 for now** (they'll add stock later).
- **Skip HUDSON and MARRAKESH** (already have 3ml). KASHMIRI SAFFRON has a 3ml at 0 stock.
- ~3 products have no size option at all (MAJMUA, SACRED HOJARI, MUKHALLAT) — confirm whether to add a size option to them too.
- **Awaiting from user: the 3ml price** (proposed $15 flat; could be tiered by territory).
- Location for inventory: `gid://shopify/Location/80900882724` ("Shop location") — but re-fetch on the correct store.
- Use `productVariantsBulkCreate` (validate first). Only Shopify — the storefront won't show 3ml unless also added in Sanity.

---

## Key architecture & gotchas

- **Headless storefront.** tarifeattar.com is Next.js and renders products from **Sanity** (GROQ `*[_type=="product"]`), with Shopify only as the checkout engine. **A product created in Shopify will NOT appear on the site** until a linked Sanity product doc exists. The product model only has `collectionType` "atlas" or "relic" — there is no "set/bundle" type, so The Traveler Set also needs a small schema + listing addition to show on-site (deferred until after the flash).
- **Repo:** `asalastudio/tarife-attar-official`, working branch **`claude/marketing-organization-9conf3`**. Sanity project `8h5l91ut` / production. Omnisend brand "Tarifé Attär" (brandID `696df30874b7188528d8c522`).
- **Brand voice (enforce in all customer copy):** no em dashes; banned words include buy, purchase, shop, sale, discount, smell, nice, strong, good, cheap, roll-on, synthetics, loud, project, indulge, pamper; product format is "glass wand applicator" (never roll-on); use waypoint / territory / composition language; voice ≈ 70% J. Peterman / 30% Eugene Schwartz. Full rules: `marketing/README.md` and `marketing/brand/BRAND_AGENT_SYSTEM_PROMPT.md`.
- **Connector instability:** MCP servers (Shopify, Omnisend, image gen) reshuffle mid-session. Re-locate tools via ToolSearch and always re-verify the Shopify store before writes.
- **Email stats:** opens/clicks/bounces are not API-accessible; always read them from the Shopify Email report.

## Pending decisions to get from the user

1. Can they **fill 3ml from bulk?** (gates the gift, the Traveler Set, and whether the new 3ml variants can ever hold stock)
2. **3ml price** for the new variants ($15?).
3. **Wave 1 numbers** → Wave 2 go/no-go.
4. Reconnect **vasana-perfumes** in Shopify.
5. Open the **PR to deploy the chat fix**?
6. Drop the gift threshold to **$40** for later waves if conversion is weak?

---

*Handoff generated mid-sprint. The artifact at the top is the live, checkable version of the "next actions." Everything referenced as a file path lives in the repo on branch `claude/marketing-organization-9conf3`.*
