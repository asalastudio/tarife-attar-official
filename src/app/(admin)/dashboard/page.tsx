/**
 * Admin Dashboard
 *
 * Overview of sales, inventory, and platform health.
 */

import Link from 'next/link';

// Placeholder data - in production, fetch from APIs
const mockMetrics = {
  today: {
    revenue: 520,
    orders: 8,
    shopifyRevenue: 340,
    etsyRevenue: 180,
  },
  month: {
    revenue: 12450,
    orders: 186,
    aov: 66.94,
    changePercent: 12.5,
  },
};

const mockLowStock = [
  { sku: 'TA-EMB-HONEY-6', title: 'Honey Oudh (6ml)', quantity: 3, territory: 'Ember' },
  { sku: 'TA-TID-BLUE-12', title: 'Blue Oudh (12ml)', quantity: 5, territory: 'Tidal' },
  { sku: 'TA-PET-ROSE-6', title: 'Turkish Rose (6ml)', quantity: 4, territory: 'Petal' },
];

const mockRecentOrders = [
  { id: '#1042', platform: 'Shopify', customer: 'Sarah M.', total: 89, status: 'Processing' },
  { id: '#1041', platform: 'Etsy', customer: 'Michael K.', total: 55, status: 'Shipped' },
  { id: '#1040', platform: 'Shopify', customer: 'Emily R.', total: 124, status: 'Processing' },
  { id: '#1039', platform: 'Etsy', customer: 'David L.', total: 42, status: 'Delivered' },
];

const mockSyncStatus = {
  lastSync: '5 minutes ago',
  productsInSync: 24,
  productsOutOfSync: 2,
  pendingUpdates: 1,
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-serif italic text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your operations across all platforms.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Revenue */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Today&apos;s Revenue</span>
            <span className="text-xs font-mono text-gray-400">LIVE</span>
          </div>
          <div className="text-3xl font-mono font-medium text-gray-900">
            ${mockMetrics.today.revenue}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="text-gray-500">
              Shopify: <span className="text-gray-900">${mockMetrics.today.shopifyRevenue}</span>
            </span>
            <span className="text-gray-500">
              Etsy: <span className="text-gray-900">${mockMetrics.today.etsyRevenue}</span>
            </span>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Today&apos;s Orders</span>
          </div>
          <div className="text-3xl font-mono font-medium text-gray-900">
            {mockMetrics.today.orders}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Across all platforms
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">This Month</span>
            <span className="text-xs font-mono text-green-600">
              +{mockMetrics.month.changePercent}%
            </span>
          </div>
          <div className="text-3xl font-mono font-medium text-gray-900">
            ${mockMetrics.month.revenue.toLocaleString()}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            {mockMetrics.month.orders} orders
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Avg Order Value</span>
          </div>
          <div className="text-3xl font-mono font-medium text-gray-900">
            ${mockMetrics.month.aov.toFixed(2)}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            This month
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Low Stock Alert</h3>
            <Link
              href="/admin/inventory"
              className="text-sm text-theme-gold hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {mockLowStock.map((item) => (
              <div key={item.sku} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    <span className="font-mono">{item.sku}</span>
                    <span className="mx-2">·</span>
                    <span>{item.territory}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`
                    px-2 py-1 rounded text-xs font-mono
                    ${item.quantity <= 3 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                  `}>
                    {item.quantity} left
                  </span>
                  <button className="text-sm text-theme-gold hover:underline">
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-sm text-theme-gold hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {mockRecentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`
                    w-2 h-2 rounded-full
                    ${order.platform === 'Shopify' ? 'bg-green-500' : 'bg-orange-500'}
                  `} />
                  <div>
                    <div className="font-medium text-gray-900">{order.id}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{order.customer}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-gray-900">${order.total}</div>
                  <div className={`text-xs mt-0.5 ${
                    order.status === 'Delivered' ? 'text-green-600' :
                    order.status === 'Shipped' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Platform Sync Status</h3>
          <button className="px-4 py-2 bg-theme-charcoal text-white text-sm rounded-lg hover:bg-theme-charcoal/90 transition-colors">
            Sync Now
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Last Sync</div>
              <div className="font-medium text-gray-900">{mockSyncStatus.lastSync}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Products In Sync</div>
              <div className="font-medium text-green-600">{mockSyncStatus.productsInSync}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Out of Sync</div>
              <div className="font-medium text-red-600">{mockSyncStatus.productsOutOfSync}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Pending Updates</div>
              <div className="font-medium text-yellow-600">{mockSyncStatus.pendingUpdates}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/inventory"
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-theme-gold transition-colors group"
        >
          <h4 className="font-medium text-gray-900 group-hover:text-theme-gold transition-colors">
            Manage Inventory
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            Update stock levels across Shopify and Etsy
          </p>
        </Link>

        <Link
          href="/admin/products"
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-theme-gold transition-colors group"
        >
          <h4 className="font-medium text-gray-900 group-hover:text-theme-gold transition-colors">
            Product Content
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            Generate AI descriptions and sync to platforms
          </p>
        </Link>

        <Link
          href="/admin/analytics"
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-theme-gold transition-colors group"
        >
          <h4 className="font-medium text-gray-900 group-hover:text-theme-gold transition-colors">
            Sales Analytics
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            Revenue by territory, platform breakdown
          </p>
        </Link>
      </div>
    </div>
  );
}
