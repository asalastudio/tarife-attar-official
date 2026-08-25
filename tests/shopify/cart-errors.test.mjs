import test from 'node:test';
import assert from 'node:assert/strict';
import { assertCartMutationSuccess } from '../../src/lib/shopify/cart-errors.ts';

test('throws the first Shopify user error for a failed cart mutation', () => {
  assert.throws(
    () =>
      assertCartMutationSuccess(
        {
          userErrors: [
            {
              field: ['lines', '0'],
              message: 'Variant is unavailable',
              code: 'INVALID',
            },
          ],
        },
        'add item',
      ),
    new Error('Shopify could not add item: Variant is unavailable'),
  );
});

test('does not throw for warnings without user errors', () => {
  assert.doesNotThrow(() =>
    assertCartMutationSuccess(
      {
        userErrors: [],
        warnings: [
          { code: 'NOTE', message: 'Cart warning', target: 'cart' },
        ],
      },
      'update cart',
    ),
  );
});

test('treats a missing userErrors array as a successful legacy payload', () => {
  assert.doesNotThrow(() => assertCartMutationSuccess({}, 'create cart'));
});
