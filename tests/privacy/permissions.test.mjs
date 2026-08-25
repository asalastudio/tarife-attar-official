import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePermissions } from '../../src/lib/privacy/permissions.ts';

const denied = {
  ready: false,
  analyticsAllowed: false,
  marketingAllowed: false,
  preferencesAllowed: false,
  saleOfDataAllowed: false,
};

test('fails closed before Shopify privacy is ready', () => {
  assert.deepEqual(normalizePermissions(null), denied);
});

test('uses Shopify allowed methods for the effective permission state', () => {
  assert.deepEqual(
    normalizePermissions({
      analyticsProcessingAllowed: () => true,
      marketingAllowed: () => false,
      preferencesProcessingAllowed: () => true,
      saleOfDataAllowed: () => false,
    }),
    {
      ready: true,
      analyticsAllowed: true,
      marketingAllowed: false,
      preferencesAllowed: true,
      saleOfDataAllowed: false,
    },
  );
});

test('fails closed when a Shopify permission method throws', () => {
  assert.deepEqual(
    normalizePermissions({
      analyticsProcessingAllowed: () => true,
      marketingAllowed: () => {
        throw new Error('privacy unavailable');
      },
      preferencesProcessingAllowed: () => true,
      saleOfDataAllowed: () => true,
    }),
    denied,
  );
});
