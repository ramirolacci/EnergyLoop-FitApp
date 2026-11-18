import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

interface Props {
  onContinueAsGuest: () => void;
}

export function WelcomeScreen({ onContinueAsGuest }: Props) {
  const { openAuthModal } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.welcome-hero',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.welcome-feature',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, delay: 0.15, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.welcome-actions',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.45, delay: 0.35, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, { scope: containerRef });

  // Paleta Pastel Mate Sólida (Opaca, cálida, sin brillos plásticos)
  const outerBg = '#EAE4D7';
  const phoneBg = '#F4EFE6';
  const surfaceColor = '#FFFFFF';
  const borderColor = '#E4DCCE';
  const textColor = '#1C1917';
  const secondaryText = '#5C5245';

  return (
    <div
      className="min-h-[100dvh] w-full flex justify-center transition-colors duration-300"
      style={{ background: outerBg }}
    >
      <div
        ref={containerRef}
        className="w-full max-w-[420px] min-h-[100dvh] flex flex-col justify-between relative shadow-2xl transition-colors duration-300 px-5"
        style={{
          background: phoneBg,
          paddingTop: 'calc(24px + env(safe-area-inset-top))',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
        }}
      >
        {/* Hero Section */}
        <div className="welcome-hero flex flex-col items-center text-center my-auto pt-2">
          {/* Logo Squircle Mate con Sombra Suave */}
          <div className="relative mb-4">
            <div
              className="relative w-20 h-20 rounded-[26px] p-2 flex items-center justify-center mobile-card-shadow"
              style={{
                background: '#FFFFFF',
                border: `1.5px solid ${borderColor}`,
              }}
            >
              <img
                src="/favicon.svg"
                alt="EnergyLoop"
                className="w-full h-full object-contain rounded-[20px]"
              />
            </div>
          </div>

          <h1
            className="text-2xl font-black tracking-tight leading-tight mb-1.5"
            style={{ color: textColor }}
          >
            EnergyLoop
          </h1>

          <p
            className="text-[11px] font-bold tracking-wider uppercase mb-2"
            style={{ color: '#3BA676' }}
          >
            Nutrición Inteligente & Balance Diario
          </p>

          <p
            className="text-xs max-w-[280px] leading-relaxed mb-6"
            style={{ color: secondaryText }}
          >
            Controla tus calorías, comidas y entrenamientos con diseño mobile-first y respaldo en la nube.
          </p>

          {/* Feature Highlights: Las 3 cards apiladas una sobre otra */}
          <div className="w-full flex flex-col gap-2.5 text-left">
            {/* Card 1: Escaneo con IA */}
            <div
              className="welcome-feature p-3.5 rounded-2xl flex items-center gap-3.5 mobile-card-shadow"
              style={{
                background: surfaceColor,
                border: `1.5px solid ${borderColor}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: '#DDF0E4',
                  border: '1px solid #BEDECB',
                  color: '#164E35',
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
                <span className="text-[11px] block leading-snug mt-0.5" style={{ color: secondaryText }}>
                  Reconoce alimentos y macronutrientes con tu cámara.
                </span>
              </div>
            </div>

            {/* Card 2: Anillo de Energía */}
            <div
              className="welcome-feature p-3.5 rounded-2xl flex items-center gap-3.5 mobile-card-shadow"
              style={{
                background: surfaceColor,
                border: `1.5px solid ${borderColor}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: '#FCEEE5',
                  border: '1px solid #F5CFBB',
                  color: '#9A3412',
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
                <span className="text-[11px] block leading-snug mt-0.5" style={{ color: secondaryText }}>
                  Monitorea tus calorías consumidas vs. quemadas en tiempo real.
                </span>
              </div>
            </div>

            {/* Card 3: Sincronización en la Nube */}
            <div
              className="welcome-feature p-3.5 rounded-2xl flex items-center gap-3.5 mobile-card-shadow"
              style={{
                background: surfaceColor,
                border: `1.5px solid ${borderColor}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: '#E5F2F7',
                  border: '1px solid #BCDEEB',
                  color: '#0B5875',
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
                <span className="text-[11px] block leading-snug mt-0.5" style={{ color: secondaryText }}>
                  Conectado a tu base de datos Supabase con respaldo seguro.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Iniciar Sesión antes que Crear Cuenta, ambos en la misma línea */}
        <div className="welcome-actions w-full flex flex-col gap-2 pt-3">
          <div className="grid grid-cols-2 gap-2.5 w-full">
            {/* 1° Botón: Iniciar Sesión (Antes que Crear Cuenta) */}
            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3.5 px-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] mobile-card-shadow flex items-center justify-center gap-1.5"
              style={{
                background: surfaceColor,
                border: `1.5px solid ${borderColor}`,
                color: textColor,
              }}
            >
              <span>Iniciar Sesión</span>
              <span className="text-xs">➔</span>
            </button>

            {/* 2° Botón: Crear Cuenta */}
            <button
              onClick={() => openAuthModal('register')}
              className="w-full py-3.5 px-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] mobile-card-shadow flex items-center justify-center gap-1.5"
              style={{
                background: '#3BA676',
                border: '1.5px solid #339468',
                color: '#FFFFFF',
              }}
            >
              <span>Crear Cuenta</span>
              <span className="text-xs">✨</span>
            </button>
          </div>

          {/* Continuar como invitado */}
          <button
            onClick={onContinueAsGuest}
            className="w-full py-2 text-center text-[11px] font-bold transition-all duration-200 hover:underline active:scale-95"
            style={{ color: secondaryText }}
          >
            Continuar como invitado sin cuenta →
          </button>
        </div>
      </div>
    </div>
  );
}
