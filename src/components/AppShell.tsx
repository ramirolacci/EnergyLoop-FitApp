import { PToast, PButtonPure, PText } from '@porsche-design-system/components-react';
import type { IconName } from '@porsche-design-system/components-react';
import type { ReactNode } from 'react';
import { useApp } from '../context/AppContext';

interface NavItem {
  id: 'dashboard' | 'history' | 'settings';
  label: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Hoy', icon: 'home' },
  { id: 'history', label: 'Historial', icon: 'chart' },
  { id: 'settings', label: 'Ajustes', icon: 'adjust' },
];

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  const { activePage, setActivePage, theme, toastRef } = useApp();

  const bgColor = theme === 'dark' ? '#0e0e12' : 'var(--bg-light)';
  const navBg = theme === 'dark' ? 'rgba(26, 26, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)';
  const borderColor = theme === 'dark' ? 'rgba(42, 42, 46, 0.5)' : 'rgba(216, 216, 219, 0.5)';

  return (
    <div
      className="min-h-[100dvh] flex flex-col transition-colors duration-300"
      style={{ 
        background: bgColor,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Content */}
      <main
        className="flex-1 max-w-lg mx-auto w-full px-4"
        style={{ 
          paddingTop: 16,
          paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' 
        }}
      >
        {children}
      </main>

      {/* Floating bottom navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 px-6 z-50 pointer-events-none"
        style={{ 
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          bottom: 0 
        }}
      >
        <nav
          className="max-w-md mx-auto flex items-center justify-around p-2 rounded-[2rem] glass pointer-events-auto transition-all shadow-2xl"
          style={{
            background: theme === 'dark' ? 'rgba(26, 26, 30, 0.7)' : 'rgba(255, 255, 255, 0.75)',
            border: `1px solid ${borderColor}`,
          }}
        >

          {NAV_ITEMS.map(({ id, label, icon }) => {
            const isActive = activePage === id;
            const color = isActive
              ? (theme === 'dark' ? '#fbfcff' : '#010205')
              : (theme === 'dark' ? '#535457' : '#afb0b3');

            return (
              <div
                key={id}
                onClick={() => setActivePage(id)}
                className="flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer"
                style={{ 
                  background: isActive ? (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') : 'transparent'
                }}
              >
                <PButtonPure
                  id={`nav-btn-${id}`}
                  icon={icon}
                  hideLabel
                  theme={theme}
                  style={{ 
                    color, 
                    '--p-button-pure-icon-color': color,
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  } as React.CSSProperties}
                  aria={{ 'aria-label': label }}
                >
                  {label}
                </PButtonPure>
                <PText
                  size="xx-small"
                  theme={theme}
                  style={{
                    color,
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {label}
                </PText>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Toast */}
      <PToast ref={toastRef} theme={theme} />
    </div>
  );
}

