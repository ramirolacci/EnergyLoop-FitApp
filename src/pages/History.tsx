import { useEffect, useState } from 'react';
import { PTabs, PTabsItem, PHeading, PText, PSpinner } from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import type { DayStats } from '../lib/types';
import { getLast7Days, formatDateLabel, getDateString } from '../lib/calculations';
import { storage } from '../lib/storage';
import { WeeklyChart } from '../components/WeeklyChart';
import { FoodCard } from '../components/FoodCard';
import { ExerciseCard } from '../components/ExerciseCard';
import type { FoodEntry, ExerciseEntry } from '../lib/types';

export function History() {
  const { profile, theme } = useApp();
  const [weekStats, setWeekStats] = useState<DayStats[]>([]);
  const [selectedDate, setSelectedDate] = useState(getDateString());
  const [dayFoods, setDayFoods] = useState<FoodEntry[]>([]);
  const [dayExercises, setDayExercises] = useState<ExerciseEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const goal = profile?.daily_calorie_goal ?? 2000;

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    void loadDayDetail(selectedDate);
  }, [selectedDate]);

  async function loadData() {
    setLoading(true);
    // Simulate loading for better UX
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

  const surfaceColor = theme === 'dark' ? '#212225' : '#fff';
  const borderColor = theme === 'dark' ? '#2a2a2e' : '#d8d8db';

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

  // Weekly totals
  const weekTotalConsumed = weekStats.reduce((s, d) => s + d.calories_consumed, 0);
  const weekTotalBurned = weekStats.reduce((s, d) => s + d.calories_burned, 0);
  const weekAvgConsumed = weekStats.filter(d => d.calories_consumed > 0).length > 0
    ? Math.round(weekTotalConsumed / weekStats.filter(d => d.calories_consumed > 0).length)
    : 0;

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center justify-between pt-2">
        <PHeading size="large" tag="h1" theme={theme}>Historial</PHeading>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <PSpinner theme={theme} size="medium" aria={{ 'aria-label': 'Cargando historial...' }} />
          <PText theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>Recuperando registros...</PText>
        </div>
      ) : (
        <>
          {/* Weekly chart */}
          <div
            className="rounded-2xl p-4 shadow-sm"
            style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
          >
            <PHeading size="small" tag="h2" theme={theme} style={{ marginBottom: 12 }}>Últimos 7 días</PHeading>
            <WeeklyChart days={weekStats} goal={goal} theme={theme} />
          </div>

          {/* Week summary */}
          <div
            className="rounded-2xl p-4 grid grid-cols-3 gap-2 shadow-sm"
            style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
          >
            {[
              { label: 'Promedio', value: weekAvgConsumed, unit: 'kcal', color: theme === 'dark' ? '#fbfcff' : '#010205' },
              { label: 'Total', value: Math.round(weekTotalConsumed), unit: 'kcal', color: theme === 'dark' ? '#fbfcff' : '#010205' },
              { label: 'Quemado', value: Math.round(weekTotalBurned), unit: 'kcal', color: '#018a16' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="text-center">
                <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                  {label}
                </PText>
                <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: '1.2', margin: '4px 0' }}>
                  {value.toLocaleString()}
                </div>
                <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                  {unit}
                </PText>
              </div>
            ))}
          </div>

          {/* Day selector */}
          <div className="py-2">
            <PText size="x-small" weight="semi-bold" theme={theme} style={{ marginBottom: 12, color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
              Seleccionar día
            </PText>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
              {selected7Days.map(date => {
                const stat = weekStats.find(s => s.date === date);
                const isSelected = date === selectedDate;
                const isT = date === getDateString();
                const d = new Date(date + 'T00:00:00');
                
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className="flex-shrink-0 flex flex-col items-center gap-1 rounded-2xl p-3 min-w-[64px] transition-all duration-200"
                    style={{
                      background: isSelected ? (theme === 'dark' ? '#fbfcff' : '#010205') : surfaceColor,
                      border: `1px solid ${isSelected ? 'transparent' : borderColor}`,
                      boxShadow: isSelected ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: isSelected ? (theme === 'dark' ? '#010205' : '#fbfcff') : (theme === 'dark' ? '#afb0b3' : '#535457') }}
                    >
                      {d.toLocaleDateString('es', { weekday: 'short' })}
                    </span>
                    <span
                      className="text-lg font-black"
                      style={{ color: isSelected ? (theme === 'dark' ? '#010205' : '#fbfcff') : (theme === 'dark' ? '#fbfcff' : '#010205') }}
                    >
                      {d.getDate()}
                    </span>
                    {stat && stat.calories_consumed > 0 && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: isSelected ? (theme === 'dark' ? '#010205' : '#fbfcff') : '#018a16' }}
                      />
                    )}
                    {isT && !isSelected && (
                      <span className="text-[10px] font-bold" style={{ color: '#018a16' }}>HOY</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day detail */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <PHeading size="small" tag="h2" theme={theme}>
                {isToday ? 'Hoy' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
              </PHeading>
            </div>


            {/* Day stats cards */}
            <div className="grid grid-cols-1 gap-3 mb-4">
               <div
                className="rounded-2xl p-4 flex items-center justify-between shadow-sm"
                style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
              >
                <div>
                  <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>Calorías consumidas</PText>
                  <div style={{ fontSize: 24, fontWeight: 800, color: selectedStats.calories_consumed > goal ? '#e00000' : (theme === 'dark' ? '#fbfcff' : '#010205') }}>
                    {Math.round(selectedStats.calories_consumed).toLocaleString()} <span className="text-sm font-normal">kcal</span>
                  </div>
                </div>
                <div className="text-right">
                  <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>Quemadas</PText>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#018a16' }}>
                    -{Math.round(selectedStats.calories_burned).toLocaleString()} <span className="text-sm font-normal">kcal</span>
                  </div>
                </div>
              </div>

              {/* Macros pills */}
              <div
                className="rounded-2xl p-4 flex items-center justify-around shadow-sm"
                style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
              >
                {[
                  { label: 'Proteína', value: Math.round(selectedStats.protein_g), color: '#ff6b00' },
                  { label: 'Carbos', value: Math.round(selectedStats.carbs_g), color: '#0076ff' },
                  { label: 'Grasa', value: Math.round(selectedStats.fat_g), color: '#b8960c' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>{label}</PText>
                    <div style={{ color, fontWeight: 700, fontSize: 16 }}>{value}g</div>
                  </div>
                ))}
              </div>
            </div>

            <PTabs activeTabIndex={0} theme={theme}>
              <PTabsItem label={`Comidas (${dayFoods.length})`}>
                <div className="flex flex-col gap-2 mt-4">
                  {dayFoods.length === 0 ? (
                    <div className="py-10 text-center opacity-50">
                      <span className="text-4xl block mb-2">🍽️</span>
                      <PText size="small" theme={theme}>Sin registros</PText>
                    </div>
                  ) : (
                    dayFoods.map(food => <FoodCard key={food.id} entry={food} theme={theme} />)
                  )}
                </div>
              </PTabsItem>
              <PTabsItem label={`Ejercicios (${dayExercises.length})`}>
                <div className="flex flex-col gap-2 mt-4">
                  {dayExercises.length === 0 ? (
                    <div className="py-10 text-center opacity-50">
                      <span className="text-4xl block mb-2">🏃</span>
                      <PText size="small" theme={theme}>Sin registros</PText>
                    </div>
                  ) : (
                    dayExercises.map(ex => <ExerciseCard key={ex.id} entry={ex} theme={theme} />)
                  )}
                </div>
              </PTabsItem>
            </PTabs>
          </div>
        </>
      )}
    </div>
  );
}

