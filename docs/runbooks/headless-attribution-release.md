# Headless Attribution Release Runbook

## Release gate

Revenue Bridge email remains blocked until every owned-channel check in this runbook passes against the same deployed build. The Meta storefront adapter may ship in the same build, but paid Meta remains blocked until the separate Meta Test Events and reconciliation gate passes.

Use a dedicated test contact and an explicitly approved low-value purchase. Keep customer email, shipping details, cart secrets, checkout URLs, tokens, and full attribution values out of screenshots, terminal output, and ClickUp.

Record the deployed commit and production configuration state before testing. Do not configure both a Shopify Google channel and a custom pixel to send the same checkout event unless their event IDs and deduplication behavior have been proven.

## 1. DNS and Shopify domain

1. Keep `vasana-perfumes.myshopify.com` as the active checkout domain until Shopify and DNS both verify a first-party checkout hostname.
2. If migrating later, create the `checkout.tarifeattar.com` DNS record using the exact target Shopify provides, connect it under **Settings → Domains**, and verify it before changing application configuration.
3. Wait until Shopify reports the domain connected and its TLS/SSL certificate active.
4. Set the production public environment variable:

   ```text
   NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN=vasana-perfumes.myshopify.com
   ```

5. Redeploy, create a disposable cart, and confirm Shopify returns an HTTPS checkout URL whose hostname is exactly `vasana-perfumes.myshopify.com`.

Pass condition: the customer can move from `www.tarifeattar.com` to a valid Shopify checkout over HTTPS without a host rewrite, open redirect, certificate warning, or redirect loop.

## 2. Shopify privacy

1. In Shopify Admin, open **Settings → Customer privacy**.
2. Configure the consent banner for every region where Shopify or counsel requires it. Enable distinct analytics and marketing choices where the Shopify interface permits them.
3. Load `www.tarifeattar.com` in a clean browser profile and verify the Shopify privacy banner renders on the headless storefront.
4. Open the Privacy page, select **Review Privacy Preferences**, and confirm the Shopify preference center reopens.
5. Verify consent can be accepted, rejected, and revised on both `www.tarifeattar.com` and the active Shopify checkout.
6. Confirm the cart and checkout remain functional when non-essential categories are rejected.

Pass condition: Shopify reports a ready privacy state, accept/reject choices persist as Shopify intends, and GA4/marketing behavior follows the effective permission rather than the presence of the banner alone.

## 3. GA4 property

1. Select or create the production GA4 property and one Web data stream for Tarifé Attär.
2. Record the `G-` measurement ID in the approved secrets/configuration system and set it as `NEXT_PUBLIC_GA4_MEASUREMENT_ID` in production. Do not copy the live ID into this runbook or ClickUp.
3. In GA4, open **Admin → Data streams → Web → Configure tag settings → Configure your domains**.
4. Add exact-match conditions for:
   - `www.tarifeattar.com`
   - `vasana-perfumes.myshopify.com`
5. Treat `vasana-perfumes.myshopify.com` as migration-only. Include it only while live checkout traffic still uses that host, then remove it after the custom checkout domain is proven.
6. Confirm the same GA4 property/stream is used on the headless storefront and Shopify checkout.
7. With analytics consent accepted, follow the checkout anchor and confirm the `_gl` linker parameter is carried to the checkout host without breaking the destination URL.

Pass condition: one browser journey remains one GA4 session across the storefront and checkout, with no self-referral from either checkout host.

