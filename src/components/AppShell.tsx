import { PToast, PIcon } from '@porsche-design-system/components-react';
import type { IconName } from '@porsche-design-system/components-react';
import type { ReactNode } from 'react';
import { useApp } from '../context/AppContext';

interface NavItem {
  id: 'dashboard' | 'history' | 'settings';
  label: string;
  icon: IconName;
  emoji: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Hoy', icon: 'home', emoji: '⚡' },
  { id: 'history', label: 'Historial', icon: 'chart', emoji: '📊' },
  { id: 'settings', label: 'Ajustes', icon: 'adjust', emoji: '⚙️' },
];

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  const { activePage, setActivePage, theme, toastRef } = useApp();

  const bgColor = theme === 'dark' ? '#0e1015' : '#f6f8f7';
  const navBg = theme === 'dark' ? 'rgba(23, 25, 34, 0.88)' : 'rgba(255, 255, 255, 0.88)';
  const navBorder = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <div
      className="min-h-[100dvh] flex flex-col justify-between transition-colors duration-300"
      style={{ 
        background: bgColor,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Mobile Screen Container (Constrained on Desktop, Full on Mobile) */}
      <main
        className="flex-1 max-w-[440px] mx-auto w-full px-4"
        style={{ 
          paddingTop: 12,
          paddingBottom: 'calc(96px + env(safe-area-inset-bottom))' 
        }}
      >
        {children}
      </main>

      {/* Floating Bottom Navigation Bar (iOS / Android Native Style) */}
      <div 
        className="fixed bottom-0 left-0 right-0 px-4 z-50 pointer-events-none"
        style={{ 
          paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
          bottom: 0 
        }}
      >
        <nav
          className="max-w-[400px] mx-auto flex items-center justify-around p-1.5 rounded-full glass pointer-events-auto transition-all shadow-xl"
          style={{
            background: navBg,
            border: `1px solid ${navBorder}`,
            boxShadow: theme === 'dark' 
              ? '0 12px 30px rgba(0, 0, 0, 0.6)' 
              : '0 10px 30px -5px rgba(24, 39, 75, 0.08)',
          }}
        >
          {NAV_ITEMS.map(({ id, label, icon }) => {
            const isActive = activePage === id;
            
            return (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-full transition-all duration-300 active:scale-95 ${
                  isActive 
                    ? theme === 'dark'
                      ? 'bg-white/10 text-emerald-400'
                      : 'bg-[#ecfdf5] text-[#065f46]'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
                aria-label={label}
              >
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100 opacity-70'}`}>
                  <PIcon 
                    name={icon} 
                    size="inherit" 
                    color="inherit"
                    theme={theme}
                    style={{ width: '20px', height: '20px' }} 
                  />
                </div>
                <span 
                  className={`text-[10px] tracking-tight uppercase leading-none ${
                    isActive ? 'font-black' : 'font-semibold opacity-70'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Toast Notification */}
      <PToast ref={toastRef} theme={theme} />
    </div>
  );
}
