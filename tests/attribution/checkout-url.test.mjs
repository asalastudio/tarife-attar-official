import test from 'node:test';
import assert from 'node:assert/strict';
import { getSafeCheckoutUrl } from '../../src/lib/attribution/checkout-url.ts';

const hosts = [
  'checkout.tarifeattar.com',
  'vasana-perfumes.myshopify.com',
];

test('accepts an exact HTTPS checkout host', () => {
  assert.equal(
    getSafeCheckoutUrl(
      'https://checkout.tarifeattar.com/checkouts/cn/abc?key=secret',
      hosts,
    ),
    'https://checkout.tarifeattar.com/checkouts/cn/abc?key=secret',
  );
});

test('accepts the migration Shopify host', () => {
  assert.equal(
    getSafeCheckoutUrl(
      'https://vasana-perfumes.myshopify.com/checkouts/cn/abc',
      hosts,
    ),
    'https://vasana-perfumes.myshopify.com/checkouts/cn/abc',
  );
});

test('rejects non-HTTPS checkout URLs', () => {
  assert.equal(
    getSafeCheckoutUrl(
      'http://checkout.tarifeattar.com/checkouts/cn/abc',
      hosts,
    ),
    null,
  );
});

test('rejects lookalike and arbitrary checkout hosts', () => {
  assert.equal(
    getSafeCheckoutUrl(
      'https://checkout.tarifeattar.com.evil.example/checkouts/cn/abc',
      hosts,
    ),
    null,
  );
  assert.equal(
    getSafeCheckoutUrl('https://evil.example/checkouts/cn/abc', hosts),
    null,
  );
});

test('rejects credentialed and non-web URLs', () => {
  assert.equal(
    getSafeCheckoutUrl(
      'https://user:pass@checkout.tarifeattar.com/checkouts/cn/abc',
      hosts,
    ),
    null,
  );
  assert.equal(getSafeCheckoutUrl('javascript:alert(1)', hosts), null);
});

test('removes fragments without changing the checkout query', () => {
  assert.equal(
    getSafeCheckoutUrl(
      'https://checkout.tarifeattar.com/checkouts/cn/abc?key=secret#fragment',
      hosts,
    ),
    'https://checkout.tarifeattar.com/checkouts/cn/abc?key=secret',
  );
});
