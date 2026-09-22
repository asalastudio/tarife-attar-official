/**
 * Backfill Product Prices from Shopify into Sanity
 *
 * WHY: Sanity's `store.priceRange` object is a read-only mirror populated by the
 * Shopify Connect app. That sync is not running — as of 2026-07-25, 28 of 34
 * live products had neither `price` nor `store.priceRange`, so the site fell back
 * to an estimated territory price table. This script writes the real Shopify
 * variant prices into the writable `price` / `priceMax` fields so the site shows
 * actual prices instead of estimates.
 *
 * Matching is done by Shopify VARIANT id (the same ids that drive Add-to-Cart),
 * not by title or handle, so a price can never land on the wrong product.
 *
 * Usage:
 *   node scripts/backfill-prices-from-shopify.mjs --dry-run    # Preview (RECOMMENDED FIRST)
 *   node scripts/backfill-prices-from-shopify.mjs              # Apply
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile(filename) {
  try {
    const envFile = readFileSync(join(__dirname, '..', filename), 'utf-8');
    envFile.split('\n').forEach((line) => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match && !match[1].startsWith('#')) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = value;
      }
    });
  } catch {
    // File may not exist; that's fine.
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const SHOPIFY_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'vasana-perfumes.myshopify.com';
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = '2024-10';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const isDryRun = process.argv.includes('--dry-run');

async function shopifyAdmin(query, variables = {}) {
  if (!SHOPIFY_ADMIN_TOKEN) throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN not set');

  const response = await fetch(
    `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const json = await response.json();
  if (json.errors) {
    console.error('Shopify API Error:', json.errors);
    throw new Error(json.errors[0]?.message || 'Shopify API error');
  }
  return json.data;
}

async function fetchShopifyProducts() {
  const products = [];
  let cursor = null;

  do {
    const query = `
      query GetProducts($cursor: String) {
        products(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            title
            handle
            status
            variants(first: 25) {
              nodes { id title sku price }
            }
          }
        }
      }
    `;
    const data = await shopifyAdmin(query, { cursor });
    products.push(...data.products.nodes);
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (cursor);

  return products;
}

function money(n) {
  return n === null || n === undefined ? '—' : `$${n}`;
}

async function main() {
  console.log('\n  BACKFILL PRICES: SHOPIFY → SANITY\n');
  console.log(`  MODE: ${isDryRun ? 'DRY RUN' : 'LIVE'}\n`);

  if (!SHOPIFY_ADMIN_TOKEN) {
    console.error('  Missing SHOPIFY_ADMIN_ACCESS_TOKEN\n');
    process.exit(1);
  }
  if (!isDryRun && !(process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN)) {
    console.error('  Missing SANITY_API_WRITE_TOKEN / SANITY_WRITE_TOKEN\n');
    process.exit(1);
  }

  // 1. Live Shopify prices, indexed by variant GID
  const shopifyProducts = await fetchShopifyProducts();
  const variantIndex = new Map(); // variant gid -> { price, productTitle, variantTitle }
  for (const p of shopifyProducts) {
    for (const v of p.variants.nodes) {
      variantIndex.set(v.id, {
        price: parseFloat(v.price),
        productTitle: p.title,
        variantTitle: v.title,
        productStatus: p.status,
      });
    }
  }
  console.log(`  Shopify: ${shopifyProducts.length} products, ${variantIndex.size} variants\n`);

  // 2. Sanity products that are linked to Shopify
  const sanityProducts = await sanityClient.fetch(`
    *[_type == "product" && !(_id in path("drafts.**")) && defined(slug.current) && (
      defined(shopifyVariantId) || defined(shopifyVariant6mlId) || defined(shopifyVariant12mlId)
    )]{
      _id, title, "slug": slug.current, price, priceMax,
      shopifyVariantId, shopifyVariant6mlId, shopifyVariant12mlId
    } | order(slug asc)
  `);
  console.log(`  Sanity: ${sanityProducts.length} products with Shopify variant links\n`);

  const updates = [];
  const unmatched = [];
  const unchanged = [];

  for (const doc of sanityProducts) {
    // Collect every linked variant we can resolve to a live Shopify price.
    const candidateIds = [
      doc.shopifyVariant6mlId,
      doc.shopifyVariant12mlId,
      doc.shopifyVariantId,
    ].filter(Boolean);

    const resolved = candidateIds
      .map((id) => variantIndex.get(id))
      .filter((v) => v && Number.isFinite(v.price));

    if (resolved.length === 0) {
      unmatched.push(doc);
      continue;
    }

    const prices = resolved.map((v) => v.price);
    const newPrice = Math.min(...prices);
    const newPriceMax = Math.max(...prices);

    // Only set priceMax when there genuinely are two different price points.
    const targetPriceMax = newPriceMax !== newPrice ? newPriceMax : undefined;

    const priceChanged = doc.price !== newPrice;
    const priceMaxChanged = (doc.priceMax ?? undefined) !== targetPriceMax;

    if (!priceChanged && !priceMaxChanged) {
      unchanged.push(doc);
      continue;
    }

    updates.push({
      doc,
      newPrice,
      targetPriceMax,
      shopifyTitle: resolved[0].productTitle,
      variantCount: resolved.length,
    });
  }

  // 3. Report
  console.log(`  To update:  ${updates.length}`);
  console.log(`  Unchanged:  ${unchanged.length}`);
  console.log(`  Unmatched:  ${unmatched.length}\n`);

  if (updates.length > 0) {
    console.log('  CHANGES:\n');
    for (const u of updates) {
      console.log(`    ${u.doc.slug}  (Shopify: "${u.shopifyTitle}", ${u.variantCount} variant(s))`);
      console.log(
        `       price:    ${money(u.doc.price)} → ${money(u.newPrice)}` +
        `     priceMax: ${money(u.doc.priceMax)} → ${money(u.targetPriceMax)}`
      );
    }
    console.log('');
  }

  if (unmatched.length > 0) {
    console.log('  UNMATCHED (Shopify variant id not found live — left untouched):');
    unmatched.forEach((d) => console.log(`    ${d.slug}`));
    console.log('');
  }

  if (isDryRun) {
    console.log('  DRY RUN COMPLETE. Re-run without --dry-run to apply.\n');
    return;
  }

  if (updates.length === 0) {
    console.log('  Nothing to write.\n');
    return;
  }

  // 4. Apply
  console.log('  WRITING...\n');
  let written = 0;
  let failed = 0;

  for (const u of updates) {
    try {
      let patch = sanityClient.patch(u.doc._id).set({ price: u.newPrice });
      patch = u.targetPriceMax === undefined
        ? patch.unset(['priceMax'])
        : patch.set({ priceMax: u.targetPriceMax });
      await patch.commit();
      written++;
      console.log(`    ✓ ${u.doc.slug}`);
    } catch (e) {
      failed++;
      console.error(`    ✗ ${u.doc.slug}: ${e.message}`);
    }
  }

  console.log(`\n  DONE: ${written} updated, ${failed} failed\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
