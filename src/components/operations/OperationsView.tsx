import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  AlertTriangle,
  Users,
  TrendingDown,
  Clock,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  PhoneCall,
  Zap,
} from 'lucide-react';
import { evaluateCustomerRetention } from '../../services/aiEngine';

export const OperationsView: React.FC = () => {
  const {
    orders,
    stores,
    alerts,
    resolveAlert,
    atRiskCustomers,
    takeRetentionAction,
    inventory,
    products,
    verifyShelfStock,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'alerts' | 'customers' | 'stores'>('alerts');

  // Key operations KPIs
  const totalOrdersCount = orders.length + 1420; // adding baseline day volume
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const cancellationRate = ((cancelledOrders / (orders.length || 1)) * 10).toFixed(1);
  const unaddressedAlerts = alerts.filter(a => !a.resolved);
  const pendingAtRiskUsers = atRiskCustomers.filter(c => !c.actionTaken);

  // Store inventory discrepancy hotspots
  const storesWithUrgentAudits = stores.map(store => {
    const urgentItems = inventory.filter(i => i.storeId === store.id && i.isUrgentAuditNeeded);
    return {
      store,
      urgentCount: urgentItems.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Ops Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Central Operations &amp; Reliability Dispatch
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">Bengaluru Metro Zone</span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Nova Pulse Command Center
              </h2>
              <p className="text-xs text-slate-400">
                Real-time inventory drift monitoring, at-risk customer recovery &amp; predictive rerouting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI Pulse Monitoring Active</span>
            </div>
          </div>
        </div>

        {/* Real-time Fleet Health KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[11px] font-mono">Network Cancellation Rate</div>
            <div className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
              <TrendingDown className="w-4 h-4" />
              <span>3.4%</span>
            </div>
            <span className="text-[10px] text-slate-500">Down from 14.5% baseline</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[11px] font-mono">On-Time Grocery Delivery</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              96.1%
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Avg ETA: 13.8 mins</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[11px] font-mono">Active Support Tickets</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              18 Open
            </div>
            <span className="text-[10px] text-slate-500">-71% due to stock verification</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[11px] font-mono">Monthly Revenue Saved</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              ₹18.4 Lakhs
            </div>
            <span className="text-[10px] text-slate-500">From zero cancelled baskets</span>
          </div>
        </div>
      </div>

      {/* Ops Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'alerts'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Inventory-Risk Alerts &amp; AI Directives</span>
          {unaddressedAlerts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-emerald-400 font-mono">
              {unaddressedAlerts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'customers'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>At-Risk Customer Churn Recovery</span>
          {pendingAtRiskUsers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono">
              {pendingAtRiskUsers.length} High Risk
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'stores'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Partner Kirana Reliability Matrix</span>
        </button>
      </div>

      {/* Tab 1: Inventory-Risk Alerts & AI Actions */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Active Operational Anomalies
              </h3>
              <p className="text-xs text-slate-400">
                Nova Pulse detects early inventory drift signals before orders are cancelled by stores.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {unaddressedAlerts.length} actionable directives
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map(alert => {
              const isResolved = alert.resolved;
              return (
                <div
                  key={alert.id}
                  className={`bg-slate-900 border rounded-2xl p-4 transition-all ${
                    isResolved
                      ? 'border-slate-800/60 opacity-60'
                      : alert.severity === 'critical'
                      ? 'border-rose-500/40 bg-rose-950/10'
                      : alert.severity === 'warning'
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : 'border-sky-500/40 bg-sky-950/10'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            alert.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : alert.severity === 'warning'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          {alert.severity} · {alert.category}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{alert.timestamp}</span>
                        {isResolved && (
                          <span className="text-xs text-emerald-400 font-semibold font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resolved &amp; Logged
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 mt-2 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-400">Nova Pulse Recommended Directive:</span>
                          <span className="font-semibold text-white">{alert.suggestedAction}</span>
                        </div>
                      </div>
                    </div>

                    <div className="self-end md:self-center shrink-0">
                      {!isResolved ? (
                        <button
                          onClick={() => {
                            if (alert.storeId && alert.productId) {
                              verifyShelfStock(alert.storeId, alert.productId);
                            }
                            resolveAlert(alert.id);
                          }}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm shadow-emerald-500/10"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Execute AI Resolution</span>
                        </button>
                      ) : (
                        <div className="text-xs text-slate-500 font-mono">Mitigation Applied</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: At-Risk Customer Churn Recovery */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Predictive Churn Detection &amp; Targeted Retention
              </h3>
              <p className="text-xs text-slate-400">
                Customers who experienced out-of-stock cancellations or delivery delays. Why broad discounts fail and how Nova Pulse retains them.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {pendingAtRiskUsers.length} vulnerable accounts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {atRiskCustomers.map(customer => {
              const assessment = evaluateCustomerRetention(customer);
              const isActionTaken = customer.actionTaken;

              return (
                <div
                  key={customer.id}
                  className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between space-y-4 ${
                    isActionTaken
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : customer.churnTier === 'high'
                      ? 'border-rose-500/40 bg-rose-950/10'
                      : 'border-amber-500/40 bg-amber-950/10'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white">{customer.name}</h4>
                        <p className="text-xs text-slate-400">{customer.area} · {customer.phone}</p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                            isActionTaken
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : customer.churnTier === 'high'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {isActionTaken ? 'Protected' : `${customer.churnRiskScore}% Churn Risk`}
                        </span>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          LTV: ₹{customer.lifetimeValueINR.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Ground Why / Cause Analysis */}
                    <div className="text-xs space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Why this customer is at risk:
                      </span>
                      <p className="text-slate-300 leading-snug">{customer.reason}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                      <div>
                        <span className="block text-slate-500">Failed Orders</span>
                        <span className="text-rose-400 font-bold">{customer.failedOrdersCount}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Delays</span>
                        <span className="text-amber-400 font-bold">{customer.delayedOrdersCount}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Coupon Dependence</span>
                        <span className="text-white font-bold">{customer.discountReliancePercent}%</span>
                      </div>
                    </div>

                    {/* Prescribed Proactive Retention Action */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Recommended Retention Action:</span>
                      </span>
                      <p className="text-slate-300 text-[11px] leading-tight">
                        {customer.recommendedAction}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    {!isActionTaken ? (
                      <button
                        onClick={() => takeRetentionAction(customer.id)}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Deploy Reliability Retention Safeguard</span>
                      </button>
                    ) : (
                      <div className="w-full py-1.5 text-center text-xs text-emerald-400 font-mono font-semibold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>VIP Guarantee Pass Deployed</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Partner Kirana Reliability Matrix */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Bengaluru Local Store Reliability Leaderboard
              </h3>
              <p className="text-xs text-slate-400">
                Partner stores audited by Nova Pulse with real-time shelf sync ratings.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {stores.length} Partner Outlets Active
            </span>
          </div>

          <div className="space-y-3">
            {stores.map(store => {
              const urgentCount = inventory.filter(
                i => i.storeId === store.id && i.isUrgentAuditNeeded
              ).length;

              return (
                <div
                  key={store.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{store.name}</span>
                      <span className="text-xs text-slate-400">({store.area})</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Partner: {store.ownerName} · {store.phone}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="block text-slate-500 text-[10px]">Reliability Score</span>
                      <span className="font-bold text-emerald-400 text-sm">{store.reliabilityScore}%</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-[10px]">Cancellation Rate</span>
                      <span className={`font-bold text-sm ${store.cancellationRate > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {store.cancellationRate}%
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-[10px]">Audit Recency</span>
                      <span className="font-bold text-white text-sm">{store.lastAuditMinutesAgo}m ago</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-[10px]">Urgent Shelf Recounts</span>
                      <span className={`font-bold text-sm ${urgentCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {urgentCount} items
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
