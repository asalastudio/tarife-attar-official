# Headless Attribution and Measurement Design

**Status:** Approved direction; implementation specification  
**Date:** 2026-08-24  
**Business gate:** Revenue Bridge owned email remains blocked until the owned-channel release test passes. Paid Meta remains blocked until the Meta release test passes.

## Purpose

Create a durable, consent-aware attribution and ecommerce measurement system for the Tarifé Attär headless storefront and Shopify checkout. Shopify must retain campaign context on the final order even when browser analytics fail, while GA4 and Meta receive complete, deduplicated ecommerce events only when the applicable privacy permissions allow them.

## Current state

- `www.tarifeattar.com` is a Next.js headless storefront.
- Shopify reports `vasana-perfumes.myshopify.com` as the current primary and checkout domain.
- Carts are created with an empty `CartInput` and no attribution attributes.
- Existing carts are not updated with attribution.
- The storefront has no GA4, Meta Pixel, consent manager, or Shopify Customer Events implementation.
- Checkout is reached with a JavaScript redirect, and checkout URLs are rewritten to the `myshopify.com` host.
- The CSP does not allow Google or Meta measurement endpoints.
- Cart mutations do not request or handle Shopify `userErrors`.
- The cart accepts an arbitrary HTTP(S) `checkout_url` query parameter.
- Cart identifiers and checkout URLs are written to browser logs.
- The cart reminder form does not collect distinct marketing consent, and its API can report success when Omnisend is unavailable or rejects the request.

## Architectural decisions

### First-party checkout domain

Shopify checkout will move to `checkout.tarifeattar.com`. The headless storefront remains at `www.tarifeattar.com`.

This is required because Shopify's Customer Privacy API cannot reliably carry consent between unrelated root domains. The first-party checkout subdomain also improves trust and reduces attribution discontinuity. The implementation must not hardcode the checkout host; it will use `NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN`.

The legacy `vasana-perfumes.myshopify.com` domain remains an allowed Shopify host during migration, but it is not the target production checkout domain and must be removed from GA4 cross-domain configuration after the first-party checkout is verified.

### Native-first platform integrations

- Shopify cart attributes provide the order-level attribution ledger.
- Shopify Customer Privacy API and Shopify's configured privacy banner provide the consent authority across storefront and checkout.
- GA4 uses one property across the headless storefront and Shopify checkout.
- Shopify Customer Events, the Google & YouTube channel, or an approved Shopify Web Pixel supplies checkout events that the headless frontend cannot observe.
- The Meta sales channel is preferred for checkout Purchase and Conversions API delivery. The headless storefront supplies pre-checkout browser events.

Custom server relays are added only when native integrations cannot pass the release tests. This avoids building and maintaining an unnecessary event pipeline.

## Scope and phases

### Phase 1: owned-channel gate

Repository-controlled work:

1. Attribution capture, persistence, and Shopify cart synchronization.
2. Shopify mutation error handling.
3. Checkout URL allowlisting and log removal.
4. Cart reminder and Omnisend consent/error hardening.
5. Shopify Customer Privacy API integration and consent-controlled GA4 loading.
6. Storefront GA4 ecommerce events.
7. CSP updates for explicitly required Shopify and Google endpoints.

Account-controlled work:

1. Add and verify `checkout.tarifeattar.com` in Shopify and DNS.
2. Configure the Shopify privacy banner regions and preferences.
3. Connect the selected GA4 property through an approved Shopify checkout integration.
4. Configure GA4 cross-domain measurement for `www.tarifeattar.com` and `checkout.tarifeattar.com`.
5. Verify the complete funnel and the resulting Shopify order in production.

### Phase 2: paid Meta gate

1. Add consent-controlled Meta Pixel events to the headless storefront.
2. Configure Shopify checkout Purchase through the Meta sales channel.
3. Confirm Conversions API is active.
4. Confirm browser/server event IDs deduplicate.
5. Confirm product identifiers match the Shopify-backed Meta catalog.
6. Reconcile one test conversion against Shopify revenue.

## Attribution ledger

### Touch model

The ledger contains separate `first` and `latest` touch records.

A touch includes:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `landing_page`
- `referrer`
- `gclid`
- `fbclid`
- `captured_at`

Rules:

