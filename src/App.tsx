import { PSpinner } from '@porsche-design-system/components-react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

function AppContent() {
  const { activePage, loading, theme } = useApp();
  const pageRef = useRef<HTMLDivElement>(null);

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

  return (
    <AppShell>
      <div ref={pageRef}>
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'history' && <History />}
        {activePage === 'settings' && <Settings />}
      </div>
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
