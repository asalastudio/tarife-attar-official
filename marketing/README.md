# Tarife Attär — Marketing Hub

Single home for every marketing asset: brand voice, product catalog source of truth, channel copy, and planning. If it shapes what a customer reads, sees, or receives, it lives here.

**Start here if you're new.** Technical/engineering docs live in [`docs/`](../docs/README.md). Session context lives in [`HANDOFF.md`](../HANDOFF.md).

---

## Quick Start

| I want to… | Open |
|---|---|
| Write any customer-facing copy | [`brand/BRAND_AGENT_SYSTEM_PROMPT.md`](brand/BRAND_AGENT_SYSTEM_PROMPT.md) (paste into Claude/ChatGPT as instructions) |
| Look up a product's notes, pricing, or coordinates | [`catalog/ATLAS_MASTER_28.md`](catalog/ATLAS_MASTER_28.md) |
| Paste listings into Etsy | [`channels/ETSY_ATLAS_LISTINGS.md`](channels/ETSY_ATLAS_LISTINGS.md) |
| Generate the email marketing system | [`channels/EMAIL_SEQUENCE_MASTER_PROMPT.md`](channels/EMAIL_SEQUENCE_MASTER_PROMPT.md) |
| See what's done and what's next | [`planning/TARIFE_ATTAR_MASTER_CHECKLIST.md`](planning/TARIFE_ATTAR_MASTER_CHECKLIST.md) |
| Understand the brand deeply | [`brand/BRAND_BRAIN.md`](brand/BRAND_BRAIN.md) |

---

## Directory Map

### `brand/` — Voice & Identity

| File | What it is |
|---|---|
| `BRAND_BRAIN.md` | Comprehensive brand intelligence: essence, philosophy, boundaries, customer identity, voice DNA, visual codes. The deep reference. |
| `BRAND_AGENT_SYSTEM_PROMPT.md` | The working tool: a complete system prompt (identity, Two Roads architecture, four territories, sensory lexicon, copywriting protocols) for generating brand-aligned content with any AI. |
| `BRAND_AGENT_README.md` | How to set up and use the brand agent (Claude Projects, ChatGPT, Cursor). |
| `MADISON_STUDIO_BRAND_FRAMEWORK.md` | Brand DNA framework formatted for Madison Studio (copywriting pillars, visual codex, messaging pillars). |
| `EVOCATION_STORY_EXPLANATION.md` | How Evocation Story and On Skin Story copy blocks flow through Sanity → site → Shopify. |

### `catalog/` — Product Source of Truth

| File | What it is |
|---|---|
| `ATLAS_MASTER_28.md` | **The master reference.** 28 waypoints, 4 territories, notes, pricing, naming changes, title formats. When copy and catalog disagree, this wins. |
| `PRODUCT_IMAGE_GUIDELINES.md` | Aspect ratios, photography standards, brand consistency rules for product images. |
| `Tarife_Attar_Atlas_Shopify_Import_v4.csv` | Shopify product import (28 products, 56 SKUs). Already imported March 2026. Regenerate: `python3 scripts/generate-shopify-csv-v4.py` |
| `shopify-import-products.csv` | Legacy Shopify import CSV. Regenerate: `node scripts/generate-shopify-csv.mjs` |

### `channels/` — Channel Copy

| File | Channel | Status |
|---|---|---|
| `ETSY_ATLAS_LISTINGS.md` | Etsy | Copy written for 28 Atlas + 3 Archive listings. **Not yet pasted into Etsy.** Caravan + Relic listings not yet written. |
| `EMAIL_SEQUENCE_MASTER_PROMPT.md` | Email (Omnisend) | Master generation prompt ready (welcome, abandoned cart, post-purchase, win-back sequences). **Sequences not yet generated or deployed.** |

### `knowledge-base/` — Customer-Facing KB Sources

Source documents for the Eleanor chat concierge knowledge base (`node scripts/kb-seed.mjs`). **Three expected files are not in the repo yet** — see [`knowledge-base/README.md`](knowledge-base/README.md).

### `planning/` — Trackers & Plans

| File | What it is |
|---|---|
| `TARIFE_ATTAR_MASTER_CHECKLIST.md` | Full implementation tracker: platform push, redirects, site updates, SEO, GEO, Etsy competitive positioning, ongoing maintenance. |

