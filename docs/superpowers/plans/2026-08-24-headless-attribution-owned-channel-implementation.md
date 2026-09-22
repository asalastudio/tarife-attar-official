# Headless Attribution Owned-Channel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify the consent-aware Shopify order attribution ledger and complete GA4 ecommerce path required to release Revenue Bridge owned email.

**Architecture:** A small pure attribution core parses, sanitizes, merges, and serializes first/latest touch data. Thin React providers connect that core to Shopify Customer Privacy, cart mutations, and GA4, while the Shopify checkout domain and customer-events integration complete the funnel outside the headless runtime. Security and Omnisend repairs ship in the same owned-channel gate because they directly affect campaign checkout and lead capture.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript 5.9, Shopify Storefront API 2026-01, Shopify Customer Privacy API, Shopify Customer Events/Web Pixels, GA4, Node.js 22 built-in test runner, Omnisend Contacts API.

**Spec:** `docs/superpowers/specs/2026-08-24-headless-attribution-measurement-design.md`

## Global Constraints

- The production checkout target is exactly `checkout.tarifeattar.com`; `vasana-perfumes.myshopify.com` is migration-only.
- First touch is immutable. Internal navigation never overwrites first or latest touch.
- Attribution persistence and Shopify synchronization require Shopify marketing processing permission.
- GA4 loading and events require Shopify analytics processing permission.
- Consent API failure defaults to no non-essential storage or emission.
- Never log cart IDs, cart secrets, checkout URLs, emails, Shopify mutation payloads, or platform secrets.
- Never send PII in GA4 events.
- Shopify cart attribute keys are restricted to the documented `ta_` namespace.
- No new test dependency is added. Node 22 runs `.mjs` tests that import pure `.ts` production modules.
- Do not modify the user's existing package manifest changes.
- Preserve unrelated dirty-worktree changes. `src/components/navigation/GlobalFooter.tsx` already has user changes; patch only its subscription behavior and verify the combined diff.
- Every source change follows red-green-refactor, and each task stages only the files named in that task.
- Owned email and paid media remain blocked until their respective live release tests pass.
- Task 10 requires separate explicit authorization for a production deployment and a real low-value test order; implementation approval alone does not authorize those external actions.

## File map

### New files

- `src/lib/attribution/ledger.ts` — pure touch parsing, sanitization, merging, persistence decoding, and Shopify attribute serialization.
- `src/lib/attribution/checkout-url.ts` — pure exact-host HTTPS checkout validation.
- `src/lib/shopify/cart-errors.ts` — pure extraction and throwing of Shopify mutation-level errors.
- `src/lib/privacy/permissions.ts` — pure privacy permission normalization.
- `src/context/PrivacyContext.tsx` — Shopify Customer Privacy API/bootstrap and consent state.
- `src/context/AttributionContext.tsx` — pending touch, persistence, immutable first touch, and cart-attribute access.
- `src/lib/omnisend/subscribe.ts` — pure request validation, payload construction, and injected upstream handler.
- `src/lib/analytics/ecommerce.ts` — pure GA4 item/event payload builders.
- `src/context/AnalyticsContext.tsx` — consent-aware gtag loading and ecommerce event methods.
- `src/components/privacy/PrivacyPreferencesButton.tsx` — opens Shopify's configured preferences UI.
- `tests/attribution/ledger.test.mjs` — attribution model tests.
- `tests/attribution/checkout-url.test.mjs` — checkout allowlist tests.
- `tests/shopify/cart-errors.test.mjs` — mutation error tests.
- `tests/privacy/permissions.test.mjs` — privacy state tests.
- `tests/omnisend/subscribe.test.mjs` — Omnisend semantics and failures.
- `tests/analytics/ecommerce.test.mjs` — GA4 schema and prohibited-data tests.
- `tests/config/csp.test.mjs` — required/forbidden CSP source tests.
- `scripts/verify-attribution-order.mjs` — read-only Shopify Admin order-attribute verifier.
- `docs/runbooks/headless-attribution-release.md` — exact DNS, Shopify, GA4, consent, order, and rollback checklist.

### Modified files

- `src/components/Providers.tsx` — provider order: privacy → attribution → analytics → cart.
- `src/context/index.ts` — export the new providers/hooks.
- `src/lib/shopify/client.ts` — cart attributes, `cartAttributesUpdate`, user errors/warnings, and cart attributes in queries.
- `src/context/ShopifyCartContext.tsx` — create/sync attributes, truthful mutation failures, sanitized logging, and confirmed add-to-cart events.
- `src/app/(site)/product/[slug]/ProductDetailClient.tsx` — consent-aware deduplicated `view_item`.
- `src/app/(site)/cart/page.tsx` — safe checkout anchor, `view_cart`, `begin_checkout`, and truthful cart-reminder UI.
- `src/app/api/subscribe/route.ts` — thin Next adapter around the Omnisend handler.
- `src/components/navigation/GlobalFooter.tsx` — explicit newsletter consent and truthful errors; preserve existing user edits.
- `src/app/(site)/quiz/TerritoryQuizClient.tsx` — distinct guide/marketing consent, truthful errors, and no plaintext email archive.
- `next.config.js` — minimal Shopify privacy and GA4 CSP sources.
- `.env.example` — checkout and GA4 public configuration plus Omnisend server configuration.
- `src/app/(site)/privacy/page.tsx` — accurate controls language and preferences entry point.

---

### Task 1: Pure attribution ledger

**Files:**
- Create: `src/lib/attribution/ledger.ts`
- Test: `tests/attribution/ledger.test.mjs`

