#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const ADMIN_API_VERSION = '2026-01';

export const ATTRIBUTION_ORDER_QUERY = `query AttributionOrderAudit($query: String!) {
  orders(first: 1, query: $query) {
    nodes { name customAttributes { key value } }
  }
}`;

export const REQUIRED_ATTRIBUTION_KEYS = [
  'ta_attribution_version',
  'ta_first_utm_source',
  'ta_first_landing_page',
  'ta_latest_utm_source',
  'ta_latest_landing_page',
];

export function parseOrderArgument(argv) {
  if (
    argv.length !== 2 ||
    argv[0] !== '--order' ||
    typeof argv[1] !== 'string' ||
    !/^#[0-9]{1,20}$/.test(argv[1])
  ) {
    throw new Error('Usage: verify-attribution-order --order #1234');
  }

  return argv[1];
}

function normalizeShopifyDomain(domain) {
  const normalized = String(domain || '').trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(normalized)) {
    throw new Error('A valid Shopify store domain is required.');
  }
  return normalized;
}

export function auditAttributionAttributes(attributes) {
  const presentKeys = new Set(
    (Array.isArray(attributes) ? attributes : [])
      .filter(
        (attribute) =>
          attribute &&
          typeof attribute.key === 'string' &&
          attribute.key.startsWith('ta_') &&
          typeof attribute.value === 'string' &&
          attribute.value.trim().length > 0,
      )
      .map(({ key }) => key),
  );

  const keysToReport = new Set([
    ...REQUIRED_ATTRIBUTION_KEYS,
    ...presentKeys,
  ]);
  const statuses = Array.from(keysToReport)
    .sort()
    .map((key) => ({
      key,
      status: presentKeys.has(key) ? 'present' : 'missing',
    }));

  return {
    complete: REQUIRED_ATTRIBUTION_KEYS.every((key) => presentKeys.has(key)),
    statuses,
  };
}

export async function fetchOrderAttributes({
  domain,
  accessToken,
  orderName,
  fetchImpl = fetch,
}) {
  const shopifyDomain = normalizeShopifyDomain(domain);
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('A Shopify Admin API token is required.');
  }
  if (!/^#[0-9]{1,20}$/.test(orderName)) {
    throw new Error('A valid Shopify order name is required.');
  }

  const response = await fetchImpl(
    `https://${shopifyDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: ATTRIBUTION_ORDER_QUERY,
        variables: { query: `name:${orderName}` },
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Shopify rejected the attribution audit.');
  }

  const body = await response.json();
  if (body.errors) {
    throw new Error('Shopify could not complete the attribution audit.');
  }

  const order = body.data?.orders?.nodes?.[0];
  if (!order || order.name !== orderName) return null;
  return Array.isArray(order.customAttributes)
    ? order.customAttributes
    : [];
}

async function main() {
  let orderName;
  try {
    orderName = parseOrderArgument(process.argv.slice(2));
  } catch {
    console.error('Usage: node scripts/verify-attribution-order.mjs --order #1234');
    return 1;
  }

  const domain =
    process.env.SHOPIFY_STORE_DOMAIN ||
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
    '';
  const accessToken =
    process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ||
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ||
    '';

  let attributes;
  try {
    attributes = await fetchOrderAttributes({
      domain,
      accessToken,
      orderName,
    });
  } catch {
    console.error('Attribution audit could not be completed.');
    return 1;
  }

  const result = auditAttributionAttributes(attributes);
  for (const { key, status } of result.statuses) {
    console.log(`${key}: ${status}`);
  }
  return result.complete ? 0 : 1;
}

const isDirectInvocation =
  Boolean(process.argv[1]) &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectInvocation) {
  process.exitCode = await main();
}