1. First touch is immutable once persisted.
2. Internal navigation never creates or overwrites a touch.
3. Latest touch changes only when a new inbound page load contains a recognized campaign/click identifier or an external referrer.
4. A first visit with no campaign parameters and no external referrer is recorded as direct only when marketing processing is allowed.
5. URL fragments are discarded.
6. Landing pages retain origin, path, and recognized attribution parameters only. Unrelated query parameters are discarded to avoid retaining accidental sensitive data.
7. Referrers retain origin and path, not query parameters.
8. UTM and click identifiers are length-limited and stripped of control characters before storage or Shopify submission.
9. No email address, customer name, cart token, or other direct identifier is stored in the attribution ledger.

### Consent behavior

The Shopify Customer Privacy API is the authority.

- If marketing processing is allowed, attribution may be persisted locally and synchronized to Shopify.
- Before the privacy API is ready, or when marketing is not allowed, attribution is held only in application memory for the current page lifecycle and is not written to persistent browser storage or Shopify.
- If the visitor grants marketing consent during the session, the pending inbound touch becomes eligible for persistence and cart synchronization.
- Rejecting marketing prevents attribution persistence and Meta events.
- Rejecting analytics prevents GA4 from loading or emitting events.
- Functional cart storage remains available because it is required to provide the cart and checkout service.

This implementation is a technical control, not a substitute for legal review of privacy text and regional settings.

### Storage and Shopify schema

The browser stores a versioned JSON ledger under a single namespaced key. Invalid, expired, or unknown-version data is ignored safely.

Shopify receives flattened, namespaced cart attributes:

```text
ta_attribution_version
ta_first_utm_source
ta_first_utm_medium
ta_first_utm_campaign
ta_first_utm_content
ta_first_utm_term
ta_first_landing_page
ta_first_referrer
ta_first_gclid
ta_first_fbclid
ta_first_captured_at
ta_latest_utm_source
ta_latest_utm_medium
ta_latest_utm_campaign
ta_latest_utm_content
ta_latest_utm_term
ta_latest_landing_page
ta_latest_referrer
ta_latest_gclid
ta_latest_fbclid
ta_latest_captured_at
```

Empty optional values are omitted. Attribute creation is deterministic so repeated synchronization is idempotent. The application never writes outside the `ta_` namespace.

### Cart data flow

1. The attribution layer initializes before cart creation.
2. It parses the inbound URL and external referrer.
3. It consults Shopify privacy permissions.
4. When marketing is allowed, it merges the inbound touch into the versioned ledger.
5. `cartCreate` receives the current attribution attributes in `CartInput.attributes`.
6. When an existing cart is restored, `cartAttributesUpdate` receives the current attribution attributes.
7. A consent change or a qualified new inbound touch triggers an idempotent update for the active cart.
8. Every cart mutation requests `userErrors` and warnings. User errors become actionable application errors instead of silent failures.
9. The order-level verification test confirms the `ta_` values in `Order.customAttributes` after checkout.

## Checkout hardening

- Checkout URLs must use HTTPS and an exact allowlisted hostname.
- Allowed hosts come from `NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN` and `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` during migration.
- Arbitrary `http`/`https` URLs are rejected.
- Legacy abandoned-cart `checkout_url` links remain supported only when the URL passes the same allowlist.
- The normal checkout control becomes an anchor using Shopify's returned checkout URL. This allows analytics link decoration and preserves standard browser behavior.
- Unsupported `return_to` and `redirect` query parameters are removed.
- Cart IDs, cart secrets, raw checkout URLs, Shopify mutation payloads, and customer emails are not logged.
- Cart IDs from recovery links are treated as secrets and are not copied into analytics events.

## Cart reminder and Omnisend

The cart reminder and marketing subscription are separate choices.

- The form collects the email needed to deliver the requested reminder.
- A distinct unchecked checkbox controls ongoing marketing consent.
- The API receives an explicit boolean `marketingConsent`.
- Omnisend email channel status is `subscribed` only when that boolean is true; otherwise it is `nonSubscribed`.
- The API returns `503` when Omnisend is not configured, an appropriate upstream error when Omnisend rejects the contact, and `500` for unexpected failures.
- The UI reports success only for a successful upstream result.
- The UI shows a retryable error when delivery cannot be registered.
- Customer email addresses are never written to application logs.
- Local browser storage does not keep a plaintext archive of customer email addresses or saved carts after submission.

