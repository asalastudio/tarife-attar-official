# Shopify Messaging attribution repair — PST-278

Owner: Codex for code and validation; Jordan for release approval and business acceptance.
Status: implemented locally and browser tested; not deployed; Messaging order attribution not yet verified.

## Confirmed problem

Jordan identified Shopify Messaging as the affected report. The August 11 commit `f15edae` originally carried campaign parameters into checkout. Later consent-aware work replaced that handoff with a URL validator and a namespaced `ta_*` cart ledger. The ledger is useful diagnostic data, but is not Shopify Messaging's native session/conversion tracking.

Production baseline at `ddea03d`, October 12 PT:
- A synthetic `shopify_email` landing stored its campaign in the ledger and cart attributes.
- Checkout had only its capability parameter; campaign parameters were missing.
- No Shopify page-view or add-to-cart analytics events were observed. Monorail traffic was privacy telemetry only.
- Source had no Shopify session headers on cart requests.
- `buildAttributionAttributePatch` conflated an empty replacement with no change. With only `ta_*` attributes, withdrawal could leave attribution on the cart.

A received October 8 campaign used Shopify's `/_t/c/v` tracked links. Its recipient-specific links were not clicked or copied into this repository. Exact attribution to a Messaging activity is still an admin-side acceptance check.

## Implemented

- Pin Shopify's official `@shopify/hydrogen-react` analytics SDK at 2026.4.4. Read public shop ID/currency/language from the existing Storefront connection; no additional production secret is required.
- Send native Shopify page views after analytics permission, including client route changes, and add-to-cart only after Shopify accepts the mutation.
- Preserve the original landing while waiting briefly for Shopify's session token initialization. Use supported SDK token readers instead of inventing IDs or depending directly on deprecated cookies.
- Attach the same SDK token values to cross-domain Storefront requests, using Shopify's header contract.
- Retain campaign UTMs at normal and recovered checkout handoff without changing Shopify's hostname, key, or discount parameters. Wait for attribution resolution on recovery.
- Make consent withdrawal send an empty attribute replacement when appropriate; keep checkout gated until synchronization. Do not forward stored campaign parameters after marketing rejection.
- Strip arbitrary URL query data and cart secrets from measurement payloads. Shopify-hosted checkout remains the purchase-event owner.

## Verification

- 79 tests pass; TypeScript passes; lint passes with existing repository warnings.
- Metadata query validated against Storefront API 2026-01.
- Isolated mobile Chrome routed application requests to the local patch while keeping the production browser origin for Shopify privacy. Shopify consent, Storefront API and analytics endpoints were real. This was not a production deployment.
- Tagged landing and cart route emitted native page events; a successful addition emitted `product_added_to_cart`. All three event batches returned HTTP 200 (empty success responses).
- Requests after SDK session initialization carried both unique and visit tokens. Initial non-measurement catalog/cart creation requests may precede token readiness; the successful cart addition carried the identifiers.
- Campaign present in ledger, cart, checkout link and the actual Shopify checkout page. Email field visible; no contact/payment data entered and no order placed.
- Real Shopify preferences UI: Decline all changed effective permissions, cleared the ledger and every `ta_*` cart key, and removed campaign parameters from the still-usable checkout link. Accept all allowed the tagged checkout test again.
- Recovered-checkout initialization tested with an intercepted synthetic destination; campaign and capability preserved.
- Evidence: `docs/evidence/shopify-messaging-2026-10-12/`. Development HMR WebSocket failure under the production-origin test proxy is a harness limitation. Checkout also logged optional-resource HTTP 401/403 responses; the form loaded and no payment was attempted. These checks do not establish payment completion.

## Remaining acceptance gates

1. Jordan approves this separate attribution release. The previous approval covered PR #16's storefront corrections only.
2. Deploy and repeat the tagged landing → cart → checkout and consent tests against the deployed build.
3. In authenticated Shopify Admin, inspect Messaging activity reporting and tracking settings. Preserve the actual campaign/activity identifier in Messaging links. No callable Admin connector is available in this session.
4. With separate authorization for any customer send or charge, use a controlled real Messaging campaign journey/order, or inspect the next naturally occurring campaign order. Compare the order's conversion details, `ta_*` evidence and the named Messaging activity's sessions/orders/sales after reporting processes it. A preview/test email or a synthetic UTM alone does not establish a real campaign conversion.
5. Mark the Messaging gate complete only with report evidence. HTTP 200, cart attributes and checkout UTMs do not by themselves prove attributed revenue. Do not backfill historical sales or promise recovery of prior missing attribution.

No sends, activations, ad spend, production publish, purchase, or gift shipment are authorized by this repair. GA4 and Meta purchase validation remain separate gates in the parent attribution runbook.

## Sources

- [Shopify Messaging email analytics](https://help.shopify.com/en/manual/promoting-marketing/analyze-marketing/shopify-email-analytics): native store data, default campaign UTM includes activity ID, last non-direct click model.
- [sendShopifyAnalytics](https://shopify.dev/docs/api/hydrogen-react/latest/utilities/sendshopifyanalytics): supported native page-view and add-to-cart transport.
- [getTrackingValues](https://shopify.dev/docs/api/hydrogen-react/latest/utilities/gettrackingvalues): current session readers through Customer Privacy API.
- [Shopify cookie deprecation](https://shopify.dev/changelog/posts/shopifyy-and-shopifys-cookies-will-no-longer-be-set).
- SDK 2026.4.4 `cart-hooks` source: cross-domain Storefront tracking header behavior used here.
