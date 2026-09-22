# Handoff: 3 ml offer, 22 September 2026

State of the "any three 3 ml for $50" offer and the decisions made so far, so
another session can pick up where this one stopped.

## What is on this branch

- Everything on `main` as of PR #11 (site header, customer service portal,
  3 ml banner and pricing, concierge fixes).
- The unmerged campaign work from `claude/tarife-attar-marketing-5fb2ab`:
  `campaigns/2026-09-15-3ml-route/` holds the 15 September "send one" email
  (dark, light and Custom Liquid section variants), the hero plates and their
  generators, and rendered proofs. That email featured the six 3 ml waypoints
  and a 22 September end date.
- This note.

## How the 3 ml size works today

- **Site code is already on `main`.** `ProductDetailClient.tsx` offers 3 ml only
  when the Sanity product has `shopifyVariant3mlId`; stock per size decides
  whether it can be bought. The banner (`SiteHeader.tsx`) links to `/atlas`,
  which does not say which waypoints come in 3 ml.
- **Sanity:** six products carry a 3 ml variant ID, all published:
  Big Sur, Hudson, Marrakesh, Samarkand, Sicily, Tobago.
- **Shopify (checked 22 Sep):** only those six products have a `3ml` variant, all
  $23 and in stock (Big Sur 86, Sicily 78, Samarkand 75, Tobago 67, Hudson 65,
  Marrakesh 22). The other 22 Atlas products have only 6ml and 12ml.
- **Discount:** automatic discount "Any three 3 ml, $50"
  (`gid://shopify/DiscountAutomaticNode/1572002300186`): $19 off once per order,
  minimum quantity 3, limited to the six 3 ml variant IDs above. Extended on
  22 Sep to end `2026-09-29T06:59:00Z` (28 Sep, 11:59 PM Pacific).

## Decisions from Jordan (22 Sep), not yet carried out

1. **Done:** deal extended through Sunday 28 September, 11:59 PM Pacific, in
   Shopify, the site banner and the concierge prompt.
2. **Every product gets a 3 ml option; stock alone decides availability.** Add a
   `3ml` value to the `Size` option of the 22 Atlas products that lack one, at
   $23, inventory tracked, policy DENY, starting at 0 stock. Follow the existing
   SKU pattern (`<TERRITORY>-<HANDLE>-3ML`, e.g. `TIDAL-BIG-SUR-3ML`, territory
   taken from the product's 6ml SKU) and weight 0.6 oz.
   Then:
   - add each new variant ID to the discount's eligible variants;
   - write each ID to `shopifyVariant3mlId` on the Sanity product (project
     `8h5l91ut`, dataset `production`);
   - update the concierge prompt in `src/app/api/chat/route.ts`, which still
     says only six waypoints come in 3 ml;
   - update the banner in `src/components/navigation/SiteHeader.tsx`, which
     says "Six waypoints in 3 ml";
   - consider pointing the banner at a view that shows which 3 ml sizes are in
     stock, since customers currently can't tell.
3. **New email:** HTML email for the deal featuring only the 3 ml waypoints in
   stock at send time, with the 28 September end date, sent to **Tier 1**
   after the consent check (`presend-consent-check`, then
   `tarife-email-campaign`).

## Running locally

`npm ci`, then `.env.local` with at least:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=8h5l91ut
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

and `npm run dev`. In Claude Code cloud sessions, `*.api.sanity.io` and
`*.apicdn.sanity.io` must be in the environment's network allowlist or every
product page fails with a 403 from the proxy.
