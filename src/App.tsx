import { PSpinner } from '@porsche-design-system/components-react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

function AppContent() {
  const { activePage, loading, theme } = useApp();

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
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'history' && <History />}
      {activePage === 'settings' && <Settings />}
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
