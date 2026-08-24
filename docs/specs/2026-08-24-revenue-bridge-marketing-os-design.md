# Tarifé Attär Revenue Bridge Marketing OS Design

**Status:** Approved strategy, implementation review checkpoint

**Date:** 2026-08-24

**Owner:** Jordan Richter

**Execution system:** ClickUp

**Commerce source of truth:** Shopify

## 1. Objective

Build a low-budget marketing operating system that converts the reconciled Shopify inventory into near-term revenue while establishing durable SEO, Google, email, and Meta acquisition infrastructure.

The operating posture is aggressive growth after the minimum sales and measurement blockers are cleared. Free and owned distribution is used first. Paid Meta amplification begins only after an offer and creative concept demonstrate revenue potential.

## 2. Sources of truth

- Shopify owns products, variants, inventory, customers, orders, discounts, and commerce performance.
- ClickUp owns marketing execution, recurring work, approvals, deadlines, and campaign reporting.
- Google Search Console owns organic search performance.
- Google Analytics owns behavior on the headless storefront.
- Google Merchant Center owns Google product-feed approval and free-listing diagnostics.
- Meta Ads Manager owns paid Meta delivery and spend performance.
- Google Drive owns shared source creatives and approved deliverables.
- AIOS owns durable marketing strategy, decisions, playbooks, and routing.
- Etsy is historical context only and must not be treated as an active commerce channel.

## 3. Current commercial baseline

### Inventory

| Inventory class | Units | Full-price value |
|---|---:|---:|
| 3ml | 444 | $10,744 |
| 6ml | 195 | $5,851 |
| 12ml | 194 | $9,712 |
| Traveler Sets | 11 | $1,045 |
| Other sellable stock | 2 | $80 |
| **Total** | **846** | **$27,432** |

The largest inventory constraint is not lack of stock. It is the lack of an effective storefront path for the 444 units of 3ml inventory. Live product pages currently expose 6ml and 12ml selections, while only two 3ml units were recorded as sold between February 1 and August 24, 2026.

### Deep-stock products

| Product | Units | Full-price value |
|---|---:|---:|
| BIG SUR | 167 | $4,857 |
| TOBAGO | 113 | $3,377 |
| SICILY | 94 | $2,516 |
| HUDSON | 93 | $2,751 |
| SAMARKAND | 92 | $2,528 |
| **Top-five concentration** | **559** | **$16,029** |

### Recent sales

- August 1 through August 24: $4,172.35 from 64 paid orders.
- August AOV: $65.19.
- Straight-line August projection: approximately $5,400.
- February 1 through August 24 AOV: $58.57 across 226 paid orders.
- August 8 through August 14 produced $2,516.87 from 40 orders.
- Twenty-seven orders in that spike used `THE OPEN ATLAS - 40%`, producing $1,450.46 net revenue while giving up $879.55 in discounts.
- Thirteen non-promotional orders in the same week produced $1,066.41 at an $82.03 AOV.
- Recent orders contain no reliable UTM attribution.

## 4. Approaches considered

### A. Revenue Bridge, recommended

Clear the storefront and measurement blockers, monetize 3ml inventory, reactivate existing customers, activate free Google and Shopify discovery, then fund one controlled Meta test from attributable owned-channel revenue.

**Tradeoff:** Requires several operational fixes before traffic is scaled, but creates the strongest combination of speed, capital efficiency, and measurement.

### B. SEO-first growth

Concentrate resources on technical SEO, commercial guides, and Google indexing before running campaigns.

**Tradeoff:** Lowest cash requirement and strongest compounding effect, but too slow to serve the immediate inventory and revenue objective by itself.

### C. Paid Meta first

Use existing creative assets to buy traffic immediately.

**Tradeoff:** Fastest reach, but unacceptable before 3ml merchandising, site analytics, Meta events, public policies, and reliable attribution are operating.

## 5. Approved operating model

The approved model is the Revenue Bridge.

### First 30-day revenue goal

| Week | Revenue target | Orders at $65 AOV | Primary job |
|---|---:|---:|---|
| Week 1 | $1,500 | 23 | Clear blockers and reactivate engaged customers |
| Week 2 | $1,750 | 27 | Launch the 3ml discovery offer |
| Week 3 | $2,250 | 35 | Win-back, repeat-buyer, SEO, Google, and organic Meta amplification |
| Week 4 | $2,500 | 38 | Scale the winning owned offer and unlock a controlled Meta test |
| **Total** | **$8,000** | **123** | **Approximately 48% above current projected monthly pace** |

The stretch goal is $10,000 and approximately 154 orders. The previous $20,000 concept becomes a 60 to 90-day milestone because it would require approximately 307 orders at the current August AOV and would consume about 73% of the current retail inventory value before replenishment.

## 6. Minimum blockers

The following items must be complete before paid traffic begins:

