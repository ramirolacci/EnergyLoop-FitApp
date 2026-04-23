import { useState } from 'react';
import { PButton, PHeading, PText, PButtonPure, PTag, PDivider } from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import { CalorieRing } from '../components/CalorieRing';
import { MacroBar } from '../components/MacroBar';
import { FoodCard } from '../components/FoodCard';
import { ExerciseCard } from '../components/ExerciseCard';
import { AddFoodModal } from '../components/AddFoodModal';
import { ScanModal } from '../components/ScanModal';
import { AddExerciseModal } from '../components/AddExerciseModal';

type ModalType = 'none' | 'addFood' | 'scan' | 'addExercise';

export function Dashboard() {
  const { profile, todayFoods, todayExercises, theme } = useApp();
  const [modal, setModal] = useState<ModalType>('none');
  const [showAllFood, setShowAllFood] = useState(false);
  const [showAllExercise, setShowAllExercise] = useState(false);

  const goal = profile?.daily_calorie_goal ?? 2000;
  const consumed = todayFoods.reduce((s, f) => s + f.calories, 0);
  const burned = todayExercises.reduce((s, e) => s + e.calories_burned, 0);
  const net = consumed - burned;
  const remaining = goal - net;
  const overGoal = net > goal;

  const protein = todayFoods.reduce((s, f) => s + f.protein_g, 0);
  const carbs = todayFoods.reduce((s, f) => s + f.carbs_g, 0);
  const fat = todayFoods.reduce((s, f) => s + f.fat_g, 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const today = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

  const surfaceColor = theme === 'dark' ? '#212225' : '#fff';
  const borderColor = theme === 'dark' ? '#2a2a2e' : '#d8d8db';

  const visibleFoods = showAllFood ? todayFoods : todayFoods.slice(0, 3);
  const visibleExercises = showAllExercise ? todayExercises : todayExercises.slice(0, 3);

  return (
    <div className="flex flex-col gap-5 pb-24 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <PHeading size="large" tag="h1" theme={theme}>{greeting}</PHeading>
          <PText size="small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457', textTransform: 'capitalize' }}>
            {today}
          </PText>
        </div>
        {overGoal && (
          <PTag variant="error" icon="exclamation" theme={theme}>Meta excedida</PTag>
        )}
      </div>

      {/* Main Stats Card */}
      <div
        className="rounded-3xl p-6 flex flex-col items-center gap-6 shadow-xl transition-all"
        style={{
          background: surfaceColor,
          border: `1px solid ${borderColor}`,
        }}
      >
        <CalorieRing consumed={consumed} burned={burned} goal={goal} theme={theme} />

        <div className="w-full flex flex-col gap-4">
          {/* Detailed balance */}
          <div className="flex items-center justify-between px-2">
            <div className="text-center">
              <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457', marginBottom: 4 }}>CONSUMIDAS</PText>
              <div style={{ fontSize: 22, fontWeight: 800, color: theme === 'dark' ? '#fbfcff' : '#010205' }}>{Math.round(consumed).toLocaleString()}</div>
            </div>
            <div className="h-8 w-px bg-current opacity-10" />
            <div className="text-center">
              <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457', marginBottom: 4 }}>QUEMADAS</PText>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#018a16' }}>{Math.round(burned).toLocaleString()}</div>
            </div>
            <div className="h-8 w-px bg-current opacity-10" />
            <div className="text-center">
              <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457', marginBottom: 4 }}>RESTANTES</PText>
              <div style={{ fontSize: 22, fontWeight: 800, color: remaining < 0 ? '#e00000' : '#ff6b00' }}>
                {Math.abs(Math.round(remaining)).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-current opacity-5" />

          {/* Macros summary */}
          <div>
             <div className="flex justify-between items-center mb-2">
                <PText size="xx-small" weight="semi-bold" theme={theme}>MACRONUTRIENTES</PText>
                <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                  {Math.round(protein)}g P · {Math.round(carbs)}g C · {Math.round(fat)}g G
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
      <div className="grid grid-cols-2 gap-3">
        <PButton
          variant="secondary"
          icon="camera"
          theme={theme}
          onClick={() => setModal('scan')}
          style={{ width: '100%' }}
        >
          Escanear etiqueta
        </PButton>
        <PButton
          variant="secondary"
          icon="add"
          theme={theme}
          onClick={() => setModal('addFood')}
          style={{ width: '100%' }}
        >
          Agregar comida
        </PButton>
      </div>

      <PButton
        variant="secondary"
        icon="flash"
        theme={theme}
        onClick={() => setModal('addExercise')}
        style={{ width: '100%' }}
      >
        Registrar ejercicio
      </PButton>

      {/* Food entries */}
      {todayFoods.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <PHeading size="small" tag="h2" theme={theme}>Comidas de hoy</PHeading>
            <PText size="small" theme={theme} style={{ color: '#018a16' }}>
              {Math.round(consumed)} kcal
            </PText>
          </div>
          <div className="flex flex-col gap-2">
            {visibleFoods.map(food => (
              <FoodCard key={food.id} entry={food} theme={theme} />
            ))}
          </div>
          {todayFoods.length > 3 && (
            <div className="mt-2 text-center">
              <PButtonPure theme={theme} onClick={() => setShowAllFood(!showAllFood)} icon={showAllFood ? 'arrow-up' : 'arrow-down'}>
                {showAllFood ? 'Ver menos' : `Ver ${todayFoods.length - 3} más`}
              </PButtonPure>
            </div>
          )}
        </div>
      )}

      {todayFoods.length === 0 && (
        <div
          className="rounded-2xl p-6 flex flex-col items-center gap-2 text-center"
          style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
        >
          <span className="text-4xl">🍽️</span>
          <PText weight="semi-bold" theme={theme}>Sin comidas registradas</PText>
          <PText size="small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
            Agregá tu primera comida del día
          </PText>
        </div>
      )}

      {/* Exercise entries */}
      {todayExercises.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <PHeading size="small" tag="h2" theme={theme}>Ejercicios de hoy</PHeading>
            <PText size="small" theme={theme} style={{ color: '#018a16' }}>
              -{Math.round(burned)} kcal
            </PText>
          </div>
          <div className="flex flex-col gap-2">
            {visibleExercises.map(ex => (
              <ExerciseCard key={ex.id} entry={ex} theme={theme} />
            ))}
          </div>
          {todayExercises.length > 3 && (
            <div className="mt-2 text-center">
              <PButtonPure theme={theme} onClick={() => setShowAllExercise(!showAllExercise)} icon={showAllExercise ? 'arrow-up' : 'arrow-down'}>
                {showAllExercise ? 'Ver menos' : `Ver ${todayExercises.length - 3} más`}
              </PButtonPure>
            </div>
          )}
        </div>
      )}

      {todayExercises.length === 0 && (
        <div
          className="rounded-2xl p-6 flex flex-col items-center gap-2 text-center"
          style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
        >
          <span className="text-4xl">🏃</span>
          <PText weight="semi-bold" theme={theme}>Sin ejercicios registrados</PText>
          <PText size="small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
            Registrá tu actividad física para ver el balance
          </PText>
        </div>
      )}

      <PDivider theme={theme} />
      <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#535457' : '#afb0b3', textAlign: 'center' }}>
        Balance neto hoy: {overGoal ? '+' : ''}{Math.round(net)} kcal · Peso: {profile?.weight_kg ?? 70} kg
      </PText>

      {/* Modals */}
      <AddFoodModal open={modal === 'addFood'} onDismiss={() => setModal('none')} />
      <ScanModal open={modal === 'scan'} onDismiss={() => setModal('none')} theme={theme} />
      <AddExerciseModal open={modal === 'addExercise'} onDismiss={() => setModal('none')} />
    </div>
  );
}
