import { useState, useMemo } from 'react';
import {
  PModal, PHeading, PButton, PText
} from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import { EXERCISE_TEMPLATES, CATEGORY_LABELS, getMET } from '../lib/exercises';
import { calcCaloriesBurned } from '../lib/calculations';
import { storage } from '../lib/storage';
import type { ExerciseEntry } from '../lib/types';

interface Props {
  open: boolean;
  onDismiss: () => void;
}

const DURATION_PRESETS = [15, 30, 45, 60, 90];

export function AddExerciseModal({ open, onDismiss }: Props) {
  const { addExerciseEntry, profile, theme } = useApp();
  const [step, setStep] = useState<'search' | 'details'>('search');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [saving, setSaving] = useState(false);

  const weight = profile?.weight_kg ?? 70;

  const recentExercises = useMemo(() => storage.getRecentExercises(4), [open]);

  const filteredTemplates = useMemo(() => {
    const s = search.toLowerCase();
    return EXERCISE_TEMPLATES.filter(t => 
      t.name.toLowerCase().includes(s) || 
      CATEGORY_LABELS[t.category].toLowerCase().includes(s)
    );
  }, [search]);

  const selected = selectedIdx !== null ? filteredTemplates[selectedIdx] : null;

  const actualDuration = customDuration ? (parseInt(customDuration) || 0) : duration;
  const met = selected ? getMET(selected as any, intensity) : 0;
  const caloriesBurned = calcCaloriesBurned(met, weight, actualDuration);

  function handleSelect(template: any) {
    const idx = filteredTemplates.findIndex(t => t.name === template.name);
    setSelectedIdx(idx >= 0 ? idx : null);
    setStep('details');
  }

  function handleDismiss() {
    setStep('search');
    setSelectedIdx(null);
    setSearch('');
    setDuration(30);
    setCustomDuration('');
    setIntensity('medium');
    setSets('');
    setReps('');
    onDismiss();
  }

  async function handleSave() {
    if (!selected) return;

    setSaving(true);
    const entry: Omit<ExerciseEntry, 'id' | 'created_at'> = {
      logged_at: new Date().toISOString(),
      name: selected.name,
      category: selected.category,
      duration_minutes: actualDuration,
      intensity,
      calories_burned: Math.round(caloriesBurned),
      sets: sets ? parseInt(sets) : null,
      reps: reps ? parseInt(reps) : null,
      met_value: met,
      icon: selected.icon,
      notes: '',
    };

    await addExerciseEntry(entry);
    setSaving(false);
    handleDismiss();
  }

  const surfaceColor = theme === 'dark' ? '#212225' : '#f5f5f8';
  const borderColor = theme === 'dark' ? '#2a2a2e' : '#d8d8db';
  
  const inputCls = `rounded-xl px-4 py-3 text-sm outline-none transition-all ${
    theme === 'dark'
      ? 'bg-[#1a1a1e] border border-[#2a2a2e] text-[#fbfcff] focus:border-[#535457]'
      : 'bg-white border border-[#d8d8db] text-[#010205] focus:border-[#afb0b3]'
  }`;

  return (
    <PModal
      open={open}
      onDismiss={handleDismiss}
      theme={theme}
      fullscreen={{ base: true, s: false }}
    >
      <PHeading slot="header" size="medium" tag="h2" theme={theme}>
        {step === 'search' ? '¿Qué entrenaste?' : 'Detalles del ejercicio'}
      </PHeading>

      <div className="flex flex-col gap-5 py-2">
        {step === 'search' && (
          <>
            <div className="relative">
              <input
                className={`${inputCls} w-full`}
                placeholder="Buscar ejercicio (ej: Correr, Yoga...)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            {!search && recentExercises.length > 0 && (
              <div>
                <PText size="xx-small" weight="bold" theme={theme} style={{ marginBottom: 8, color: theme === 'dark' ? '#afb0b3' : '#535457' }}>RECIENTES</PText>
                <div className="grid grid-cols-2 gap-2">
                  {recentExercises.map((e, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(e)}
                      className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                      style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
                    >
                      <span className="text-xl">{e.icon}</span>
                      <PText size="x-small" weight="bold" theme={theme}>{e.name}</PText>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <PText size="xx-small" weight="bold" theme={theme} style={{ marginBottom: 8, color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                {search ? 'RESULTADOS' : 'TODOS LOS EJERCICIOS'}
              </PText>
              <div className="grid grid-cols-2 gap-2">
                {filteredTemplates.map(t => (
                  <button
                    key={t.name}
                    onClick={() => handleSelect(t)}
                    className="flex flex-col items-center gap-1 p-4 rounded-2xl text-center transition-all hover:scale-[1.02]"
                    style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
                  >
                    <span className="text-3xl mb-1">{t.icon}</span>
                    <PText size="x-small" weight="bold" theme={theme}>{t.name}</PText>
                    <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>{CATEGORY_LABELS[t.category]}</PText>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 'details' && selected && (
          <>
            <div className="rounded-2xl p-4 flex items-center gap-4 shadow-sm" style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}>
              <span className="text-4xl">{selected.icon}</span>
              <div>
                <PHeading size="small" theme={theme}>{selected.name}</PHeading>
                <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                  {CATEGORY_LABELS[selected.category]}
                </PText>
              </div>
            </div>

            <div>
              <PText size="x-small" weight="bold" theme={theme} style={{ marginBottom: 12, marginLeft: 4 }}>Intensidad</PText>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setIntensity(v)}
                    className="flex-1 py-3 rounded-xl text-xs font-bold transition-all capitalize"
                    style={{
                      background: intensity === v ? (v === 'high' ? '#e00000' : v === 'medium' ? '#ff6b00' : '#0076ff') : surfaceColor,
                      color: intensity === v ? '#fff' : (theme === 'dark' ? '#afb0b3' : '#535457'),
                      border: `1px solid ${intensity === v ? 'transparent' : borderColor}`,
                    }}
                  >
                    {v === 'low' ? 'Baja' : v === 'medium' ? 'Media' : 'Alta'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <PText size="x-small" weight="bold" theme={theme} style={{ marginBottom: 12, marginLeft: 4 }}>Duración (minutos)</PText>
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {DURATION_PRESETS.map(d => (
                  <button
                    key={d}
                    onClick={() => { setDuration(d); setCustomDuration(''); }}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all min-w-[60px]"
                    style={{
                      background: duration === d && !customDuration ? (theme === 'dark' ? '#fbfcff' : '#010205') : surfaceColor,
                      color: duration === d && !customDuration ? (theme === 'dark' ? '#010205' : '#fbfcff') : (theme === 'dark' ? '#afb0b3' : '#535457'),
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    {d}'
                  </button>
                ))}
              </div>
              <input
                className={`${inputCls} w-full`}
                type="number"
                inputMode="numeric"
                placeholder="Ingresar duración manual..."
                value={customDuration}
                onChange={e => setCustomDuration(e.target.value)}
              />
            </div>

            {selected.category === 'strength' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <PText size="x-small" weight="bold" theme={theme} style={{ marginBottom: 8, marginLeft: 4 }}>Series</PText>
                  <input className={`${inputCls} w-full`} type="number" inputMode="numeric" placeholder="3" value={sets} onChange={e => setSets(e.target.value)} />
                </div>
                <div>
                  <PText size="x-small" weight="bold" theme={theme} style={{ marginBottom: 8, marginLeft: 4 }}>Reps</PText>
                  <input className={`${inputCls} w-full`} type="number" inputMode="numeric" placeholder="10" value={reps} onChange={e => setReps(e.target.value)} />
                </div>
              </div>
            )}

            <div className="rounded-2xl p-5 flex items-center justify-between mt-2" style={{ background: '#018a16', color: '#fff' }}>
              <div>
                <PText size="xx-small" weight="bold" style={{ color: 'rgba(255,255,255,0.7)' }}>QUEMARÁS APROX.</PText>
                <PText size="large" weight="bold" style={{ color: '#fff' }}>{Math.round(caloriesBurned)} kcal</PText>
              </div>
              <div className="h-8 w-px bg-white opacity-20" />
              <div className="text-right">
                <PText size="xx-small" weight="bold" style={{ color: 'rgba(255,255,255,0.7)' }}>TIEMPO</PText>
                <PText size="medium" weight="bold" style={{ color: '#fff' }}>{actualDuration} min</PText>
              </div>
            </div>
          </>
        )}
      </div>

      <div slot="footer" className="flex gap-2">
        {step === 'details' && (
          <PButton variant="primary" onClick={handleSave} loading={saving} icon="check" theme={theme}>
            Guardar
          </PButton>
        )}
        {step === 'details' && (
          <PButton variant="secondary" onClick={() => setStep('search')} theme={theme}>
            Volver
          </PButton>
        )}
        <PButton variant={step === 'search' ? 'primary' : 'secondary'} onClick={handleDismiss} theme={theme}>
          {step === 'search' ? 'Cerrar' : 'Cancelar'}
        </PButton>
      </div>
    </PModal>
  );
}
