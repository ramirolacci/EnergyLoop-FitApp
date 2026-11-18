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
  const { profile, theme, todayFoods, todayExercises } = useApp();
  const [weekStats, setWeekStats] = useState<DayStats[]>([]);
  const [selectedDate, setSelectedDate] = useState(getDateString());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'foods' | 'exercises'>('foods');
  const containerRef = useRef<HTMLDivElement>(null);

  const goal = profile?.daily_calorie_goal ?? 0;

  useGSAP(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo('.history-item', 
        { opacity: 0, y: 10 }, 
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
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

  const surfaceColor = '#ffffff';
  const borderColor = '#f0ebe1';
  const secondaryText = '#706453';

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
    <div ref={containerRef} className="flex flex-col gap-4 pb-6">
      {/* Mobile Header */}
      <header className="history-item flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
            Métricas & Progreso
          </span>
          <h1 
            className="text-lg font-black tracking-tight"
            style={{ color: '#1a1e24' }}
          >
            Historial 📊
          </h1>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <PSpinner theme={theme} size="medium" />
          <span className="text-xs font-semibold" style={{ color: secondaryText }}>
            Cargando métricas...
          </span>
        </div>
      ) : (
        <>
          {/* Weekly chart card */}
          <div
            className="history-item rounded-3xl p-4 mobile-card-shadow"
            style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
                Últimos 7 días
              </span>
              <span className="text-[10px] font-extrabold text-[#1d5f3f] dark:text-[#6ee7b7] bg-[#e8f5ee] dark:bg-emerald-950/40 border border-[#b7e4ce] dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                Meta: {goal} kcal
              </span>
            </div>
            <WeeklyChart days={weekStats} goal={goal} theme={theme} />
          </div>

          {/* Week summary pills (Beige Pastel & Verde Pastel) */}
          <div className="history-item grid grid-cols-2 gap-2.5">
            {/* Promedio - Beige Pastel */}
            <div 
              className="p-3.5 rounded-2xl mobile-card-shadow flex flex-col gap-0.5" 
              style={{ 
                background: '#f7f4ee', 
                border: '1px solid #e9e4d8' 
              }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#706453' }}>
                Promedio Diario
              </span>
              <div className="text-lg font-black" style={{ color: '#1a1e24' }}>
                {weekAvgConsumed.toLocaleString()} <span className="text-xs font-normal opacity-50">kcal</span>
              </div>
            </div>

            {/* Total Semana - Verde Pastel */}
            <div 
              className="p-3.5 rounded-2xl mobile-card-shadow flex flex-col gap-0.5" 
              style={{ 
                background: '#e8f5ee',
                border: '1px solid #b7e4ce',
                color: '#1d5f3f' 
              }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                Total Ingerido
              </span>
              <div className="text-lg font-black">
                {Math.round(weekTotalConsumed).toLocaleString()} <span className="text-xs font-normal opacity-70">kcal</span>
              </div>
            </div>
          </div>

          {/* Day selector (Tira Calendario Mobile) */}
          <div className="history-item">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 px-1 mb-1.5 block" style={{ color: secondaryText }}>
              Seleccionar día
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              {selected7Days.map(date => {
                const isSelected = date === selectedDate;
                const d = new Date(date + 'T00:00:00');
                
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className="flex-shrink-0 flex flex-col items-center gap-0.5 rounded-2xl py-2 px-3 min-w-[56px] transition-all duration-200 active:scale-95"
                    style={{
                      background: isSelected 
                        ? '#4eba87' 
                        : surfaceColor,
                      border: `1px solid ${isSelected ? 'transparent' : borderColor}`,
                      boxShadow: isSelected 
                        ? '0 6px 14px -3px rgba(78, 186, 135, 0.4)' 
                        : 'none',
                    }}
                  >
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: isSelected ? '#ffffff' : secondaryText }}
                    >
                      {d.toLocaleDateString('es', { weekday: 'short' }).replace('.', '')}
                    </span>
                    <span
                      className="text-base font-black leading-tight"
                      style={{ color: isSelected ? '#ffffff' : '#1a1e24' }}
                    >
                      {d.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumen del día seleccionado */}
          <div className="history-item">
            <div
              className="rounded-2xl p-3.5 flex items-center justify-between mobile-card-shadow"
              style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
            >
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 block" style={{ color: secondaryText }}>
                  {isToday ? 'Balance Hoy' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric' })}
                </span>
                <div 
                  className="text-xl font-black mt-0.5" 
                  style={{ color: selectedStats.net_calories > goal ? '#c2410c' : '#1a1e24' }}
                >
                  {Math.round(selectedStats.net_calories).toLocaleString()} <span className="text-xs font-normal opacity-50">kcal</span>
                </div>
              </div>

              {selectedStats.calories_burned > 0 ? (
                <div className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#fff0e6] text-[#c2410c] border border-[#fed7aa]">
                  🔥 {Math.round(selectedStats.calories_burned)} kcal
                </div>
              ) : (
                <div className="px-2 py-0.5 rounded-full text-[10px] font-semibold opacity-60" style={{ color: secondaryText }}>
                  Sin ejercicio
                </div>
              )}
            </div>
          </div>

          {/* Toggle Tabs (Comidas / Ejercicios) */}
          <div 
            className="history-item flex p-1 rounded-2xl" 
            style={{ 
              background: '#f7f4ee',
              border: `1px solid ${borderColor}`
            }}
          >
            <button
              onClick={() => setTab('foods')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'foods' 
                  ? 'bg-white text-[#1d5f3f] shadow-xs' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              🥗 Comidas ({dayFoods.length})
            </button>
            <button
              onClick={() => setTab('exercises')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'exercises' 
                  ? 'bg-white dark:bg-[#202330] text-[#c2410c] dark:text-[#fdba74] shadow-xs' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              💪 Actividad ({dayExercises.length})
            </button>
          </div>

          {/* Lista de Registros */}
          <div className="history-item flex flex-col gap-2">
            {tab === 'foods' ? (
              dayFoods.length === 0 ? (
                <div className="py-10 text-center opacity-40">
                  <span className="text-3xl block mb-1">🍽️</span>
                  <span className="text-xs font-bold">Sin comidas registradas en este día</span>
                </div>
              ) : (
                dayFoods.map(food => <FoodCard key={food.id} entry={food} theme={theme} />)
              )
            ) : (
              dayExercises.length === 0 ? (
                <div className="py-10 text-center opacity-40">
                  <span className="text-3xl block mb-1">🏃</span>
                  <span className="text-xs font-bold">Sin actividad física registrada</span>
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
