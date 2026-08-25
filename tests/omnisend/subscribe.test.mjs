import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildOmnisendPayload,
  submitSubscription,
} from '../../src/lib/omnisend/subscribe.ts';

const timestamp = '2026-08-25T16:00:00.000Z';

test('marks a reminder-only contact nonSubscribed without consent metadata', () => {
  const payload = buildOmnisendPayload(
    {
      email: ' Buyer@Example.com ',
      source: 'satchel',
      marketingConsent: false,
      cartItems: [{ title: 'Granada', price: '52.00' }],
    },
    timestamp,
  );

  assert.equal(payload.identifiers[0].id, 'buyer@example.com');
  assert.equal(
    payload.identifiers[0].channels.email.status,
    'nonSubscribed',
  );
  assert.equal(
    payload.identifiers[0].channels.email.statusChangedAt,
    timestamp,
  );
  assert.equal('consent' in payload.identifiers[0], false);
});

test('marks an explicit newsletter contact subscribed with consent metadata', () => {
  const payload = buildOmnisendPayload(
    {
      email: 'buyer@example.com',
      source: 'newsletter',
      marketingConsent: true,
    },
    timestamp,
  );

  assert.equal(payload.identifiers[0].channels.email.status, 'subscribed');
  assert.deepEqual(payload.identifiers[0].consent, {
    source: 'tarife-newsletter-form',
    createdAt: timestamp,
  });
});

test('rejects invalid consent, source, territory, email, and oversized carts', () => {
  for (const input of [
    { email: 'invalid', source: 'newsletter', marketingConsent: true },
    {
      email: 'buyer@example.com',
      source: 'unknown',
      marketingConsent: true,
    },
    {
      email: 'buyer@example.com',
      source: 'quiz',
      marketingConsent: 'yes',
    },
    {
      email: 'buyer@example.com',
      source: 'quiz',
      marketingConsent: false,
      territory: 'unknown',
    },
    {
      email: 'buyer@example.com',
      source: 'satchel',
      marketingConsent: false,
      cartItems: Array.from({ length: 101 }, () => ({
        title: 'Granada',
        price: '52.00',
      })),
    },
  ]) {
    assert.throws(() => buildOmnisendPayload(input, timestamp));
  }
});

test('returns 503 without configuration and never calls Omnisend', async () => {
  let called = false;
  const result = await submitSubscription({
    input: {
      email: 'buyer@example.com',
      source: 'newsletter',
      marketingConsent: true,
    },
    apiKey: '',
    fetchImpl: async () => {
      called = true;
      throw new Error('must not call');
    },
    now: () => timestamp,
  });

  assert.equal(called, false);
  assert.equal(result.status, 503);
  assert.equal(result.body.success, false);
});

test('returns 502 when Omnisend rejects the request', async () => {
  const result = await submitSubscription({
    input: {
      email: 'buyer@example.com',
      source: 'satchel',
      marketingConsent: false,
    },
    apiKey: 'configured',
    fetchImpl: async () => new Response('private upstream detail', { status: 400 }),
    now: () => timestamp,
  });

  assert.equal(result.status, 502);
  assert.deepEqual(result.body, {
    success: false,
    error: 'Email service rejected the request. Please try again.',
  });
});

test('uses the current Omnisend endpoint, headers, and returns success only for 2xx', async () => {
  let request;
  const result = await submitSubscription({
    input: {
      email: 'buyer@example.com',
      source: 'newsletter',
      marketingConsent: true,
    },
    apiKey: 'configured',
    fetchImpl: async (url, init) => {
      request = { url, init };
      return new Response('{}', { status: 201 });
    },
    now: () => timestamp,
  });

  assert.equal(request.url, 'https://api.omnisend.com/api/contacts');
  assert.equal(
    request.init.headers.Authorization,
    'Omnisend-API-Key configured',
  );
  assert.equal(request.init.headers['Omnisend-Version'], '2026-03-15');
  assert.equal(request.init.headers['Content-Type'], 'application/json');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { success: true });
});

test('returns 400 for invalid input and 500 for network failures', async () => {
  const invalid = await submitSubscription({
    input: { email: 'invalid', source: 'newsletter', marketingConsent: true },
    apiKey: 'configured',
    fetchImpl: fetch,
    now: () => timestamp,
  });
  assert.equal(invalid.status, 400);

  const failed = await submitSubscription({
    input: {
      email: 'buyer@example.com',
      source: 'newsletter',
      marketingConsent: true,
    },
    apiKey: 'configured',
    fetchImpl: async () => {
      throw new Error('network failed');
    },
    now: () => timestamp,
  });
  assert.equal(failed.status, 500);
  assert.equal(failed.body.success, false);
});
