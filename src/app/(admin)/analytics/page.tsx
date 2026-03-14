'use client';

/**
 * Analytics Page
 *
 * Sales analytics, revenue breakdown, and performance metrics.
 */

import { useState } from 'react';

// Mock analytics data
const mockMetrics = {
  revenue: {
    total: 12450,
    shopify: 8120,
    etsy: 4330,
    previousPeriod: 11100,
    changePercent: 12.2,
  },
  orders: {
    total: 186,
    shopify: 124,
    etsy: 62,
    aov: 66.94,
  },
  units: {
    total: 248,
    shopify: 165,
    etsy: 83,
  },
};

const mockTerritoryData = [
  { territory: 'Ember', revenue: 4890, units: 98, percent: 39.3 },
  { territory: 'Tidal', revenue: 3110, units: 62, percent: 25.0 },
  { territory: 'Petal', revenue: 2680, units: 54, percent: 21.5 },
  { territory: 'Terra', revenue: 1770, units: 34, percent: 14.2 },
];

const mockTopProducts = [
  { title: 'Honey Oudh (6ml)', sku: 'TA-EMB-HONEY-6', units: 42, revenue: 1176, territory: 'Ember' },
  { title: 'Blue Oudh (6ml)', sku: 'TA-TID-BLUE-6', units: 38, revenue: 1216, territory: 'Tidal' },
  { title: 'Turkish Rose (6ml)', sku: 'TA-PET-ROSE-6', units: 31, revenue: 1085, territory: 'Petal' },
  { title: 'Moroccan Leather (6ml)', sku: 'TA-TER-LEATHER-6', units: 28, revenue: 1064, territory: 'Terra' },
  { title: 'Honey Oudh (12ml)', sku: 'TA-EMB-HONEY-12', units: 24, revenue: 1152, territory: 'Ember' },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Get territory color
  const getTerritoryColor = (territory: string) => {
    const colors: Record<string, string> = {
      Ember: 'bg-orange-500',
      Tidal: 'bg-blue-500',
      Petal: 'bg-pink-500',
      Terra: 'bg-green-500',
    };
    return colors[territory] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif italic text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">
            Sales performance and revenue breakdown.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              period === 'week'
                ? 'bg-theme-charcoal text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              period === 'month'
                ? 'bg-theme-charcoal text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              period === 'year'
                ? 'bg-theme-charcoal text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Total Revenue</span>
            <span className={`text-xs font-mono ${mockMetrics.revenue.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {mockMetrics.revenue.changePercent > 0 ? '+' : ''}{mockMetrics.revenue.changePercent}%
            </span>
          </div>
          <div className="text-3xl font-mono font-medium text-gray-900">
            ${mockMetrics.revenue.total.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            vs ${mockMetrics.revenue.previousPeriod.toLocaleString()} last {period}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Total Orders</span>
          </div>
          <div className="text-3xl font-mono font-medium text-gray-900">
            {mockMetrics.orders.total}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            AOV: ${mockMetrics.orders.aov.toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Units Sold</span>
          </div>
          <div className="text-3xl font-mono font-medium text-gray-900">
            {mockMetrics.units.total}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Avg {(mockMetrics.units.total / mockMetrics.orders.total).toFixed(1)} per order
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Avg Order Value</span>
          </div>
          <div className="text-3xl font-mono font-medium text-gray-900">
            ${mockMetrics.orders.aov.toFixed(2)}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            This {period}
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Revenue by Platform</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Shopify */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-gray-900">Shopify</span>
                  </div>
                  <span className="font-mono text-sm text-gray-900">
                    ${mockMetrics.revenue.shopify.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(mockMetrics.revenue.shopify / mockMetrics.revenue.total) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((mockMetrics.revenue.shopify / mockMetrics.revenue.total) * 100).toFixed(1)}% of total
                </div>
              </div>

              {/* Etsy */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm font-medium text-gray-900">Etsy</span>
                  </div>
                  <span className="font-mono text-sm text-gray-900">
                    ${mockMetrics.revenue.etsy.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${(mockMetrics.revenue.etsy / mockMetrics.revenue.total) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((mockMetrics.revenue.etsy / mockMetrics.revenue.total) * 100).toFixed(1)}% of total
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Territory Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Revenue by Territory</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockTerritoryData.map((territory) => (
                <div key={territory.territory}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${getTerritoryColor(territory.territory)}`} />
                      <span className="text-sm font-medium text-gray-900">{territory.territory}</span>
                    </div>
                    <span className="font-mono text-sm text-gray-900">
                      ${territory.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${getTerritoryColor(territory.territory)} h-2 rounded-full`}
                      style={{ width: `${territory.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>{territory.units} units</span>
                    <span>{territory.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Top Products</h3>
        </div>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Territory
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockTopProducts.map((product, index) => (
                <tr key={product.sku} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-400">#{index + 1}</span>
                      <span className="font-medium text-gray-900">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-600">{product.sku}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      product.territory === 'Ember' ? 'bg-orange-100 text-orange-700' :
                      product.territory === 'Tidal' ? 'bg-blue-100 text-blue-700' :
                      product.territory === 'Petal' ? 'bg-pink-100 text-pink-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {product.territory}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm text-gray-900">{product.units}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm font-medium text-gray-900">
                      ${product.revenue.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
