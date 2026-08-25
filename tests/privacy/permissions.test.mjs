import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SETTLED_DENIED_PERMISSIONS,
  normalizePermissions,
  settlePermissions,
} from '../../src/lib/privacy/permissions.ts';

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

test('settles unavailable privacy controls without granting measurement permission', () => {
  assert.deepEqual(SETTLED_DENIED_PERMISSIONS, {
    ready: true,
    analyticsAllowed: false,
    marketingAllowed: false,
    preferencesAllowed: false,
    saleOfDataAllowed: false,
  });
});

test('settles a broken Shopify permission API without deadlocking commerce', () => {
  assert.deepEqual(
    settlePermissions({
      analyticsProcessingAllowed: () => {
        throw new Error('privacy unavailable');
      },
      marketingAllowed: () => true,
      preferencesProcessingAllowed: () => true,
      saleOfDataAllowed: () => true,
    }),
    SETTLED_DENIED_PERMISSIONS,
  );
});
