#!/usr/bin/env node
/**
 * Sync evocation copy + on-skin stories from local files to Sanity.
 *
 * Reads from evocation-copy.mjs (and onskin-copy.mjs if it exists),
 * then patches atlasData.evocationStory and atlasData.onSkinStory
 * for all 28 Atlas products.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=xxx node scripts/sync-evocation-to-sanity.mjs
 *   SANITY_WRITE_TOKEN=xxx node scripts/sync-evocation-to-sanity.mjs --dry-run
 */

import { createClient } from '@sanity/client';
import { EVOCATION_COPY } from './evocation-copy.mjs';

let ONSKIN_COPY = {};
try {
  const mod = await import('./onskin-copy.mjs');
  ONSKIN_COPY = mod.ONSKIN_COPY || {};
} catch {
  // onskin-copy.mjs doesn't exist yet — skip
}

const projectId = '8h5l91ut';
const dataset = 'production';
const apiVersion = '2025-12-31';
const token = process.env.SANITY_WRITE_TOKEN;
const isDryRun = process.argv.includes('--dry-run');

if (!token && !isDryRun) {
  console.error('ERROR: SANITY_WRITE_TOKEN required. Or use --dry-run.');
  process.exit(1);
}

const clientConfig = { projectId, dataset, apiVersion, useCdn: false };
if (token) clientConfig.token = token;
const client = createClient(clientConfig);

async function main() {
  console.log('');
  console.log('='.repeat(60));
  console.log('  SYNC EVOCATION COPY TO SANITY');
  console.log('='.repeat(60));
  if (isDryRun) console.log('  [DRY RUN — no changes will be written]');
  console.log('');

  const products = await client.fetch(`*[_type == "product" && collectionType == "atlas"] {
    _id, title, "slug": slug.current,
    "evocationStory": atlasData.evocationStory,
    "onSkinStory": atlasData.onSkinStory
  }`);

  console.log(`Found ${products.length} Atlas products in Sanity`);
  console.log(`Evocation entries: ${Object.keys(EVOCATION_COPY).length}`);
  console.log(`On-skin entries: ${Object.keys(ONSKIN_COPY).length}`);
  console.log('');

  const transaction = client.transaction();
  let evocationUpdated = 0;
  let onskinUpdated = 0;
  let skipped = 0;

  for (const product of products) {
    const slug = product.slug;
    const newEvocation = EVOCATION_COPY[slug];
    const newOnskin = ONSKIN_COPY[slug];
    const changes = [];

    if (newEvocation) {
      const newArray = [newEvocation];
      const oldFirst = product.evocationStory?.[0] || '';
      if (oldFirst !== newEvocation) {
        changes.push('evocationStory');
        if (!isDryRun) {
          transaction.patch(product._id, (p) =>
            p.set({ 'atlasData.evocationStory': newArray })
          );
        }
        evocationUpdated++;
      }
    }

    if (newOnskin) {
      const newArray = Array.isArray(newOnskin) ? newOnskin : [newOnskin];
      const oldFirst = product.onSkinStory?.[0] || '';
      if (oldFirst !== newArray[0]) {
        changes.push('onSkinStory');
        if (!isDryRun) {
          transaction.patch(product._id, (p) =>
            p.set({ 'atlasData.onSkinStory': newArray })
          );
        }
        onskinUpdated++;
      }
    }

    if (changes.length > 0) {
      console.log(`[~] ${product.title} (${slug}) — updating ${changes.join(', ')}`);
    } else if (!newEvocation && !newOnskin) {
      console.log(`[!] ${product.title} (${slug}) — no copy found in source files`);
      skipped++;
    } else {
      console.log(`[.] ${product.title} (${slug}) — already up to date`);
      skipped++;
    }
  }

  console.log('');
  if (!isDryRun && (evocationUpdated > 0 || onskinUpdated > 0)) {
    console.log('Committing to Sanity...');
    await transaction.commit();
    console.log('Done!');
  }

  console.log('');
  console.log(`  Evocation updated: ${evocationUpdated}`);
  console.log(`  On-skin updated:   ${onskinUpdated}`);
  console.log(`  Skipped:           ${skipped}`);
  console.log('');
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
