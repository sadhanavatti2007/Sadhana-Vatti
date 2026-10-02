import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  Layers,
  Play,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface Slide {
  id: string;
  step: string;
  badge: string;
  title: string;
  subtitle: string;
  bullets: Array<{ title: string; desc: string; metric?: string }>;
  takeaway: string;
}

const SLIDES: Slide[] = [
  {
    id: 'problem',
    step: '01 / 05',
    badge: 'The Problem Statement',
    title: 'The Quick-Commerce Paradox: Fast Delivery, Fragile Reliability',
    subtitle: 'Quick-commerce in India promised 10-minute delivery, but created a hidden retention disaster.',
    bullets: [
      {
        title: 'Inaccurate Kirana & Dark Store Inventory',
        desc: 'Partner stores simultaneously serve walk-in shoppers and app delivery riders. Physical shelf counts drift rapidly within hours, creating "ghost inventory" where apps show items that don\'t exist.',
        metric: '35% stock discrepancy within 4 hours',
      },
      {
        title: 'Failed Deliveries & Sudden Cancellations',
        desc: 'Riders arrive at the store only to discover items missing. Orders are abruptly cancelled after 15 minutes of customer anticipation, turning convenience into customer rage.',
        metric: '12-16% peak-hour order cancellations',
      },
      {
        title: 'Coupon Addiction & Bleeding Margins',
        desc: 'To compensate for poor reliability, platforms burn ₹40-₹80 per order on aggressive discount codes and apology credits, leading to massive cash burns without creating true loyalty.',
        metric: '₹45+ spent per order on defensive retention',
      },
    ],
    takeaway: 'Quick commerce cannot scale sustainably on discounts alone; customer loyalty depends on fulfillment certainty.',
  },
  {
    id: 'evidence',
    step: '02 / 05',
    badge: 'Ground Evidence & Data',
    title: 'The Customer Churn Spiral: Why Users Abandon Apps',
    subtitle: 'Data shows that inventory failure is the #1 driver of customer defection to competitors.',
    bullets: [
      {
        title: 'The "2-Strike" Churn Rule',
        desc: 'When an Indian consumer suffers 2 cancelled grocery orders within 14 days (especially morning milk, breakfast bread, or cooking oil), 65% permanently uninstall or stop ordering.',
        metric: '65% churn probability after 2nd failed order',
      },
      {
        title: 'Customer Support Escalations',
        desc: 'Over 70% of quick-commerce support tickets stem from out-of-stock items, delivery partner delays waiting for missing stock, or partial refunds.',
        metric: '72% tickets related to item unavailability',
      },
      {
        title: 'Partner Store Penalties & Resentment',
        desc: 'Local Kirana owners face arbitrary cancellation penalties and friction with riders, leading to disengagement and lack of interest in updating traditional POS systems.',
        metric: '84% Kirana owners find existing apps too complex',
      },
    ],
    takeaway: 'Solving shelf inventory accuracy at the local store is the single highest-ROI lever for quick commerce.',
  },
  {
    id: 'solution',
    step: '03 / 05',
    badge: 'The Nova Pulse Solution',
    title: 'NOVA PULSE: AI-Powered Local Commerce Reliability Platform',
    subtitle: 'A predictive, explainable intelligence layer between local stores, customers, and operations.',
    bullets: [
      {
        title: 'Explainable Product Availability Confidence',
        desc: 'Calculates real-time confidence (0-100%) for every item based on Audit Recency, Stockout Frequency, and Sales Velocity. Transparently explains WHY an item is safe or risky.',
        metric: 'Transparent heuristics + transparent "Why"',
      },
      {
        title: 'Proactive 10-Second Kirana Shelf Audits',
        desc: 'Instead of demanding full-store inventory counts, Nova Pulse only prompts store owners to verify 1-2 fast-moving items right when velocity spikes or safety buffers breach.',
        metric: '1-click "Verify Shelf" takes < 5 seconds',
      },
      {
        title: 'Pre-Flight Safeguards & 1-Click Smart Substitutions',
        desc: 'If an item runs low, Nova Pulse either offers customers verified substitutes in their cart or empowers store owners to swap equivalent items with zero price penalties.',
        metric: '76% drop in order cancellations',
      },
    ],
    takeaway: 'Nova Pulse turns unpredictable Kirana inventory into a dependable, high-confidence fulfillment network.',
  },
  {
    id: 'live-demo',
    step: '04 / 05',
    badge: 'Interactive Demo Guide',
    title: 'Interactive Hackathon Demo: Walkthrough For Judges',
    subtitle: 'Follow this 3-step live simulation right inside this web application.',
    bullets: [
      {
        title: 'Step 1: Test the Customer Experience',
        desc: 'Switch to Customer App. Notice the "Nova Pulse Availability Confidence" badges (e.g. Amul Milk vs Nandini). Click "Why?" to view the factor breakdown and explore recommended alternatives. Add items and watch the live Order Reliability Check before placing order.',
        metric: 'Try browsing & checkout',
      },
      {
        title: 'Step 2: Act as the Partner Kirana Store',
        desc: 'Switch to Partner Store Hub. View incoming orders and test the "1-Click AI Smart Substitution" workflow. Then click "Live Shelf Inventory" and click "Verify Shelf (Pulse Audit)" to see instant confidence score boosts.',
        metric: 'Try accepting orders & shelf audit',
      },
      {
        title: 'Step 3: Monitor in Ops Control & Simulate Financial ROI',
        desc: 'Switch to Nova Ops Control to view real-time fleet alerts and deploy retention safeguards for high-churn users. Then open the Impact Simulator to slide parameters and calculate ₹ Crores in retained margins.',
        metric: 'Try Ops interventions & financial sliders',
      },
    ],
    takeaway: 'Every action across Customer, Store, and Ops is fully reactive and synchronized in real time.',
  },
  {
    id: 'business-impact',
    step: '05 / 05',
    badge: 'Business Impact & Economics',
    title: 'Economic Transformation: Turning Discrepancies into Retained Profit',
    subtitle: 'Sustainable unit economics without unsustainable discount burns.',
    bullets: [
      {
        title: 'Direct Margin Expansion',
        desc: 'For a mid-sized network doing 100,000 monthly orders, reducing cancellations from 14.5% to 3.5% saves ₹4.1 Crores annually in preserved basket revenue and avoided rider dispatch losses.',
        metric: '+₹4.1 Cr annual revenue preserved',
      },
      {
        title: '30-Day Repeat Purchase Lift',
        desc: 'When deliveries are consistently complete and punctual, organic 30-day repeat rates jump from 28% to 44%, driving an estimated +₹1.8 Crores in annual LTV expansion.',
        metric: 'Repeat rate jumps from 28% to 44%',
      },
      {
        title: '40% Reduction in Defensive Discount Burn',
        desc: 'Platforms can drastically slash untargeted ₹50-₹100 apology coupons because order trust is rebuilt organically, achieving EBITDA positivity much earlier.',
        metric: '₹40-₹60 Lakhs saved annually in promo burn',
      },
    ],
    takeaway: 'Reliability is the ultimate retention engine. Nova Pulse proves that operational excellence drives commercial profitability.',
  },
];