1. A purchasable 3ml discovery offer is available on the headless storefront.
2. The homepage no longer makes the 11-unit Traveler Set the dominant acquisition offer.
3. Public shipping, return, contact, and privacy information is accessible without using the concierge.
4. GA4 and Google Search Console are connected.
5. Meta ViewContent, AddToCart, InitiateCheckout, and Purchase events pass end-to-end tests.
6. Campaign links use a documented UTM convention.
7. Product structured data includes a valid image and accurate offer information.
8. The inaccessible Etsy profile is removed from active Organization structured data and current marketing references.
9. Merchant Center and Meta catalog product errors are reviewed and corrected.

## 7. Immediate revenue system

### Lead offer

Create a fixed Shopify bundle called **First Coordinates**:

- BIG SUR 3ml
- TOBAGO 3ml
- SAMARKAND 3ml
- Proposed price: $65
- Component retail value: approximately $71
- Current maximum capacity: 79 bundles
- Current revenue capacity: $5,135

The bundle must use component-level inventory tracking. The free first-party Shopify Bundles app is the preferred implementation. Open mix-and-match behavior is out of scope for the first release.

### Secondary merchandising

- Feature SICILY and SERENGETI as proven products with useful available inventory.
- Use HUDSON as a creative test rather than assuming deep inventory equals demand.
- Keep low-stock DAMASCUS, KANDY, Musk Gazelle, and the Traveler Set out of broad acquisition campaigns.
- Use real low-stock messaging only when the relevant Shopify quantity supports it.

### Email program

The first 30 days use targeted, consented Shopify segments and remain within the current communication SOP.

1. Reintroduction and legacy-name navigation.
2. First Coordinates launch.
3. Territory education, quiz, and product recommendation.
4. Winning product or territory follow-up.
5. Win-back automation for eligible previous buyers.
6. Existing welcome and abandoned-checkout automations remain active.

The program should use Shopify's included monthly email allowance and protect deliverability through engaged segments, smart delivery, authentication, and controlled frequency.

## 8. SEO system

### Technical foundation

- Add image data to Product structured data.
- Add accurate Offer URLs and variant relationships.
- Add crawlable shipping and return information.
- Correct truncated product meta descriptions.
- Add missing product images and descriptive alt text.
- Validate product pages with Google's Rich Results Test.
- Submit the sitemap in Search Console.
- Measure organic clicks in Search Console and on-site behavior in GA4.
- Preserve former product names in page copy and metadata.

### Search-first page architecture

The Atlas and territory language remains the premium brand layer. A search-first guide layer is added to capture customer language:

- Perfume oils
- Attar perfume oils
- Alcohol-free fragrance
- Oud perfume oils
- Musk perfume oils
- Musk Tahara and white musk
- Jasmine and floral perfume oils
- Perfume oil discovery sets and samples
- How to apply perfume oil
- How to layer perfume oil
- Legacy Tarife Attar names and their current Atlas names

Publish one high-intent guide per week during the first 30 days. Each guide must answer a real customer question, link to relevant in-stock products, and provide a reusable source for email and Meta content.

## 9. Google system

### Merchant Center

Google Merchant Center free listings are the first Google growth priority.

- Connect the Google and YouTube Shopify channel.
- Confirm free listings are enabled.
- Correct the two active products missing images.
- Complete the four active products missing Shopify SEO fields.
- Confirm specific perfume-oil product categories.
- Supply Tarife Attar as the brand and legitimate MPN data where GTINs do not exist.
- Add shipping and return information.
- Review the Merchant Center `Needs attention` report weekly.
- Add UTMs to product-feed landing links where supported and report free-listing clicks separately from paid traffic.

### Google Business Profile

The profile is used only if Tarifé Attär meets Google's in-person eligibility requirements through a legitimate staffed showroom or service interaction.

If eligible:

- Complete categories, hours, appointment link, website link, products, photos, and description.
- Publish one weekly update using the same campaign narrative as email and Meta.
- Request honest reviews after genuine customer experiences without incentives.
- Add UTMs to website and appointment links.

If ineligible, Merchant Center, Search Console, and organic search replace Business Profile activity.

## 10. Meta system

### Organic content

Use three repeatable themes:

1. Scent translation: what notes feel like on skin.
2. Ritual: application, layering, longevity, and intimacy.
3. Journey and proof: place, material, legacy-name recognition, and customer experience.

Weekly cadence:

- Three short-form videos or reels.
- One product or territory carousel.
- Stories supporting each email campaign.
- One customer-proof or educational post.

Existing local and Google Drive assets are reused before commissioning new creative production.

### Catalog and measurement

- Connect the Shopify Facebook and Instagram sales channel.
- Sync only active, correctly merchandised products.
- Resolve catalog errors.
- Validate the Meta pixel and Conversions API across the headless site and Shopify checkout.
- Build a 30-day catalog retargeting audience after measurement is working.

### Paid unlock

Paid Meta begins only when:

