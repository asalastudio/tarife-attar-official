import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMetaAddToCart,
  buildMetaInitiateCheckout,
  buildMetaViewContent,
  buildShopifyCatalogContentId,
} from '../../src/lib/analytics/meta.ts';

const item = {
  item_id: 'gid://shopify/ProductVariant/456',
  item_name: 'Granada',
  item_variant: '6ml',
  meta_content_id: 'shopify_US_123_456',
  price: 52,
  quantity: 1,
};

test('formats Shopify product and variant IDs to match the Meta catalog convention', () => {
  assert.equal(
    buildShopifyCatalogContentId(
      'gid://shopify/Product/123',
      'gid://shopify/ProductVariant/456',
      'us',
    ),
    'shopify_US_123_456',
  );
  assert.equal(buildShopifyCatalogContentId('invalid', '456', 'US'), null);
});

test('builds the required Meta storefront events without customer identifiers', () => {
  assert.deepEqual(buildMetaViewContent(item, 'usd'), {
    event: 'ViewContent',
    params: {
      content_ids: ['shopify_US_123_456'],
      content_name: 'Granada',
      content_type: 'product',
      currency: 'USD',
      value: 52,
    },
  });
  assert.equal(buildMetaAddToCart(item, 'USD').event, 'AddToCart');

  const checkout = buildMetaInitiateCheckout([item], 'USD');
  assert.equal(checkout.event, 'InitiateCheckout');
  assert.equal(checkout.params.num_items, 1);
  assert.doesNotMatch(JSON.stringify(checkout), /email|phone|cart_id|checkout_url/i);
});
