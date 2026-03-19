import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env manually
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

// Atlas product ID → best Shopify CDN image URL mapping
// Using old Shopify handles to map to correct images based on legacy names
const imagePatches = [
  // EMBER
  { id: 'product-aden', title: 'ADEN', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Aseel_149db521-8f19-440b-9a1e-f2b4f6ed98d4.jpg?v=1769116400' },
  { id: 'product-saana', title: 'SAANA', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Honey_Oudh_0c6396a2-f172-4a28-87d4-803056bacb8c.jpg?v=1758666982' },
  { id: 'product-granada', title: 'GRANADA', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Oudh_Tobacco_8d59abaf-8d41-4d41-b2f8-71a66ab34998.jpg?v=1769116398' },
  { id: 'product-malabar', title: 'MALABAR', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Vanilla_Sands.jpg?v=1758669428' },
  { id: 'product-serengeti', title: 'SERENGETI', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Black_Musk_4c602f31-f051-499c-bf0e-04f8c6612eb7.jpg?v=1758670943' },
  { id: 'product-beirut', title: 'BEIRUT', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Aseel_63faae9b-fa48-4fa4-a978-40e4dc0ae89c.jpg?v=1758673131' },
  { id: 'product-tarifa', title: 'TARIFA', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Rose_a63c494d-2b6e-4d13-88a4-482084e9715d.jpg?v=1758673105' },

  // TIDAL
  // BAHIA already has mainImage — skip
  // BAHRAIN already has mainImage — skip
  { id: 'product-big-sur', title: 'BIG SUR', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Rose_a63c494d-2b6e-4d13-88a4-482084e9715d.jpg?v=1758673105' },
  { id: 'product-meishan', title: 'MEISHAN', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Rose_7c5cad14-d578-4b66-b8d6-edf8e2048cd1.jpg?v=1758667052' },
  { id: 'product-monaco', title: 'MONACO', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Aseel_63faae9b-fa48-4fa4-a978-40e4dc0ae89c.jpg?v=1758673131' },
  { id: 'product-tangiers', title: 'TANGIERS', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Rose_62a887bb-603d-400d-8c99-551d7669f4e5.jpg?v=1758672986' },
  { id: 'product-tigris', title: 'TIGRIS', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/freepik__create-a-luxury-ecommerce-studioquality-editorial-__449.jpg?v=1758692848' },

  // PETAL
  { id: 'product-carmel', title: 'CARMEL', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Rose_a63c494d-2b6e-4d13-88a4-482084e9715d.jpg?v=1758673105' },
  { id: 'product-damascus', title: 'DAMASCUS', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Rose_a63c494d-2b6e-4d13-88a4-482084e9715d.jpg?v=1758673105' },
  { id: 'product-tobago', title: 'TOBAGO', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/freepik__create-a-luxury-ecommerce-studioquality-editorial-__448_69229292-005b-4ddb-9d06-eec70669848f.jpg?v=1769116364' },
  { id: 'product-kandy', title: 'KANDY', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/freepik__create-a-luxury-ecommerce-studioquality-editorial-__448.jpg?v=1758691250' },
  { id: 'product-manali', title: 'MANALI', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Aseel_577f0749-a8c5-4a0a-a414-0b893d7921ab.jpg?v=1758669516' },
  { id: 'product-medina', title: 'MEDINA', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/White_Musk_71652ee9-dbf1-4ebc-ad66-1e6c5bd37b57.jpg?v=1758667081' },
  { id: 'product-siwa', title: 'SIWA', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/White_Musk_66d60785-11ee-41fb-8410-fcefa7d63643.jpg?v=1769116403' },

  // TERRA
  { id: 'product-astoria', title: 'ASTORIA', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/freepik__create-a-luxury-ecommerce-studioquality-editorial-__16840_1b65ba27-4bf1-4c91-8803-cea9a5dcb560.png?v=1769116387' },
  // HAVANA already has mainImage — skip
  { id: 'product-hudson', title: 'HUDSON', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/freepik__create-a-luxury-ecommerce-studioquality-editorial-__16843.jpg?v=1758669722' },
  { id: 'product-marrakesh', title: 'MARRAKESH', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Oudh_Tobacco.jpg?v=1758669763' },
  // RIYADH (MrstQjdf6zzaYjkAerow7y) already has mainImage — skip
  { id: 'product-samarkand', title: 'SAMARKAND', url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/Oudh_Tobacco.jpg?v=1758669763' },
  // SICILY already has mainImage — skip
];

async function patchImages() {
  console.log(`\nPatching ${imagePatches.length} products with Shopify image URLs...\n`);

  let success = 0;
  let failed = 0;

  for (const patch of imagePatches) {
    try {
      await client
        .patch(patch.id)
        .set({ shopifyPreviewImageUrl: patch.url })
        .commit();
      console.log(`✅ ${patch.title} — image URL set`);
      success++;
    } catch (err) {
      console.error(`❌ ${patch.title} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${success} patched, ${failed} failed.`);
}

patchImages();