- Measurement passes end to end.
- First Coordinates or an equivalent 3ml offer is live.
- Public policies are visible.
- One owned campaign concept produces at least $1,500 in attributable revenue.
- A creative and offer combination clearly outperforms the alternatives.

The first test is capped at $300, funded from attributable owned-channel revenue, and uses one consolidated sales campaign with no more than three existing creatives.

Interim guardrails:

- Target at least 3.0x attributed revenue on ad spend until gross-margin data provides a definitive CAC ceiling.
- Do not scale a creative without at least three purchases.
- Increase budget no more than 20% every three days while the guardrail holds.
- Pause a creative after it spends approximately one target CAC without producing a purchase.

## 11. Creative asset consolidation

After Google Drive access is available, index creative assets without moving or duplicating source files.

Each approved asset receives:

- Product or territory
- Asset type
- Orientation and dimensions
- Funnel stage
- Channel suitability
- Rights or usage status
- Quality status
- Campaign history
- Source link

The first creative audit prioritizes BIG SUR, TOBAGO, SAMARKAND, SICILY, SERENGETI, and the discovery bundle. New paid creative production begins only after existing assets are audited and the first owned-channel tests identify a winning concept.

## 12. ClickUp design

Use the existing Tarifé Attär Marketing folder and existing lists.

### Campaigns list

Create one parent campaign:

`30-Day Revenue Bridge | $8K Goal`

Create weekly campaign tasks beneath it for email, organic Meta, SEO guides, Google posts, and any approved paid test.

Required fields:

- Channel
- Funnel stage
- Offer
- Hero product or SKU
- Inventory available at launch
- Audience segment
- Target revenue
- Actual revenue
- Campaign URL and UTM
- Spend
- ROAS
- Creative source link
- Approval status
- Publish date
- Owner

### Lifecycle Automations list

Track:

- Welcome
- Abandoned checkout
- Win-back
- Post-purchase education
- Review request, where eligible

Each automation must document eligibility, suppression, frequency, measurement, and current live status.

### Operational Notifications list

Track recurring or exception-driven work:

- Merchant Center disapprovals
- Meta catalog errors
- Tracking failures
- Low-stock campaign alerts
- Broken URLs
- Email deliverability warnings

No software implementation task is duplicated into ClickUp. Code changes remain in the software-build tracking lane. ClickUp owns marketing and operational execution.

## 13. Command-center visual

Create a simple wide visual artifact with six sections:

1. **Revenue:** $8,000 monthly goal, actual revenue, pace, orders, and AOV.
2. **Inventory:** 846 units, $27,432 value, size mix, and the 3ml monetization gap.
3. **Concentration:** top deep-stock products and low-stock exclusions.
4. **Four-week plan:** weekly targets and primary campaign.
5. **Channels:** Shopify/email, SEO, Google, and Meta with readiness status.
6. **Paid gate:** required conditions, released budget, current spend, and ROAS.

The artifact is a decision surface, not a dense report. It should be premium, restrained, and readable at a glance. Shopify values are labeled with their refresh timestamp.

## 14. Weekly scorecard

Primary metrics:

- Revenue
- Orders
- AOV
- Full-price revenue percentage
- Units sold by size
- Revenue by hero product
- Email click rate and attributable revenue
- Store conversion rate
- Add-to-cart and checkout completion
- Google organic clicks
- Google free-listing clicks
- Meta organic profile or site actions
- Meta spend, CAC, and ROAS after unlock

Open rate is diagnostic only and is not treated as the primary email success metric.

## 15. Implementation boundaries

- No ClickUp, Shopify, Meta, Google, or Google Drive write occurs without the implementation plan derived from this reviewed design.
- No existing user files or ClickUp structures are replaced.
- No customer PII is copied into AIOS, specifications, creative indexes, or visual artifacts.
- No paid campaign launches without a final budget and measurement check.
- No artificial scarcity is used.
- No GTIN or product identifier is invented.
- Etsy is excluded from current-channel execution.

## 16. Acceptance criteria

The first release is complete when:

1. The approved ClickUp campaign and operational structure exists without duplicating software tasks.
2. The command-center visual renders the reconciled Shopify baseline and weekly revenue goal.
3. The 3ml discovery offer has an approved implementation task and inventory-safe design.
4. All minimum blockers have assigned owners, due dates, and verification criteria.
5. Every campaign task includes its product, inventory, revenue target, UTM, and measurement plan.
6. Paid Meta remains locked until the documented conditions are satisfied.
7. A weekly scorecard can be updated from Shopify, Google, email, and Meta data without using customer PII.

## 17. Remaining implementation inputs

These inputs refine execution but do not change the approved operating model:

- Confirm whether the private showroom satisfies Google Business Profile in-person eligibility.
- Confirm product gross margin or contribution margin before replacing the interim 3.0x ROAS guardrail with a definitive CAC ceiling.
- Confirm inventory replenishment capacity before setting the second-month revenue target.
- Provide Google Drive access for the creative asset index.
