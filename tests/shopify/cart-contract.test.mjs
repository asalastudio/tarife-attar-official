import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN = 'test-store.myshopify.com';
process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'test-token';

const {
  ADD_LINES_MUTATION,
  CART_ATTRIBUTES_UPDATE_MUTATION,
  CREATE_CART_MUTATION,
  GET_CART_QUERY,
  REMOVE_LINES_MUTATION,
  UPDATE_LINES_MUTATION,
} = await import('../../src/lib/shopify/client.ts');

test('every cart mutation requests Shopify user errors and warnings', () => {
  for (const mutation of [
    CREATE_CART_MUTATION,
    ADD_LINES_MUTATION,
    UPDATE_LINES_MUTATION,
    REMOVE_LINES_MUTATION,
    CART_ATTRIBUTES_UPDATE_MUTATION,
  ]) {
    assert.match(mutation, /userErrors\s*\{/);
    assert.match(mutation, /warnings\s*\{/);
  }
});

test('cart create and update accept attribution attributes', () => {
  assert.match(CREATE_CART_MUTATION, /\$input:\s*CartInput/);
  assert.match(CART_ATTRIBUTES_UPDATE_MUTATION, /cartAttributesUpdate/);
  assert.match(
    CART_ATTRIBUTES_UPDATE_MUTATION,
    /\$attributes:\s*\[AttributeInput!\]!/,
  );
});

test('cart responses expose attributes for idempotent synchronization', () => {
  for (const document of [
    CREATE_CART_MUTATION,
    GET_CART_QUERY,
    ADD_LINES_MUTATION,
    UPDATE_LINES_MUTATION,
    REMOVE_LINES_MUTATION,
    CART_ATTRIBUTES_UPDATE_MUTATION,
  ]) {
    assert.match(document, /attributes\s*\{\s*key\s+value\s*\}/);
  }
});
