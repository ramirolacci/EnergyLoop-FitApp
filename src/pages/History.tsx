import { useEffect, useState, useRef } from 'react';
import { PSpinner } from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import type { DayStats } from '../lib/types';
import { getLast7Days, getDateString } from '../lib/calculations';
import { storage } from '../lib/storage';
import { useMemo } from 'react';
import { WeeklyChart } from '../components/WeeklyChart';
import { FoodCard } from '../components/FoodCard';
import { ExerciseCard } from '../components/ExerciseCard';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function History() {
  const { profile, theme, toggleTheme, todayFoods, todayExercises } = useApp();
  const [weekStats, setWeekStats] = useState<DayStats[]>([]);
  const [selectedDate, setSelectedDate] = useState(getDateString());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'foods' | 'exercises'>('foods');
  const containerRef = useRef<HTMLDivElement>(null);

  const goal = profile?.daily_calorie_goal ?? 0;

  useGSAP(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo('.history-item', 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, { dependencies: [loading], scope: containerRef });

  useEffect(() => {
    let ignore = false;
    async function init() {
      setLoading(true);
      
      const days = getLast7Days();
      const allFoods = storage.getFoods();
      const allExercises = storage.getExercises();
      
      const stats: DayStats[] = days.map(date => {
        const dayFoods = allFoods.filter(f => f.logged_at.startsWith(date));
        const dayExercises = allExercises.filter(e => e.logged_at.startsWith(date));
        
        const consumed = dayFoods.reduce((sum, f) => sum + f.calories, 0);
        const burned = dayExercises.reduce((sum, e) => sum + e.calories_burned, 0);
        
        return {
          date,
          calories_consumed: consumed,
          calories_burned: burned,
          net_calories: consumed - burned,
          protein_g: dayFoods.reduce((sum, f) => sum + f.protein_g, 0),
          carbs_g: dayFoods.reduce((sum, f) => sum + f.carbs_g, 0),
          fat_g: dayFoods.reduce((sum, f) => sum + f.fat_g, 0),
        };
      });

      if (!ignore) {
        setWeekStats(stats);
        setLoading(false);
      }
    }
    void init();
    return () => { ignore = true; };
  }, [todayFoods, todayExercises]);

  const dayFoods = useMemo(() => storage.getFoods(selectedDate), [selectedDate, todayFoods]);
  const dayExercises = useMemo(() => storage.getExercises(selectedDate), [selectedDate, todayExercises]);

  const surfaceColor = theme === 'dark' ? '#171922' : '#ffffff';
  const borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
  const secondaryText = theme === 'dark' ? '#94a3b8' : '#64748b';

  const selected7Days = getLast7Days();
  const isToday = selectedDate === getDateString();

  const selectedStats = weekStats.find(s => s.date === selectedDate) ?? {
    date: selectedDate,
    calories_consumed: 0,
    calories_burned: 0,
    net_calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
  };

  const weekTotalConsumed = weekStats.reduce((s, d) => s + d.calories_consumed, 0);
  const weekAvgConsumed = weekStats.filter(d => d.calories_consumed > 0).length > 0
    ? Math.round(weekTotalConsumed / weekStats.filter(d => d.calories_consumed > 0).length)
    : 0;

  return (
    <div ref={containerRef} className="flex flex-col gap-6 pb-24">
      {/* Mobile Header with Dark Mode Toggle */}
      <header className="history-item flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
            Métricas & Progreso
          </span>
          <h1 
            className="text-2xl font-black tracking-tight"
            style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
          >
            Historial 📊
          </h1>
        </div>

        {/* Quick Dark Mode Button */}
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
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <PSpinner theme={theme} size="medium" />
          <span className="text-xs font-semibold" style={{ color: secondaryText }}>
            Cargando tus métricas...
          </span>
        </div>
      ) : (
        <>
          {/* Weekly chart card */}
          <div
            className="history-item rounded-3xl p-5 mobile-card-shadow"
            style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
                Últimos 7 días
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                Meta: {goal} kcal
              </span>
            </div>
            <WeeklyChart days={weekStats} goal={goal} theme={theme} />
          </div>

          {/* Week summary pills */}
          <div className="history-item grid grid-cols-2 gap-3">
            {/* Promedio */}
            <div 
              className="p-4 rounded-2xl mobile-card-shadow flex flex-col gap-1" 
              style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
                Promedio Diario
              </span>
              <div className="text-xl font-black" style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}>
                {weekAvgConsumed.toLocaleString()} <span className="text-xs font-normal opacity-50">kcal</span>
              </div>
            </div>

            {/* Total Semana - Pastel Menta */}
            <div 
              className="p-4 rounded-2xl mobile-card-shadow flex flex-col gap-1" 
              style={{ 
                background: theme === 'dark' ? 'rgba(52, 211, 153, 0.15)' : '#ecfdf5',
                border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.25)' : '#d1fae5'}`,
                color: theme === 'dark' ? '#6ee7b7' : '#065f46' 
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Total Ingerido
              </span>
              <div className="text-xl font-black">
                {Math.round(weekTotalConsumed).toLocaleString()} <span className="text-xs font-normal opacity-70">kcal</span>
              </div>
            </div>
          </div>

          {/* Day selector (Native Mobile Calendar Strip) */}
          <div className="history-item">
            <span className="text-xs font-bold uppercase tracking-wider opacity-60 px-1 mb-2 block" style={{ color: secondaryText }}>
              Seleccionar día
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {selected7Days.map(date => {
                const isSelected = date === selectedDate;
                const d = new Date(date + 'T00:00:00');
                
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className="flex-shrink-0 flex flex-col items-center gap-1 rounded-2xl py-3 px-3.5 min-w-[62px] transition-all duration-200 active:scale-95"
                    style={{
                      background: isSelected 
                        ? (theme === 'dark' ? '#34d399' : '#10b981') 
                        : surfaceColor,
                      border: `1px solid ${isSelected ? 'transparent' : borderColor}`,
                      boxShadow: isSelected 
                        ? (theme === 'dark' ? '0 8px 16px -4px rgba(52, 211, 153, 0.4)' : '0 8px 16px -4px rgba(16, 185, 129, 0.4)') 
                        : 'none',
                    }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: isSelected ? '#ffffff' : secondaryText }}
                    >
                      {d.toLocaleDateString('es', { weekday: 'short' }).replace('.', '')}
                    </span>
                    <span
                      className="text-lg font-black"
                      style={{ color: isSelected ? '#ffffff' : (theme === 'dark' ? '#f8fafc' : '#1e293b') }}
                    >
                      {d.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day summary widget */}
          <div className="history-item">
            <div
              className="rounded-3xl p-4 flex items-center justify-between mobile-card-shadow"
              style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-0.5" style={{ color: secondaryText }}>
                  {isToday ? 'Balance Neto Hoy' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric' })}
                </span>
                <div 
                  className="text-2xl font-black" 
                  style={{ color: selectedStats.net_calories > goal ? '#ef4444' : (theme === 'dark' ? '#f8fafc' : '#1e293b') }}
                >
                  {Math.round(selectedStats.net_calories).toLocaleString()} <span className="text-xs font-normal opacity-50">kcal</span>
                </div>
              </div>

              {selectedStats.calories_burned > 0 ? (
                <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                  🔥 {Math.round(selectedStats.calories_burned)} kcal
                </div>
              ) : (
                <div className="px-2.5 py-1 rounded-full text-xs font-semibold opacity-60" style={{ color: secondaryText }}>
                  Sin ejercicio
                </div>
              )}
            </div>
          </div>

          {/* Toggle Tabs (Comidas / Ejercicios) */}
          <div 
            className="history-item flex p-1 rounded-2xl" 
            style={{ 
              background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f0f4f2',
              border: `1px solid ${borderColor}`
            }}
          >
            <button
              onClick={() => setTab('foods')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'foods' 
                  ? 'bg-white dark:bg-[#1f222e] text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              🥗 Comidas ({dayFoods.length})
            </button>
            <button
              onClick={() => setTab('exercises')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'exercises' 
                  ? 'bg-white dark:bg-[#1f222e] text-amber-600 dark:text-amber-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              💪 Entrenamientos ({dayExercises.length})
            </button>
          </div>

          {/* Entries List */}
          <div className="history-item flex flex-col gap-2.5">
            {tab === 'foods' ? (
              dayFoods.length === 0 ? (
                <div className="py-12 text-center opacity-40">
                  <span className="text-4xl block mb-2">🍽️</span>
                  <span className="text-sm font-bold">Sin comidas para este día</span>
                </div>
              ) : (
                dayFoods.map(food => <FoodCard key={food.id} entry={food} theme={theme} />)
              )
            ) : (
              dayExercises.length === 0 ? (
                <div className="py-12 text-center opacity-40">
                  <span className="text-4xl block mb-2">🏃</span>
                  <span className="text-sm font-bold">Sin actividad registrada</span>
                </div>
              ) : (
                dayExercises.map(ex => <ExerciseCard key={ex.id} entry={ex} theme={theme} />)
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
