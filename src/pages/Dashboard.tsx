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
  const { profile, todayFoods, todayExercises, theme, refreshCount } = useApp();
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
  
  const surfaceColor = '#ffffff';
  const borderColor = '#e4dcce';
  const secondaryText = '#5c5245';

  const visibleFoods = showAllFood ? todayFoods : todayFoods.slice(0, 3);
  const visibleExercises = showAllExercise ? todayExercises : todayExercises.slice(0, 3);

  return (
    <div ref={containerRef} className="flex flex-col gap-4 pb-6">
      
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
            style={{ color: '#1c1917' }}
          >
            {profile?.name ? profile.name.split(' ')[0] : 'Mi Balance'}
          </h1>
        </div>

        {/* Header Right: Avatar / Cloud Status */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={!user ? () => openAuthModal('login') : undefined}
            title={!user ? 'Conectar cuenta en la nube' : profile?.name || 'Perfil'}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-base overflow-hidden transition-all duration-200 active:scale-90 mobile-card-shadow"
            style={{
              background: user ? '#3ba676' : '#ddf0e4',
              border: `1.5px solid ${user ? '#339468' : '#bedecb'}`,
              color: user ? '#ffffff' : '#164e35',
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
          border: `1.5px solid ${borderColor}`,
        }}
      >
        {/* Ecuación Nutricional en Chips Pasteles Mate */}
        <div className="w-full relative">
          <button 
            onClick={() => setShowInfo(true)}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center transition-all active:scale-90 opacity-60 hover:opacity-100"
            style={{ background: '#efe9dc' }}
            title="¿Cómo funciona?"
          >
            <PIcon name="question" size="inherit" theme={theme} color="inherit" style={{ width: '10px', height: '10px' }} />
          </button>

          <div className="grid grid-cols-4 gap-1 text-center px-0.5 pt-0.5">
            {/* Meta - Beige Pastel Mate */}
            <div 
              className="py-1.5 px-1 rounded-xl flex flex-col items-center"
              style={{ 
                background: '#efe9dc',
                border: '1px solid #e0d5c3'
              }}
            >
              <span className="text-[8px] font-bold uppercase tracking-wider opacity-70" style={{ color: secondaryText }}>
                Meta
              </span>
              <span className="text-xs font-black" style={{ color: '#1c1917' }}>
                {goal}
              </span>
            </div>

            {/* Ingerido - Naranja Pastel Mate */}
            <div 
              className="py-1.5 px-1 rounded-xl flex flex-col items-center"
              style={{ 
                background: '#fceee5',
                border: '1px solid #f5cfbb'
              }}
            >
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#9a3412]">
                Comida
              </span>
              <span className="text-xs font-black text-[#9a3412]">
                {consumed}
              </span>
            </div>

            {/* Quemado - Celeste Pastel Mate */}
            <div 
              className="py-1.5 px-1 rounded-xl flex flex-col items-center"
              style={{ 
                background: '#e5f2f7',
                border: '1px solid #bcdeeb'
              }}
            >
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#0b5875]">
                Ejercicio
              </span>
              <span className="text-xs font-black text-[#0b5875]">
                {burned}
              </span>
            </div>

            {/* Restantes - Verde Pastel Mate */}
            <div 
              className="py-1.5 px-1 rounded-xl flex flex-col items-center"
              style={{ 
                background: overGoal ? '#fceee5' : '#ddf0e4',
                border: `1px solid ${overGoal ? '#f5cfbb' : '#bedecb'}`
              }}
            >
              <span 
                className="text-[8px] font-bold uppercase tracking-wider"
                style={{ color: overGoal ? '#9a3412' : '#164e35' }}
              >
                {overGoal ? 'Exceso' : 'Restan'}
              </span>
              <span 
                className="text-xs font-black"
                style={{ color: overGoal ? '#9a3412' : '#164e35' }}
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

      {/* Escáner IA (Verde Pastel Mate Sólido) */}
      <section className="dash-item">
        <button
          onClick={() => setModal('scan')}
          className="w-full relative overflow-hidden p-4 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] mobile-card-shadow"
          style={{ 
            background: '#3ba676',
            color: '#ffffff',
            border: '1.5px solid #339468'
          }}
        >
          <div className="relative z-10 flex-1 pr-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 mb-1">
              <span className="text-[10px]">✨</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-white">IA Vision</span>
            </div>
            <h2 className="text-sm font-black text-white leading-tight">
              Escanear Platillo o Etiqueta
            </h2>
            <p className="text-[11px] text-white/95 mt-0.5 leading-snug">
              Analiza calorías y macronutrientes al instante
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
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
              background: '#fceee5',
              border: '1px solid #f5cfbb'
            }}
          >
            🍎
          </div>
          <div className="text-left min-w-0">
            <div className="text-xs font-black truncate" style={{ color: '#1c1917' }}>
              Comida
            </div>
            <div className="text-[10px] font-bold text-[#9a3412]">
              + Registrar
            </div>
          </div>
        </button>

        {/* + Ejercicio (Celeste Pastel Mate) */}
        <button 
          onClick={() => setModal('addExercise')}
          className="flex items-center gap-2.5 p-3 rounded-2xl transition-all active:scale-95 mobile-card-shadow"
          style={{ 
            background: surfaceColor,
            border: `1.5px solid ${borderColor}` 
          }}
        >
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-xs flex-shrink-0"
            style={{ 
              background: '#e5f2f7',
              border: '1px solid #bcdeeb'
            }}
          >
            💪
          </div>
          <div className="text-left min-w-0">
            <div className="text-xs font-black truncate" style={{ color: '#1c1917' }}>
              Ejercicio
            </div>
            <div className="text-[10px] font-bold text-[#0b5875]">
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
          <span className="font-bold text-xs" style={{ color: '#1a1e24' }}>
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
