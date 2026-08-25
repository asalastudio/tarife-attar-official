import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const cartPage = await readFile('src/app/(site)/cart/page.tsx', 'utf8');
const cartContext = await readFile('src/context/ShopifyCartContext.tsx', 'utf8');
const productPage = await readFile(
  'src/app/(site)/product/[slug]/ProductDetailClient.tsx',
  'utf8',
);

test('cart page has no arbitrary redirect or hardcoded checkout rewrite', () => {
  assert.doesNotMatch(cartPage, /startsWith\(['"]http/);
  assert.doesNotMatch(cartPage, /window\.location\.href\s*=/);
  assert.doesNotMatch(
    cartPage,
    /return_to|searchParams\.set\(['"]redirect/,
  );
  assert.doesNotMatch(
    cartPage,
    /const shopifyDomain\s*=\s*['"]vasana-perfumes/,
  );
  assert.match(cartPage, /getSafeCheckoutUrl/);
  assert.match(cartPage, /<a[\s\S]*href=\{safeCheckoutUrl\}/);
});

test('the storefront emits all four confirmed GA4 funnel events', () => {
  assert.match(productPage, /trackViewItem/);
  assert.match(cartContext, /trackAddToCart/);
  assert.match(cartPage, /trackViewCart/);
  assert.match(cartPage, /trackBeginCheckout/);
});

test('checkout is unavailable until cart attribution synchronization finishes', () => {
  assert.match(cartContext, /isReadyForCheckout/);
  assert.match(cartPage, /isReadyForCheckout/);
});
