import { useState, useRef, useMemo } from 'react';
import { PHeading, PText, PDivider, PButtonPure } from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import { CalorieRing } from '../components/CalorieRing';
import { FoodCard } from '../components/FoodCard';
import { ExerciseCard } from '../components/ExerciseCard';
import { MacroBar } from '../components/MacroBar';
import { AddFoodModal } from '../components/AddFoodModal';
import { ScanModal } from '../components/ScanModal';
import { AddExerciseModal } from '../components/AddExerciseModal';
import { CountUp } from '../components/CountUp';
import { formatNumber } from '../lib/calculations';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function Dashboard() {
  const { profile, todayFoods, todayExercises, deleteFoodEntry, deleteExerciseEntry, theme } = useApp();
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
      burned: acc.burned
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, burned: 0 });
  }, [todayFoods]);

  const burned = useMemo(() => {
    return todayExercises.reduce((acc, e) => acc + e.calories_burned, 0);
  }, [todayExercises]);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.dash-header', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      gsap.fromTo('.dash-stats-card', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.8, delay: 0.1, ease: 'elastic.out(1, 0.8)' });
      gsap.fromTo('.dash-action', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, stagger: 0.1, ease: 'power3.out' });
      gsap.fromTo('.dash-section', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, stagger: 0.1, ease: 'power3.out' });
      gsap.fromTo('.dash-item', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.4, stagger: 0.05, ease: 'power2.out' });
    }, containerRef);
    return () => ctx.revert();
  }, { scope: containerRef });

  const goal = profile?.daily_calorie_goal || 0;
  const consumed = stats.calories;
  const net = consumed - burned;
  const remaining = goal - net;
  const overGoal = net > goal;
  const isConfigured = goal > 0;

  const protein = stats.protein;
  const carbs = stats.carbs;
  const fat = stats.fat;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  
  const surfaceColor = theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface-light)';
  const borderColor = theme === 'dark' ? 'var(--border-dark)' : 'var(--border-light)';
  const secondaryText = theme === 'dark' ? '#afb0b3' : '#535457';

  const visibleFoods = showAllFood ? todayFoods : todayFoods.slice(0, 3);
  const visibleExercises = showAllExercise ? todayExercises : todayExercises.slice(0, 3);

  return (
    <div ref={containerRef} className="flex flex-col gap-8 pb-24">
      {/* Header */}
      <header className="dash-header flex items-center justify-between mt-2">
        <div>
          <PHeading size="large" theme={theme} style={{ fontWeight: 900 }}>
            {hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'}, {profile?.name ? profile.name.split(' ')[0] : 'Campeón'} ⚡
          </PHeading>
          <PText size="small" theme={theme} style={{ color: secondaryText }}>Hoy es un buen día para entrenar</PText>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-[#018a16] flex items-center justify-center text-2xl shadow-lg shadow-[#018a1644] overflow-hidden">
          {profile?.avatar ? (
            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>🥗</span>
          )}
        </div>
      </header>

      {/* Main Stats Card */}
      <div
        className="rounded-[2.5rem] p-6 flex flex-col items-center gap-6 card-shadow dash-stats-card"
        style={{
          background: surfaceColor,
          border: `1px solid ${borderColor}`,
        }}
      >
        <CalorieRing consumed={consumed} burned={burned} goal={goal} theme={theme} />

        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="text-center">
              <PText size="xx-small" theme={theme} style={{ color: secondaryText, marginBottom: 4 }}>CONSUMIDAS</PText>
              <div style={{ fontSize: 22, fontWeight: 800, color: theme === 'dark' ? '#fbfcff' : '#010205' }}>
                <CountUp value={consumed} />
              </div>
            </div>
            <div className="h-8 w-px bg-current opacity-10" />
            <div className="text-center">
              <PText size="xx-small" theme={theme} style={{ color: secondaryText, marginBottom: 4 }}>QUEMADAS</PText>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#018a16' }}>
                <CountUp value={burned} />
              </div>
            </div>
            <div className="h-8 w-px bg-current opacity-10" />
            <div className="text-center">
              <PText size="xx-small" theme={theme} style={{ color: secondaryText, marginBottom: 4 }}>RESTANTES</PText>
              <div style={{ fontSize: 22, fontWeight: 800, color: remaining < 0 ? '#e00000' : '#ff6b00' }}>
                <CountUp value={Math.abs(remaining)} />
              </div>
            </div>
          </div>

          <PDivider theme={theme} />

          <div>
             <div className="flex justify-between items-center mb-2">
                <PText size="xx-small" weight="semi-bold" theme={theme}>MACRONUTRIENTES</PText>
                <PText size="xx-small" theme={theme} style={{ color: secondaryText }}>
                  <CountUp value={protein} decimals={1} />g P · <CountUp value={carbs} decimals={1} />g C · <CountUp value={fat} decimals={1} />g G
                </PText>
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
      </div>

      {/* Quick Actions */}
      <div className="dash-action grid grid-cols-2 gap-4">
        <button 
          onClick={() => setModal('addFood')}
          className="group flex items-center gap-4 p-5 rounded-[2rem] transition-all hover:scale-[1.02] active:scale-[0.98] card-shadow glass"
          style={{ 
            background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(1, 138, 22, 0.05)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(1, 138, 22, 0.1)'}` 
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#018a16] flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">
            🍎
          </div>
          <div className="text-left">
            <PText weight="bold" theme={theme}>Comida</PText>
            <PText size="xx-small" theme={theme} style={{ color: secondaryText }}>Registrar</PText>
          </div>
        </button>

        <button 
          onClick={() => setModal('addExercise')}
          className="group flex items-center gap-4 p-5 rounded-[2rem] transition-all hover:scale-[1.02] active:scale-[0.98] card-shadow glass"
          style={{ 
            background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0, 118, 255, 0.05)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0, 118, 255, 0.1)'}` 
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0076ff] flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">
            💪
          </div>
          <div className="text-left">
            <PText weight="bold" theme={theme}>Ejercicio</PText>
            <PText size="xx-small" theme={theme} style={{ color: secondaryText }}>Quemar</PText>
          </div>
        </button>
      </div>

      {/* Macros Detailed */}
      <section className="dash-section">
        <div className="flex items-center justify-between mb-5 px-2">
          <PHeading size="small" theme={theme} style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Macronutrientes</PHeading>
          <PText size="xx-small" theme={theme} weight="bold" style={{ color: '#018a16' }}>DETALLES</PText>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Proteína', val: protein, goal: profile?.daily_protein_goal ?? 150, color: '#018a16', icon: '🍗' },
            { label: 'Carbos', val: carbs, goal: 300, color: '#ff6b00', icon: '🍞' },
            { label: 'Grasas', val: fat, goal: 70, color: '#0076ff', icon: '🥑' },
          ].map(m => (
            <div 
              key={m.label}
              className="p-4 rounded-3xl flex flex-col items-center gap-3 card-shadow"
              style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${m.color}15` }}>
                {m.icon}
              </div>
              <div className="text-center">
                <div className="text-lg font-black tracking-tight" style={{ color: theme === 'dark' ? '#fbfcff' : '#010205' }}>
                  <CountUp value={m.val} decimals={m.val % 1 === 0 ? 0 : 1} />g
                </div>
                <PText size="xx-small" theme={theme} style={{ color: secondaryText, fontWeight: 700 }}>{m.label.toUpperCase()}</PText>
              </div>
              <div className="w-full h-1.5 bg-current opacity-5 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.min((m.val / m.goal) * 100, 100)}%`,
                    background: m.color,
                    boxShadow: `0 0 10px ${m.color}66`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Assistant Banner */}
      <section className="dash-item">
        <button
          onClick={() => setModal('scan')}
          className="w-full relative overflow-hidden p-6 rounded-[2.5rem] flex items-center justify-between text-left transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-xl"
          style={{ background: 'linear-gradient(135deg, #018a16 0%, #005a0e 100%)', color: '#fff' }}
        >
          <div className="relative z-10">
            <PText size="small" weight="bold" style={{ color: 'rgba(255,255,255,0.8)' }}>ASISTENTE IA</PText>
            <PHeading size="small" style={{ color: '#fff' }}>¿Dudas con tu comida?</PHeading>
            <PText size="x-small" style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Escanea y deja que la IA calcule todo</PText>
          </div>
          <div className="text-5xl group-hover:scale-110 transition-transform duration-500 bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            📸
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-5 rounded-full" />
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-white opacity-5 rounded-full" />
        </button>
      </section>

      {/* Food entries */}
      {todayFoods.length > 0 && (
        <div className="dash-section">
          <div className="flex items-center justify-between mb-4">
            <PHeading size="small" theme={theme}>Comidas de hoy</PHeading>
            {todayFoods.length > 3 && (
              <PButtonPure 
                theme={theme} 
                icon={showAllFood ? 'arrow-up' : 'arrow-down'} 
                onClick={() => setShowAllFood(!showAllFood)}
              >
                {showAllFood ? 'Ver menos' : `Ver todos (${todayFoods.length})`}
              </PButtonPure>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {visibleFoods.map(food => (
              <div key={food.id} className="dash-item">
                <FoodCard entry={food} theme={theme} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise entries */}
      {todayExercises.length > 0 && (
        <div className="dash-section">
          <div className="flex items-center justify-between mb-4">
            <PHeading size="small" theme={theme}>Ejercicios de hoy</PHeading>
            {todayExercises.length > 3 && (
              <PButtonPure 
                theme={theme} 
                icon={showAllExercise ? 'arrow-up' : 'arrow-down'} 
                onClick={() => setShowAllExercise(!showAllExercise)}
              >
                {showAllExercise ? 'Ver menos' : `Ver todos (${todayExercises.length})`}
              </PButtonPure>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {visibleExercises.map(ex => (
              <div key={ex.id} className="dash-item">
                <ExerciseCard entry={ex} theme={theme} />
              </div>
            ))}
          </div>
        </div>
      )}

      {todayFoods.length === 0 && (
        <div className="rounded-2xl p-6 flex flex-col items-center gap-2 text-center dash-item" style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}>
          <span className="text-4xl">🍽️</span>
          <PText weight="semi-bold" theme={theme}>Sin comidas registradas</PText>
          <PText size="small" theme={theme} style={{ color: secondaryText }}>Comenzá registrando tu desayuno</PText>
        </div>
      )}

      {todayExercises.length === 0 && (
        <div className="rounded-2xl p-6 flex flex-col items-center gap-2 text-center dash-item" style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}>
          <span className="text-4xl">🏃</span>
          <PText weight="semi-bold" theme={theme}>Sin ejercicios registrados</PText>
          <PText size="small" theme={theme} style={{ color: secondaryText }}>Registrá tu actividad física</PText>
        </div>
      )}

      <PDivider theme={theme} />
      <PText size="xx-small" theme={theme} style={{ color: secondaryText, textAlign: 'center' }}>
        Balance neto hoy: {overGoal ? '+' : ''}{formatNumber(net)} kcal · Peso: {formatNumber(profile?.weight_kg ?? 70, 1)} kg
      </PText>

      {/* Modals */}
      <AddFoodModal open={modal === 'addFood'} onDismiss={() => setModal('none')} />
      <ScanModal open={modal === 'scan'} onDismiss={() => setModal('none')} theme={theme} />
      <AddExerciseModal open={modal === 'addExercise'} onDismiss={() => setModal('none')} />
    </div>
  );
}
