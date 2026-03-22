#!/usr/bin/env node

/**
 * Generate Shopify Import CSV from Atlas Collection data.
 *
 * Usage: node scripts/generate-shopify-csv.mjs
 * Output: shopify-import-products.csv in project root
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { ALL_ATLAS_PRODUCTS, TERRITORIES } from './atlas-rebrand-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '..', 'shopify-import-products.csv');

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildDescriptionHTML(product) {
  const territory = TERRITORIES[product.territory];
  const legacy = product.legacyName ? `<p><em>Previously known as ${product.legacyName}</em></p>` : '';
  const evocation = product.evocationCopy
    ? `<p>${product.evocationCopy}</p>`
    : '';

  return `<h3>${product.atlasName}</h3>${legacy}<p>${product.scentNotes}</p>${evocation}<p><strong>${territory.name} Territory</strong> — ${territory.tagline}</p><p>Clean, skin-safe perfume oil. Alcohol-free. Cruelty-free.</p>`;
}

const headers = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags',
  'Published', 'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value',
  'Option3 Name', 'Option3 Value', 'Variant SKU', 'Variant Grams',
  'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
  'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
  'Variant Requires Shipping', 'Variant Taxable', 'Variant Barcode',
  'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card',
  'SEO Title', 'SEO Description', 'Google Shopping / Google Product Category',
  'Google Shopping / Gender', 'Google Shopping / Age Group', 'Variant Image',
  'Variant Weight Unit', 'Variant Tax Code', 'Cost per item', 'Included / United States',
  'Price / United States', 'Compare At Price / United States', 'Included / International',
  'Price / International', 'Compare At Price / International', 'Status',
];

const rows = [];

for (const product of ALL_ATLAS_PRODUCTS) {
  const territory = TERRITORIES[product.territory];
  const handle = product.slug;
  const title = product.atlasName;
  const bodyHtml = buildDescriptionHTML(product);
  const vendor = 'Tarife Attar';
  const productCategory = 'Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne';
  const type = 'Perfume Oil';

  const tags = [
    `Atlas Collection`,
    territory.name,
    `${territory.name} Territory`,
    product.legacyName ? `formerly ${product.legacyName}` : '',
    product.scentNotes,
    'perfume oil',
    'clean fragrance',
    'alcohol-free',
    'cruelty-free',
    'skin-safe',
  ].filter(Boolean).join(', ');

  const seoTitle = `${title} — ${product.legacyName ? product.legacyName + ' ' : ''}Perfume Oil | Tarife Attar Atlas Collection`;
  const seoDesc = `${product.scentNotes}. ${territory.name} Territory. Clean, skin-safe perfume oil. ${product.legacyName ? `Previously known as ${product.legacyName}. ` : ''}Alcohol-free, cruelty-free.`;

  // 6ml variant (first row for this product)
  rows.push([
    handle, title, bodyHtml, vendor, productCategory, type, tags,
    'TRUE', 'Size', '6ml', '', '', '', '',
    `TA-${handle.toUpperCase()}-6ML`, 30,
    'shopify', 10, 'deny', 'manual',
    product.price6ml, '', 'TRUE', 'TRUE', '',
    '', 1, `${title} perfume oil by Tarife Attar`,
    'FALSE',
    seoTitle, seoDesc,
    productCategory, 'Unisex', 'Adult', '',
    'g', '', '', 'TRUE', '', '', 'TRUE', '', '', 'active',
  ].map(escapeCSV).join(','));

  // 12ml variant (second row)
  rows.push([
    handle, '', '', '', '', '', '',
    '', 'Size', '12ml', '', '', '', '',
    `TA-${handle.toUpperCase()}-12ML`, 55,
    'shopify', 5, 'deny', 'manual',
    product.price12ml, '', 'TRUE', 'TRUE', '',
    '', '', '',
    '',
    '', '',
    '', '', '', '',
    'g', '', '', 'TRUE', '', '', 'TRUE', '', '', '',
  ].map(escapeCSV).join(','));
}

const csv = [headers.join(','), ...rows].join('\n') + '\n';
writeFileSync(outputPath, csv, 'utf-8');

console.log(`Wrote ${outputPath}`);
console.log(`  ${ALL_ATLAS_PRODUCTS.length} products, ${rows.length} rows (including variant rows)`);
