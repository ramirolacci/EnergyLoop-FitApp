import { useState, useRef, useMemo } from 'react';
import { PModal, PButton, PIcon } from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CalorieRing } from '../components/CalorieRing';
import { FoodCard } from '../components/FoodCard';
import { ExerciseCard } from '../components/ExerciseCard';
import { MacroBar } from '../components/MacroBar';
import { AddFoodModal } from '../components/AddFoodModal';
import { ScanModal } from '../components/ScanModal';
import { AddExerciseModal } from '../components/AddExerciseModal';
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
      gsap.fromTo('.dash-header', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      gsap.fromTo('.dash-stats-card', { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.08, ease: 'power2.out' });
      gsap.fromTo('.dash-action', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.15, stagger: 0.05, ease: 'power2.out' });
      gsap.fromTo('.dash-section', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.2, stagger: 0.05, ease: 'power2.out' });
      gsap.fromTo('.dash-item', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, delay: 0.25, stagger: 0.03, ease: 'power2.out' });
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
  
  const surfaceColor = theme === 'dark' ? '#181b22' : '#ffffff';
  const borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#f0ebe1';
  const secondaryText = theme === 'dark' ? '#94a3b8' : '#78716c';

  const visibleFoods = showAllFood ? todayFoods : todayFoods.slice(0, 3);
  const visibleExercises = showAllExercise ? todayExercises : todayExercises.slice(0, 3);

  return (
    <div ref={containerRef} className="flex flex-col gap-4 pb-20">
      
      {/* Top Mobile Bar - Proporciones estándar Play Store / App Store */}
      <header className="dash-header flex items-center justify-between pt-1">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">
              {hour < 12 ? '☀️' : hour < 20 ? '⛅' : '🌙'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: secondaryText }}>
              {hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'}
            </span>
          </div>
          <h1 
            className="text-lg font-black tracking-tight truncate mt-0.5"
            style={{ color: theme === 'dark' ? '#f8fafc' : '#1a1e24' }}
          >
            {profile?.name ? profile.name.split(' ')[0] : 'Mi Balance'}
          </h1>
        </div>

        {/* Header Right: Botón Dark Mode ☀️/🌙 + Avatar */}
        <div className="flex items-center gap-1.5">
          {/* Botón Dark Mode de 1 toque */}
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

          {/* Avatar / Cloud Status */}
          <button 
            onClick={!user ? openAuthModal : undefined}
            title={!user ? 'Conectar cuenta en la nube' : profile?.name || 'Perfil'}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-base overflow-hidden transition-all duration-200 active:scale-90 mobile-card-shadow"
            style={{
              background: user ? '#4eba87' : (theme === 'dark' ? 'rgba(78, 186, 135, 0.2)' : '#e8f5ee'),
              border: `1px solid ${user ? '#38a169' : '#b7e4ce'}`,
              color: user ? '#ffffff' : '#1d5f3f',
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

      {/* Main Stats Card (Blanco Pastel, Verde Pastel, Beige Pastel, Naranja Pastel, Celeste Pastel) */}
      <div
        className="rounded-3xl p-4 flex flex-col items-center gap-3.5 mobile-card-shadow dash-stats-card transition-all"
        style={{
          background: surfaceColor,
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* Ecuación Nutricional en Chips Pasteles */}
        <div className="w-full relative">
          <button 
            onClick={() => setShowInfo(true)}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center transition-all active:scale-90 opacity-60 hover:opacity-100"
            style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f7f4ee' }}
            title="¿Cómo funciona?"
          >
            <PIcon name="question" size="inherit" theme={theme} color="inherit" style={{ width: '10px', height: '10px' }} />
          </button>

          <div className="grid grid-cols-4 gap-1 text-center px-0.5 pt-0.5">
            {/* Meta - Beige Pastel */}
            <div 
              className="py-1.5 px-1 rounded-xl flex flex-col items-center"
              style={{ 
                background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f7f4ee',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#e9e4d8'}`
              }}
            >
              <span className="text-[8px] font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
                Meta
              </span>
              <span className="text-xs font-black" style={{ color: theme === 'dark' ? '#f8fafc' : '#1a1e24' }}>
                {goal}
              </span>
            </div>

            {/* Ingerido - Naranja Pastel Suave */}
            <div 
              className="py-1.5 px-1 rounded-xl flex flex-col items-center"
              style={{ 
                background: theme === 'dark' ? 'rgba(251, 164, 113, 0.12)' : '#fff0e6',
                border: `1px solid ${theme === 'dark' ? 'rgba(251, 164, 113, 0.25)' : '#fed7aa'}`
              }}
            >
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#c2410c] dark:text-[#fdba74]">
                Comida
              </span>
              <span className="text-xs font-black text-[#c2410c] dark:text-[#fdba74]">
                {consumed}
              </span>
            </div>

            {/* Quemado - Celeste Pastel Suave */}
            <div 
              className="py-1.5 px-1 rounded-xl flex flex-col items-center"
              style={{ 
                background: theme === 'dark' ? 'rgba(126, 200, 227, 0.12)' : '#e1f5fe',
                border: `1px solid ${theme === 'dark' ? 'rgba(126, 200, 227, 0.25)' : '#b3e5fc'}`
              }}
            >
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#0277bd] dark:text-[#93c5fd]">
                Ejercicio
              </span>
              <span className="text-xs font-black text-[#0277bd] dark:text-[#93c5fd]">
                {burned}
              </span>
            </div>

            {/* Restantes - Verde Pastel Suave */}
            <div 
              className="py-1.5 px-1 rounded-xl flex flex-col items-center"
              style={{ 
                background: theme === 'dark' 
                  ? (overGoal ? 'rgba(248, 113, 113, 0.15)' : 'rgba(78, 186, 135, 0.15)') 
                  : (overGoal ? '#fff0e6' : '#e8f5ee'),
                border: `1px solid ${theme === 'dark' 
                  ? (overGoal ? 'rgba(248, 113, 113, 0.3)' : 'rgba(78, 186, 135, 0.3)') 
                  : (overGoal ? '#fed7aa' : '#b7e4ce')}`
              }}
            >
              <span 
                className="text-[8px] font-bold uppercase tracking-wider"
                style={{ color: overGoal ? '#c2410c' : '#1d5f3f' }}
              >
                {overGoal ? 'Exceso' : 'Restan'}
              </span>
              <span 
                className="text-xs font-black"
                style={{ color: overGoal ? '#c2410c' : '#1d5f3f' }}
              >
                {Math.abs(remaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Anillo de Calorías en Escala Mobile Perfecta (168px) */}
        <CalorieRing consumed={consumed} burned={burned} goal={goal} theme={theme} />

        {/* Barras de Macronutrientes (Proteínas, Carbos, Grasas en Colores Pasteles) */}
        <div className="w-full">
          <MacroBar
            protein={protein}
            carbs={carbs}
            fat={fat}
            proteinGoal={profile?.daily_protein_goal ?? undefined}
            theme={theme}
          />
        </div>
      </div>

      {/* Escáner IA (Verde Pastel Hero) */}
      <section className="dash-item">
        <button
          onClick={() => setModal('scan')}
          className="w-full relative overflow-hidden p-4 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] mobile-card-shadow"
          style={{ 
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #1b4d3e 0%, #16382e 100%)'
              : 'linear-gradient(135deg, #4eba87 0%, #34d399 100%)',
            color: '#ffffff',
            border: `1px solid ${theme === 'dark' ? 'rgba(78, 186, 135, 0.3)' : '#b7e4ce'}`
          }}
        >
          <div className="relative z-10 flex-1 pr-2">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md mb-1">
              <span className="text-[10px]">✨</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-white">IA Vision</span>
            </div>
            <h2 className="text-sm font-black text-white leading-tight">
              Escanear Platillo o Etiqueta
            </h2>
            <p className="text-[11px] text-white/90 mt-0.5 leading-snug">
              Analiza calorías y macronutrientes al instante
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl flex-shrink-0">
            📸
          </div>
        </button>
      </section>

      {/* Acciones Rápidas (Píldoras Pasteles Táctiles) */}
      <div className="dash-action grid grid-cols-2 gap-2.5">
        {/* + Comida (Beige Pastel) */}
        <button 
          onClick={() => setModal('addFood')}
          className="flex items-center gap-2.5 p-3 rounded-2xl transition-all active:scale-95 mobile-card-shadow"
          style={{ 
            background: surfaceColor,
            border: `1px solid ${borderColor}` 
          }}
        >
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-xs flex-shrink-0"
            style={{ 
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f7f4ee',
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e9e4d8'}`
            }}
          >
            🍎
          </div>
          <div className="text-left min-w-0">
            <div className="text-xs font-black truncate" style={{ color: theme === 'dark' ? '#f8fafc' : '#1a1e24' }}>
              Comida
            </div>
            <div className="text-[10px] font-bold text-[#c2410c] dark:text-[#fdba74]">
              + Registrar
            </div>
          </div>
        </button>

        {/* + Ejercicio (Celeste Pastel) */}
        <button 
          onClick={() => setModal('addExercise')}
          className="flex items-center gap-2.5 p-3 rounded-2xl transition-all active:scale-95 mobile-card-shadow"
          style={{ 
            background: surfaceColor,
            border: `1px solid ${borderColor}` 
          }}
        >
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-xs flex-shrink-0"
            style={{ 
              background: theme === 'dark' ? 'rgba(126, 200, 227, 0.15)' : '#e1f5fe',
              border: `1px solid ${theme === 'dark' ? 'rgba(126, 200, 227, 0.25)' : '#b3e5fc'}`
            }}
          >
            💪
          </div>
          <div className="text-left min-w-0">
            <div className="text-xs font-black truncate" style={{ color: theme === 'dark' ? '#f8fafc' : '#1a1e24' }}>
              Ejercicio
            </div>
            <div className="text-[10px] font-bold text-[#0277bd] dark:text-[#93c5fd]">
              + Quemar
            </div>
          </div>
        </button>
      </div>

      {/* Comidas Registradas */}
      {todayFoods.length > 0 && (
        <div className="dash-section flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🥗</span>
              <h2 className="text-xs font-black uppercase tracking-wider opacity-70" style={{ color: secondaryText }}>
                Comidas hoy ({todayFoods.length})
              </h2>
            </div>
            {todayFoods.length > 3 && (
              <button 
                onClick={() => setShowAllFood(!showAllFood)}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {showAllFood ? 'Ver menos' : 'Ver todas'}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {visibleFoods.map(food => (
              <div key={food.id} className="dash-item">
                <FoodCard entry={food} theme={theme} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entrenamientos Registrados */}
      {todayExercises.length > 0 && (
        <div className="dash-section flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🏃</span>
              <h2 className="text-xs font-black uppercase tracking-wider opacity-70" style={{ color: secondaryText }}>
                Actividad hoy ({todayExercises.length})
              </h2>
            </div>
            {todayExercises.length > 3 && (
              <button 
                onClick={() => setShowAllExercise(!showAllExercise)}
                className="text-[11px] font-bold text-[#c2410c] dark:text-[#fdba74] hover:underline"
              >
                {showAllExercise ? 'Ver menos' : 'Ver todos'}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {visibleExercises.map(ex => (
              <div key={ex.id} className="dash-item">
                <ExerciseCard entry={ex} theme={theme} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío cuando no hay nada registrado */}
      {todayFoods.length === 0 && (
        <div 
          className="rounded-2xl p-5 flex flex-col items-center gap-1.5 text-center mobile-card-shadow dash-item" 
          style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#e8f5ee] dark:bg-emerald-950/40 flex items-center justify-center text-2xl mb-0.5">
            🥑
          </div>
          <span className="font-bold text-xs" style={{ color: theme === 'dark' ? '#f8fafc' : '#1a1e24' }}>
            Sin comidas registradas hoy
          </span>
          <span className="text-[11px]" style={{ color: secondaryText }}>
            Toca el Escáner IA o "+ Comida" para iniciar
          </span>
        </div>
      )}

      {/* Modals */}
      <AddFoodModal open={modal === 'addFood'} onDismiss={() => setModal('none')} />
      <ScanModal open={modal === 'scan'} onDismiss={() => setModal('none')} theme={theme} />
      <AddExerciseModal open={modal === 'addExercise'} onDismiss={() => setModal('none')} />
      
      {/* Modal explicativo */}
      <PModal 
        open={showInfo} 
        onDismiss={() => setShowInfo(false)} 
        heading="Metodología EnergyLoop" 
        theme={theme}
      >
        <div className="flex flex-col gap-3 py-2">
          <div className="p-3.5 rounded-2xl bg-[#e8f5ee] dark:bg-emerald-950/30 border border-[#b7e4ce] dark:border-emerald-800/40">
            <span className="text-xs font-bold text-[#1d5f3f] dark:text-emerald-400 block mb-1">
              💳 Presupuesto Diario
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Comienzas cada día con tu meta energética. Los alimentos restan de este presupuesto y el ejercicio te devuelve calorías disponibles.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-[#fff0e6] dark:bg-amber-950/20 border border-[#fed7aa] dark:border-amber-900/30">
              <span className="text-[11px] font-bold text-[#c2410c] dark:text-amber-400">🍎 Alimentos</span>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                Restan calorías de tu presupuesto.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-[#e1f5fe] dark:bg-sky-950/20 border border-[#b3e5fc] dark:border-sky-900/30">
              <span className="text-[11px] font-bold text-[#0277bd] dark:text-sky-400">💪 Ejercicio</span>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                Generan bono y suman calorías.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border" style={{ borderColor }}>
            <span className="text-xs font-bold text-[#1d5f3f] dark:text-emerald-400 block mb-0.5">
              🎯 Objetivo Diario
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Tu meta ideal es terminar el día lo más cerca posible de 0 calorías restantes.
            </p>
          </div>

          <div style={{ borderRadius: '9999px', overflow: 'hidden', width: '100%', transform: 'translateZ(0)', marginTop: 4 }}>
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
