import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envFile = readFileSync(resolve(__dirname, '../.env'), 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const client = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: envVars.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function cleanup() {
  console.log('\n=== SANITY CLEANUP ===\n');

  // 1. Fix RIYADH duplicate — copy mainImage from old to new, then delete old
  console.log('--- RIYADH DUPLICATE FIX ---');
  try {
    const oldRiyadh = await client.getDocument('MrstQjdf6zzaYjkAerow7y');
    if (oldRiyadh?.mainImage) {
      await client
        .patch('product-riyadh')
        .set({ mainImage: oldRiyadh.mainImage })
        .commit();
      console.log('✅ Copied mainImage from old RIYADH to new RIYADH');
    }
    await client.delete('MrstQjdf6zzaYjkAerow7y');
    console.log('✅ Deleted old RIYADH (MrstQjdf6zzaYjkAerow7y)');
  } catch (err) {
    console.error('❌ RIYADH fix failed:', err.message);
  }

  // 2. Delete 44 orphaned Shopify-synced products (null title/slug)
  console.log('\n--- ORPHANED SHOPIFY PRODUCTS ---');
  const orphans = [
    'shopifyProduct-10002039210266',
    'shopifyProduct-10002039341338',
    'shopifyProduct-10002039439642',
    'shopifyProduct-10002039669018',
    'shopifyProduct-10002039767322',
    'shopifyProduct-10002040062234',
    'shopifyProduct-10002040324378',
    'shopifyProduct-10002041045274',
    'shopifyProduct-10002041798938',
    'shopifyProduct-10002042028314',
    'shopifyProduct-10002043011354',
    'shopifyProduct-10002043240730',
    'shopifyProduct-10002043830554',
    'shopifyProduct-10002043928858',
    'shopifyProduct-10002044092698',
    'shopifyProduct-10002044125466',
    'shopifyProduct-10002044256538',
    'shopifyProduct-10002044387610',
    'shopifyProduct-10002050744602',
    'shopifyProduct-10101413183770',
    'shopifyProduct-10101455716634',
    'shopifyProduct-10104463229210',
    'shopifyProduct-10104463261978',
    'shopifyProduct-10104463294746',
    'shopifyProduct-10104463360282',
    'shopifyProduct-10104463393050',
    'shopifyProduct-10104463491354',
    'shopifyProduct-10104463556890',
    'shopifyProduct-10104463589658',
    'shopifyProduct-10104463655194',
    'shopifyProduct-10104463687962',
    'shopifyProduct-10104463786266',
    'shopifyProduct-10104463884570',
    'shopifyProduct-10104463950106',
    'shopifyProduct-10104463982874',
    'shopifyProduct-10104464048410',
    'shopifyProduct-10104464146714',
    'shopifyProduct-10104464179482',
    'shopifyProduct-10104464212250',
    'shopifyProduct-10104464277786',
    'shopifyProduct-10104464310554',
    'shopifyProduct-10104464343322',
    'shopifyProduct-10104464408858',
    'shopifyProduct-10104464474394',
  ];

  let deleted = 0;
  let failed = 0;

  for (const id of orphans) {
    try {
      await client.delete(id);
      deleted++;
      if (deleted % 10 === 0) console.log(`  Deleted ${deleted}/${orphans.length}...`);
    } catch (err) {
      console.error(`  ❌ Failed to delete ${id}: ${err.message}`);
      failed++;
    }
  }
  console.log(`✅ Deleted ${deleted} orphaned products (${failed} failed)`);

  // 3. Final count
  console.log('\n--- FINAL PRODUCT COUNT ---');
  const remaining = await client.fetch('count(*[_type == "product" && !(_id in path("drafts.**"))])');
  console.log(`Total products remaining in Sanity: ${remaining}`);

  console.log('\n=== CLEANUP COMPLETE ===\n');
}

cleanup();
