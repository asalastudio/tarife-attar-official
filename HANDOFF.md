# TARIFE ATTAR — SESSION HANDOFF
## Updated: March 18, 2026 (End of Session)

---

## WHAT WAS DONE THIS SESSION

### SEO Foundation (All Committed & Pushed)
- `src/app/robots.ts` — Allows Google, GPTBot, ClaudeBot, PerplexityBot
- `src/app/sitemap.ts` — Dynamic sitemap from Sanity
- `src/app/layout.tsx` — metadataBase, title template, OG, Twitter Cards, Organization JSON-LD
- `src/app/(site)/page.tsx` — Homepage metadata
- `src/app/(site)/product/[slug]/page.tsx` — generateMetadata() + Product JSON-LD
- `src/app/(site)/atlas/page.tsx` — Atlas metadata
- `src/app/(site)/relic/page.tsx` — Relic metadata

### Product Page UX (All Committed & Pushed)
- Removed duplicate notes preview near price selector
- Moved trust badges above buy button
- Evocation: collapsible, open desktop, collapsed mobile
- On Skin: collapsible, open desktop, collapsed mobile
- Scent Architecture: collapsed by default
- The Journey: collapsed by default

### Readability (All Committed & Pushed)
- Removed italic from body text site-wide (13 files)
- Kept italic only on H1/H2 headings and compass labels
- Removed all em dashes (~144 instances) from evocation, on-skin, and ingest scripts

### Sanity CMS (Executed Directly)
- Ran ingest: all 28 Atlas products updated
- Ran image patch: Shopify CDN fallback URLs applied
- Ran cleanup: 44 orphaned products deleted, RIYADH duplicate fixed

### Shopify
- v4 CSV generated and imported (28 products, 56 SKUs)
- Product category warning noted (non-blocking)

### Product Format Fix
- All "roll-on" references changed to "glass wand applicator" across codebase, metadata, JSON-LD

### Git
- Branch: `brand-agent-docs`
- All changes committed and pushed
- Vercel builds triggered

---

## DOCUMENTS OF TRUTH

| Document | Path | Purpose |
|----------|------|---------|
| **Atlas Master Reference** | `ATLAS_MASTER_28.md` | Source of truth — 28 waypoints, territories, notes, pricing |
| **Master Catalog** | `Tarife_Attar_MASTER_CATALOG.xlsx` | Copy-paste reference for Etsy + Shopify (building) |
| **Shopify Import** | `Tarife_Attar_Atlas_Shopify_Import_v4.csv` | Shopify product import — imported |
| **Etsy Listings** | `ETSY_ATLAS_LISTINGS.md` | Ready-to-paste Etsy copy (28 Atlas + 3 Archive) |
| **Checklist** | `TARIFE_ATTAR_MASTER_CHECKLIST.md` | Full task tracker |
| **Handoff** | `HANDOFF.md` | This file |
| **Brand Agent** | `BRAND_AGENT_SYSTEM_PROMPT.md` | Voice rules, sensory lexicon |

---

## COMPLETE SITE ARCHITECTURE

| Section | Purpose | Products |
|---------|---------|----------|
| **The Atlas** | 28 waypoints, 4 territories | Individual perfume oils |
| **The Relic** | Rare specimens | Pure ouds, aged resins, vintage attars |
| **The Caravan** | Gift sets & bundles | Garden Route, Trade Route, Full Atlas |
| **The Archive** | Discontinued | Cairo, Kalahari, Ethiopia |

---

## THE CARAVAN (Locked)

### The Garden Route (10×3ml)
*Coordinates: 33.9636° S, 22.4617° E — George, South Africa*
CARMEL, MONACO, TOBAGO, MEDINA, SIWA, MANALI, MEISHAN, TARIFA, BAHIA, MALABAR

### The Trade Route (10×3ml)
*Coordinates: 39.6542° N, 66.9597° E — Samarkand, Uzbekistan*
HAVANA, RIYADH, SAMARKAND, MARRAKESH, HUDSON, SICILY, ASTORIA, ADEN, BIG SUR, TANGIERS

### The Full Atlas (28×3ml)
*Coordinates: 36.0143° N, 5.6044° W — Tarifa, Spain*
All 28 waypoints, all 4 territories.

**Pricing: TBD — need from Jordan**

---

## ALL 28 WAYPOINTS (Final)

### EMBER ($28 / $48)
| # | Waypoint | Legacy Name |
|---|----------|-------------|
| 1 | ADEN | Oud Fire |
| 2 | SAANA | Honey Oud |
| 3 | GRANADA | Granada Amber |
| 4 | MALABAR | Vanilla Sands |
| 5 | SERENGETI | Black Musk |
| 6 | BEIRUT | — (new, 1 Million type) |
| 7 | TARIFA | Teeb Musk |

