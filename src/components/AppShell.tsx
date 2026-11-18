import { PToast, PIcon } from '@porsche-design-system/components-react';
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

  const outerBg = '#EAE4D7';
  const phoneBg = '#F4EFE6';
  const navBg = 'rgba(255, 255, 255, 0.96)';
  const navBorder = '#E4DCCE';

  return (
    <div
      className="min-h-[100dvh] w-full flex justify-center transition-colors duration-300"
      style={{ background: outerBg }}
    >
      {/* Contenedor Mobile (Ancho óptimo nativo) */}
      <div 
        className="w-full max-w-[420px] min-h-[100dvh] flex flex-col justify-between relative shadow-2xl transition-colors duration-300"
        style={{ 
          background: phoneBg,
          paddingTop: 'calc(10px + env(safe-area-inset-top))',
        }}
      >
        {/* Main Content */}
        <main
          className="flex-1 w-full px-4"
          style={{ 
            paddingBottom: 'calc(105px + env(safe-area-inset-bottom))' 
          }}
        >
          {children}
        </main>

        {/* Floating Bottom Navigation Bar (Play Store / App Store standard) */}
        <div 
          className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-2"
          style={{ 
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            bottom: 0 
          }}
        >
          <nav
            className="w-[calc(100%-2rem)] max-w-[390px] flex items-center justify-around p-1.5 rounded-full glass pointer-events-auto transition-all mobile-card-shadow"
            style={{
              background: navBg,
              border: `1px solid ${navBorder}`,
            }}
          >
            {NAV_ITEMS.map(({ id, label, icon }) => {
              const isActive = activePage === id;
              
              return (
                <button
                  key={id}
                  onClick={() => setActivePage(id)}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-full transition-all duration-200 active:scale-95 ${
                    isActive 
                      ? 'bg-[#DDF0E4] text-[#164E35]'
                      : 'text-[#6B6357] hover:text-[#1C1917]'
                  }`}
                  aria-label={label}
                >
                  <div className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'scale-95 opacity-70'}`}>
                    <PIcon 
                      name={icon} 
                      size="inherit" 
                      color="inherit"
                      theme={theme}
                      style={{ width: '18px', height: '18px' }} 
                    />
                  </div>
                  <span 
                    className={`text-[9px] tracking-tight uppercase leading-none ${
                      isActive ? 'font-black' : 'font-semibold opacity-75'
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
    </div>
  );
}

export default AppShell;