## GA4 design

### Storefront loading

GA4 uses `NEXT_PUBLIC_GA4_MEASUREMENT_ID`. The tag loads only when Shopify reports analytics processing is allowed. Consent changes are handled without requiring a page refresh.

### Storefront events

- `view_item`: emitted once for the active product/variant view.
- `add_to_cart`: emitted only after Shopify confirms the cart mutation.
- `view_cart`: emitted when the cart becomes viewable with its current items and value.
- `begin_checkout`: emitted once when the visitor activates a valid checkout link.

All events use a shared item mapper with stable Shopify product/variant identifiers, item name, variant, unit price, quantity, and currency. Events do not include cart IDs, emails, or other prohibited data.

### Checkout events

The Shopify checkout integration maps:

- `checkout_shipping_info_submitted` to `add_shipping_info`
- `payment_info_submitted` to `add_payment_info`
- `checkout_completed` to `purchase`

`purchase.transaction_id` is the stable Shopify order ID. Value, currency, tax, shipping, discounts, and item data come from the completed Shopify checkout event. Repeated thank-you or order-status views must not create a second transaction.

The final integration choice between Google's Shopify channel and a Shopify Web Pixel is determined by the release test. The native channel is preferred; a custom pixel is used only if the native channel cannot emit the required events into the selected property.

### Domain continuity

GA4 cross-domain configuration uses:

- `www.tarifeattar.com`
- `checkout.tarifeattar.com`

The current `vasana-perfumes.myshopify.com` host is included only during migration testing. A normal decorated anchor handoff is required; JavaScript-only navigation is not used for the standard checkout path.

## Meta design

- The storefront Pixel loads only when marketing processing and applicable data-sharing permission are allowed.
- `ViewContent`, `AddToCart`, and `InitiateCheckout` use Shopify catalog-compatible content identifiers.
- Shopify checkout emits `Purchase` through the Meta sales channel.
- Browser and server purchase events share an event ID and are verified as deduplicated in Meta Test Events.
- Conversions API credentials remain in Shopify/Meta configuration or server-only secrets; none are shipped to the browser.
- Meta is not added to the CSP or production bundle until the paid-gate phase begins.

## Components and file boundaries

The implementation will introduce focused units rather than placing measurement logic inside the existing cart component:

- `src/lib/attribution/*`: pure parsing, sanitization, merge, serialization, and checkout URL validation.
- `src/context/AttributionContext.tsx`: browser lifecycle, privacy state, persistence, and active-ledger access.
- `src/lib/analytics/*`: consent-aware GA4 loader and typed ecommerce event adapters.
- `src/components/privacy/*`: Shopify privacy API/bootstrap integration and preference entry point.
- `src/context/ShopifyCartContext.tsx`: consumes attribution attributes, updates restored carts, handles mutation errors, and emits confirmed cart events.
- `src/lib/shopify/client.ts`: cart attribute mutation, shared cart fields, `userErrors`, and warnings.
- `src/app/(site)/cart/page.tsx`: safe checkout link, consent-aware begin-checkout event, and corrected reminder UI.
- `src/app/api/subscribe/route.ts`: explicit consent semantics and truthful upstream errors.
- `next.config.js`: minimal CSP additions required by the approved integrations.

Existing unrelated work in the dirty worktree must remain untouched. Package changes are avoided unless the implementation proves they are necessary.

## Error handling and observability

- Pure parsing failures return an empty or previous valid ledger; they never block shopping.
- Cart attribution sync failures surface through the cart error state and a sanitized diagnostic without cart secrets.
- A cart may remain usable when attribution sync fails, but the release test fails and campaigns stay blocked.
- GA4 or Meta failures never block cart operations.
- Consent API failure defaults to no non-essential persistence or emission.
- Checkout host validation failure blocks navigation and presents a customer-safe error.
- Subscription failures are truthful, retryable, and contain no PII in logs.

## Test strategy

Implementation follows red-green-refactor.

### Automated unit and integration tests

