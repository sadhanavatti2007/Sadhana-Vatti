import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronRight, ArrowRight, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Step {
  id: string;
  stepNumber: string;
  phase: 'problem' | 'solution';
  title: string;
  subtitle: string;
  explanation: string;
  targetRole?: 'customer' | 'store' | 'operations' | 'simulator' | 'presentation';
  evidenceMetric: string;
}

const STORY_STEPS: Step[] = [
  {
    id: 'step-1',
    stepNumber: '01',
    phase: 'problem',
    title: 'Inventory Problem',
    subtitle: 'Ghost Shelves & Discrepancies',
    explanation: 'Kirana partner stores manage offline walk-in customers and quick-commerce orders simultaneously. Without real-time synchronization, online apps show items that are already sold out.',
    targetRole: 'store',
    evidenceMetric: '30-40% stock drift within 4 hours',
  },
  {
    id: 'step-2',
    stepNumber: '02',
    phase: 'problem',
    title: 'Product Unavailability',
    subtitle: 'Uncertain Availability',
    explanation: 'Customers add items to cart assuming 100% availability. Stores discover stockouts only after picking starts, causing delayed dispatch or partial fulfillment.',
    targetRole: 'customer',
    evidenceMetric: '1 in 6 morning milk orders out-of-stock',
  },
  {
    id: 'step-3',
    stepNumber: '03',
    phase: 'problem',
    title: 'Failed Orders',
    subtitle: 'Sudden Cancellations',
    explanation: 'Riders arrive at the store only to discover items missing. Stores unilaterally cancel the order, burning delivery costs and dispatch bandwidth.',
    targetRole: 'operations',
    evidenceMetric: '14.5% cancellation during peak hours',
  },
  {
    id: 'step-4',
    stepNumber: '04',
    phase: 'problem',
    title: 'Customer Frustration',
    subtitle: 'Broken Morning Routines',
    explanation: 'Customers counting on quick breakfast groceries face sudden cancellations after waiting 15 minutes. Support tickets and negative reviews surge.',
    targetRole: 'operations',
    evidenceMetric: '72% of tickets stem from out-of-stock cancellations',
  },
  {
    id: 'step-5',
    stepNumber: '05',
    phase: 'problem',
    title: 'Lower Retention',
    subtitle: 'High Churn & Coupon Burn',
    explanation: 'Users switch to competing apps (Zepto/Blinkit/Instamart). Platforms burn excessive ₹50-₹100 discount coupons trying to win back frustrated users.',
    targetRole: 'operations',
    evidenceMetric: '65% churn after 2nd failed order',
  },
  {
    id: 'step-6',
    stepNumber: '06',
    phase: 'solution',
    title: 'NOVA PULSE Solution',
    subtitle: 'AI Reliability Engine',
    explanation: 'Nova Pulse calculates real-time shelf confidence, prompts stores for rapid 10-second audits on high-velocity items, and pre-allocates reliable replacements.',
    targetRole: 'store',
    evidenceMetric: 'Audit Recency + Demand Velocity algorithm',
  },
  {
    id: 'step-7',
    stepNumber: '07',
    phase: 'solution',
    title: 'Better Reliability',
    subtitle: '94%+ Guaranteed Fulfillment',
    explanation: 'Orders are pre-safeguarded before checkout with instant AI substitutions or multi-store fallback routing. Cancellations plunge from 14.5% to 3.5%.',
    targetRole: 'customer',
    evidenceMetric: 'Cancellations drop by 76%',
  },
  {
    id: 'step-8',
    stepNumber: '08',
    phase: 'solution',
    title: 'More Repeat Purchases',
    subtitle: 'Sustainable Growth Without Burn',
    explanation: 'Predictable, reliable grocery delivery builds genuine customer trust. 30-day repeat purchase rate jumps from 28% to 46% with 40% lower discount spend.',
    targetRole: 'simulator',
    evidenceMetric: '+₹2.4 Cr net annual profitability',
  },
];

export const StoryBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string>('step-6');
  const { setCurrentRole } = useApp();

  const activeStep = STORY_STEPS.find(s => s.id === activeStepId) || STORY_STEPS[5];

  return (
    <aside aria-label="The Nova Pulse Story & Mechanics" className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          {/* Header teaser */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold tracking-wide uppercase font-mono">
              The Story Chain
            </span>
            <span className="text-xs text-slate-300 font-medium">
              From Inventory Drift to Repeat Commerce: How Nova Pulse Solves Quick-Commerce Churn
            </span>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Collapse Chain' : 'Explore Story Pipeline'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Horizontal Mini Pipeline */}
        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {STORY_STEPS.map((step, idx) => {
            const isSelected = step.id === activeStepId;
            const isProblem = step.phase === 'problem';
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    setActiveStepId(step.id);
                    setIsExpanded(true);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer text-[11px] ${
                    isSelected
                      ? isProblem
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-600/40 font-semibold'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : isProblem
                      ? 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/60'
                      : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-75">{step.stepNumber}.</span>
                  <span>{step.title}</span>
                </button>
                {idx < STORY_STEPS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Detailed Expanded Drawer */}
        {isExpanded && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      activeStep.phase === 'problem'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    Phase {activeStep.stepNumber} · {activeStep.phase === 'problem' ? 'Vulnerability' : 'Nova Pulse Mechanism'}
                  </span>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {activeStep.title} <span className="text-slate-400 font-normal">({activeStep.subtitle})</span>
                  </h4>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">{activeStep.explanation}</p>
                <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                  <span className="font-semibold text-slate-300">Ground Evidence:</span>
                  <span className="font-mono text-emerald-400">{activeStep.evidenceMetric}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {activeStep.targetRole && (
                  <button
                    onClick={() => {
                      setCurrentRole(activeStep.targetRole!);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg hover:bg-emerald-400 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    <span>Test in {activeStep.targetRole.toUpperCase()} View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setCurrentRole('presentation')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg border border-slate-700 transition-colors text-center cursor-pointer"
                >
                  View Full Pitch Deck
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