### TIDAL ($30 / $50)
| # | Waypoint | Legacy Name |
|---|----------|-------------|
| 8 | BAHIA | Coconut Jasmine |
| 9 | BAHRAIN | Blue Oud |
| 10 | BIG SUR | Del Mar |
| 11 | MEISHAN | China Rain |
| 12 | MONACO | Dubai Musk |
| 13 | TANGIERS | Regatta |
| 14 | TIGRIS | — (new) |

### PETAL ($30 / $50)
| # | Waypoint | Legacy Name |
|---|----------|-------------|
| 15 | CARMEL | White Amber |
| 16 | DAMASCUS | Turkish Rose |
| 17 | TOBAGO | Arabian Jasmine |
| 18 | KANDY | Peach Memoir |
| 19 | MANALI | Himalayan Musk |
| 20 | MEDINA | Musk Tahara |
| 21 | SIWA | White Egyptian Musk |

### TERRA ($33 / $55)
| # | Waypoint | Legacy Name |
|---|----------|-------------|
| 22 | ASTORIA | Pacific Moss |
| 23 | HAVANA | Oud & Tobacco |
| 24 | HUDSON | Spanish Sandalwood |
| 25 | MARRAKESH | — |
| 26 | RIYADH | Black Oud |
| 27 | SAMARKAND | Oud Aura |
| 28 | SICILY | Sicilian Oudh |

---

## NAMING CHANGES (Quick Reference)

| Old → New | Legacy Name | Territory |
|---|---|---|
| Petra → **SAANA** | Honey Oud | Ember |
| Zanzibar → **MALABAR** | Vanilla Sands | Ember |
| Oman → **TARIFA** | Teeb Musk | Ember |
| Ethiopia → **BEIRUT** | (new scent) | Ember |
| Kyoto → **MEISHAN** | China Rain | Tidal |
| Dubai → **MONACO** | Dubai Musk | Tidal |
| Regatta → **TANGIERS** | Regatta | Tidal |
| Amer → **CARMEL** | White Amber | Petal |
| Grasse → **TOBAGO** | Arabian Jasmine | Petal |
| Tulum → **HUDSON** | Spanish Sandalwood | Terra |

---

## BRAND RULES

1. Never specify oud origin — just "Oud" or "Agarwood"
2. Never specify vanilla origin — just "Vanilla"
3. Never reference inspiration brand names in customer-facing copy
4. No "inspired by" language
5. Oud is always a NOTE in Atlas, never a raw material claim (Relic is different)
6. Product format: "glass wand applicator" NOT "roll-on"
7. Banned words: smell, nice, strong, cheap, good, buy, purchase, synthetics, loud, broadcast, project, indulge, pamper
8. Voice: 70% J. Peterman / 30% Eugene Schwartz
9. No em dashes in copy
10. Main site titles: Just the waypoint name
11. Etsy titles: WAYPOINT — [Scent Words] Perfume Oil | Niche Fragrance | Tarife Attar

---

## STILL NEEDS DOING (Priority)

### Immediate
1. Merge `brand-agent-docs` to `main` for production deploy
2. Verify Vercel build succeeds on main
3. Archive old Shopify products (OMAN, CHERISH, RITUAL, etc.)
4. Set inventory quantities on new Shopify products

### This Week
5. Finish master catalog spreadsheet (building)
6. Write Caravan Etsy listings (Garden Route, Trade Route, Full Atlas)
7. Write Relic Etsy listings
8. Start Etsy manual listing updates (28 Atlas + Archive + Caravan + Relic)
9. Create Etsy shop sections (Ember, Tidal, Petal, Terra, The Relic, The Caravan, The Archive)
10. Build interactive Atlas map

### Needs Pricing from Jordan
- The Garden Route (10×3ml) — $?
- The Trade Route (10×3ml) — $?
- The Full Atlas (28×3ml) — $?
- Relic products — individual pricing

### Next Phase
11. Build /about page
12. Build educational content (/guide/what-is-attar, etc.)
13. Build /faq with schema
14. Submit to Google Search Console
15. Etsy competitive audit
16. Etsy API automation (pending approval)

---

## ENVIRONMENT

- Sanity: 8h5l91ut / production
- Git Branch: brand-agent-docs
- Deploy: Vercel (auto on push)
- Etsy API: Pending approval (keystring: sh003squj548jpzm6af7st1c)

---

*To continue: "Continue Tarife Attar. Check HANDOFF.md for context, ATLAS_MASTER_28.md for source of truth."*