1. First touch remains immutable across internal navigation.
2. Qualified external/campaign visits update latest touch only.
3. Direct first touch is created only when marketing is allowed.
4. Reject consent prevents persistence, cart attribution, GA4, and Meta.
5. Accept consent persists the pending touch and synchronizes the active cart.
6. Attribute serialization is deterministic, namespaced, sanitized, and within platform limits.
7. `cartCreate` includes attributes.
8. Restored carts invoke `cartAttributesUpdate`.
9. Shopify `userErrors` fail the relevant cart operation.
10. Allowed checkout domains pass; lookalike, non-HTTPS, credentialed, and arbitrary hosts fail.
11. The subscription API distinguishes subscribed and nonSubscribed contacts.
12. Missing configuration, upstream rejection, and exceptions never return success.
13. Storefront ecommerce events contain the required GA4 fields and exclude prohibited data.
14. Repeated render/state updates do not emit duplicate `view_item`, `view_cart`, or `begin_checkout` events.

The existing repository has no test runner. Phase-one implementation will use Node 22's built-in test runner for pure TypeScript modules where possible, avoiding changes to the user's currently modified package manifest. Browser behavior will be covered by a narrowly configured end-to-end test only if unit boundaries cannot prove it.

### Live owned-channel release test

Owned email can launch only after one complete production test proves:

1. A Revenue Bridge campaign URL opens with the approved UTMs.
2. The visitor accepts the required consent.
3. First touch remains unchanged through product browsing and cart actions.
4. Latest touch behaves according to the touch rules.
5. The Shopify cart contains the expected `ta_` attributes.
6. Checkout occurs on `checkout.tarifeattar.com`.
7. A test order completes.
8. The order contains the campaign values in `Order.customAttributes`.
9. GA4 DebugView shows `view_item`, `add_to_cart`, `view_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, and exactly one `purchase` with correct revenue and Shopify order ID.
10. A separate reject-consent test shows no GA4 or Meta emission and no persisted attribution.

### Live paid Meta release test

Paid Meta remains blocked until:

1. Meta Test Events shows the pre-checkout browser funnel.
2. One Shopify checkout creates one deduplicated Purchase.
3. Browser and server events share the expected event identity.
4. Product identifiers match the catalog.
5. Purchase value and currency match Shopify.
6. The consent-reject test emits no Meta events.

## Rollout and rollback

1. Deploy phase-one code with GA4 and Meta disabled unless their public IDs and consent integration are configured.
2. Configure and verify `checkout.tarifeattar.com` before making it the checkout target.
3. Enable the Shopify privacy banner and verify accept/reject behavior.
4. Enable GA4 and complete the owned-channel test.
5. Release the Revenue Bridge email only after the test evidence is recorded.
6. Enable Meta measurement separately and complete the paid-gate test.
7. Release Meta budget only after reconciliation.

Rollback is configuration-first: disable measurement IDs and platform pixels without disabling cart or checkout. If the first-party checkout domain fails, revert Shopify's checkout domain while keeping arbitrary checkout URLs blocked. Campaigns return to blocked status until the release test passes again.

## External configuration required

Implementation cannot complete the live release gates from repository code alone. The operator must provide or confirm:

- DNS access for `checkout.tarifeattar.com`.
- Shopify Admin access to Domains, Customer Privacy, Customer Events, and sales channels.
- The production GA4 measurement ID and property access.
- Google & YouTube channel connection or approval to install a custom Shopify pixel.
- Meta Pixel/dataset and catalog access for phase two.

No secrets are committed to the repository. Public browser identifiers use environment variables; API secrets remain in platform configuration or server-only environment variables.

## Source references

- [Shopify cart attributes carry to orders](https://shopify.dev/docs/api/storefront/latest/objects/attribute)
- [Shopify cartAttributesUpdate](https://shopify.dev/docs/api/storefront/latest/mutations/cartattributesupdate)
- [Shopify Customer Privacy API for custom storefronts](https://shopify.dev/docs/api/customer-privacy)
- [Shopify Web Pixels](https://shopify.dev/docs/apps/build/marketing/pixels)
- [Shopify standard customer events](https://shopify.dev/docs/api/web-pixels-api/standard-events)
- [GA4 ecommerce implementation](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Google cross-domain measurement](https://developers.google.com/tag-platform/devguides/cross-domain)
- [Omnisend contact channel statuses](https://api-docs.omnisend.com/reference/contacts)
