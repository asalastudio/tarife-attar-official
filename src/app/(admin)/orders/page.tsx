'use client';

/**
 * Orders Management Page
 *
 * Unified view of orders from Shopify and Etsy.
 */

import { useState } from 'react';

// Mock orders data
const mockOrders = [
  {
    id: '1',
    orderNumber: '#1042',
    platform: 'Shopify',
    customer: 'Sarah Mitchell',
    email: 'sarah.m@email.com',
    items: 2,
    total: 89,
    status: 'Processing',
    createdAt: '2026-03-14T10:30:00Z',
  },
  {
    id: '2',
    orderNumber: 'ETSY-8847291',
    platform: 'Etsy',
    customer: 'Michael Kim',
    email: 'mkim@email.com',
    items: 1,
    total: 55,
    status: 'Shipped',
    createdAt: '2026-03-14T09:15:00Z',
  },
  {
    id: '3',
    orderNumber: '#1041',
    platform: 'Shopify',
    customer: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    items: 3,
    total: 124,
    status: 'Processing',
    createdAt: '2026-03-14T08:45:00Z',
  },
  {
    id: '4',
    orderNumber: 'ETSY-8847156',
    platform: 'Etsy',
    customer: 'David Lee',
    email: 'dlee@email.com',
    items: 1,
    total: 42,
    status: 'Delivered',
    createdAt: '2026-03-13T16:20:00Z',
  },
  {
    id: '5',
    orderNumber: '#1040',
    platform: 'Shopify',
    customer: 'Amanda Foster',
    email: 'afoster@email.com',
    items: 2,
    total: 76,
    status: 'Delivered',
    createdAt: '2026-03-13T14:10:00Z',
  },
];

export default function OrdersPage() {
  const [orders] = useState(mockOrders);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filterPlatform !== 'all' && order.platform !== filterPlatform) return false;
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    return true;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Processing: 'bg-yellow-100 text-yellow-700',
      Shipped: 'bg-blue-100 text-blue-700',
      Delivered: 'bg-green-100 text-green-700',
      Cancelled: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif italic text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500 mt-1">
            View and manage orders from all platforms.
          </p>
        </div>
        <button className="px-4 py-2 bg-theme-charcoal text-white text-sm rounded-lg hover:bg-theme-charcoal/90 transition-colors">
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Platform</label>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Platforms</option>
              <option value="Shopify">Shopify</option>
              <option value="Etsy">Etsy</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            {filteredOrders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        order.platform === 'Shopify' ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                    />
                    <span className="text-sm text-gray-600">{order.platform}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                  <div className="text-xs text-gray-500">{order.email}</div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-sm text-gray-600">{order.items}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    ${order.total}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-500">Total Orders (Today)</div>
          <div className="text-2xl font-mono font-medium text-gray-900 mt-1">
            {orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-500">Processing</div>
          <div className="text-2xl font-mono font-medium text-yellow-600 mt-1">
            {orders.filter(o => o.status === 'Processing').length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-500">Shipped</div>
          <div className="text-2xl font-mono font-medium text-blue-600 mt-1">
            {orders.filter(o => o.status === 'Shipped').length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-mono font-medium text-green-600 mt-1">
            ${orders.reduce((sum, o) => sum + o.total, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
