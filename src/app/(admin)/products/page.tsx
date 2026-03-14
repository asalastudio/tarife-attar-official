'use client';

/**
 * Products Management Page
 *
 * Unified product view with AI content generation.
 * Manages product data across Sanity, Shopify, and Etsy.
 */

import { useState } from 'react';
import Link from 'next/link';

// Mock product data
const mockProducts = [
  {
    id: '1',
    title: 'Honey Oudh',
    legacyName: 'Oud Honey',
    slug: 'honey-oudh',
    territory: 'Ember',
    collection: 'Atlas',
    hasEvocation: true,
    hasOnSkin: true,
    shopifyLinked: true,
    etsyLinked: true,
    sanityId: 'prod_001',
  },
  {
    id: '2',
    title: 'Blue Oudh',
    legacyName: null,
    slug: 'blue-oudh',
    territory: 'Tidal',
    collection: 'Atlas',
    hasEvocation: true,
    hasOnSkin: false,
    shopifyLinked: true,
    etsyLinked: false,
    sanityId: 'prod_002',
  },
  {
    id: '3',
    title: 'Turkish Rose',
    legacyName: 'Rose Attar',
    slug: 'turkish-rose',
    territory: 'Petal',
    collection: 'Atlas',
    hasEvocation: false,
    hasOnSkin: false,
    shopifyLinked: true,
    etsyLinked: true,
    sanityId: 'prod_003',
  },
  {
    id: '4',
    title: 'Moroccan Leather',
    legacyName: null,
    slug: 'moroccan-leather',
    territory: 'Terra',
    collection: 'Atlas',
    hasEvocation: true,
    hasOnSkin: true,
    shopifyLinked: true,
    etsyLinked: true,
    sanityId: 'prod_004',
  },
  {
    id: '5',
    title: 'Vintage Assam Oud',
    legacyName: null,
    slug: 'vintage-assam-oud',
    territory: null,
    collection: 'Relic',
    hasEvocation: false,
    hasOnSkin: false,
    shopifyLinked: true,
    etsyLinked: false,
    sanityId: 'prod_005',
  },
];

export default function ProductsPage() {
  const [products] = useState(mockProducts);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filterCollection, setFilterCollection] = useState<string>('all');
  const [filterTerritory, setFilterTerritory] = useState<string>('all');
  const [filterContentStatus, setFilterContentStatus] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (filterCollection !== 'all' && product.collection !== filterCollection) return false;
    if (filterTerritory !== 'all' && product.territory !== filterTerritory) return false;
    if (filterContentStatus === 'complete' && (!product.hasEvocation || !product.hasOnSkin)) return false;
    if (filterContentStatus === 'incomplete' && product.hasEvocation && product.hasOnSkin) return false;
    return true;
  });

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Select all
  const selectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  // Generate AI content for selected products
  const generateContent = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setSelectedProducts([]);
    alert('Content generation complete! (Demo)');
  };

  // Get territory badge
  const getTerritoryBadge = (territory: string | null) => {
    if (!territory) return null;
    const styles: Record<string, string> = {
      Ember: 'bg-orange-100 text-orange-700',
      Petal: 'bg-pink-100 text-pink-700',
      Tidal: 'bg-blue-100 text-blue-700',
      Terra: 'bg-green-100 text-green-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs ${styles[territory]}`}>
        {territory}
      </span>
    );
  };

  // Get content status
  const getContentStatus = (product: typeof mockProducts[0]) => {
    const complete = product.hasEvocation && product.hasOnSkin;
    const partial = product.hasEvocation || product.hasOnSkin;

    if (complete) {
      return (
        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
          Complete
        </span>
      );
    } else if (partial) {
      return (
        <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">
          Partial
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
          Missing
        </span>
      );
    }
  };

  // Get platform links
  const getPlatformLinks = (product: typeof mockProducts[0]) => {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${product.shopifyLinked ? 'bg-green-500' : 'bg-gray-300'}`}
          title={product.shopifyLinked ? 'Shopify linked' : 'Shopify not linked'}
        />
        <span
          className={`w-2 h-2 rounded-full ${product.etsyLinked ? 'bg-orange-500' : 'bg-gray-300'}`}
          title={product.etsyLinked ? 'Etsy linked' : 'Etsy not linked'}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif italic text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage product content and platform connections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedProducts.length > 0 && (
            <>
              <button
                onClick={generateContent}
                disabled={isGenerating}
                className="px-4 py-2 bg-theme-gold text-white text-sm rounded-lg hover:bg-theme-gold/90 transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : `Generate Content (${selectedProducts.length})`}
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Push to Etsy
              </button>
            </>
          )}
        </div>
      </div>

      {/* AI Content Generator Card */}
      <div className="bg-gradient-to-r from-theme-charcoal to-gray-800 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium">AI Content Generator</h3>
            <p className="text-sm text-white/70 mt-1 max-w-xl">
              Generate brand-aligned product descriptions using the Tarife Attär Brand Agent.
              Creates evocations, on-skin descriptions, and Etsy-optimized listings.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/50">Brand Agent Status</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm">Ready</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <select className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white">
            <option value="evocation">Generate Evocation (3 paragraphs)</option>
            <option value="onskin">Generate On Skin (2 paragraphs)</option>
            <option value="etsy">Generate Etsy Listing</option>
            <option value="all">Generate All Content</option>
          </select>
          <button
            onClick={generateContent}
            disabled={selectedProducts.length === 0 || isGenerating}
            className="px-4 py-2 bg-white text-theme-charcoal text-sm font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Processing...' : 'Generate for Selected'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Collection</label>
            <select
              value={filterCollection}
              onChange={(e) => setFilterCollection(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Collections</option>
              <option value="Atlas">Atlas</option>
              <option value="Relic">Relic</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Territory</label>
            <select
              value={filterTerritory}
              onChange={(e) => setFilterTerritory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Territories</option>
              <option value="Ember">Ember</option>
              <option value="Petal">Petal</option>
              <option value="Tidal">Tidal</option>
              <option value="Terra">Terra</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Content Status</label>
            <select
              value={filterContentStatus}
              onChange={(e) => setFilterContentStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="complete">Complete</option>
              <option value="incomplete">Needs Content</option>
            </select>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            {filteredProducts.length} products
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={selectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Collection
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Territory
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platforms
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className={`${selectedProducts.includes(product.id) ? 'bg-blue-50' : ''} hover:bg-gray-50`}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-900">{product.title}</div>
                  {product.legacyName && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Formerly: {product.legacyName}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    product.collection === 'Atlas'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {product.collection}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {getTerritoryBadge(product.territory)}
                  {!product.territory && (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-center">
                  {getContentStatus(product)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-3">
                    {getPlatformLinks(product)}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-sm text-theme-gold hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/product/${product.slug}`}
                      target="_blank"
                      className="text-sm text-gray-500 hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Content Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-500">Total Products</div>
          <div className="text-2xl font-mono font-medium text-gray-900 mt-1">
            {products.length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-500">Content Complete</div>
          <div className="text-2xl font-mono font-medium text-green-600 mt-1">
            {products.filter((p) => p.hasEvocation && p.hasOnSkin).length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-500">Needs Content</div>
          <div className="text-2xl font-mono font-medium text-yellow-600 mt-1">
            {products.filter((p) => !p.hasEvocation || !p.hasOnSkin).length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-500">Not on Etsy</div>
          <div className="text-2xl font-mono font-medium text-orange-600 mt-1">
            {products.filter((p) => !p.etsyLinked).length}
          </div>
        </div>
      </div>
    </div>
  );
}