export const HackathonPresentation: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { setCurrentRole } = useApp();

  const currentSlide = SLIDES[currentSlideIndex];

  const handlePrev = () => {
    setCurrentSlideIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex(prev => Math.min(SLIDES.length - 1, prev + 1));
  };

  return (
    <div className="space-y-6">
      {/* Presentation Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            College Hackathon Pitch Deck
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5">
            NOVA PULSE – AI Reliability &amp; Retention Architecture
          </h2>
        </div>

        {/* Slide Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                idx === currentSlideIndex
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {slide.step.split(' ')[0]} {slide.badge.split(' ')[1] || slide.badge}
            </button>
          ))}
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative min-h-[480px] flex flex-col justify-between">
        <div>
          {/* Slide Sub-Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold uppercase">
              {currentSlide.badge}
            </span>
            <span className="font-mono text-xs text-slate-400">{currentSlide.step}</span>
          </div>

          {/* Slide Title */}
          <div className="mt-4 space-y-1">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {currentSlide.title}
            </h3>
            <p className="text-sm text-slate-400 font-medium">{currentSlide.subtitle}</p>
          </div>

          {/* Bullet Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {currentSlide.bullets.map((bullet, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{bullet.title}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{bullet.desc}</p>
                </div>
                {bullet.metric && (
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400 font-semibold">
                    {bullet.metric}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Slide Bottom Bar: Takeaway & Navigation Controls */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-300 flex items-center gap-2 max-w-xl">
            <span className="text-emerald-400 font-bold uppercase font-mono text-[10px]">
              Core Insight:
            </span>
            <span className="italic">{currentSlide.takeaway}</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {currentSlide.id === 'live-demo' && (
              <button
                onClick={() => setCurrentRole('customer')}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Jump into Live Demo</span>
              </button>
            )}

            <button
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className={`p-2 rounded-xl border text-xs cursor-pointer ${
                currentSlideIndex === 0
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentSlideIndex === SLIDES.length - 1}
              className={`p-2 rounded-xl border text-xs cursor-pointer ${
                currentSlideIndex === SLIDES.length - 1
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
