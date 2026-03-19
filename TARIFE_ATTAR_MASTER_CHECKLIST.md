# TARIFE ATTAR — MASTER IMPLEMENTATION CHECKLIST
## March 18, 2026

---

## PHASE 1: PUSH DATA TO ALL PLATFORMS

- [x] Create robots.ts (allows Google, GPTBot, ClaudeBot, PerplexityBot)
- [x] Create sitemap.ts (dynamic from Sanity — all products, journal, field journal)
- [x] Update root layout metadata (metadataBase, title template, description, OG, Twitter)
- [x] Add Organization JSON-LD to root layout
- [x] Add generateMetadata + Product JSON-LD to product pages
- [x] Add homepage metadata
- [x] Add Atlas page metadata
- [x] Add Relic page metadata
- [x] Patch all 28 Atlas products with Shopify image URLs (23 patched, 5 already had images)
- [ ] Run Sanity ingest script (node scripts/ingest-fragrances.mjs)
- [ ] Delete old Sanity product drafts (REGALIA, OBSIDIAN, ONYX, CLARITY, RITUAL, TAHARA, CHERISH, DELMAR, DUBAI, OMAN, KYOTO, JASMINE, AMER, CARAVAN, ETHIOPIA)
- [ ] Clean up 40+ orphaned Shopify-synced products in Sanity (null title, null slug)
- [ ] Fix duplicate RIYADH document (delete the one without image)
- [ ] Import Shopify spreadsheet (Admin > Products > Import)
- [ ] Copy/paste all 28 Etsy listings from ETSY_ATLAS_LISTINGS.md
- [ ] Create Etsy shop sections: Ember, Tidal, Petal, Terra, The Archive
- [ ] Move CAIRO, KALAHARI, ETHIOPIA to The Archive section on Etsy
- [ ] Verify build compiles (npx tsc --noEmit)
- [ ] Deploy to production

---

## PHASE 2: URL REDIRECTS & CLEANUP

- [ ] Add 301 redirects in next.config.js:
  - [ ] /product/petra → /product/saana
  - [ ] /product/zanzibar → /product/malabar
  - [ ] /product/oman → /product/tarifa
  - [ ] /product/ethiopia → /product/beirut
  - [ ] /product/kyoto → /product/meishan
  - [ ] /product/dubai → /product/monaco
  - [ ] /product/amer → /product/carmel
  - [ ] /product/grasse → /product/tobago
  - [ ] /product/tulum → /product/hudson
  - [ ] /product/regatta → /product/tangiers
  - [ ] /product/regalia → /product/samarkand
  - [ ] /product/obsidian → /product/serengeti
  - [ ] /product/clarity → /product/manali
  - [ ] /product/ritual → /product/siwa
  - [ ] /product/cherish → /product/kandy
  - [ ] /product/tahara → /product/medina
  - [ ] /product/jasmine → /product/tobago
  - [ ] /product/delmar → /product/big-sur
  - [ ] /product/caravan → /product/saana
- [ ] Regenerate sitemap after all slugs are live
- [ ] Submit updated sitemap to Google Search Console

---

## PHASE 3: MAIN SITE UPDATES

- [ ] Update Atlas interactive map (add TARIFA as starting waypoint, update all renamed waypoints)
- [ ] Update territory pages (verify each territory lists correct 7 waypoints)
- [ ] Update product page template (waypoint name only as title, "Formerly known as" subtitle)
- [ ] Update navigation/menus for renamed products
- [ ] Build /archive page (CAIRO, KALAHARI, ETHIOPIA with "From the Vault" styling)
- [ ] Update Brand Brain doc (24 waypoints → 28)
- [ ] Verify all product images render correctly after slug changes
- [ ] Upload unique product photography (replace shared placeholder images)

---

## PHASE 4: SEO IMPLEMENTATION

