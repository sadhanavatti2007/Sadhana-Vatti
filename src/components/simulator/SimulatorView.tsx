import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateSimulatorImpact } from '../../services/aiEngine';
import {
  Sliders,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const { simulatorParams, updateSimulatorParams } = useApp();

  const impact = calculateSimulatorImpact(simulatorParams);

  const applyPreset = (preset: 'conservative' | 'balanced' | 'aggressive') => {
    if (preset === 'conservative') {
      updateSimulatorParams({
        inventoryAccuracyPercent: 88,
        cancellationRatePercent: 6.5,
        repeatPurchaseRatePercent: 36,
        deliveryReliabilityPercent: 90,
        monthlyActiveOrders: 60000,
        avgOrderValueINR: 320,
        couponSpendReductionPercent: 25,
      });
    } else if (preset === 'balanced') {
      updateSimulatorParams({
        inventoryAccuracyPercent: 93,
        cancellationRatePercent: 3.5,
        repeatPurchaseRatePercent: 44,
        deliveryReliabilityPercent: 95,
        monthlyActiveOrders: 120000,
        avgOrderValueINR: 380,
        couponSpendReductionPercent: 40,
      });
    } else {
      updateSimulatorParams({
        inventoryAccuracyPercent: 97,
        cancellationRatePercent: 1.8,
        repeatPurchaseRatePercent: 54,
        deliveryReliabilityPercent: 98,
        monthlyActiveOrders: 250000,
        avgOrderValueINR: 440,
        couponSpendReductionPercent: 60,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Sliders className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Financial &amp; Unit Economics Engine
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">Real INR Modeling</span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Nova Pulse Business Impact Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Simulate how reducing inventory drift and cancelled orders directly expands gross margins and customer LTV.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 self-end md:self-auto bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => applyPreset('conservative')}
              className="px-2.5 py-1 rounded-lg hover:text-white text-slate-400 transition-colors cursor-pointer"
            >
              Conservative
            </button>
            <button
              onClick={() => applyPreset('balanced')}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 cursor-pointer"
            >
              Standard Hub
            </button>
            <button
              onClick={() => applyPreset('aggressive')}
              className="px-2.5 py-1 rounded-lg hover:text-white text-slate-400 transition-colors cursor-pointer"
            >
              Metro Scale
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sliders on Left (5 cols), Live Results on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sliders Input Panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Model Assumptions
            </h3>
            <span className="text-xs text-slate-400 font-mono">Adjust Parameters</span>
          </div>

          {/* Slider 1: Inventory Accuracy */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">Inventory Accuracy Target</span>
              <span className="font-mono font-bold text-emerald-400">
                {simulatorParams.inventoryAccuracyPercent}%
              </span>
            </div>
            <input
              type="range"
              min="65"
              max="99"
              step="1"
              value={simulatorParams.inventoryAccuracyPercent}
              onChange={e =>
                updateSimulatorParams({ inventoryAccuracyPercent: Number(e.target.value) })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Baseline: 70%</span>
              <span>Lift: +{impact.inventoryAccuracyLiftPercent}%</span>
            </div>
          </div>

          {/* Slider 2: Cancellation Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">Target Cancellation Rate</span>
              <span className="font-mono font-bold text-emerald-400">
                {simulatorParams.cancellationRatePercent}%
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="15.0"
              step="0.5"
              value={simulatorParams.cancellationRatePercent}
              onChange={e =>
                updateSimulatorParams({ cancellationRatePercent: Number(e.target.value) })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Industry Avg: 14.5%</span>
              <span className="text-emerald-400">Drop: -{impact.cancellationDropPercent}%</span>
            </div>
          </div>

          {/* Slider 3: 30-Day Repeat Purchase Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">30-Day Repeat Purchase Rate</span>
              <span className="font-mono font-bold text-emerald-400">
                {simulatorParams.repeatPurchaseRatePercent}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="65"
              step="1"
              value={simulatorParams.repeatPurchaseRatePercent}
              onChange={e =>
                updateSimulatorParams({ repeatPurchaseRatePercent: Number(e.target.value) })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Baseline: 28%</span>
              <span>Lift: +{impact.repeatRateLiftPercent}%</span>
            </div>
          </div>

          {/* Slider 4: Monthly Active Orders */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">Monthly Network Orders</span>
              <span className="font-mono font-bold text-white">
                {simulatorParams.monthlyActiveOrders.toLocaleString()} orders
              </span>
            </div>
            <input
              type="range"
              min="25000"
              max="500000"
              step="10000"
              value={simulatorParams.monthlyActiveOrders}
              onChange={e =>
                updateSimulatorParams({ monthlyActiveOrders: Number(e.target.value) })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>25,000 / mo</span>
              <span>500,000 / mo</span>
            </div>
          </div>

          {/* Slider 5: Average Order Value (AOV) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">Average Order Value (AOV)</span>
              <span className="font-mono font-bold text-white">
                ₹{simulatorParams.avgOrderValueINR}
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="1000"
              step="20"
              value={simulatorParams.avgOrderValueINR}
              onChange={e =>
                updateSimulatorParams({ avgOrderValueINR: Number(e.target.value) })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹200</span>
              <span>₹1,000</span>
            </div>
          </div>

          {/* Slider 6: Coupon Burn Reduction */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300">Discount Coupon Spend Reduction</span>
              <span className="font-mono font-bold text-emerald-400">
                {simulatorParams.couponSpendReductionPercent}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="5"
              value={simulatorParams.couponSpendReductionPercent}
              onChange={e =>
                updateSimulatorParams({ couponSpendReductionPercent: Number(e.target.value) })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10% saved</span>
              <span>70% saved</span>
            </div>
          </div>
        </div>

        {/* Live Impact Calculations & Financial Outputs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Net Annual ROI Banner */}
          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Projected Net Annual Profitability Lift</span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                +₹{impact.totalNetAnnualGainCrores} Crores
              </span>
              <span className="text-xs text-emerald-400 font-mono font-semibold">/ year</span>
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-xl">
              Achieved by eliminating {impact.monthlyOrdersSaved.toLocaleString()} failed order attempts per month, recovering high-LTV repeat customers, and cutting defensive discount coupon burn.
            </p>
          </div>

          {/* 4 Supporting Financial Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Pillar 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1.5">
              <div className="text-slate-400 font-mono text-[11px] uppercase">
                Direct Revenue Preserved
              </div>
              <div className="text-xl font-bold text-white font-mono">
                ₹{impact.annualRevenueSavedCrores} Cr
              </div>
              <p className="text-[11px] text-slate-400">
                {impact.monthlyOrdersSaved.toLocaleString()} orders/month saved from sudden out-of-stock cancellation.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1.5">
              <div className="text-slate-400 font-mono text-[11px] uppercase">
                Customer LTV Expansion
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                +₹{impact.annualLTVExpansionCrores} Cr
              </div>
              <p className="text-[11px] text-slate-400">
                Repeat purchase rate up from 28% to {simulatorParams.repeatPurchaseRatePercent}% as delivery trust solidifies.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1.5">
              <div className="text-slate-400 font-mono text-[11px] uppercase">
                Discount Coupon Burn Saved
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                ₹{impact.annualCouponBurnSavingsLakhs} Lakhs
              </div>
              <p className="text-[11px] text-slate-400">
                Less dependence on blunt ₹50 promo codes to entice churned customers back.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1.5">
              <div className="text-slate-400 font-mono text-[11px] uppercase">
                Support &amp; Dispatch Waste Saved
              </div>
              <div className="text-xl font-bold text-white font-mono">
                ₹{impact.annualSupportCostSavingsLakhs} Lakhs
              </div>
              <p className="text-[11px] text-slate-400">
                Eliminates rider wasted trip compensations and call center escalations.
              </p>
            </div>
          </div>

          {/* Before vs After Nova Pulse Unit Economics Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Per-Order Unit Economics: Legacy vs Nova Pulse
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2">Metric</th>
                    <th className="py-2 text-rose-400">Legacy Quick-Commerce</th>
                    <th className="py-2 text-emerald-400">With Nova Pulse AI</th>
                    <th className="py-2 text-right">Net Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                  <tr>
                    <td className="py-2.5 font-sans font-medium text-white">Shelf Stock Accuracy</td>
                    <td className="py-2.5 text-rose-300">68% - 72%</td>
                    <td className="py-2.5 text-emerald-300 font-bold">{simulatorParams.inventoryAccuracyPercent}%</td>
                    <td className="py-2.5 text-right text-emerald-400">+{impact.inventoryAccuracyLiftPercent}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans font-medium text-white">Peak Cancellation Rate</td>
                    <td className="py-2.5 text-rose-300">14.5%</td>
                    <td className="py-2.5 text-emerald-300 font-bold">{simulatorParams.cancellationRatePercent}%</td>
                    <td className="py-2.5 text-right text-emerald-400">-{impact.cancellationDropPercent}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans font-medium text-white">30-Day Customer Repeat Rate</td>
                    <td className="py-2.5 text-rose-300">28.0%</td>
                    <td className="py-2.5 text-emerald-300 font-bold">{simulatorParams.repeatPurchaseRatePercent}%</td>
                    <td className="py-2.5 text-right text-emerald-400">+{impact.repeatRateLiftPercent}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans font-medium text-white">Avg Retention Discount Burn</td>
                    <td className="py-2.5 text-rose-300">₹45 / order</td>
                    <td className="py-2.5 text-emerald-300 font-bold">₹{(45 * (1 - simulatorParams.couponSpendReductionPercent / 100)).toFixed(0)} / order</td>
                    <td className="py-2.5 text-right text-emerald-400">-{simulatorParams.couponSpendReductionPercent}% Burn</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
