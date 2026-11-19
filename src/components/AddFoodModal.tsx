import { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useApp } from '../context/AppContext';
import { recalcFoodEntry, formatNumber, formatMacro } from '../lib/calculations';
import { storage } from '../lib/storage';
import { COMMON_FOODS } from '../lib/foodLibrary';

interface Props {
  open: boolean;
  onDismiss: () => void;
  prefill?: Partial<{
    name: string;
    calories_per_serving: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    sodium_mg: number;
    serving_size_g: number;
    servings_per_package: number;
    servings_consumed: number;
    scan_confidence: number;
    source: 'scan' | 'manual' | 'quick';
  }>;
}

interface FormState {
  name: string;
  calories_per_serving: string;
  protein_per_serving: string;
  carbs_per_serving: string;
  fat_per_serving: string;
  sodium_per_serving: string;
  serving_size_g: string;
  servings_per_package: string;
  servings_consumed: string;
}

export function AddFoodModal({ open, onDismiss, prefill }: Props) {
  const { addFoodEntry, toast } = useApp();
  const [step, setStep] = useState<'search' | 'form'>(prefill ? 'form' : 'search');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Control de renderizado para permitir animación GSAP de salida
  const [shouldRender, setShouldRender] = useState(open);
  const isClosing = useRef(false);

  // Referencias para animaciones GSAP
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormState>({
    name: prefill?.name ?? '',
    calories_per_serving: String(prefill?.calories_per_serving ?? ''),
    protein_per_serving: String(prefill?.protein_g ?? '0'),
    carbs_per_serving: String(prefill?.carbs_g ?? '0'),
    fat_per_serving: String(prefill?.fat_g ?? '0'),
    sodium_per_serving: String(prefill?.sodium_mg ?? '0'),
    serving_size_g: String(prefill?.serving_size_g ?? '100'),
    servings_per_package: String(prefill?.servings_per_package ?? '1'),
    servings_consumed: String(prefill?.servings_consumed ?? '1'),
  });

  // Sincronizar apertura
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      isClosing.current = false;
      setStep(prefill ? 'form' : 'search');
      if (prefill) {
        setForm({
          name: prefill.name ?? '',
          calories_per_serving: String(prefill.calories_per_serving ?? ''),
          protein_per_serving: String(prefill.protein_g ?? '0'),
          carbs_per_serving: String(prefill.carbs_g ?? '0'),
          fat_per_serving: String(prefill.fat_g ?? '0'),
          sodium_per_serving: String(prefill.sodium_mg ?? '0'),
          serving_size_g: String(prefill.serving_size_g ?? '100'),
          servings_per_package: String(prefill.servings_per_package ?? '1'),
          servings_consumed: String(prefill.servings_consumed ?? '1'),
        });
      }
    } else if (!isClosing.current) {
      setShouldRender(false);
    }
  }, [open, prefill]);

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
    setForm({
      name: '',
      calories_per_serving: '',
      protein_per_serving: '0',
      carbs_per_serving: '0',
      fat_per_serving: '0',
      sodium_per_serving: '0',
      serving_size_g: '100',
      servings_per_package: '1',
      servings_consumed: '1',
    });
    setError('');
    setSearch('');
    setStep(prefill ? 'form' : 'search');
    setShowAdvanced(false);
  };

  // Manejar tecla Escape para cerrar con animación suave
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && shouldRender) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldRender]);

  const recentFoods = useMemo(() => storage.getRecentFoods(4), []);

  const filteredLibrary = useMemo(() => {
    if (!search.trim()) return [];
    const s = search.toLowerCase();
    return COMMON_FOODS.filter((f) => f.name.toLowerCase().includes(s));
  }, [search]);

  const calPerServing = parseFloat(form.calories_per_serving) || 0;
  const servingsConsumed = parseFloat(form.servings_consumed) || 1;
  const servingsPerPackage = parseFloat(form.servings_per_package) || 1;
  const proteinPerServing = parseFloat(form.protein_per_serving) || 0;
  const carbsPerServing = parseFloat(form.carbs_per_serving) || 0;
  const fatPerServing = parseFloat(form.fat_per_serving) || 0;
  const sodiumPerServing = parseFloat(form.sodium_per_serving) || 0;

  const totalCalConsumed = Math.round(calPerServing * servingsConsumed);
  const computed = recalcFoodEntry(
    calPerServing,
    servingsConsumed,
    proteinPerServing,
    carbsPerServing,
    fatPerServing,
    sodiumPerServing
  );

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  function handleSelectFromLibrary(item: {
    name?: string;
    calories_per_serving?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    sodium_mg?: number;
    serving_size_g?: number;
    servings_per_package?: number;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const i = item as any;
    setForm({
      name: String(i.name || ''),
      calories_per_serving: String(i.calories_per_serving || 0),
      protein_per_serving: String(i.protein_g ?? 0),
      carbs_per_serving: String(i.carbs_g ?? 0),
      fat_per_serving: String(i.fat_g ?? 0),
      sodium_per_serving: String(i.sodium_mg ?? 0),
      serving_size_g: String(i.serving_size_g ?? 100),
      servings_per_package: String(i.servings_per_package ?? 1),
      servings_consumed: '1',
    });
    setStep('form');
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Por favor ingresa un nombre para el alimento');
      return;
    }
    if (!form.calories_per_serving || calPerServing <= 0) {
      setError('Por favor ingresa las calorías');
      return;
    }

    setSaving(true);
    await addFoodEntry({
      logged_at: new Date().toISOString(),
      name: form.name.trim(),
      calories: computed.calories,
      protein_g: computed.protein_g,
      carbs_g: computed.carbs_g,
      fat_g: computed.fat_g,
      sodium_mg: computed.sodium_mg,
      serving_size_g: parseFloat(form.serving_size_g) || 100,
      servings_per_package: servingsPerPackage,
      servings_consumed: servingsConsumed,
      calories_per_serving: calPerServing,
      scan_confidence: prefill?.scan_confidence ?? null,
      source: prefill?.source ?? 'manual',
      icon: form.name ? COMMON_FOODS.find((f) => f.name === form.name)?.icon ?? '🍽️' : '🍽️',
      notes: '',
    });
    setSaving(false);
    toast('¡Comida registrada con éxito!', 'success');
    handleClose();
  }

  if (!shouldRender) return null;

  const inputCls =
    'w-full rounded-2xl px-4 py-2.5 text-base font-semibold outline-none transition-all bg-white border border-[#E4DCCE] text-stone-900 focus:border-[#3BA676] shadow-2xs';
  const labelCls = 'text-[10px] font-bold uppercase tracking-wider text-[#5C5245] flex items-center mb-1';

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
              🍎
            </div>
            <div>
              <h2 className="text-base font-black text-[#1C1917] tracking-tight leading-tight">
                {step === 'search' ? '¿Qué comiste?' : 'Detalles de la Comida'}
              </h2>
              <p className="text-xs text-[#5C5245] font-medium leading-none mt-1">
                {step === 'search'
                  ? 'Busca un alimento o elige uno frecuente'
                  : 'Ajusta porciones y confirma los valores'}
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
                background: step === 'form' ? '#3BA676' : '#E4DCCE',
              }}
            />
            <span
              className={`text-[9px] font-bold tracking-tight text-center ${
                step === 'form' ? 'text-[#164E35]' : 'text-[#8C8273]'
              }`}
            >
              2. Porción y Macros
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

        {/* Contenido dinámico del Wizard con ref animada por GSAP */}
        <div ref={stepContentRef} className="flex flex-col gap-3 py-1">
          {/* PASO 1: BÚSQUEDA Y SELECCIÓN DE ALIMENTOS */}
          {step === 'search' && (
            <div className="flex flex-col gap-3.5">
              {/* Buscador */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar alimento (ej: Huevo, Pollo, Avena...)"
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

              {/* Resultados filtrados de la búsqueda */}
              {search.trim() && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#3BA676] px-1">
                    Resultados de búsqueda ({filteredLibrary.length})
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto no-scrollbar">
                    {filteredLibrary.length > 0 ? (
                      filteredLibrary.map((food) => (
                        <button
                          key={food.name}
                          type="button"
                          onClick={() => handleSelectFromLibrary(food)}
                          className="p-3 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-2xs"
                          style={{
                            background: '#FFFFFF',
                            border: '1.5px solid #E4DCCE',
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{food.icon}</span>
                            <div>
                              <div className="text-xs font-black text-[#1C1917]">{food.name}</div>
                              <div className="text-[10px] text-[#5C5245]">
                                {food.protein_g}g Proteína · {food.carbs_g}g Carbos
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-black text-[#164E35] bg-[#DDF0E4] px-2 py-0.5 rounded-lg border border-[#BEDECB]">
                            {food.calories_per_serving} kcal
                          </span>
                        </button>
                      ))
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          update('name', search.trim());
                          setStep('form');
                        }}
                        className="p-4 rounded-2xl text-left border-2 border-dashed border-[#3BA676] bg-[#DDF0E4]/30 flex items-center gap-3 transition-all active:scale-[0.98]"
                      >
                        <span className="text-2xl">➕</span>
                        <div>
                          <div className="text-xs font-black text-[#164E35]">
                            Agregar "{search.trim()}" manualmente
                          </div>
                          <div className="text-[10px] text-[#5C5245]">
                            Toca para completar sus calorías y nutrientes
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Si no hay búsqueda: Recientes + Comunes */}
              {!search.trim() && (
                <>
                  {/* Recientes */}
                  {recentFoods.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C5245] px-1">
                        Recientes
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {recentFoods.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => handleSelectFromLibrary(f)}
                            className="p-2.5 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-2xs"
                            style={{
                              background: '#FFFFFF',
                              border: '1.5px solid #E4DCCE',
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🕒</span>
                              <span className="text-xs font-bold text-[#1C1917]">{f.name}</span>
                            </div>
                            <span className="text-[11px] font-black text-[#164E35] bg-[#DDF0E4] px-2 py-0.5 rounded-lg">
                              {f.calories_per_serving} kcal
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alimentos Comunes */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C5245] px-1">
                      Alimentos Frecuentes
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {COMMON_FOODS.slice(0, 6).map((food) => (
                        <button
                          key={food.name}
                          type="button"
                          onClick={() => handleSelectFromLibrary(food)}
                          className="p-3 rounded-2xl flex flex-col items-center text-center gap-1 transition-all active:scale-[0.97] shadow-2xs hover:border-[#3BA676]"
                          style={{
                            background: '#FFFFFF',
                            border: '1.5px solid #E4DCCE',
                          }}
                        >
                          <span className="text-2xl">{food.icon}</span>
                          <span className="text-xs font-bold text-[#1C1917] leading-tight line-clamp-1">
                            {food.name}
                          </span>
                          <span className="text-[10px] font-black text-[#164E35] bg-[#DDF0E4] px-2 py-0.5 rounded-lg border border-[#BEDECB] mt-0.5">
                            {food.calories_per_serving} kcal
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Botón para carga manual desde cero */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                      style={{
                        background: '#FFFFFF',
                        border: '1.5px solid #E4DCCE',
                        color: '#5C5245',
                      }}
                    >
                      <span>➕ Cargar alimento personalizado desde cero</span>
                      <span>➔</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PASO 2: DETALLES, PORCIONES Y MACROS */}
          {step === 'form' && (
            <div className="flex flex-col gap-3.5">
              {/* Tarjeta de Datos del Alimento */}
              <div
                className="p-4 rounded-2xl flex flex-col gap-3 shadow-2xs"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E4DCCE',
                }}
              >
                <div>
                  <label htmlFor="food-name" className={labelCls}>
                    <span>Nombre del alimento</span>
                    <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    id="food-name"
                    type="text"
                    placeholder="Ej: Avena, Ensalada de frutas..."
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className={inputCls}
                    autoFocus={!form.name}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label htmlFor="cal-serving" className={labelCls}>
                      <span>Calorías/porción</span>
                      <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      id="cal-serving"
                      type="number"
                      inputMode="decimal"
                      placeholder="120"
                      value={form.calories_per_serving}
                      onChange={(e) => update('calories_per_serving', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="gram-serving" className={labelCls}>
                      <span>Gramos/porción</span>
                    </label>
                    <input
                      id="gram-serving"
                      type="number"
                      placeholder="100"
                      value={form.serving_size_g}
                      onChange={(e) => update('serving_size_g', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Selector de Porciones Rápidas */}
              <div
                className="p-3.5 rounded-2xl flex flex-col gap-2 shadow-2xs"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E4DCCE',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className={labelCls}>Porciones consumidas</span>
                  <span className="text-xs font-black text-[#164E35]">
                    {servingsConsumed} {servingsConsumed === 1 ? 'porción' : 'porciones'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[0.5, 1, 1.5, 2].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => update('servings_consumed', String(v))}
                      className="py-2 px-1 rounded-xl text-xs font-bold transition-all active:scale-95 text-center"
                      style={{
                        background:
                          form.servings_consumed === String(v) ? '#DDF0E4' : '#F4EFE6',
                        border:
                          form.servings_consumed === String(v)
                            ? '2px solid #3BA676'
                            : '1.5px solid #E4DCCE',
                        color:
                          form.servings_consumed === String(v) ? '#164E35' : '#5C5245',
                      }}
                    >
                      {v === 1 ? '1 porción' : `${v} porc.`}
                    </button>
                  ))}
                </div>

                {/* Input manual de porción */}
                <div className="pt-1">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="O ingresa cantidad manual..."
                    value={form.servings_consumed}
                    onChange={(e) => update('servings_consumed', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Botón Acordeón para Macronutrientes Opcionales */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="py-2 px-3 rounded-xl text-xs font-bold text-[#5C5245] hover:text-[#1C1917] flex items-center justify-between transition-all"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E4DCCE',
                }}
              >
                <span className="flex items-center gap-1.5">
                  <span>🥗</span>
                  <span>
                    {showAdvanced ? 'Ocultar macronutrientes' : 'Agregar proteínas, carbos y grasas'}
                  </span>
                </span>
                <span className="text-xs">{showAdvanced ? '▲' : '▼'}</span>
              </button>

              {/* Campos de Macronutrientes */}
              {showAdvanced && (
                <div
                  className="grid grid-cols-3 gap-2 p-3 rounded-2xl animate-in fade-in duration-200"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E4DCCE',
                  }}
                >
                  <div>
                    <label className={labelCls}>🥩 Proteína (g)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={form.protein_per_serving}
                      onChange={(e) => update('protein_per_serving', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>🍞 Carbos (g)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={form.carbs_per_serving}
                      onChange={(e) => update('carbs_per_serving', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>🥑 Grasas (g)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={form.fat_per_serving}
                      onChange={(e) => update('fat_per_serving', e.target.value)}
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
                    Total a registrar
                  </div>
                  <div className="text-2xl font-black tracking-tight leading-tight mt-0.5">
                    {formatNumber(totalCalConsumed)} kcal
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#DDF0E4]">
                    Proteína
                  </div>
                  <div className="text-lg font-black tracking-tight leading-tight mt-0.5">
                    {formatMacro(computed.protein_g)}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-1">
                {!prefill && (
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
                )}
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
                      <span>¡Registrar Comida!</span>
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
