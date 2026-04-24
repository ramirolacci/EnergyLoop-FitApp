import { useEffect, useState, useRef } from 'react';
import { PHeading, PText, PSpinner, PButtonPure, PTag } from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import type { DayStats } from '../lib/types';
import { getLast7Days, getDateString } from '../lib/calculations';
import { storage } from '../lib/storage';
import { WeeklyChart } from '../components/WeeklyChart';
import { FoodCard } from '../components/FoodCard';
import { ExerciseCard } from '../components/ExerciseCard';
import type { FoodEntry, ExerciseEntry } from '../lib/types';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function History() {
  const { profile, theme } = useApp();
  const [weekStats, setWeekStats] = useState<DayStats[]>([]);
  const [selectedDate, setSelectedDate] = useState(getDateString());
  const [dayFoods, setDayFoods] = useState<FoodEntry[]>([]);
  const [dayExercises, setDayExercises] = useState<ExerciseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'foods' | 'exercises'>('foods');
  const containerRef = useRef<HTMLDivElement>(null);

  const goal = profile?.daily_calorie_goal ?? 0;

  useGSAP(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo('.history-item', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, { dependencies: [loading], scope: containerRef });

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    void loadDayDetail(selectedDate);
  }, [selectedDate]);

  async function loadData() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    
    const days = getLast7Days();
    const statsMap = storage.getStatsByRange(7);
    
    const stats: DayStats[] = days.map(date => {
      const s = statsMap[date] || { consumed: 0, burned: 0, protein: 0 };
      const foods = storage.getFoods(date);
      return {
        date,
        calories_consumed: s.consumed,
        calories_burned: s.burned,
        net_calories: s.consumed - s.burned,
        protein_g: s.protein,
        carbs_g: foods.reduce((sum, f) => sum + f.carbs_g, 0),
        fat_g: foods.reduce((sum, f) => sum + f.fat_g, 0),
      };
    });

    setWeekStats(stats);
    setLoading(false);
  }

  async function loadDayDetail(date: string) {
    const foods = storage.getFoods(date);
    const exercises = storage.getExercises(date);
    setDayFoods(foods);
    setDayExercises(exercises);
  }

  const surfaceColor = theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface-light)';
  const borderColor = theme === 'dark' ? 'var(--border-dark)' : 'var(--border-light)';
  const secondaryText = theme === 'dark' ? '#afb0b3' : '#535457';

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
    <div ref={containerRef} className="flex flex-col gap-8 pb-24">
      <header className="history-item flex items-center justify-between mt-2">
        <div>
          <PHeading size="large" theme={theme} style={{ fontWeight: 900 }}>Historial 📊</PHeading>
          <PText size="small" theme={theme} style={{ color: secondaryText }}>Tus progresos semanales</PText>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <PSpinner theme={theme} size="medium" />
          <PText theme={theme} style={{ color: secondaryText }}>Recuperando registros...</PText>
        </div>
      ) : (
        <>
          {/* Weekly chart */}
          <div
            className="history-item rounded-[2.5rem] p-6 card-shadow"
            style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
          >
            <PHeading size="small" theme={theme} style={{ marginBottom: 20 }}>Últimos 7 días</PHeading>
            <WeeklyChart days={weekStats} goal={goal} theme={theme} />
          </div>

          {/* Week summary pills */}
          <div className="history-item grid grid-cols-2 gap-4">
            <div className="p-5 rounded-[2rem] card-shadow flex flex-col gap-1" style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}>
              <PText size="xx-small" weight="bold" theme={theme} style={{ color: secondaryText }}>PROMEDIO DIARIO</PText>
              <div className="text-2xl font-black" style={{ color: theme === 'dark' ? '#fbfcff' : '#010205' }}>
                {weekAvgConsumed.toLocaleString()} <span className="text-sm font-normal opacity-50">kcal</span>
              </div>
            </div>
            <div className="p-5 rounded-[2rem] card-shadow flex flex-col gap-1" style={{ background: '#018a16', color: '#fff' }}>
              <PText size="xx-small" weight="bold" style={{ color: 'rgba(255,255,255,0.7)' }}>TOTAL SEMANA</PText>
              <div className="text-2xl font-black">
                {Math.round(weekTotalConsumed).toLocaleString()} <span className="text-sm font-normal opacity-70">kcal</span>
              </div>
            </div>
          </div>

          {/* Day selector */}
          <div className="history-item">
            <PHeading size="small" theme={theme} style={{ marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 8 }}>Seleccionar día</PHeading>
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
              {selected7Days.map(date => {
                const isSelected = date === selectedDate;
                const d = new Date(date + 'T00:00:00');
                
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className="flex-shrink-0 flex flex-col items-center gap-1 rounded-[1.5rem] p-4 min-w-[70px] transition-all duration-300"
                    style={{
                      background: isSelected ? '#018a16' : surfaceColor,
                      border: `1px solid ${isSelected ? 'transparent' : borderColor}`,
                      boxShadow: isSelected ? '0 10px 20px -5px rgba(1, 138, 22, 0.4)' : 'none',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : secondaryText }}
                    >
                      {d.toLocaleDateString('es', { weekday: 'short' })}
                    </span>
                    <span
                      className="text-xl font-black"
                      style={{ color: isSelected ? '#fff' : (theme === 'dark' ? '#fbfcff' : '#010205') }}
                    >
                      {d.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Detail Header */}
          <div className="history-item flex items-center justify-between">
             <PHeading size="small" theme={theme}>
                {isToday ? 'Hoy' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric' })}
             </PHeading>
             <div className="h-10 w-10 rounded-xl bg-current opacity-5 flex items-center justify-center text-xl">
               📅
             </div>
          </div>

          {/* Selected day summary */}
          <div className="history-item grid grid-cols-1 gap-4">
             <div
              className="rounded-[2rem] p-6 flex items-center justify-between card-shadow"
              style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
            >
              <div>
                <PText size="xx-small" weight="bold" theme={theme} style={{ color: secondaryText, marginBottom: 4 }}>CONSUMO NETO</PText>
                <div className="text-3xl font-black" style={{ color: selectedStats.net_calories > goal ? 'var(--danger)' : (theme === 'dark' ? '#fbfcff' : '#010205') }}>
                  {Math.round(selectedStats.net_calories).toLocaleString()} <span className="text-base font-normal opacity-50">kcal</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <PTag variant="success" theme={theme}>
                  {Math.round(selectedStats.calories_burned)} kcal quemadas
                </PTag>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="history-item flex p-1.5 rounded-2xl bg-current opacity-5 glass" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <button
              onClick={() => setTab('foods')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'foods' ? 'shadow-sm translate-y-[-1px]' : ''}`}
              style={{ 
                background: tab === 'foods' ? (theme === 'dark' ? '#fbfcff' : '#010205') : 'transparent',
                color: tab === 'foods' ? (theme === 'dark' ? '#010205' : '#fbfcff') : secondaryText
              }}
            >
              COMIDAS ({dayFoods.length})
            </button>
            <button
              onClick={() => setTab('exercises')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'exercises' ? 'shadow-sm translate-y-[-1px]' : ''}`}
              style={{ 
                background: tab === 'exercises' ? (theme === 'dark' ? '#fbfcff' : '#010205') : 'transparent',
                color: tab === 'exercises' ? (theme === 'dark' ? '#010205' : '#fbfcff') : secondaryText
              }}
            >
              EJERCICIOS ({dayExercises.length})
            </button>
          </div>

          {/* List */}
          <div className="history-item flex flex-col gap-3">
            {tab === 'foods' ? (
              dayFoods.length === 0 ? (
                <div className="py-12 text-center opacity-30">
                  <span className="text-5xl block mb-3">🍽️</span>
                  <PText weight="bold" theme={theme}>Sin registros para este día</PText>
                </div>
              ) : (
                dayFoods.map(food => <FoodCard key={food.id} entry={food} theme={theme} />)
              )
            ) : (
              dayExercises.length === 0 ? (
                <div className="py-12 text-center opacity-30">
                  <span className="text-5xl block mb-3">🏃</span>
                  <PText weight="bold" theme={theme}>Sin actividad física</PText>
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
