import { useState, useRef, useMemo } from 'react';
import { PHeading, PText, PModal, PButton, PIcon } from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CalorieRing } from '../components/CalorieRing';
import { FoodCard } from '../components/FoodCard';
import { ExerciseCard } from '../components/ExerciseCard';
import { MacroBar } from '../components/MacroBar';
import { AddFoodModal } from '../components/AddFoodModal';
import { ScanModal } from '../components/ScanModal';
import { AddExerciseModal } from '../components/AddExerciseModal';
import { formatNumber } from '../lib/calculations';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function Dashboard() {
  const { profile, todayFoods, todayExercises, theme, toggleTheme, refreshCount } = useApp();
  const { user, openAuthModal } = useAuth();
  const [modal, setModal] = useState<'none' | 'addFood' | 'scan' | 'addExercise' | 'setup'>('none');
  const [showAllFood, setShowAllFood] = useState(false);
  const [showAllExercise, setShowAllExercise] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    return todayFoods.reduce((acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein_g,
      carbs: acc.carbs + f.carbs_g,
      fat: acc.fat + f.fat_g,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [todayFoods, refreshCount]);

  const burned = useMemo(() => {
    return todayExercises.reduce((acc, e) => acc + e.calories_burned, 0);
  }, [todayExercises, refreshCount]);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.dash-header', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      gsap.fromTo('.dash-stats-card', { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.6, delay: 0.1, ease: 'power2.out' });
      gsap.fromTo('.dash-action', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2, stagger: 0.08, ease: 'power3.out' });
      gsap.fromTo('.dash-section', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.25, stagger: 0.08, ease: 'power3.out' });
      gsap.fromTo('.dash-item', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.3, stagger: 0.04, ease: 'power2.out' });
    }, containerRef);
    return () => ctx.revert();
  }, { dependencies: [todayFoods, todayExercises], scope: containerRef });

  const goal = profile?.daily_calorie_goal || 0;
  const consumed = stats.calories;
  const net = consumed - burned;
  const remaining = goal - net;
  const overGoal = net > goal;
  
  const protein = stats.protein;
  const carbs = stats.carbs;
  const fat = stats.fat;

  const [showInfo, setShowInfo] = useState(false);
  const hour = new Date().getHours();
  
  const surfaceColor = theme === 'dark' ? '#171922' : '#ffffff';
  const borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
  const secondaryText = theme === 'dark' ? '#94a3b8' : '#64748b';

  const visibleFoods = showAllFood ? todayFoods : todayFoods.slice(0, 3);
  const visibleExercises = showAllExercise ? todayExercises : todayExercises.slice(0, 3);

  return (
    <div ref={containerRef} className="flex flex-col gap-6 pb-24">
      
      {/* Native Mobile Header with Dark Mode Toggle */}
      <header className="dash-header flex items-center justify-between pt-1">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">
              {hour < 12 ? '☀️' : hour < 20 ? '⛅' : '🌙'}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
              {hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'}
            </span>
          </div>
          <h1 
            className="text-2xl font-black tracking-tight truncate mt-0.5"
            style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
          >
            {profile?.name ? profile.name.split(' ')[0] : 'Campeón'} ⚡
          </h1>
        </div>

        {/* Header Right Actions: Dark Mode Button + Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 mobile-card-shadow"
            style={{
              background: surfaceColor,
              border: `1px solid ${borderColor}`,
              color: theme === 'dark' ? '#fde047' : '#f59e0b',
            }}
            title={theme === 'dark' ? 'Cambiar a Modo Claro pastel' : 'Cambiar a Modo Oscuro'}
            aria-label="Cambiar tema"
          >
            <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>

          {/* User Avatar / Connect Button */}
          <button 
            onClick={!user ? openAuthModal : undefined}
            title={!user ? 'Conectar cuenta en la nube' : profile?.name || 'Perfil'}
            className="h-10 w-10 rounded-2xl flex items-center justify-center text-xl overflow-hidden transition-all duration-200 active:scale-90 mobile-card-shadow"
            style={{
              background: user ? '#10b981' : (theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#ecfdf5'),
              border: `1px solid ${user ? '#059669' : '#a7f3d0'}`,
              color: user ? '#ffffff' : '#065f46',
            }}
          >
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{user ? '👤' : '☁️'}</span>
            )}
          </button>
        </div>
      </header>

      {/* Main Stats Card (Calorie Ring + Equation + MacroBar) */}
      <div
        className="rounded-[2rem] p-5 flex flex-col items-center gap-5 mobile-card-shadow dash-stats-card transition-all"
        style={{
          background: surfaceColor,
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* Industry Standard Equation in Clean Pastel Pills */}
        <div className="w-full relative">
          <button 
            onClick={() => setShowInfo(true)}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90 opacity-60 hover:opacity-100"
            style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f5f3' }}
            title="¿Cómo funciona el balance?"
          >
            <PIcon name="question" size="inherit" theme={theme} color="inherit" style={{ width: '12px', height: '12px' }} />
          </button>

          <div className="grid grid-cols-4 gap-1.5 text-center px-1 pt-1">
            {/* Meta */}
            <div 
              className="p-2 rounded-xl flex flex-col items-center"
              style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8faf9' }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
                Meta
              </span>
              <span className="text-xs font-black" style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}>
                {goal}
              </span>
            </div>

            {/* Ingerido - Pastel Coral */}
            <div 
              className="p-2 rounded-xl flex flex-col items-center"
              style={{ 
                background: theme === 'dark' ? 'rgba(255, 133, 150, 0.1)' : '#fff1f2',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 133, 150, 0.2)' : '#ffe4e6'}`
              }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500">
                Comida
              </span>
              <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                {consumed}
              </span>
            </div>

            {/* Quemado - Pastel Naranja */}
            <div 
              className="p-2 rounded-xl flex flex-col items-center"
              style={{ 
                background: theme === 'dark' ? 'rgba(251, 146, 60, 0.1)' : '#fff7ed',
                border: `1px solid ${theme === 'dark' ? 'rgba(251, 146, 60, 0.2)' : '#ffedd5'}`
              }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">
                Ejercicio
              </span>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                {burned}
              </span>
            </div>

            {/* Restantes - Pastel Menta */}
            <div 
              className="p-2 rounded-xl flex flex-col items-center"
              style={{ 
                background: theme === 'dark' 
                  ? (overGoal ? 'rgba(248, 113, 113, 0.15)' : 'rgba(52, 211, 153, 0.1)') 
                  : (overGoal ? '#fee2e2' : '#ecfdf5'),
                border: `1px solid ${theme === 'dark' 
                  ? (overGoal ? 'rgba(248, 113, 113, 0.25)' : 'rgba(52, 211, 153, 0.2)') 
                  : (overGoal ? '#fecaca' : '#d1fae5')}`
              }}
            >
              <span 
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: overGoal ? '#dc2626' : '#059669' }}
              >
                {overGoal ? 'Exceso' : 'Restan'}
              </span>
              <span 
                className="text-xs font-black"
                style={{ color: overGoal ? '#dc2626' : '#059669' }}
              >
                {Math.abs(remaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Circular Progress Ring */}
        <CalorieRing consumed={consumed} burned={burned} goal={goal} theme={theme} />

        {/* Macronutrient Bars */}
        <div className="w-full pt-1">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
              Macronutrientes
            </span>
            <span className="text-[10px] font-semibold opacity-70" style={{ color: secondaryText }}>
              {formatNumber(protein, 0)}g P · {formatNumber(carbs, 0)}g C · {formatNumber(fat, 0)}g G
            </span>
          </div>
          <MacroBar
            protein={protein}
            carbs={carbs}
            fat={fat}
            proteinGoal={profile?.daily_protein_goal ?? undefined}
            theme={theme}
          />
        </div>
      </div>

      {/* AI Scanner Hero Banner (Pastel Gradient) */}
      <section className="dash-item">
        <button
          onClick={() => setModal('scan')}
          className="w-full relative overflow-hidden p-5 rounded-3xl flex items-center justify-between text-left transition-all active:scale-[0.98] group shadow-md"
          style={{ 
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: '#ffffff'
          }}
        >
          <div className="relative z-10 flex-1 pr-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md mb-1.5">
              <span className="text-xs">✨</span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-white">Escáner IA</span>
            </div>
            <h2 className="text-lg font-black text-white leading-tight">
              Reconocimiento Visual
            </h2>
            <p className="text-xs text-white/85 mt-1 leading-snug">
              Toma una foto al platillo y la IA calculará calorías e ingredientes
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
            📸
          </div>
        </button>
      </section>

      {/* Quick Action Touch Buttons */}
      <div className="dash-action grid grid-cols-2 gap-3">
        {/* + Comida */}
        <button 
          onClick={() => setModal('addFood')}
          className="flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-95 mobile-card-shadow"
          style={{ 
            background: theme === 'dark' ? '#171922' : '#ffffff',
            border: `1px solid ${borderColor}` 
          }}
        >
          <div 
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-xs"
            style={{ background: theme === 'dark' ? 'rgba(255, 133, 150, 0.15)' : '#fff1f2' }}
          >
            🍎
          </div>
          <div className="text-left">
            <div className="text-sm font-black" style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}>
              Comida
            </div>
            <div className="text-[11px] font-semibold text-rose-500">
              + Registrar
            </div>
          </div>
        </button>

        {/* + Ejercicio */}
        <button 
          onClick={() => setModal('addExercise')}
          className="flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-95 mobile-card-shadow"
          style={{ 
            background: theme === 'dark' ? '#171922' : '#ffffff',
            border: `1px solid ${borderColor}` 
          }}
        >
          <div 
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-xs"
            style={{ background: theme === 'dark' ? 'rgba(251, 146, 60, 0.15)' : '#fff7ed' }}
          >
            💪
          </div>
          <div className="text-left">
            <div className="text-sm font-black" style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}>
              Ejercicio
            </div>
            <div className="text-[11px] font-semibold text-amber-500">
              + Quemar
            </div>
          </div>
        </button>
      </div>

      {/* Food entries list */}
      {todayFoods.length > 0 && (
        <div className="dash-section flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">🥗</span>
              <h2 className="text-sm font-black tracking-tight" style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}>
                Comidas registradas ({todayFoods.length})
              </h2>
            </div>
            {todayFoods.length > 3 && (
              <button 
                onClick={() => setShowAllFood(!showAllFood)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {showAllFood ? 'Ver menos' : 'Ver todos'}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            {visibleFoods.map(food => (
              <div key={food.id} className="dash-item">
                <FoodCard entry={food} theme={theme} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise entries list */}
      {todayExercises.length > 0 && (
        <div className="dash-section flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">🏃</span>
              <h2 className="text-sm font-black tracking-tight" style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}>
                Entrenamientos de hoy ({todayExercises.length})
              </h2>
            </div>
            {todayExercises.length > 3 && (
              <button 
                onClick={() => setShowAllExercise(!showAllExercise)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                {showAllExercise ? 'Ver menos' : 'Ver todos'}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            {visibleExercises.map(ex => (
              <div key={ex.id} className="dash-item">
                <ExerciseCard entry={ex} theme={theme} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty States if Nothing Logged Yet */}
      {todayFoods.length === 0 && (
        <div 
          className="rounded-3xl p-6 flex flex-col items-center gap-2 text-center mobile-card-shadow dash-item" 
          style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#ecfdf5] dark:bg-emerald-950/40 flex items-center justify-center text-3xl mb-1">
            🥑
          </div>
          <span className="font-bold text-sm" style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}>
            Aún no has registrado comidas hoy
          </span>
          <span className="text-xs" style={{ color: secondaryText }}>
            Toca el botón Escáner IA o "+ Comida" para iniciar tu registro diario
          </span>
        </div>
      )}

      {/* Modals */}
      <AddFoodModal open={modal === 'addFood'} onDismiss={() => setModal('none')} />
      <ScanModal open={modal === 'scan'} onDismiss={() => setModal('none')} theme={theme} />
      <AddExerciseModal open={modal === 'addExercise'} onDismiss={() => setModal('none')} />
      
      {/* Logic Info Modal */}
      <PModal 
        open={showInfo} 
        onDismiss={() => setShowInfo(false)} 
        heading="Metodología EnergyLoop" 
        theme={theme}
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
            <PHeading size="small" theme={theme} style={{ color: '#059669', marginBottom: 4 }}>
              💳 Tu Presupuesto Diario
            </PHeading>
            <PText size="small" theme={theme}>
              Comienzas cada día con una meta energética. Cada alimento resta de este presupuesto, mientras que el ejercicio te devuelve calorías disponibles.
            </PText>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">🍎 Alimentos</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Gastan calorías de tu presupuesto diario.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">💪 Ejercicio</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Generan bono y aumentan tus calorías restantes.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border" style={{ borderColor }}>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
              🎯 Objetivo Diario
            </span>
            <PText size="small" theme={theme}>
              Tu meta ideal es terminar el día lo más cerca posible de 0 calorías restantes.
            </PText>
          </div>

          <div style={{ borderRadius: '9999px', overflow: 'hidden', width: '100%', transform: 'translateZ(0)' }}>
            <PButton 
              variant="primary" 
              theme={theme} 
              onClick={() => setShowInfo(false)}
              style={{ width: '100%', margin: 0 }}
            >
              ¡Entendido!
            </PButton>
          </div>
        </div>
      </PModal>
    </div>
  );
}
