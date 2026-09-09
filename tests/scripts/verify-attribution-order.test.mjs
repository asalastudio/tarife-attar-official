import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ADMIN_API_VERSION,
  ATTRIBUTION_ORDER_QUERY,
  auditAttributionAttributes,
  fetchOrderAttributes,
  parseOrderArgument,
} from '../../scripts/verify-attribution-order.mjs';

test('accepts an exact order argument and rejects query fragments', () => {
  assert.equal(parseOrderArgument(['--order', '#1234']), '#1234');

  for (const argv of [
    [],
    ['--order'],
    ['--order', 'name:#1234 OR email:*'],
    ['--order', '#1234', '--extra'],
    ['--other', '#1234'],
  ]) {
    assert.throws(() => parseOrderArgument(argv));
  }
});

test('audits only ta_ keys and never returns attribute values', () => {
  const result = auditAttributionAttributes([
    { key: 'note', value: 'private note' },
    { key: 'ta_attribution_version', value: '1' },
    { key: 'ta_first_utm_source', value: 'omnisend' },
    { key: 'ta_first_landing_page', value: 'https://example.test/private' },
    { key: 'ta_latest_utm_source', value: 'omnisend' },
    { key: 'ta_latest_landing_page', value: 'https://example.test/private' },
    { key: 'ta_latest_utm_campaign', value: 'revenue_bridge' },
  ]);

  assert.equal(result.complete, true);
  assert.ok(result.statuses.every(({ key }) => key.startsWith('ta_')));
  assert.ok(result.statuses.every(({ status }) => status === 'present'));
  assert.doesNotMatch(JSON.stringify(result), /omnisend|private|revenue_bridge/);
});

test('reports every required key missing for an absent order', () => {
  const result = auditAttributionAttributes(null);
  assert.equal(result.complete, false);
  assert.ok(result.statuses.every(({ status }) => status === 'missing'));
  assert.equal(result.statuses.length, 5);
});

test('uses the fixed read-only Admin API query and safe order search', async () => {
  let captured;
  const attributes = await fetchOrderAttributes({
    domain: 'vasana-perfumes.myshopify.com',
    accessToken: 'secret-token',
    orderName: '#1234',
    fetchImpl: async (url, init) => {
      captured = { url, init };
      return new Response(
        JSON.stringify({
          data: {
            orders: {
              nodes: [
                {
                  name: '#1234',
                  customAttributes: [
                    { key: 'ta_attribution_version', value: '1' },
                  ],
                },
              ],
            },
          },
        }),
        { status: 200 },
      );
    },
  });

  assert.equal(ADMIN_API_VERSION, '2026-01');
  assert.equal(
    captured.url,
    'https://vasana-perfumes.myshopify.com/admin/api/2026-01/graphql.json',
  );
  const request = JSON.parse(captured.init.body);
  assert.equal(request.query, ATTRIBUTION_ORDER_QUERY);
  assert.deepEqual(request.variables, { query: 'name:#1234' });
  assert.deepEqual(attributes, [
    { key: 'ta_attribution_version', value: '1' },
  ]);
});

test('rejects non-Shopify domains before making a request', async () => {
  await assert.rejects(
    fetchOrderAttributes({
      domain: 'attacker.example',
      accessToken: 'secret-token',
      orderName: '#1234',
      fetchImpl: async () => {
        throw new Error('must not call');
      },
    }),
  );
});