- [ ] Run full SEO audit on tarifeattar.com (technical, meta, structured data, Core Web Vitals)
- [ ] Run Etsy marketplace SEO audit (competitive analysis, keyword gaps, review sentiment)
- [ ] Add structured data (JSON-LD) — Product schema on every product page
- [ ] Verify meta titles and descriptions render correctly on live site
- [ ] Add Open Graph and Twitter Card tags to remaining pages
- [ ] Implement internal linking strategy (territory → product, product → territory)
- [ ] Verify alt text for all images in Sanity CMS
- [ ] Page speed optimization (image compression, lazy loading, font optimization)
- [ ] Remove debug fetch in atlas/page.tsx lines 94-108 (hitting 127.0.0.1:7243 on every render)

---

## PHASE 5: GEO (GENERATIVE ENGINE OPTIMIZATION)

- [ ] Create /about page (brand story, sourcing, credentials, Organization schema)
- [ ] Create /guide/what-is-attar (educational, FAQ schema)
- [ ] Create /guide/perfume-oil-vs-eau-de-parfum (comparison, FAQ schema)
- [ ] Create /guide/how-to-apply-perfume-oil (HowTo schema)
- [ ] Create /guide/what-is-oud (educational, FAQ schema)
- [ ] Create /faq master FAQ page (FAQPage schema)
- [ ] Add entity definition text to homepage ("Tarife Attar is a niche perfume oil brand...")
- [ ] Add Article JSON-LD to Journal and Field Journal entries
- [ ] Add BreadcrumbList JSON-LD across all pages
- [ ] Submit brand to Fragrantica and Basenotes databases

---

## PHASE 6: ETSY COMPETITIVE POSITIONING

- [ ] Complete Etsy competitive audit (top 10 perfume oil sellers)
- [ ] Harvest review sentiment keywords from your reviews + competitor reviews
- [ ] Optimize all 13 tags per listing based on competitive analysis
- [ ] Develop Etsy Ads strategy (which products, which keywords)
- [ ] Improve listing quality score (first photo, conversion rate, response time)
- [ ] Build Etsy API automation script (ready for when app is approved)
- [ ] Follow up with Etsy developer support on API approval (email sent to developer@etsy.com)

---

## PHASE 7: ONGOING MAINTENANCE

- [ ] Monitor Google Search Console weekly (impressions, clicks, position)
- [ ] Monitor Etsy search analytics weekly (which terms drive views/sales)
- [ ] Update listings monthly based on performance (rotate tags, test titles)
- [ ] Respond to all reviews (builds shop quality score)
- [ ] Keep Shopify, Etsy, and site inventory synced

---

## NAMING CHANGES QUICK REFERENCE

| Old Name → New Waypoint | Legacy Name | Territory |
|---|---|---|
| Petra → SAANA | Honey Oud | Ember |
| Zanzibar → MALABAR | Vanilla Sands | Ember |
| Oman → TARIFA | Teeb Musk | Ember |
| Ethiopia → BEIRUT | (new scent) | Ember |
| Kyoto → MEISHAN | China Rain | Tidal |
| Dubai → MONACO | Dubai Musk | Tidal |
| Regatta → TANGIERS | Regatta | Tidal |
| Amer → CARMEL | White Amber | Petal |
| Grasse → TOBAGO | Arabian Jasmine | Petal |
| Tulum → HUDSON | Spanish Sandalwood | Terra |

---

## KEY FILES

| File | Location |
|---|---|
| Master Reference (28 waypoints) | ATLAS_MASTER_28.md |
| Etsy Listings | ETSY_ATLAS_LISTINGS.md |
| Shopify Import Spreadsheet | Tarife_Attar_Atlas_Shopify_Import_v3.xlsx |
| Sanity Ingest Script | scripts/ingest-fragrances.mjs |
| Image Patch Script | scripts/patch-images.mjs |
| Evocation Copy | scripts/evocation-copy.mjs |
| SEO: robots.ts | src/app/robots.ts |
| SEO: sitemap.ts | src/app/sitemap.ts |

---

*Last updated: March 18, 2026*
