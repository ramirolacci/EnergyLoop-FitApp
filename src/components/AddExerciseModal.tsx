import { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useApp } from '../context/AppContext';
import {
  EXERCISE_TEMPLATES,
  CATEGORY_LABELS,
  getMET,
  type ExerciseTemplate,
} from '../lib/exercises';
import { calcCaloriesBurned, formatNumber } from '../lib/calculations';
import { storage } from '../lib/storage';
import type { ExerciseEntry } from '../lib/types';

interface Props {
  open: boolean;
  onDismiss: () => void;
}

const DURATION_PRESETS = [15, 30, 45, 60, 90];

export function AddExerciseModal({ open, onDismiss }: Props) {
  const { addExerciseEntry, profile, toast } = useApp();
  const [step, setStep] = useState<'search' | 'details'>('search');
  const [selectedTemplate, setSelectedTemplate] = useState<ExerciseTemplate | null>(null);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<'cardio' | 'strength' | 'flexibility' | 'sports' | 'other'>('cardio');
  const [customIcon, setCustomIcon] = useState('⚡');
  const [search, setSearch] = useState('');

  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Control de renderizado para permitir animación GSAP de salida
  const [shouldRender, setShouldRender] = useState(open);
  const isClosing = useRef(false);

  // Referencias para animaciones GSAP
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

  const weight = profile?.weight_kg ?? 70;
  const recentExercises = useMemo(() => storage.getRecentExercises(4), []);

  const filteredTemplates = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return EXERCISE_TEMPLATES;
    return EXERCISE_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(s) ||
        CATEGORY_LABELS[t.category].toLowerCase().includes(s)
    );
  }, [search]);

  // Sincronizar apertura
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      isClosing.current = false;
      setStep('search');
    } else if (!isClosing.current) {
      setShouldRender(false);
    }
  }, [open]);

  // Animación GSAP de entrada (aparición sutil y suave)
  useGSAP(() => {
    if (shouldRender && !isClosing.current && backdropRef.current && modalBoxRef.current) {
      gsap.killTweensOf([backdropRef.current, modalBoxRef.current]);

      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.32, ease: 'power2.out' }
      );

      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, y: 18, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: 'power3.out', clearProps: 'transform' }
      );
    }
  }, { dependencies: [shouldRender] });

  // Animación GSAP de transición suave entre pasos del Wizard
  useGSAP(() => {
    if (stepContentRef.current && shouldRender && !isClosing.current) {
      gsap.killTweensOf(stepContentRef.current);
      gsap.fromTo(
        stepContentRef.current,
        { opacity: 0, y: 12, filter: 'blur(2px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.3,
          ease: 'power2.out',
          clearProps: 'all',
        }
      );
    }
  }, { dependencies: [step] });

  // Animación GSAP de salida (desaparición sutil y suave)
  const handleClose = () => {
    if (isClosing.current) return;
    isClosing.current = true;

    if (backdropRef.current && modalBoxRef.current) {
      gsap.killTweensOf([backdropRef.current, modalBoxRef.current]);

      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
      });

      gsap.to(modalBoxRef.current, {
        opacity: 0,
        y: 14,
        scale: 0.97,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => {
          isClosing.current = false;
          setShouldRender(false);
          resetForm();
          onDismiss();
        },
      });
    } else {
      resetForm();
      onDismiss();
    }
  };

  const resetForm = () => {
    setStep('search');
    setSelectedTemplate(null);
    setCustomName('');
    setCustomCategory('cardio');
    setCustomIcon('⚡');
    setSearch('');
    setDuration(30);
    setCustomDuration('');
    setIntensity('medium');
    setSets('');
    setReps('');
    setError('');
  };

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && shouldRender) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldRender]);

  const activeDuration = customDuration ? parseInt(customDuration, 10) || 0 : duration;

  const currentTemplate: ExerciseTemplate = useMemo(() => {
    if (selectedTemplate) return selectedTemplate;
    return {
      name: customName || 'Ejercicio personalizado',
      category: customCategory,
      metLow: 3.0,
      metMedium: 5.0,
      metHigh: 8.0,
      icon: customIcon,
    };
  }, [selectedTemplate, customName, customCategory, customIcon]);

  const met = getMET(currentTemplate, intensity);
  const caloriesBurned = calcCaloriesBurned(met, weight, activeDuration);

  function handleSelect(item: { name: string; category?: string; icon?: string }) {
    const found = EXERCISE_TEMPLATES.find((t) => t.name === item.name);
    if (found) {
      setSelectedTemplate(found);
    } else {
      setSelectedTemplate(null);
      setCustomName(item.name);
      setCustomCategory((item.category as ExerciseTemplate['category']) || 'cardio');
      setCustomIcon(item.icon || '⚡');
    }
    setStep('details');
  }

  function handleStartCustom(name?: string) {
    setSelectedTemplate(null);
    setCustomName(name || '');
    setCustomCategory('cardio');
    setCustomIcon('⚡');
    setStep('details');
  }

  async function handleSave() {
    const exerciseName = selectedTemplate ? selectedTemplate.name : customName.trim();
    if (!exerciseName) {
      setError('Por favor indica un nombre para el ejercicio');
      return;
    }

    if (activeDuration <= 0) {
      setError('Por favor selecciona o ingresa una duración válida');
      return;
    }

    setSaving(true);
    const entry: Omit<ExerciseEntry, 'id' | 'created_at'> = {
      logged_at: new Date().toISOString(),
      name: exerciseName,
      category: currentTemplate.category,
      duration_minutes: activeDuration,
      intensity,
      calories_burned: Math.round(caloriesBurned),
      sets: sets ? parseInt(sets, 10) : null,
      reps: reps ? parseInt(reps, 10) : null,
      met_value: met,
      icon: currentTemplate.icon,
      notes: '',
    };

    await addExerciseEntry(entry);
    setSaving(false);
    toast('¡Ejercicio registrado con éxito!', 'success');
    handleClose();
  }

  if (!shouldRender) return null;

  const inputCls =
    'w-full rounded-2xl px-4 py-2.5 text-base font-semibold outline-none transition-all bg-white border border-[#E4DCCE] text-stone-900 focus:border-[#3BA676] shadow-2xs';
  const labelCls = 'text-[10px] font-bold uppercase tracking-wider text-[#5C5245] flex items-center mb-1';

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: 'rgba(28, 25, 23, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalBoxRef}
        className="w-full max-w-[420px] rounded-[28px] p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto no-scrollbar relative"
        style={{
          background: '#F4EFE6',
          border: '1.5px solid #E4DCCE',
        }}
      >
        {/* Encabezado con Ícono, Título y Botón Cerrar */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E4DCCE]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3BA676] text-white flex items-center justify-center text-lg shadow-xs shrink-0">
              🏃
            </div>
            <div>
              <h2 className="text-base font-black text-[#1C1917] tracking-tight leading-tight">
                {step === 'search' ? '¿Qué entrenaste?' : 'Detalles del Ejercicio'}
              </h2>
              <p className="text-xs text-[#5C5245] font-medium leading-none mt-1">
                {step === 'search'
                  ? 'Busca una actividad o elige una común'
                  : 'Ajusta duración, nivel y calorías'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C5245] hover:text-[#1C1917] hover:bg-[#EAE4D7] transition-all duration-150 active:scale-90 shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Wizard Indicator Bar (Paso 1 y Paso 2) */}
        <div className="grid grid-cols-2 gap-2 pt-0.5 pb-1">
          <div className="flex flex-col gap-1 items-center">
            <div
              className="w-full h-1.5 rounded-full transition-all duration-300"
              style={{
                background: '#3BA676',
              }}
            />
            <span className="text-[9px] font-bold text-[#164E35] tracking-tight text-center">
              1. Seleccionar
            </span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <div
              className="w-full h-1.5 rounded-full transition-all duration-300"
              style={{
                background: step === 'details' ? '#3BA676' : '#E4DCCE',
              }}
            />
            <span
              className={`text-[9px] font-bold tracking-tight text-center ${
                step === 'details' ? 'text-[#164E35]' : 'text-[#8C8273]'
              }`}
            >
              2. Duración y Nivel
            </span>
          </div>
        </div>

        {/* Notificación de Error */}
        {error && (
          <div className="rounded-2xl p-3 bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs font-medium flex items-start gap-2 shadow-2xs">
            <span className="font-bold">⚠️</span>
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Contenido dinámico del Wizard animado con GSAP */}
        <div ref={stepContentRef} className="flex flex-col gap-3 py-1">
          {/* PASO 1: BÚSQUEDA Y SELECCIÓN DE EJERCICIO */}
          {step === 'search' && (
            <div className="flex flex-col gap-3.5">
              {/* Buscador y botón '+' para cargar ejercicio personalizado */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Buscar ejercicio (ej: Correr, Yoga...)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${inputCls} pl-10 pr-9`}
                    autoFocus
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8C8273]">
                    🔍
                  </span>
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleStartCustom()}
                  title="Cargar ejercicio personalizado desde cero"
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black transition-all active:scale-90 shadow-2xs shrink-0"
                  style={{
                    background: '#3BA676',
                    border: '1.5px solid #339468',
                    color: '#FFFFFF',
                  }}
                >
                  ➕
                </button>
              </div>

              {/* Resultados de búsqueda activa */}
              {search.trim() ? (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#3BA676] px-1">
                    Resultados ({filteredTemplates.length})
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto no-scrollbar">
                    {filteredTemplates.length > 0 ? (
                      filteredTemplates.map((t) => (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => handleSelect(t)}
                          className="p-3 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-2xs hover:border-[#3BA676]"
                          style={{
                            background: '#FFFFFF',
                            border: '1.5px solid #E4DCCE',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{t.icon}</span>
                            <div>
                              <div className="text-xs font-black text-[#1C1917]">{t.name}</div>
                              <div className="text-[10px] text-[#5C5245]">
                                {CATEGORY_LABELS[t.category]}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#164E35] bg-[#DDF0E4] px-2.5 py-1 rounded-xl border border-[#BEDECB]">
                            Elegir →
                          </span>
                        </button>
                      ))
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartCustom(search.trim())}
                        className="p-4 rounded-2xl text-left border-2 border-dashed border-[#3BA676] bg-[#DDF0E4]/30 flex items-center gap-3 transition-all active:scale-[0.98]"
                      >
                        <span className="text-2xl">➕</span>
                        <div>
                          <div className="text-xs font-black text-[#164E35]">
                            Registrar "{search.trim()}"
                          </div>
                          <div className="text-[10px] text-[#5C5245]">
                            Toca para ajustar tiempo e intensidad
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Recientes */}
                  {recentExercises.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C5245] px-1">
                        Recientes
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {recentExercises.map((e, idx) => (
                          <button
                            key={`${e.name}-${idx}`}
                            type="button"
                            onClick={() => handleSelect(e)}
                            className="p-2.5 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-2xs"
                            style={{
                              background: '#FFFFFF',
                              border: '1.5px solid #E4DCCE',
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg">{e.icon || '🏃'}</span>
                              <span className="text-xs font-bold text-[#1C1917]">{e.name}</span>
                            </div>
                            <span className="text-[10px] font-bold text-[#164E35] bg-[#DDF0E4] px-2 py-0.5 rounded-lg border border-[#BEDECB]">
                              {e.duration_minutes ? `${e.duration_minutes} min` : 'Reciente'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Todos los ejercicios en cuadrícula */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C5245] px-1">
                      Ejercicios frecuentes
                    </span>
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto no-scrollbar pr-0.5">
                      {filteredTemplates.map((t) => (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => handleSelect(t)}
                          className="p-3.5 rounded-2xl flex flex-col items-center text-center gap-1 transition-all active:scale-[0.97] shadow-2xs hover:border-[#3BA676]"
                          style={{
                            background: '#FFFFFF',
                            border: '1.5px solid #E4DCCE',
                          }}
                        >
                          <span className="text-3xl mb-0.5">{t.icon}</span>
                          <span className="text-xs font-bold text-[#1C1917] leading-tight line-clamp-1">
                            {t.name}
                          </span>
                          <span className="text-[10px] font-semibold text-[#164E35] bg-[#DDF0E4] px-2 py-0.5 rounded-lg border border-[#BEDECB] mt-0.5">
                            {CATEGORY_LABELS[t.category]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PASO 2: DETALLES, INTENSIDAD Y DURACIÓN */}
          {step === 'details' && (
            <div className="flex flex-col gap-3.5">
              {/* Tarjeta del Ejercicio Seleccionado */}
              <div
                className="p-3.5 rounded-2xl flex items-center justify-between shadow-2xs"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E4DCCE',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#DDF0E4] border border-[#BEDECB] flex items-center justify-center text-2xl shrink-0">
                    {currentTemplate.icon}
                  </div>
                  <div>
                    {selectedTemplate ? (
                      <div className="text-sm font-black text-[#1C1917] leading-tight">
                        {currentTemplate.name}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Nombre de la actividad"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="text-sm font-black text-[#1C1917] bg-transparent border-b border-[#3BA676] pb-0.5 outline-none focus:border-[#164E35]"
                        autoFocus
                      />
                    )}
                    <div className="text-xs text-[#5C5245] font-semibold mt-0.5">
                      {CATEGORY_LABELS[currentTemplate.category]}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black text-[#164E35] bg-[#DDF0E4] px-2 py-1 rounded-lg border border-[#BEDECB] whitespace-nowrap">
                    MET {met.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Selector de Intensidad */}
              <div
                className="p-3.5 rounded-2xl flex flex-col gap-2 shadow-2xs"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E4DCCE',
                }}
              >
                <span className={labelCls}>Intensidad del esfuerzo</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setIntensity(v)}
                      className="py-2.5 px-2 rounded-xl text-xs font-bold transition-all active:scale-95 text-center whitespace-nowrap"
                      style={{
                        background: intensity === v ? '#DDF0E4' : '#F4EFE6',
                        border:
                          intensity === v ? '2px solid #3BA676' : '1.5px solid #E4DCCE',
                        color: intensity === v ? '#164E35' : '#5C5245',
                      }}
                    >
                      {v === 'low' ? 'Baja' : v === 'medium' ? 'Media' : 'Alta'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Duración */}
              <div
                className="p-3.5 rounded-2xl flex flex-col gap-2.5 shadow-2xs"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E4DCCE',
                }}
              >
                <span className={labelCls}>Duración del entrenamiento</span>

                {/* Botones de Duración Rápida */}
                <div className="grid grid-cols-5 gap-1.5">
                  {DURATION_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDuration(d);
                        setCustomDuration('');
                      }}
                      className="py-2.5 px-1 rounded-xl text-xs font-bold transition-all active:scale-95 text-center whitespace-nowrap"
                      style={{
                        background:
                          duration === d && !customDuration ? '#DDF0E4' : '#F4EFE6',
                        border:
                          duration === d && !customDuration
                            ? '2px solid #3BA676'
                            : '1.5px solid #E4DCCE',
                        color:
                          duration === d && !customDuration ? '#164E35' : '#5C5245',
                      }}
                    >
                      {d}'
                    </button>
                  ))}
                </div>

                {/* Input opcional para duración personalizada */}
                <div className="pt-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="O ingresa duración manual (minutos)..."
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Si es categoría de Fuerza: Series y Repeticiones */}
              {currentTemplate.category === 'strength' && (
                <div
                  className="p-3.5 rounded-2xl grid grid-cols-2 gap-3 shadow-2xs"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E4DCCE',
                  }}
                >
                  <div>
                    <label htmlFor="ex-sets" className={labelCls}>
                      <span>Series</span>
                    </label>
                    <input
                      id="ex-sets"
                      type="number"
                      inputMode="numeric"
                      placeholder="Ej: 4"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="ex-reps" className={labelCls}>
                      <span>Repeticiones</span>
                    </label>
                    <input
                      id="ex-reps"
                      type="number"
                      inputMode="numeric"
                      placeholder="Ej: 10"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              {/* Banner Resumen en Verde Pastel Mate */}
              <div
                className="rounded-2xl p-4 flex items-center justify-between shadow-xs"
                style={{
                  background: '#3BA676',
                  color: '#FFFFFF',
                }}
              >
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#DDF0E4]">
                    Quemarás aprox.
                  </div>
                  <div className="text-2xl font-black tracking-tight leading-tight mt-0.5">
                    {formatNumber(caloriesBurned)} kcal
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#DDF0E4]">
                    Tiempo
                  </div>
                  <div className="text-lg font-black tracking-tight leading-tight mt-0.5">
                    {activeDuration} min
                  </div>
                </div>
              </div>

              {/* Botones de acción al pie */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('search')}
                  className="px-4 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 shrink-0"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E4DCCE',
                    color: '#5C5245',
                  }}
                >
                  ← Volver
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
                  style={{
                    background: '#3BA676',
                    border: '1.5px solid #339468',
                    color: '#FFFFFF',
                  }}
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>¡Registrar Ejercicio!</span>
                      <span>✓</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