Official reference: [GA4 cross-domain measurement](https://support.google.com/analytics/answer/10071811)

## 4. Shopify checkout measurement

Use one approved checkout implementation:

- Connect the same GA4 property through Shopify's **Google & YouTube** channel if it provides the required checkout events for this store; or
- Install an approved Shopify Web Pixel/customer-events integration.

The checkout integration must honor Shopify privacy signals and map Shopify's standard customer events as follows:

| Shopify customer event | GA4 event | Required fields |
| --- | --- | --- |
| `checkout_started` | Checkout-entry validation; do not duplicate the headless `begin_checkout` | Checkout/session continuity |
| `checkout_shipping_info_submitted` | `add_shipping_info` | `currency`, `value`, `items` |
| `payment_info_submitted` | `add_payment_info` | `currency`, `value`, `items` |
| `checkout_completed` | `purchase` | Shopify order ID as `transaction_id`, `currency`, `value`, `items` |

1. Ensure `purchase.transaction_id` is the stable Shopify order ID, not a browser-generated value.
2. Ensure repeated Thank-you/Order-status page visits do not produce another purchase with a different transaction ID.
3. Confirm checkout events contain no customer email, phone, shipping address, cart secret, or checkout URL.
4. Confirm the integration sends nothing when the effective analytics permission is denied.

Pass condition: Shopify Customer Events and GA4 DebugView show the expected checkout sequence once, and one completed Shopify order produces exactly one GA4 purchase.

Official references: [Shopify `checkout_started`](https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_started), [Shopify standard customer events](https://shopify.dev/docs/api/web-pixels-api/standard-events)

## 5. Campaign test URL

Use this exact URL from a clean browser profile:

```text
https://www.tarifeattar.com/product/granada?utm_source=omnisend&utm_medium=email&utm_campaign=revenue_bridge_test&utm_content=hero
```

Do not add customer identifiers, email addresses, cart IDs, or checkout URLs to campaign parameters.

## 5A. Meta paid-channel gate

The headless storefront uses `NEXT_PUBLIC_META_PIXEL_ID` only after Shopify reports marketing processing is allowed. `NEXT_PUBLIC_META_CATALOG_COUNTRY` must match the country prefix used by the Shopify-synced Meta catalog (for example, `US`). Shopify's Facebook & Instagram channel remains the only owner of checkout completion and server-side conversion delivery; the headless storefront must not emit a completed-order event.

1. Confirm the connected Facebook & Instagram channel is using **Enhanced** data sharing: Meta Pixel, advanced matching, and Conversions API.
2. Confirm the Vercel Meta Pixel ID is the same dataset shown by that Shopify channel.
3. Confirm browser events appear in Meta Test Events only after marketing consent:
   - `ViewContent`
   - `AddToCart`
   - `InitiateCheckout`
4. Inspect `content_ids` and confirm they match actual Shopify-synced catalog item IDs in the form `shopify_{COUNTRY}_{PRODUCT_ID}_{VARIANT_ID}`.
5. Complete the separately approved test order and confirm Shopify produces one browser/server-deduplicated completed-order conversion through the connected channel.
6. Confirm the Shopify order value, currency, and item identifiers match the Meta conversion.
7. In a clean reject-consent profile, confirm no request is sent to `connect.facebook.net` or `facebook.com` and no Meta event appears.

Pass condition: Meta Test Events shows the complete pre-checkout funnel, one correctly deduplicated completed-order conversion from Shopify, catalog identifiers match, and the reject path emits nothing. Do not release paid budget on a partial pass.

## 6. Consent accept test

Run this path only after production deployment and the low-value purchase have separate approval.

1. Open a clean browser profile and start GA4 DebugView/network inspection.
2. Open the campaign test URL and accept analytics and marketing processing.
3. In browser storage, confirm `ta_attribution_v1` exists. Verify first touch is the Revenue Bridge visit.
4. Navigate internally to at least one other page and return. Confirm first touch is unchanged.
5. Select a real in-stock variant and add it to the satchel.
6. Inspect the Storefront cart response and confirm non-empty `ta_` attributes include:
   - `ta_attribution_version`
   - `ta_first_utm_source`
   - `ta_first_landing_page`
   - `ta_latest_utm_source`
   - `ta_latest_landing_page`
7. Open the cart and confirm `view_item → add_to_cart → view_cart` in DebugView with the correct product, quantity, value, and currency.
8. Confirm the checkout link hostname is exactly `vasana-perfumes.myshopify.com`.
9. Select **Secure Checkout** and confirm one `begin_checkout` event before the handoff.
10. Complete the approved test order and confirm `add_shipping_info → add_payment_info → purchase`.
11. Confirm purchase value/currency/items match Shopify and `transaction_id` equals the Shopify order ID.
12. Refresh the Thank-you/Order-status page and confirm GA4 still contains exactly one purchase for that transaction ID.
13. Verify the order ledger without printing values:

    ```bash
    read -r "task_order_name?Enter the completed Shopify test order name: "
    node scripts/verify-attribution-order.mjs --order "$task_order_name"
    ```

Pass condition: every verifier key reports `present`, the full DebugView funnel is ordered correctly, and Shopify order revenue equals the single GA4 purchase value.

## 7. Consent reject test

Run this test first in production so a failure cannot be hidden by an earlier granted-consent session.

1. Open a separate clean browser profile with network preservation and GA4 DebugView available.
2. Open the campaign test URL and reject analytics and marketing processing.
3. Confirm browser storage does not contain `ta_attribution_v1`.
4. Add an in-stock variant and inspect the Storefront cart. Confirm there are no `ta_` cart attributes. Any retained or blank `ta_` key is a failure until Shopify removal behavior is understood and corrected.
5. Confirm no requests are sent to `googletagmanager.com`, `google-analytics.com`, `connect.facebook.net`, or `facebook.com`, and no GA4 or Meta storefront events appear.
6. Open the cart and checkout. Confirm essential cart, quantity, removal, and checkout behavior still works.
7. Do not complete a second purchase unless it was separately approved and is necessary to validate the reject path.

Pass condition: no attribution storage, Shopify attribution attributes, GA4 loading, or GA4 events are present, while cart and checkout remain usable.

## 8. Evidence record

Record sanitized evidence on ClickUp task `86bbkqy4u`:

- Deployed commit
- Test timestamp and timezone
- Shopify order name (not email or customer name)
- GA4 transaction ID
- Consent-accept pass/fail by criterion
- Consent-reject pass/fail by criterion
- Shopify-versus-GA4 revenue reconciliation
- Shopify-versus-Meta conversion reconciliation and deduplication result
- Screenshots with all customer PII, cart secrets, checkout URLs, and tokens redacted
- Test operator
- Final release decision and approver

Move the owned-email gate to done only after every criterion passes. Keep paid Meta gate `86bbkqy5z` blocked.

## 9. Rollback

If any criterion fails:

1. Keep Revenue Bridge email blocked and do not release paid media.
2. Clear `NEXT_PUBLIC_GA4_MEASUREMENT_ID` in the production environment and redeploy if storefront GA4 behavior is unsafe or inaccurate.
3. Clear `NEXT_PUBLIC_META_PIXEL_ID` and redeploy if Meta consent, catalog identifiers, or event delivery is unsafe or inaccurate.
4. Disable the Shopify checkout Google integration/Web Pixel if it duplicates purchases, bypasses consent, exposes prohibited data, or reports incorrect revenue.
5. Revert the checkout domain to the last verified Shopify host if DNS, TLS, or redirect behavior is broken.
6. Preserve the Shopify-native order attribution ledger only if its consent and order-value behavior is correct; otherwise roll back the affected deployment.
7. Record the failed criterion and sanitized evidence on ClickUp without customer PII.
8. Repeat both clean-profile consent paths after the correction. Do not release on a partial pass.
