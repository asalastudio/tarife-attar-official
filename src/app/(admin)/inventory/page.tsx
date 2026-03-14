'use client';

/**
 * Inventory Management Page
 *
 * Unified view of inventory across Shopify and Etsy.
 * Allows bulk updates and sync operations.
 */

import { useState } from 'react';

// Mock inventory data - in production, fetch from unified database
const mockInventory = [
  {
    id: '1',
    sku: 'TA-EMB-HONEY-6',
    title: 'Honey Oudh',
    variant: '6ml',
    territory: 'Ember',
    collection: 'Atlas',
    costPrice: 12,
    retailPrice: 28,
    localQuantity: 24,
    shopifyQuantity: 24,
    etsyQuantity: 24,
    syncStatus: 'synced' as const,
    lowStockThreshold: 5,
  },
  {
    id: '2',
    sku: 'TA-EMB-HONEY-12',
    title: 'Honey Oudh',
    variant: '12ml',
    territory: 'Ember',
    collection: 'Atlas',
    costPrice: 20,
    retailPrice: 48,
    localQuantity: 18,
    shopifyQuantity: 18,
    etsyQuantity: 18,
    syncStatus: 'synced' as const,
    lowStockThreshold: 5,
  },
  {
    id: '3',
    sku: 'TA-TID-BLUE-6',
    title: 'Blue Oudh',
    variant: '6ml',
    territory: 'Tidal',
    collection: 'Atlas',
    costPrice: 14,
    retailPrice: 32,
    localQuantity: 5,
    shopifyQuantity: 5,
    etsyQuantity: 3,
    syncStatus: 'out_of_sync' as const,
    lowStockThreshold: 5,
  },
  {
    id: '4',
    sku: 'TA-PET-ROSE-6',
    title: 'Turkish Rose',
    variant: '6ml',
    territory: 'Petal',
    collection: 'Atlas',
    costPrice: 15,
    retailPrice: 35,
    localQuantity: 4,
    shopifyQuantity: 4,
    etsyQuantity: 4,
    syncStatus: 'synced' as const,
    lowStockThreshold: 5,
  },
  {
    id: '5',
    sku: 'TA-TER-LEATHER-6',
    title: 'Moroccan Leather',
    variant: '6ml',
    territory: 'Terra',
    collection: 'Atlas',
    costPrice: 16,
    retailPrice: 38,
    localQuantity: 12,
    shopifyQuantity: 12,
    etsyQuantity: 10,
    syncStatus: 'out_of_sync' as const,
    lowStockThreshold: 5,
  },
  {
    id: '6',
    sku: 'TA-REL-OUD-ASSAM-3',
    title: 'Vintage Assam Oud',
    variant: '3ml',
    territory: null,
    collection: 'Relic',
    costPrice: 180,
    retailPrice: 320,
    localQuantity: 3,
    shopifyQuantity: 3,
    etsyQuantity: 3,
    syncStatus: 'synced' as const,
    lowStockThreshold: 2,
  },
];

type SyncStatus = 'synced' | 'out_of_sync' | 'pending' | 'error';
type Territory = 'Ember' | 'Petal' | 'Tidal' | 'Terra' | null;

