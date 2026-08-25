import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAddToCart,
  buildBeginCheckout,
  buildViewCart,
  buildViewItem,
} from '../../src/lib/analytics/ecommerce.ts';

const item = {
  item_id: 'gid://shopify/ProductVariant/123',
  item_name: 'Granada',
  item_variant: '6ml',
  price: 52,
  quantity: 1,
};

test('builds the required GA4 ecommerce path with currency and value', () => {
  assert.deepEqual(buildViewItem(item, 'USD'), {
    event: 'view_item',
    params: { currency: 'USD', value: 52, items: [item] },
  });
  assert.equal(buildAddToCart(item, 'usd').event, 'add_to_cart');
  assert.equal(buildViewCart([item], 'USD').event, 'view_cart');
  assert.equal(buildBeginCheckout([item], 'USD').event, 'begin_checkout');
});

test('calculates value from normalized item price and quantity', () => {
  const result = buildViewCart(
    [
      { ...item, price: 52.005, quantity: 2 },
      { ...item, item_id: 'second', price: 10, quantity: 1 },
    ],
    'usd',
  );

  assert.equal(result.params.currency, 'USD');
  assert.equal(result.params.value, 114.01);
});

test('does not include customer, cart, or unexpected input identifiers', () => {
  const unsafeItem = {
    ...item,
    email: 'buyer@example.com',
    cart_id: 'secret-cart',
    checkout_url: 'https://example.test/secret',
  };
  const serialized = JSON.stringify(buildBeginCheckout([unsafeItem], 'USD'));

  assert.doesNotMatch(serialized, /email|cart_id|checkout_url|customer/i);
  assert.doesNotMatch(serialized, /buyer@example\.com|secret-cart/);
});

test('rejects missing identity and invalid commerce values', () => {
  for (const invalid of [
    { ...item, item_id: '' },
    { ...item, item_name: '' },
    { ...item, price: Number.NaN },
    { ...item, price: -1 },
    { ...item, quantity: 0 },
    { ...item, quantity: 1.5 },
  ]) {
    assert.throws(() => buildAddToCart(invalid, 'USD'));
  }
  assert.throws(() => buildViewItem(item, 'US'));
});