**Interfaces:**
- Produces: `AttributionTouch`, `AttributionLedger`, `InboundTouch`, `parseInboundTouch(input): InboundTouch | null`, `mergeAttribution(existing: AttributionLedger | null, inbound: InboundTouch | null): AttributionLedger | null`, `parseStoredLedger(raw: string | null): AttributionLedger | null`, `serializeCartAttributes(ledger: AttributionLedger | null): Array<{ key: string; value: string }>`.
- Consumes: Browser URL/referrer strings supplied later by `AttributionContext`; no browser globals are read in this module.

- [ ] **Step 1: Write failing parsing and immutable-first-touch tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mergeAttribution,
  parseInboundTouch,
  parseStoredLedger,
  serializeCartAttributes,
} from '../../src/lib/attribution/ledger.ts';

const first = parseInboundTouch({
  url: 'https://www.tarifeattar.com/product/granada?utm_source=omnisend&utm_medium=email&utm_campaign=revenue_bridge&utm_content=hero&gclid=G-123&ignored=secret',
  referrer: 'https://mail.google.com/mail/u/0/',
  ownHosts: ['www.tarifeattar.com', 'tarifeattar.com', 'checkout.tarifeattar.com'],
  capturedAt: '2026-08-25T16:00:00.000Z',
});

test('retains only attribution parameters and strips referrer query data', () => {
  assert.equal(first?.qualified, true);
  assert.equal(first?.touch.utm_source, 'omnisend');
  assert.equal(first?.touch.landing_page, 'https://www.tarifeattar.com/product/granada?utm_source=omnisend&utm_medium=email&utm_campaign=revenue_bridge&utm_content=hero&gclid=G-123');
  assert.equal(first?.touch.referrer, 'https://mail.google.com/mail/u/0/');
});

test('never overwrites first touch and ignores internal navigation for latest touch', () => {
  const initial = mergeAttribution(null, first);
  const internal = parseInboundTouch({
    url: 'https://www.tarifeattar.com/cart',
    referrer: 'https://www.tarifeattar.com/product/granada',
    ownHosts: ['www.tarifeattar.com', 'tarifeattar.com', 'checkout.tarifeattar.com'],
    capturedAt: '2026-08-25T16:05:00.000Z',
  });
  assert.deepEqual(mergeAttribution(initial, internal), initial);
});

test('updates only latest touch for a qualified second campaign', () => {
  const initial = mergeAttribution(null, first);
  const second = parseInboundTouch({
    url: 'https://www.tarifeattar.com/atlas?utm_source=google&utm_medium=organic&utm_campaign=attar_guide',
    referrer: 'https://www.google.com/search?q=attar',
    ownHosts: ['www.tarifeattar.com', 'tarifeattar.com', 'checkout.tarifeattar.com'],
    capturedAt: '2026-08-26T16:00:00.000Z',
  });
  const merged = mergeAttribution(initial, second);
  assert.equal(merged?.first.utm_source, 'omnisend');
  assert.equal(merged?.latest.utm_source, 'google');
});