---

## Channel Status Board (March 2026)

| Channel | State | Next action |
|---|---|---|
| **Site** (tarifeattar.com) | Live on Vercel. SEO foundation shipped (robots, sitemap, JSON-LD, metadata). | /about page, /guide educational content, /faq with schema, Search Console submission. |
| **Shopify** | 28 products / 56 SKUs imported (v4 CSV). | Archive old products (OMAN, CHERISH, RITUAL…), set inventory quantities. |
| **Etsy** | Listing copy ready; nothing pasted yet. API approval pending. | Paste 28 Atlas + 3 Archive listings, create shop sections (Ember, Tidal, Petal, Terra, The Relic, The Caravan, The Archive), write Caravan + Relic listings. |
| **Email** (Omnisend) | Master prompt ready; no sequences built. Abandoned-cart 404 issue was fixed (`docs/reports/OMNISEND_404_FIX.md`). | Generate sequences from the master prompt, build in Omnisend. |
| **Chat concierge** (Eleanor) | Live on site; KB seeding pipeline exists. | Add the three missing KB source docs, run `kb-seed.mjs --publish`. |

---

## Open Gaps

**Blocked on pricing (Jordan):**
- The Garden Route (10×3ml) — $?
- The Trade Route (10×3ml) — $?
- The Full Atlas (28×3ml) — $?
- Relic products — individual pricing

**Referenced but missing from the repo** (add when available):
- `Tarife_Attar_MASTER_CATALOG.xlsx` — copy-paste master catalog for Etsy + Shopify (was "building")
- `Etsy-FAQ-Formatted.md` → drop into `knowledge-base/`
- `Return-Policy-Formatted.md` → drop into `knowledge-base/`
- `THE_CARTOGRAPHER_NARRATIVE.md` → drop into `knowledge-base/`

**Copy not yet written:**
- Caravan Etsy listings (Garden Route, Trade Route, Full Atlas)
- Relic Etsy listings
- Email sequences (prompt exists; output doesn't)

---

## Brand Rules — Quick Reference

Full rules: `brand/BRAND_AGENT_SYSTEM_PROMPT.md` and `catalog/ATLAS_MASTER_28.md`.

1. Never specify oud or vanilla origin — just "Oud" / "Agarwood" / "Vanilla"
2. No inspiration brand names, no "inspired by" language in customer-facing copy
3. Oud is always a NOTE in Atlas, never a raw-material claim (Relic is different)
4. Product format: "glass wand applicator", never "roll-on"
5. Banned words: smell, nice, strong, cheap, good, buy, purchase, synthetics, loud, broadcast, project, indulge, pamper
6. Voice: 70% J. Peterman / 30% Eugene Schwartz
7. No em dashes in customer-facing copy
8. Main site titles: waypoint name only. Etsy titles: `WAYPOINT — [Scent Words] Perfume Oil | Niche Fragrance | Tarife Attar`
9. Vocabulary boundary: Atlas and Relic use distinct vocabularies (Two Roads) — don't cross them

---

## Related Automation (`scripts/`)

| Script | Purpose |
|---|---|
| `kb-seed.mjs` | Seed Eleanor chat KB from these marketing docs (searches `marketing/` dirs) |
| `generate-shopify-csv-v4.py` | Regenerate the v4 Shopify import CSV into `catalog/` |
| `generate-shopify-csv.mjs` / `generate-shopify-import-csv.mjs` | Regenerate legacy import CSV into `catalog/` |
| `verify-shopify-import.mjs` | Verify Shopify products match the import CSV |
| `evocation-copy.mjs` / `onskin-copy.mjs` | Product storytelling copy (evocation + on-skin) used by ingest |
| `ingest-fragrances.mjs` | Push product content into Sanity |
| `sync-descriptions-to-shopify.mjs` | Sync product descriptions Sanity → Shopify |

---

## Conventions

- New channel copy (social, ads, wholesale…) → new file under `channels/`
- Customer-facing KB/FAQ/policy source docs → `knowledge-base/`
- Catalog data artifacts (import CSVs, spreadsheets) → `catalog/`
- Keep `ATLAS_MASTER_28.md` as the single source of truth — update it first, then propagate
- Update the Channel Status Board above when a channel's state changes
