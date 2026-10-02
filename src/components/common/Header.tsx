import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  ShoppingBag,
  Store as StoreIcon,
  Activity,
  Sliders,
  Presentation,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    cart,
    orders,
    alerts,
    atRiskCustomers,
    resetDemoData,
  } = useApp();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'accepted').length;
  const criticalAlertsCount = alerts.filter(a => !a.resolved).length;
  const highRiskCustomersCount = atRiskCustomers.filter(c => c.churnTier === 'high' && !c.actionTaken).length;

  const roles: Array<{ id: UserRole; label: string; icon: React.ReactNode; badge?: number }> = [
    {
      id: 'customer',
      label: 'Customer App',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'store',
      label: 'Partner Store Hub',
      icon: <StoreIcon className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      id: 'operations',
      label: 'Nova Ops Control',
      icon: <Activity className="w-4 h-4" />,
      badge: criticalAlertsCount + highRiskCustomersCount > 0 ? criticalAlertsCount + highRiskCustomersCount : undefined,
    },
    {
      id: 'simulator',
      label: 'Impact Simulator',
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      id: 'presentation',
      label: 'Pitch & Story Deck',
      icon: <Presentation className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              NOVA <span className="text-emerald-400">PULSE</span>
            </span>
            <span className="text-[11px] text-slate-400 block -mt-1 font-mono">
              Local Commerce Reliability Engine
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation / Role Switcher Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full">
          {roles.map(role => {
            const isActive = currentRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setCurrentRole(role.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {role.icon}
                <span>{role.label}</span>
                {role.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-slate-950 text-emerald-400'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {role.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Quick Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={resetDemoData}
            title="Reset Hackathon Demo Data to pristine state"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