test('rejects invalid stored versions and emits deterministic namespaced attributes', () => {
  assert.equal(parseStoredLedger('{"version":99}'), null);
  const ledger = mergeAttribution(null, first);
  const attrs = serializeCartAttributes(ledger);
  assert.equal(attrs[0].key, 'ta_attribution_version');
  assert.equal(attrs[0].value, '1');
  assert.equal(attrs.find(({ key }) => key === 'ta_first_utm_source')?.value, 'omnisend');
  assert.ok(attrs.every(({ key, value }) => key.startsWith('ta_') && !/[\u0000-\u001F]/.test(value)));
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/attribution/ledger.test.mjs`  
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/lib/attribution/ledger.ts`.

- [ ] **Step 3: Implement the attribution model**

Use this public shape and constants:

```ts
export const ATTRIBUTION_STORAGE_KEY = 'ta_attribution_v1';
export const ATTRIBUTION_VERSION = 1 as const;
export const ATTRIBUTION_QUERY_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid',
] as const;

export interface AttributionTouch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_page: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
  captured_at: string;
}

export interface AttributionLedger {
  version: 1;
  first: AttributionTouch;
  latest: AttributionTouch;
}

export interface InboundTouch {
  touch: AttributionTouch;
  qualified: boolean;
}
```

Implementation rules:

- Limit UTM values to 255 characters, click IDs to 512, and landing/referrer values to 1024.
- Remove ASCII control characters and trim whitespace.
- Treat an exact own-host referrer as internal; never use substring hostname checks.
- Set direct first touch to `utm_source: '(direct)'` and `utm_medium: '(none)'` with `qualified: false`.
- Return `null` for internal navigation without a recognized campaign/click ID.
- `mergeAttribution(null, inbound)` initializes both first/latest; existing ledgers update latest only when `qualified` is true.
- `parseStoredLedger` validates version, required URLs/timestamps, and string-only optional fields without throwing.
- `serializeCartAttributes` uses the exact 21-key schema in the spec, omits empty values, preserves deterministic order, and never exceeds Shopify's 250-attribute limit.

- [ ] **Step 4: Run unit tests and typecheck**

Run: `node --test tests/attribution/ledger.test.mjs && npm run typecheck`  
Expected: PASS; TypeScript exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/attribution/ledger.ts tests/attribution/ledger.test.mjs
git commit -m "feat: add consent-ready attribution ledger"
```

---

### Task 2: Checkout validation and Shopify mutation errors

**Files:**
- Create: `src/lib/attribution/checkout-url.ts`
- Create: `src/lib/shopify/cart-errors.ts`
- Test: `tests/attribution/checkout-url.test.mjs`
- Test: `tests/shopify/cart-errors.test.mjs`

**Interfaces:**
- Produces: `getSafeCheckoutUrl(rawUrl, allowedHosts): string | null`.
- Produces: `ShopifyUserError`, `ShopifyWarning`, `assertCartMutationSuccess(payload, operation): void`.
- Consumes: Raw Shopify/legacy checkout URLs and mutation payloads.

- [ ] **Step 1: Write failing security and error tests**

```js
// tests/attribution/checkout-url.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { getSafeCheckoutUrl } from '../../src/lib/attribution/checkout-url.ts';

const hosts = ['checkout.tarifeattar.com', 'vasana-perfumes.myshopify.com'];

test('accepts exact HTTPS checkout hosts and rejects lookalikes', () => {
  assert.equal(
    getSafeCheckoutUrl('https://checkout.tarifeattar.com/checkouts/cn/abc', hosts),
    'https://checkout.tarifeattar.com/checkouts/cn/abc',
  );
  assert.equal(getSafeCheckoutUrl('http://checkout.tarifeattar.com/checkouts/cn/abc', hosts), null);
  assert.equal(getSafeCheckoutUrl('https://checkout.tarifeattar.com.evil.example/checkouts/cn/abc', hosts), null);
  assert.equal(getSafeCheckoutUrl('https://user:pass@checkout.tarifeattar.com/checkouts/cn/abc', hosts), null);
  assert.equal(getSafeCheckoutUrl('javascript:alert(1)', hosts), null);
});
```

```js
// tests/shopify/cart-errors.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { assertCartMutationSuccess } from '../../src/lib/shopify/cart-errors.ts';

test('throws a sanitized mutation error when Shopify returns userErrors', () => {
  assert.throws(
    () => assertCartMutationSuccess({ userErrors: [{ field: ['lines', '0'], message: 'Variant is unavailable', code: 'INVALID' }] }, 'add item'),
    /Variant is unavailable/,
  );
});

test('does not throw for warnings alone', () => {
  assert.doesNotThrow(() => assertCartMutationSuccess({ userErrors: [], warnings: [{ code: 'NOTE', message: 'Warning', target: 'cart' }] }, 'update cart'));
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/attribution/checkout-url.test.mjs tests/shopify/cart-errors.test.mjs`  
Expected: FAIL because both production modules are missing.

- [ ] **Step 3: Implement exact-host validation and mutation assertions**

`getSafeCheckoutUrl` must parse with `new URL`, require `https:`, reject username/password, compare `url.hostname.toLowerCase()` against normalized exact hosts, discard the fragment, and return `url.toString()`.

`assertCartMutationSuccess` must throw ``new Error(`Shopify could not ${operation}: ${firstError.message}`)`` using only Shopify's message text. It must not include variables, cart IDs, URLs, or full payload JSON.

- [ ] **Step 4: Run tests and typecheck**

Run: `node --test tests/attribution/checkout-url.test.mjs tests/shopify/cart-errors.test.mjs && npm run typecheck`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/attribution/checkout-url.ts src/lib/shopify/cart-errors.ts tests/attribution/checkout-url.test.mjs tests/shopify/cart-errors.test.mjs
git commit -m "fix: validate checkout destinations and cart errors"
```

---

### Task 3: Shopify privacy authority and attribution lifecycle

**Files:**
- Create: `src/lib/privacy/permissions.ts`
- Create: `src/context/PrivacyContext.tsx`
- Create: `src/context/AttributionContext.tsx`
- Test: `tests/privacy/permissions.test.mjs`
- Modify: `src/context/index.ts`
- Modify: `src/components/Providers.tsx`

**Interfaces:**
- Produces: `MeasurementPermissions`, `normalizePermissions(apiState)`.
- Produces: `usePrivacy(): { ready; analyticsAllowed; marketingAllowed; preferencesAllowed; saleOfDataAllowed; showPreferences }`.
- Produces: `useAttribution(): { ledger; cartAttributes; ready }`.
- Consumes: `window.Shopify.customerPrivacy`, inbound URL/referrer, `localStorage`, and Task 1 functions.

- [ ] **Step 1: Write failing fail-closed permission tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePermissions } from '../../src/lib/privacy/permissions.ts';

test('fails closed before Shopify privacy is ready', () => {
  assert.deepEqual(normalizePermissions(null), {
    ready: false,
    analyticsAllowed: false,
    marketingAllowed: false,
    preferencesAllowed: false,
    saleOfDataAllowed: false,
  });
});

test('uses Shopify allowed methods rather than raw consent strings', () => {
  assert.deepEqual(normalizePermissions({
    analyticsProcessingAllowed: () => true,
    marketingAllowed: () => false,
    preferencesProcessingAllowed: () => true,
    saleOfDataAllowed: () => false,
  }), {
    ready: true,
    analyticsAllowed: true,
    marketingAllowed: false,
    preferencesAllowed: true,
    saleOfDataAllowed: false,
  });
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/privacy/permissions.test.mjs`  
Expected: FAIL because `permissions.ts` is missing.

- [ ] **Step 3: Implement the pure permission normalizer**

Catch method failures and return the fail-closed state. Never interpret `currentVisitorConsent()` alone as permission.

- [ ] **Step 4: Run and verify GREEN**

Run: `node --test tests/privacy/permissions.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Implement `PrivacyContext` and `AttributionContext`**

Provider order in `src/components/Providers.tsx` must be:

```tsx
<PrivacyProvider>
  <AttributionProvider>
    <ConvexProvider client={convex}>
      <ChatProvider>
        <ShopifyCartProvider>
          <WishlistProvider>
            <CompassProvider>
              {children}
              <ElevenLabsVoiceWidget />
            </CompassProvider>
          </WishlistProvider>
        </ShopifyCartProvider>
      </ChatProvider>
    </ConvexProvider>
  </AttributionProvider>
</PrivacyProvider>
```

`PrivacyProvider` requirements:

- Load `https://cdn.shopify.com/shopifycloud/privacy-banner/storefront-banner.js` once and call `privacyBanner.loadBanner({ storefrontAccessToken, checkoutRootDomain, storefrontRootDomain: 'tarifeattar.com' })` so Shopify bootstraps the Customer Privacy API for the headless storefront.
- After the banner promise resolves, read permissions from `window.Shopify.customerPrivacy`; when an already-present Shopify runtime exposes `loadFeatures`, request `consent-tracking-api` before the first permission read.
- Use the public storefront token and `NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN` only in Shopify's documented headless consent call.
- Listen for `visitorConsentCollected` and recompute the allowed methods.
- Expose a working `showPreferences` callback through Shopify's configured banner script.
- If required public configuration is absent, remain fail-closed and issue one configuration-only warning without values.

`AttributionProvider` requirements:

- Parse the first inbound page synchronously into a React ref so it survives SPA navigation.
- Read/write `ATTRIBUTION_STORAGE_KEY` only when `marketingAllowed` is true.
- When marketing becomes allowed, merge the pending inbound touch with valid stored data and publish deterministic cart attributes.
- When marketing is denied/revoked, clear the stored attribution key and publish no cart attributes.
- Do not clear the functional `shopify_cart_id` key.
- Export hooks from `src/context/index.ts`.

- [ ] **Step 6: Typecheck and build**

Run: `npm run typecheck && npm run build`  
Expected: both exit 0; no provider-order or browser-global SSR error.

- [ ] **Step 7: Commit**

```bash
git add src/lib/privacy/permissions.ts src/context/PrivacyContext.tsx src/context/AttributionContext.tsx tests/privacy/permissions.test.mjs src/context/index.ts src/components/Providers.tsx
git commit -m "feat: connect attribution to Shopify privacy consent"
```

---

### Task 4: Shopify cart attribute propagation and truthful failures

**Files:**
- Modify: `src/lib/shopify/client.ts`
- Modify: `src/context/ShopifyCartContext.tsx`

**Interfaces:**
- Consumes: `useAttribution().cartAttributes` and `assertCartMutationSuccess`.
- Produces: `CART_ATTRIBUTES_UPDATE_MUTATION`; every cart mutation payload returns `userErrors` and `warnings`; active cart attributes stay synchronized.

- [ ] **Step 1: Add a failing source-contract test**

Create `tests/shopify/cart-contract.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CREATE_CART_MUTATION,
  ADD_LINES_MUTATION,
  UPDATE_LINES_MUTATION,
  REMOVE_LINES_MUTATION,
  CART_ATTRIBUTES_UPDATE_MUTATION,
} from '../../src/lib/shopify/client.ts';

test('every cart mutation requests userErrors and warnings', () => {
  for (const mutation of [CREATE_CART_MUTATION, ADD_LINES_MUTATION, UPDATE_LINES_MUTATION, REMOVE_LINES_MUTATION, CART_ATTRIBUTES_UPDATE_MUTATION]) {
    assert.match(mutation, /userErrors\s*\{/);
    assert.match(mutation, /warnings\s*\{/);
  }
});

test('cart create and update support attribution attributes', () => {
  assert.match(CREATE_CART_MUTATION, /\$input:\s*CartInput/);
  assert.match(CART_ATTRIBUTES_UPDATE_MUTATION, /cartAttributesUpdate/);
  assert.match(CART_ATTRIBUTES_UPDATE_MUTATION, /\$attributes:\s*\[AttributeInput!\]!/);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/shopify/cart-contract.test.mjs`  
Expected: FAIL because the update mutation/export and error fields are absent.

- [ ] **Step 3: Update Storefront API documents**

Add this mutation and the same error/warning fields to all existing cart mutations:

```graphql
mutation cartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
  cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
    cart { id checkoutUrl attributes { key value } totalQuantity }
    userErrors { field message code }
    warnings { code message target }
  }
}
```

Also request `attributes { key value }` from `cartCreate`, `getCart`, and line mutations so live inspection can confirm synchronization.

- [ ] **Step 4: Run the source-contract test**

Run: `node --test tests/shopify/cart-contract.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Integrate attributes into the cart provider**

- Pass `{ input: { attributes: cartAttributes } }` to `cartCreate`.
- After restoring an existing cart, call `cartAttributesUpdate` when the current consent-eligible attribute fingerprint differs from returned cart attributes.
- Re-sync an active cart when eligible attributes change after consent or a qualified inbound touch.
- Guard the update with a deterministic fingerprint to prevent render loops.
- Call `assertCartMutationSuccess` for create/add/update/remove/attribute-update payloads.
- Preserve cart usability on attribution-sync failure but set the cart error to `Campaign tracking could not be attached. Please try again before checkout.`
- Remove logs containing cart IDs, checkout URLs, response payloads, and mapped line data.
- Remove checkout-host rewriting from `ShopifyCartContext`; expose Shopify's returned URL unchanged.

- [ ] **Step 6: Run all cart tests, typecheck, and build**

Run: `node --test tests/shopify/*.test.mjs tests/attribution/*.test.mjs && npm run typecheck && npm run build`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/shopify/client.ts src/context/ShopifyCartContext.tsx tests/shopify/cart-contract.test.mjs
git commit -m "feat: persist attribution on Shopify carts"
```

---

### Task 5: Omnisend consent and truthful lead capture

**Files:**
- Create: `src/lib/omnisend/subscribe.ts`
- Test: `tests/omnisend/subscribe.test.mjs`
- Modify: `src/app/api/subscribe/route.ts`
- Modify: `src/app/(site)/cart/page.tsx`
- Modify: `src/components/navigation/GlobalFooter.tsx`
- Modify: `src/app/(site)/quiz/TerritoryQuizClient.tsx`

**Interfaces:**
- Produces: `SubscribeInput`, `buildOmnisendPayload(input, now)`, `submitSubscription({ input, apiKey, fetchImpl, now })` returning `{ status; body }`.
- Consumes: Explicit `marketingConsent: boolean` from every caller.

- [ ] **Step 1: Write failing consent and failure-semantic tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOmnisendPayload, submitSubscription } from '../../src/lib/omnisend/subscribe.ts';

test('marks a reminder-only contact nonSubscribed', () => {
  const payload = buildOmnisendPayload({
    email: 'buyer@example.com', source: 'satchel', marketingConsent: false, cartItems: [{ title: 'Granada', price: '52.00' }],
  }, '2026-08-25T16:00:00.000Z');
  assert.equal(payload.identifiers[0].channels.email.status, 'nonSubscribed');
});

test('marks an explicit newsletter contact subscribed', () => {
  const payload = buildOmnisendPayload({ email: 'buyer@example.com', source: 'newsletter', marketingConsent: true }, '2026-08-25T16:00:00.000Z');
  assert.equal(payload.identifiers[0].channels.email.status, 'subscribed');
});

test('returns 503 without configuration and never claims success', async () => {
  const result = await submitSubscription({
    input: { email: 'buyer@example.com', source: 'newsletter', marketingConsent: true },
    apiKey: '', fetchImpl: async () => { throw new Error('must not call'); }, now: () => '2026-08-25T16:00:00.000Z',
  });
  assert.equal(result.status, 503);
  assert.equal(result.body.success, false);
});

test('returns 502 when Omnisend rejects the request', async () => {
  const result = await submitSubscription({
    input: { email: 'buyer@example.com', source: 'satchel', marketingConsent: false },
    apiKey: 'configured', fetchImpl: async () => new Response('rejected', { status: 400 }), now: () => '2026-08-25T16:00:00.000Z',
  });
  assert.equal(result.status, 502);
  assert.equal(result.body.success, false);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/omnisend/subscribe.test.mjs`  
Expected: FAIL because the module is missing.

- [ ] **Step 3: Implement pure payload and injected handler**

Validation requirements:

- Normalize email with trim/lowercase and a conservative `^[^\s@]+@[^\s@]+\.[^\s@]+$` test.
- Require source to be `quiz`, `satchel`, or `newsletter`.
- Require `marketingConsent` to be a boolean.
- Allow only documented territory values.
- Limit cart items to 100 and each title to 200 characters.
- Use `subscribed` only when `marketingConsent === true`; otherwise use `nonSubscribed`.
- POST to `https://api.omnisend.com/api/contacts` with `Authorization: Omnisend-API-Key ${apiKey}`, `Omnisend-Version: 2026-03-15`, and `Content-Type: application/json`.
- Use `statusChangedAt` for the channel timestamp. When consent is true, include the channel consent object with ``source: `tarife-${input.source}-form` `` and the same `createdAt` timestamp; do not fabricate IP or user-agent values.
- Return 400 for invalid input, 503 for missing key, 502 for non-2xx upstream, 500 for thrown failures, and 200 only after a 2xx Omnisend response.
- Do not return the upstream response body or log the email.

- [ ] **Step 4: Run and verify GREEN**

Run: `node --test tests/omnisend/subscribe.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Replace the API route with a thin adapter**

```ts
export async function POST(request: NextRequest) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
  const result = await submitSubscription({
    input,
    apiKey: process.env.OMNISEND_API_KEY || '',
    fetchImpl: fetch,
    now: () => new Date().toISOString(),
  });
  return NextResponse.json(result.body, { status: result.status });
}
```

- [ ] **Step 6: Correct every caller**

- Cart: add an unchecked marketing checkbox, send its boolean, check `response.ok`, show a retryable error, remove `saved-carts` plaintext email storage, and set only the functional `satchel-saved` flag after success.
- Footer newsletter: send `marketingConsent: true` because the form action explicitly subscribes; show success only for `response.ok`; preserve all unrelated user changes.
- Quiz: add a distinct unchecked ongoing-marketing checkbox, send its boolean, remove plaintext `territory-profiles` email storage, and show failure when the API fails.
- Remove email values from all client/server logs.

- [ ] **Step 7: Verify combined dirty-file diff**

Run: `git diff -- src/components/navigation/GlobalFooter.tsx`  
Expected: existing user edits remain; only the subscription request and error UI are added by this task.

- [ ] **Step 8: Run tests, typecheck, and build**

Run: `node --test tests/omnisend/subscribe.test.mjs && npm run typecheck && npm run build`  
Expected: PASS.

- [ ] **Step 9: Commit only task-owned hunks/files**

Because `GlobalFooter.tsx` is already dirty, use `git add -p src/components/navigation/GlobalFooter.tsx` and stage only this task's subscription hunks. Then:

```bash
git add src/lib/omnisend/subscribe.ts tests/omnisend/subscribe.test.mjs src/app/api/subscribe/route.ts 'src/app/(site)/cart/page.tsx' 'src/app/(site)/quiz/TerritoryQuizClient.tsx'
git commit -m "fix: enforce truthful email consent and delivery"
```

---

### Task 6: Consent-aware GA4 ecommerce adapter

**Files:**
- Create: `src/lib/analytics/ecommerce.ts`
- Create: `src/context/AnalyticsContext.tsx`
- Test: `tests/analytics/ecommerce.test.mjs`
- Modify: `src/context/index.ts`
- Modify: `src/components/Providers.tsx`

**Interfaces:**
- Produces: `CommerceItem`, `buildViewItem`, `buildAddToCart`, `buildViewCart`, `buildBeginCheckout`.
- Produces: `useAnalytics()` methods `trackViewItem`, `trackAddToCart`, `trackViewCart`, `trackBeginCheckout`.
- Consumes: `usePrivacy().analyticsAllowed` and `NEXT_PUBLIC_GA4_MEASUREMENT_ID`.

- [ ] **Step 1: Write failing GA4 schema and privacy-safety tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAddToCart, buildBeginCheckout, buildViewCart, buildViewItem } from '../../src/lib/analytics/ecommerce.ts';

const item = { item_id: 'gid://shopify/ProductVariant/123', item_name: 'Granada', item_variant: '6ml', price: 52, quantity: 1 };

test('builds the required GA4 ecommerce path with currency and value', () => {
  assert.deepEqual(buildViewItem(item, 'USD'), { event: 'view_item', params: { currency: 'USD', value: 52, items: [item] } });
  assert.equal(buildAddToCart(item, 'USD').event, 'add_to_cart');
  assert.equal(buildViewCart([item], 'USD').event, 'view_cart');
  assert.equal(buildBeginCheckout([item], 'USD').event, 'begin_checkout');
});

test('does not include customer or cart identifiers', () => {
  const serialized = JSON.stringify(buildBeginCheckout([item], 'USD'));
  assert.doesNotMatch(serialized, /email|cart_id|checkout_url|customer/i);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/analytics/ecommerce.test.mjs`  
Expected: FAIL because the analytics module is missing.

- [ ] **Step 3: Implement pure ecommerce builders**

Normalize prices to finite non-negative numbers, quantities to positive integers, currency to an uppercase three-letter code, and value to the sum of `price * quantity`. Throw for missing `item_id` or `item_name` so bad analytics never silently ship.

- [ ] **Step 4: Run and verify GREEN**

Run: `node --test tests/analytics/ecommerce.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Implement `AnalyticsContext`**

- Do not inject gtag when the measurement ID is empty or analytics is denied.
- On permission, load ``https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`` once.
- Initialize `dataLayer`, `gtag('js', new Date())`, and `gtag('config', id, { linker: { domains: ['www.tarifeattar.com', 'checkout.tarifeattar.com', 'vasana-perfumes.myshopify.com'] } })`.
- On consent revocation after load, call `gtag('consent', 'update', { analytics_storage: 'denied' })` and make all public tracking methods no-op.
- On consent grant, call the corresponding `granted` update before events.
- Deduplicate `view_item`, `view_cart`, and `begin_checkout` by a caller-supplied deterministic key; never deduplicate confirmed `add_to_cart` operations.
- Declare only the narrow `window.dataLayer`/`window.gtag` globals required.
- Insert `AnalyticsProvider` between `AttributionProvider` and `ShopifyCartProvider` in `src/components/Providers.tsx`.

- [ ] **Step 6: Typecheck and build**

Run: `node --test tests/analytics/ecommerce.test.mjs && npm run typecheck && npm run build`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/analytics/ecommerce.ts src/context/AnalyticsContext.tsx tests/analytics/ecommerce.test.mjs src/context/index.ts src/components/Providers.tsx
git commit -m "feat: add consent-aware GA4 ecommerce adapter"
```

---

### Task 7: Storefront GA4 events and secure checkout anchor

**Files:**
- Modify: `src/context/ShopifyCartContext.tsx`
- Modify: `src/app/(site)/product/[slug]/ProductDetailClient.tsx`
- Modify: `src/app/(site)/cart/page.tsx`

**Interfaces:**
- Consumes: `useAnalytics()` and `getSafeCheckoutUrl()`.
- Produces: confirmed `view_item`, `add_to_cart`, `view_cart`, and `begin_checkout`; safe anchor handoff.

- [ ] **Step 1: Write a failing checkout-source contract test**

Create `tests/attribution/cart-page-contract.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('cart page has no arbitrary redirect or hardcoded checkout rewrite', async () => {
  const source = await readFile(new URL('../../src/app/(site)/cart/page.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /startsWith\(['"]http/);
  assert.doesNotMatch(source, /window\.location\.href\s*=/);
  assert.doesNotMatch(source, /return_to|searchParams\.set\(['"]redirect/);
  assert.doesNotMatch(source, /const shopifyDomain\s*=\s*['"]vasana-perfumes/);
  assert.match(source, /getSafeCheckoutUrl/);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/attribution/cart-page-contract.test.mjs`  
Expected: FAIL on the existing redirect and hardcoded rewrite.

- [ ] **Step 3: Wire confirmed storefront events**

- Product page: build the selected variant `CommerceItem` from Shopify variant ID, product title, selected size, current price, and quantity. Emit `view_item` using key ```${item.item_id}:${item.item_variant ?? 'default'}``` only when ID/price exist.
- Cart provider: after `cartLinesAdd` succeeds, locate the returned variant and emit `add_to_cart` with the requested added quantity, not the cart line's cumulative quantity.
- Cart page: map current cart lines into `CommerceItem[]` and emit `view_cart` using a stable item/quantity/value fingerprint.
- Cart page: emit `begin_checkout` in the valid anchor's `onClick` using the current fingerprint.

- [ ] **Step 4: Replace redirect logic with a validated anchor**

```tsx
const allowedCheckoutHosts = [
  process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN,
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
].filter((host): host is string => Boolean(host));
const safeCheckoutUrl = getSafeCheckoutUrl(checkoutUrl, allowedCheckoutHosts);
```

Render an `<a href={safeCheckoutUrl}>` only when the cart is non-empty, sync is idle, and the URL is valid. Render the disabled button/error state otherwise. Validate legacy query-param checkout URLs with the same helper before `window.location.replace`; do not log either URL.

- [ ] **Step 5: Remove remaining sensitive cart logs**

Run: `rg -n "console\.(log|warn|error).*?(cartId|checkoutUrl|Checkout URL|Shopify response|Cart Item Node|saveCartEmail)" src/context/ShopifyCartContext.tsx 'src/app/(site)/cart/page.tsx' src/app/api/subscribe/route.ts`  
Expected: no output.

- [ ] **Step 6: Run tests, typecheck, and build**

Run: `node --test tests/attribution/*.test.mjs tests/analytics/*.test.mjs tests/shopify/*.test.mjs && npm run typecheck && npm run build`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/context/ShopifyCartContext.tsx 'src/app/(site)/product/[slug]/ProductDetailClient.tsx' 'src/app/(site)/cart/page.tsx' tests/attribution/cart-page-contract.test.mjs
git commit -m "feat: measure the headless purchase funnel safely"
```

---

### Task 8: CSP, environment contract, and privacy preferences

**Files:**
- Test: `tests/config/csp.test.mjs`
- Modify: `next.config.js`
- Modify: `.env.example`
- Create: `src/components/privacy/PrivacyPreferencesButton.tsx`
- Modify: `src/app/(site)/privacy/page.tsx`

**Interfaces:**
- Consumes: `usePrivacy().showPreferences`.
- Produces: a production CSP that permits only the required Shopify privacy/GA4 sources and a visible way to revise consent.

- [ ] **Step 1: Write the failing CSP test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import nextConfig from '../../next.config.js';

test('CSP permits Shopify consent and GA4 but not Meta before the paid gate', async () => {
  const entries = await nextConfig.headers();
  const csp = entries[0].headers.find(({ key }) => key === 'Content-Security-Policy').value;
  assert.match(csp, /https:\/\/www\.googletagmanager\.com/);
  assert.match(csp, /https:\/\/\*\.google-analytics\.com/);
  assert.match(csp, /https:\/\/checkout\.tarifeattar\.com/);
  assert.doesNotMatch(csp, /connect\.facebook\.net|facebook\.com\/tr/);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/config/csp.test.mjs`  
Expected: FAIL because Google and the first-party checkout host are absent.

- [ ] **Step 3: Apply the minimal CSP additions**

- `script-src`: add `https://www.googletagmanager.com`.
- `connect-src`: add `https://checkout.tarifeattar.com`, `https://www.google-analytics.com`, and `https://*.google-analytics.com`.
- Keep Meta sources absent until the paid plan.
- Do not broaden `default-src`, `object-src`, `base-uri`, or `frame-ancestors`.

- [ ] **Step 4: Document the environment contract**

Add exactly:

```dotenv
NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN=checkout.tarifeattar.com
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
OMNISEND_API_KEY=
```

Label the first two public/browser-safe and Omnisend server-only. Do not edit `.env` or `.env.local` in this task.

- [ ] **Step 5: Add consent preferences UI and accurate privacy copy**

Add `PrivacyPreferencesButton` that calls `showPreferences` and is disabled until privacy is ready. Update the privacy page to state that non-essential analytics/marketing is controlled through the preference center and that declining does not disable cart/checkout. Do not present legal guarantees.

- [ ] **Step 6: Run tests, typecheck, and build**

Run: `node --test tests/config/csp.test.mjs tests/privacy/permissions.test.mjs && npm run typecheck && npm run build`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add next.config.js .env.example tests/config/csp.test.mjs src/components/privacy/PrivacyPreferencesButton.tsx 'src/app/(site)/privacy/page.tsx'
git commit -m "feat: enforce analytics consent and CSP policy"
```

---

### Task 9: Read-only Shopify verification and live release runbook

**Files:**
- Create: `scripts/verify-attribution-order.mjs`
- Create: `docs/runbooks/headless-attribution-release.md`

**Interfaces:**
- Consumes: `SHOPIFY_STORE_DOMAIN` or `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_API_ACCESS_TOKEN` or `SHOPIFY_ADMIN_ACCESS_TOKEN`, and an order name supplied as `--order`.
- Produces: sanitized pass/fail output for the expected `ta_` custom attributes; never prints customer data or tokens.

- [ ] **Step 1: Write the read-only verifier**

The script must:

- Parse `--order '#1234'` without accepting arbitrary GraphQL fragments.
- Query Admin API `2026-01` for the exact order name and `customAttributes { key value }` only.
- Filter output to `ta_` keys.
- Require `ta_attribution_version`, `ta_first_utm_source`, `ta_first_landing_page`, `ta_latest_utm_source`, and `ta_latest_landing_page`.
- Print only key names and `present`/`missing`; do not print values, order email, customer, cart, checkout URL, or access token.
- Exit 0 only when the order exists and every required key is present; otherwise exit 1.

The query is fixed:

```graphql
query AttributionOrderAudit($query: String!) {
  orders(first: 1, query: $query) {
    nodes { name customAttributes { key value } }
  }
}
```

- [ ] **Step 2: Syntax-check the verifier**

Run: `node --check scripts/verify-attribution-order.mjs`  
Expected: no output and exit 0.

- [ ] **Step 3: Write the live runbook**

The runbook must contain these exact operator sections:

1. **DNS and Shopify domain:** create `checkout.tarifeattar.com`, add it in Shopify Admin → Settings → Domains, target Online Store/checkout, verify SSL, and set `NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN` in production.
2. **Shopify privacy:** configure banner regions in Settings → Customer privacy, verify the headless banner, and confirm accept/reject on both `www` and `checkout` hosts.
3. **GA4 property:** record the measurement ID, configure cross-domain measurement for `www.tarifeattar.com` and `checkout.tarifeattar.com`, and mark the `myshopify.com` host migration-only.
4. **Shopify checkout measurement:** connect the same GA4 property through Google & YouTube or install the approved Shopify Web Pixel; map shipping, payment, and completed checkout events.
5. **Campaign test URL:** use `https://www.tarifeattar.com/product/granada?utm_source=omnisend&utm_medium=email&utm_campaign=revenue_bridge_test&utm_content=hero`.
6. **Consent accept test:** verify local ledger, Shopify cart attributes, safe checkout hostname, completed order, order custom attributes, DebugView funnel, revenue, currency, and one purchase.
7. **Consent reject test:** verify no attribution storage, no `ta_` cart attributes, no GA4 requests/events, and functional cart/checkout.
8. **Evidence record:** capture timestamp, order name, GA4 transaction ID, screenshots, test operator, and pass/fail without copying customer PII into ClickUp.
9. **Rollback:** clear the public GA4 ID, disable checkout integration/pixel, revert checkout domain if necessary, and keep Revenue Bridge blocked.

- [ ] **Step 4: Run the complete local verification suite**

Run:

```bash
node --test tests/attribution/*.test.mjs tests/shopify/*.test.mjs tests/privacy/*.test.mjs tests/omnisend/*.test.mjs tests/analytics/*.test.mjs tests/config/*.test.mjs
npm run typecheck
npm run build
git diff --check
```

Expected: all tests pass; typecheck/build exit 0; no whitespace errors.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-attribution-order.mjs docs/runbooks/headless-attribution-release.md
git commit -m "docs: add attribution release verification runbook"
```

---

### Task 10: Production owned-channel release test

**Files:**
- No repository edits required unless the test exposes a defect.
- Evidence is recorded on ClickUp task `86bbkqy4u` without customer PII.

**Interfaces:**
- Consumes: deployed phase-one build, configured checkout domain/privacy/GA4, a low-value test order, and Task 9 verifier.
- Produces: objective pass/fail decision for owned email.

- [ ] **Step 1: Deploy the verified phase-one build with Meta disabled**

Confirm production has:

```text
NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN set to checkout.tarifeattar.com
NEXT_PUBLIC_GA4_MEASUREMENT_ID set from the selected production GA4 web stream
OMNISEND_API_KEY set from the approved server-only secrets manager
```

Do not expose or copy the actual values into git, terminal output, or ClickUp.

- [ ] **Step 2: Run the consent-reject path first**

Open a clean browser profile with the campaign test URL, reject analytics/marketing, add an item, view cart, and open checkout. Confirm cart and checkout work while browser storage, Shopify cart attributes, GA4 DebugView, and network requests show no non-essential attribution/analytics.

- [ ] **Step 3: Run the complete consent-accept purchase**

Use a separate clean profile, accept consent, browse internally, add an item, view cart, and complete the approved low-value test purchase on `checkout.tarifeattar.com`.

- [ ] **Step 4: Verify the Shopify order ledger**

Run `read -r "task_order_name?Enter the completed Shopify test order name: "` followed by `node scripts/verify-attribution-order.mjs --order "$task_order_name"`.  
Expected: every required `ta_` key reports `present`; exit 0.

- [ ] **Step 5: Verify GA4 DebugView**

Confirm this ordered path for the same browser session:

```text
view_item → add_to_cart → view_cart → begin_checkout → add_shipping_info → add_payment_info → purchase
```

Confirm exactly one purchase, Shopify order ID as `transaction_id`, correct value/currency, and expected items.

- [ ] **Step 6: Reconcile and release or remain blocked**

- Pass only if Shopify order revenue equals GA4 purchase value and every owned-channel criterion in the spec passes.
- Record sanitized evidence on ClickUp task `86bbkqy4u` and move it to done only on full pass.
- Keep `86bbkqy5z` (paid Meta gate) blocked.
- If any criterion fails, record the failed criterion, revert/disable the affected measurement integration if necessary, and keep the email blocked.

## Deferred paid-measurement plan

After Task 10 passes, create a separate implementation plan for Meta Pixel storefront events, Shopify Meta sales-channel Purchase/CAPI, event-ID deduplication, catalog identifier matching, Test Events verification, and Shopify revenue reconciliation. Do not add Meta code or CSP sources during this owned-channel plan.
