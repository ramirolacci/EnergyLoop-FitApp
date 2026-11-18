import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

interface Props {
  onContinueAsGuest: () => void;
}

export function WelcomeScreen({ onContinueAsGuest }: Props) {
  const { theme, toggleTheme } = useApp();
  const { openAuthModal } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.welcome-hero',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.welcome-feature',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.welcome-actions',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.45, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, { scope: containerRef });

  const outerBg = theme === 'dark' ? '#0a0c0f' : '#ede8df';
  const phoneBg = theme === 'dark' ? '#111317' : '#f7f4ee';
  const surfaceColor = theme === 'dark' ? '#181b22' : '#ffffff';
  const borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e9e4d8';
  const textColor = theme === 'dark' ? '#f8fafc' : '#1a1e24';
  const secondaryText = theme === 'dark' ? '#94a3b8' : '#706453';

  return (
    <div
      className="min-h-[100dvh] w-full flex justify-center transition-colors duration-300"
      style={{ background: outerBg }}
    >
      <div
        ref={containerRef}
        className="w-full max-w-[420px] min-h-[100dvh] flex flex-col justify-between relative shadow-2xl transition-colors duration-300 px-5 py-6"
        style={{
          background: phoneBg,
          paddingTop: 'calc(16px + env(safe-area-inset-top))',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
        }}
      >
        {/* Top Bar with Brand Badge & Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{
                background: theme === 'dark' ? 'rgba(78, 186, 135, 0.15)' : '#e8f5ee',
                color: theme === 'dark' ? '#34d399' : '#1d5f3f',
                border: theme === 'dark' ? '1px solid rgba(78, 186, 135, 0.3)' : '1px solid #b7e4ce',
              }}
            >
              EnergyLoop Mobile
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 mobile-card-shadow"
            style={{
              background: surfaceColor,
              border: `1px solid ${borderColor}`,
              color: theme === 'dark' ? '#fde047' : '#f59e0b',
            }}
            title={theme === 'dark' ? 'Cambiar a Modo Claro pastel' : 'Cambiar a Modo Oscuro'}
            aria-label="Cambiar tema"
          >
            <span className="text-base leading-none">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="welcome-hero flex flex-col items-center text-center my-auto pt-4">
          {/* Logo Squircle with Ambient Glow */}
          <div className="relative mb-5">
            <div
              className="absolute inset-0 rounded-[32px] blur-xl opacity-40 transition-opacity"
              style={{ background: '#4eba87' }}
            />
            <div
              className="relative w-24 h-24 rounded-[28px] p-2 flex items-center justify-center mobile-card-shadow"
              style={{
                background: theme === 'dark' ? '#181b22' : '#ffffff',
                border: `1.5px solid ${borderColor}`,
              }}
            >
              <img
                src="/favicon.svg"
                alt="EnergyLoop"
                className="w-full h-full object-contain rounded-[22px]"
              />
            </div>
          </div>

          <h1
            className="text-2xl font-black tracking-tight leading-tight mb-2"
            style={{ color: textColor }}
          >
            EnergyLoop
          </h1>

          <p
            className="text-xs font-semibold tracking-wide uppercase mb-3"
            style={{ color: '#4eba87' }}
          >
            Nutrición Inteligente & Balance Diario
          </p>

          <p
            className="text-xs max-w-[290px] leading-relaxed mb-6"
            style={{ color: secondaryText }}
          >
            Controla tus calorías, comidas y entrenamientos con diseño mobile-first y respaldo en la nube.
          </p>

          {/* Feature Highlights (Pastel Cards) */}
          <div className="w-full flex flex-col gap-2.5 text-left">
            <div
              className="welcome-feature p-3 rounded-2xl flex items-center gap-3 mobile-card-shadow"
              style={{
                background: theme === 'dark' ? '#181b22' : '#ffffff',
                border: `1px solid ${borderColor}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: theme === 'dark' ? 'rgba(78, 186, 135, 0.18)' : '#e8f5ee',
                  color: '#4eba87',
                }}
              >
                🥗
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className="text-xs font-bold block"
                  style={{ color: textColor }}
                >
                  Escaneo con IA
                </span>
                <span className="text-[10px] block" style={{ color: secondaryText }}>
                  Reconoce alimentos y macros con tu cámara al instante.
                </span>
              </div>
            </div>

            <div
              className="welcome-feature p-3 rounded-2xl flex items-center gap-3 mobile-card-shadow"
              style={{
                background: theme === 'dark' ? '#181b22' : '#ffffff',
                border: `1px solid ${borderColor}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: theme === 'dark' ? 'rgba(251, 164, 113, 0.18)' : '#fff0e6',
                  color: '#fba471',
                }}
              >
                ⚡
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className="text-xs font-bold block"
                  style={{ color: textColor }}
                >
                  Anillo de Energía
                </span>
                <span className="text-[10px] block" style={{ color: secondaryText }}>
                  Monitorea tus calorías consumidas vs. quemadas en tiempo real.
                </span>
              </div>
            </div>

            <div
              className="welcome-feature p-3 rounded-2xl flex items-center gap-3 mobile-card-shadow"
              style={{
                background: theme === 'dark' ? '#181b22' : '#ffffff',
                border: `1px solid ${borderColor}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: theme === 'dark' ? 'rgba(126, 200, 227, 0.18)' : '#e1f5fe',
                  color: '#7ec8e3',
                }}
              >
                ☁️
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className="text-xs font-bold block"
                  style={{ color: textColor }}
                >
                  Sincronización en la Nube
                </span>
                <span className="text-[10px] block" style={{ color: secondaryText }}>
                  Conectado a tu base de datos Supabase con respaldo seguro.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="welcome-actions w-full flex flex-col gap-2.5 pt-4">
          <button
            onClick={() => openAuthModal('register')}
            className="w-full py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
            style={{
              background: '#4eba87',
              color: '#ffffff',
            }}
          >
            <span>Crear Cuenta</span>
            <span>✨</span>
          </button>

          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] mobile-card-shadow flex items-center justify-center gap-2"
            style={{
              background: surfaceColor,
              border: `1.5px solid ${borderColor}`,
              color: textColor,
            }}
          >
            <span>Iniciar Sesión</span>
            <span>➔</span>
          </button>

          <button
            onClick={onContinueAsGuest}
            className="w-full py-2 text-center text-[11px] font-bold transition-all duration-200 hover:underline active:scale-95 mt-1"
            style={{ color: secondaryText }}
          >
            Continuar como invitado sin cuenta →
          </button>
        </div>
      </div>
    </div>
  );
}
