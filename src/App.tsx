/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { StoryBanner } from './components/common/StoryBanner';
import { ToastContainer } from './components/common/ToastContainer';
import { CustomerView } from './components/customer/CustomerView';
import { StoreView } from './components/store/StoreView';
import { OperationsView } from './components/operations/OperationsView';
import { SimulatorView } from './components/simulator/SimulatorView';
import { HackathonPresentation } from './components/presentation/HackathonPresentation';

const AppContent: React.FC = () => {
  const { currentRole } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      <Header />
      <StoryBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentRole === 'customer' && <CustomerView />}
        {currentRole === 'store' && <StoreView />}
        {currentRole === 'operations' && <OperationsView />}
        {currentRole === 'simulator' && <SimulatorView />}
        {currentRole === 'presentation' && <HackathonPresentation />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            NOVA PULSE · AI-Powered Local Commerce Reliability &amp; Retention Platform
          </p>
          <p className="font-mono text-[11px] text-slate-600">
            College Hackathon MVP · Bengaluru Metro Pilot
          </p>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