export default function InventoryPage() {
  const [inventory, setInventory] = useState(mockInventory);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterTerritory, setFilterTerritory] = useState<string>('all');
  const [filterCollection, setFilterCollection] = useState<string>('all');
  const [filterSync, setFilterSync] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    if (filterTerritory !== 'all' && item.territory !== filterTerritory) return false;
    if (filterCollection !== 'all' && item.collection !== filterCollection) return false;
    if (filterSync !== 'all' && item.syncStatus !== filterSync) return false;
    return true;
  });

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Select all visible
  const selectAll = () => {
    if (selectedItems.length === filteredInventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredInventory.map((i) => i.id));
    }
  };

  // Start editing
  const startEdit = (id: string, currentQty: number) => {
    setEditingId(id);
    setEditQuantity(currentQty);
  };

  // Save edit
  const saveEdit = (id: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              localQuantity: editQuantity,
              syncStatus: 'pending' as SyncStatus,
            }
          : item
      )
    );
    setEditingId(null);
  };

  // Sync selected to platforms
  const syncSelected = () => {
    setInventory((prev) =>
      prev.map((item) =>
        selectedItems.includes(item.id)
          ? {
              ...item,
              shopifyQuantity: item.localQuantity,
              etsyQuantity: item.localQuantity,
              syncStatus: 'synced' as SyncStatus,
            }
          : item
      )
    );
    setSelectedItems([]);
  };

  // Get sync status badge
  const getSyncBadge = (status: SyncStatus) => {
    const styles = {
      synced: 'bg-green-100 text-green-700',
      out_of_sync: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700',
    };
    const labels = {
      synced: 'Synced',
      out_of_sync: 'Out of Sync',
      pending: 'Pending',
      error: 'Error',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-mono ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Get territory badge
  const getTerritoryBadge = (territory: Territory) => {
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif italic text-theme-charcoal">Inventory</h2>
          <p className="text-sm font-mono text-theme-industrial mt-1">
            Manage stock levels across Shopify and Etsy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <button
              onClick={syncSelected}
              className="px-4 py-2 bg-theme-gold text-white text-sm font-mono rounded-lg hover:bg-theme-gold/90 transition-all duration-300 ease-liquid"
            >
              Sync {selectedItems.length} Items
            </button>
          )}
          <button className="px-4 py-2 bg-theme-charcoal text-theme-alabaster text-sm font-mono rounded-lg hover:bg-theme-charcoal/90 transition-all duration-300 ease-liquid">
            + Add Stock
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-theme-charcoal/10 p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-xs font-mono text-theme-industrial uppercase tracking-wider block mb-1">Collection</label>
            <select
              value={filterCollection}
              onChange={(e) => setFilterCollection(e.target.value)}
              className="px-3 py-2 border border-theme-charcoal/10 rounded-lg text-sm font-mono bg-white/50"
            >
              <option value="all">All Collections</option>
              <option value="Atlas">Atlas</option>
              <option value="Relic">Relic</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-mono text-theme-industrial uppercase tracking-wider block mb-1">Territory</label>
            <select
              value={filterTerritory}
              onChange={(e) => setFilterTerritory(e.target.value)}
              className="px-3 py-2 border border-theme-charcoal/10 rounded-lg text-sm font-mono bg-white/50"
            >
              <option value="all">All Territories</option>
              <option value="Ember">Ember</option>
              <option value="Petal">Petal</option>
              <option value="Tidal">Tidal</option>
              <option value="Terra">Terra</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-mono text-theme-industrial uppercase tracking-wider block mb-1">Sync Status</label>
            <select
              value={filterSync}
              onChange={(e) => setFilterSync(e.target.value)}
              className="px-3 py-2 border border-theme-charcoal/10 rounded-lg text-sm font-mono bg-white/50"
            >
              <option value="all">All Status</option>
              <option value="synced">Synced</option>
              <option value="out_of_sync">Out of Sync</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="ml-auto text-sm font-mono text-theme-industrial">
            {filteredInventory.length} items
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-theme-charcoal/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-theme-alabaster border-b border-theme-charcoal/10">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredInventory.length && filteredInventory.length > 0}
                  onChange={selectAll}
                  className="rounded border-theme-charcoal/20"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono text-theme-industrial uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono text-theme-industrial uppercase tracking-wider">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono text-theme-industrial uppercase tracking-wider">
                Territory
              </th>
              <th className="px-4 py-3 text-center text-xs font-mono text-theme-industrial uppercase tracking-wider">
                Local
              </th>
              <th className="px-4 py-3 text-center text-xs font-mono text-theme-industrial uppercase tracking-wider">
                Shopify
              </th>
              <th className="px-4 py-3 text-center text-xs font-mono text-theme-industrial uppercase tracking-wider">
                Etsy
              </th>
              <th className="px-4 py-3 text-center text-xs font-mono text-theme-industrial uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-mono text-theme-industrial uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-charcoal/5">
            {filteredInventory.map((item) => {
              const isLowStock = item.localQuantity <= item.lowStockThreshold;
              const isEditing = editingId === item.id;

              return (
                <tr
                  key={item.id}
                  className={`${selectedItems.includes(item.id) ? 'bg-blue-50' : ''} hover:bg-gray-50`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.variant}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm text-gray-600">{item.sku}</span>
                  </td>
                  <td className="px-4 py-4">
                    {getTerritoryBadge(item.territory)}
                    {!item.territory && (
                      <span className="text-xs text-gray-400">{item.collection}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center font-mono"
                        autoFocus
                      />
                    ) : (
                      <span className={`font-mono ${isLowStock ? 'text-red-600 font-bold' : 'text-gray-900'}`}>
                        {item.localQuantity}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`font-mono ${item.shopifyQuantity !== item.localQuantity ? 'text-red-600' : 'text-gray-600'}`}>
                      {item.shopifyQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`font-mono ${item.etsyQuantity !== item.localQuantity ? 'text-red-600' : 'text-gray-600'}`}>
                      {item.etsyQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {getSyncBadge(item.syncStatus)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="text-sm text-green-600 hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-sm text-gray-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(item.id, item.localQuantity)}
                          className="text-sm text-theme-gold hover:underline"
                        >
                          Edit
                        </button>
                        {item.syncStatus === 'out_of_sync' && (
                          <button
                            onClick={() => {
                              setInventory((prev) =>
                                prev.map((i) =>
                                  i.id === item.id
                                    ? {
                                        ...i,
                                        shopifyQuantity: i.localQuantity,
                                        etsyQuantity: i.localQuantity,
                                        syncStatus: 'synced' as SyncStatus,
                                      }
                                    : i
                                )
                              );
                            }}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Sync
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-theme-charcoal/10">
          <div className="text-sm font-mono text-theme-industrial uppercase tracking-wider">Total SKUs</div>
          <div className="text-2xl font-mono font-medium text-theme-charcoal mt-1">
            {inventory.length}
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-theme-charcoal/10">
          <div className="text-sm font-mono text-theme-industrial uppercase tracking-wider">Total Units</div>
          <div className="text-2xl font-mono font-medium text-theme-charcoal mt-1">
            {inventory.reduce((sum, i) => sum + i.localQuantity, 0)}
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-theme-charcoal/10">
          <div className="text-sm font-mono text-theme-industrial uppercase tracking-wider">Low Stock Items</div>
          <div className="text-2xl font-mono font-medium text-red-600 mt-1">
            {inventory.filter((i) => i.localQuantity <= i.lowStockThreshold).length}
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-theme-charcoal/10">
          <div className="text-sm font-mono text-theme-industrial uppercase tracking-wider">Out of Sync</div>
          <div className="text-2xl font-mono font-medium text-theme-gold mt-1">
            {inventory.filter((i) => i.syncStatus === 'out_of_sync').length}
          </div>
        </div>
      </div>
    </div>
  );
}
