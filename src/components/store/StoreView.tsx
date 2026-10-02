import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store as StoreIcon,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  TrendingUp,
  XCircle,
  Package,
} from 'lucide-react';
import { OrderStatus } from '../../types';

export const StoreView: React.FC = () => {
  const {
    stores,
    selectedStoreId,
    setSelectedStoreId,
    products,
    inventory,
    orders,
    updateStock,
    verifyShelfStock,
    updateOrderStatus,
    acceptOrderWithSubstitution,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'reliability'>('orders');
  const [inventoryFilter, setInventoryFilter] = useState<'urgent' | 'low' | 'all'>('urgent');

  const currentStore = stores.find(s => s.id === selectedStoreId) || stores[0];

  // Orders for this store
  const storeOrders = orders.filter(o => o.storeId === currentStore.id);

  // Inventory for this store
  const storeInventory = inventory.filter(i => i.storeId === currentStore.id);

  // Products needing urgent stock audits
  const urgentAuditItems = storeInventory.filter(i => i.isUrgentAuditNeeded);
  const lowStockItems = storeInventory.filter(i => i.stockCount <= 3);

  const displayedInventory =
    inventoryFilter === 'urgent'
      ? urgentAuditItems
      : inventoryFilter === 'low'
      ? lowStockItems
      : storeInventory;

  return (
    <div className="space-y-6">
      {/* Store Header & Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <StoreIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Store Partner Portal
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Managed by {currentStore.ownerName}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {currentStore.name}
              </h2>
              <p className="text-xs text-slate-400">{currentStore.address}</p>
            </div>
          </div>

          {/* Quick Store Selector for Demo */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 font-mono hidden sm:block">Switch Partner:</div>
            <select
              value={currentStore.id}
              onChange={e => setSelectedStoreId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
            >
              {stores.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.area})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Store Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[11px] font-mono">Reliability Score</div>
            <div className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{currentStore.reliabilityScore}%</span>
            </div>
            <span className="text-[10px] text-slate-500">Tier 1 Partner</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[11px] font-mono">Cancellation Risk</div>
            <div className={`text-lg font-bold font-mono mt-0.5 ${currentStore.cancellationRate > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {currentStore.cancellationRate}%
            </div>
            <span className="text-[10px] text-slate-500">Industry avg: 14.5%</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[11px] font-mono">Last Physical Audit</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{currentStore.lastAuditMinutesAgo}m ago</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Real-time sync active</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[11px] font-mono">Urgent Audits Needed</div>
            <div className={`text-lg font-bold font-mono mt-0.5 ${urgentAuditItems.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {urgentAuditItems.length} Products
            </div>
            <span className="text-[10px] text-slate-500">Prompted by Nova Pulse</span>
          </div>
        </div>
      </div>

      {/* Store Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Incoming Customer Orders</span>
          {storeOrders.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-emerald-400 font-mono">
              {storeOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Live Shelf Inventory & Audits</span>
          {urgentAuditItems.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono">
              {urgentAuditItems.length} Urgent
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reliability')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'reliability'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Cancellation Prevention Analytics</span>
        </button>
      </div>

      {/* Tab 1: Incoming Orders & Substitution Flow */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {storeOrders.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
              <Package className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No active orders for this store right now.</p>
              <p className="text-xs text-slate-500">
                You can switch to the Customer App to place an order or select another store.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storeOrders.map(order => {
                const isPending = order.status === 'pending';
                const isAccepted = order.status === 'accepted';
                const isPacking = order.status === 'packing';
                const isOutForDelivery = order.status === 'out_for_delivery';
                const isDelivered = order.status === 'delivered';
                const isCancelled = order.status === 'cancelled';

                return (
                  <div
                    key={order.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Order Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-white">#{order.id}</span>
                            <span className="text-[11px] text-slate-400 font-mono">· {order.createdAt}</span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium mt-0.5">{order.customerName}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">{order.customerAddress}</p>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                              isDelivered
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : isCancelled
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {order.status.replace('_', ' ')}
                          </span>
                          <div className="text-xs font-mono font-bold text-white mt-1">₹{order.totalAmount}</div>
                        </div>
                      </div>

                      {/* Items in this order */}
                      <div className="mt-3 space-y-1.5">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">
                          Items to Pick ({order.items.length})
                        </span>
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/80"
                          >
                            <span className="font-medium text-slate-200">
                              {item.quantity}× {item.productName}
                            </span>
                            <span className="font-mono text-slate-400">₹{item.subtotal}</span>
                          </div>
                        ))}
                      </div>

                      {/* Nova Pulse AI Smart Substitution Recommendation */}
                      {order.substitutionPending && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-2">
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                            <Sparkles className="w-4 h-4" />
                            <span>AI Substitution Ready (Prevents Cancellation)</span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {order.substitutionPending.storeReason}
                          </p>
                          <div className="flex items-center justify-between text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-400">Recommended Swap:</span>
                            <span className="font-semibold text-emerald-400">
                              {order.substitutionPending.replacementProductName}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              acceptOrderWithSubstitution(
                                order.id,
                                order.substitutionPending!.originalProductId,
                                order.substitutionPending!.replacementProductId
                              )
                            }
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                          >
                            Accept Order with 1-Click Substitution
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Store Action Workflow Buttons */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      {isPending && !order.substitutionPending && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 border border-rose-500/30 rounded-lg cursor-pointer"
                          >
                            Reject (Out of Stock)
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'accepted')}
                            className="flex-1 py-1.5 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors cursor-pointer"
                          >
                            Accept & Confirm Stock
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'packing')}
                          className="w-full py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Mark as Packing / Picking Done
                        </button>
                      )}

                      {isPacking && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                          className="w-full py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors cursor-pointer"
                        >
                          Handover to Rider (Dispatch)
                        </button>
                      )}

                      {isOutForDelivery && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="w-full py-2 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/40 rounded-lg transition-colors cursor-pointer"
                        >
                          Confirm Delivery Completed
                        </button>
                      )}

                      {(isDelivered || isCancelled) && (
                        <div className="w-full text-center text-xs text-slate-500 font-mono py-1">
                          Order lifecycle concluded
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Live Shelf Inventory & 10-Second Audits */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Inventory Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setInventoryFilter('urgent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  inventoryFilter === 'urgent'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Urgent Audits Needed ({urgentAuditItems.length})
              </button>
              <button
                onClick={() => setInventoryFilter('low')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  inventoryFilter === 'low'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Low Stock (≤3 units)
              </button>
              <button
                onClick={() => setInventoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  inventoryFilter === 'all'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Shelf Items ({storeInventory.length})
              </button>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Tip: Click &quot;Verify Shelf&quot; to conduct a 5-sec audit &amp; boost availability confidence.
            </span>
          </div>

          {/* Inventory Items List */}
          <div className="space-y-3">
            {displayedInventory.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                No items match this filter. Everything is operating normally.
              </div>
            ) : (
              displayedInventory.map(item => {
                const prod = products.find(p => p.id === item.productId);
                if (!prod) return null;

                return (
                  <div
                    key={item.productId}
                    className={`bg-slate-900 border rounded-2xl p-4 transition-all ${
                      item.isUrgentAuditNeeded
                        ? 'border-rose-500/40 bg-rose-950/10'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Product Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                              {prod.category}
                            </span>
                            {item.isUrgentAuditNeeded && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase font-mono">
                                Urgent Verification Flagged
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-white mt-0.5">{prod.name}</h4>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ₹{prod.price} · Sales Velocity: {item.salesVelocityPerHour} units/hr · Last audited {item.lastStockAuditMinutesAgo}m ago
                          </div>
                        </div>
                      </div>

                      {/* Stock Stepper & 1-Click Shelf Verification */}
                      <div className="flex items-center gap-3 self-end md:self-auto">
                        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 font-mono px-2">Shelf Stock:</span>
                          <button
                            onClick={() => updateStock(currentStore.id, item.productId, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono font-bold text-sm text-white px-2">
                            {item.stockCount}
                          </span>
                          <button
                            onClick={() => updateStock(currentStore.id, item.productId, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => verifyShelfStock(currentStore.id, item.productId)}
                          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-emerald-500/10"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify Shelf (Pulse Audit)</span>
                        </button>
                      </div>
                    </div>

                    {item.auditUrgencyReason && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Why flagged: {item.auditUrgencyReason}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Store Health & Cancellation Prevention */}
      {activeTab === 'reliability' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-sm font-bold text-white">How Nova Pulse Protects Partner Kirana Margins</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              In standard quick-commerce models, when an item is missing on shelves, the platform cancels the order and penalizes the local store with a cancellation charge. Nova Pulse uses proactive inventory confidence and smart substitutions so your store keeps 100% of order revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 uppercase font-mono">Cancellation Protection</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">₹14,200 Preserved</p>
              <p className="text-slate-400 text-[11px]">
                38 potential order cancellations prevented this month via 1-click substitutions and timely shelf alerts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 uppercase font-mono">Shelf Sync Discipline</span>
              <p className="text-lg font-bold text-white font-mono">98.2% Accurate</p>
              <p className="text-slate-400 text-[11px]">
                {currentStore.ownerName} completes morning audits in under 45 seconds using Nova Pulse Quick-Verify.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 uppercase font-mono">Customer Repeat Rate</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">51.4%</p>
              <p className="text-slate-400 text-[11px]">
                Neighborhood customers return 2.1× more often because orders arrive complete without missing items.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
