import { PSpinner } from '@porsche-design-system/components-react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { SetupModal } from './components/SetupModal';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Suppress GSAP warnings for missing elements (e.g. conditional rendering)
gsap.config({ nullTargetWarn: false });

function AppContent() {
  const { activePage, loading, theme, profile } = useApp();
  const pageRef = useRef<HTMLDivElement>(null);
  
  // Manage global SetupModal state
  const isConfigured = profile?.daily_calorie_goal ? profile.daily_calorie_goal > 0 : false;
  const [showGlobalSetup, setShowGlobalSetup] = useState(false);

  useGSAP(() => {
    if (pageRef.current) {
      gsap.killTweensOf(pageRef.current);
      gsap.fromTo(pageRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.3, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, { dependencies: [activePage] });

  if (loading) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center gap-4"
        style={{ background: theme === 'dark' ? '#0e0e12' : '#f2f2f5' }}
      >
        <span className="text-4xl">🥗</span>
        <PSpinner size="medium" theme={theme} aria={{ 'aria-label': 'Cargando...' }} />
      </div>
    );
  }

  // If not configured, force open the setup modal
  const shouldShowSetup = (!isConfigured) || showGlobalSetup;

  return (
    <AppShell>
      <div ref={pageRef}>
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'history' && <History />}
        {activePage === 'settings' && <Settings onOpenSetup={() => setShowGlobalSetup(true)} />}
      </div>
      
      {/* Global Setup Modal */}
      <SetupModal 
        open={shouldShowSetup} 
        onDismiss={() => setShowGlobalSetup(false)} 
      />
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
