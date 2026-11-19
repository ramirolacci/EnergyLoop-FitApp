import { useState, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useApp } from '../context/AppContext';
import { CountUp } from './CountUp';

interface Props {
  open: boolean;
  onDismiss: () => void;
}

type Step = 'physical' | 'activity' | 'goal' | 'result';

export function SetupModal({ open, onDismiss }: Props) {
  const { profile, updateProfile, toast } = useApp();
  const [step, setStep] = useState<Step>('physical');

  // Control de renderizado para permitir animación GSAP de salida
  const [shouldRender, setShouldRender] = useState(open);
  const isClosing = useRef(false);

  // Referencias para animaciones GSAP
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

  // Form State precargado con el perfil actual si existe
  const [weight, setWeight] = useState(String(profile?.weight_kg || '70'));
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState<number>(1.375); // Ligero por defecto
  const [objective, setObjective] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  const [calculatedGoal, setCalculatedGoal] = useState(2200);
  const [bmrValue, setBmrValue] = useState(1700);

  // Sincronizar apertura
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      isClosing.current = false;
      setStep('physical');
    } else if (!isClosing.current) {
      setShouldRender(false);
    }
  }, [open]);

  // Animación GSAP de entrada (aparición sutil y suave)
  useGSAP(() => {
    if (shouldRender && !isClosing.current && backdropRef.current && modalBoxRef.current) {
      gsap.killTweensOf([backdropRef.current, modalBoxRef.current]);
      
      // Backdrop suave
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.32, ease: 'power2.out' }
      );

      // Modal con elevación y micro-escala
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
          duration: 0.32,
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
          onDismiss();
        },
      });
    } else {
      onDismiss();
    }
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

  const stepMeta = useMemo(() => {
    switch (step) {
      case 'physical':
        return { index: 1, title: 'Datos Corporales', desc: 'Ingresa tu sexo, peso, altura y edad' };
      case 'activity':
        return { index: 2, title: 'Nivel de Actividad', desc: '¿Cuánto movimiento tienes en tu día a día?' };
      case 'goal':
        return { index: 3, title: 'Tu Objetivo', desc: 'Define qué meta quieres alcanzar' };
      case 'result':
        return { index: 4, title: 'Tu Plan Diario', desc: 'Presupuesto calórico y de macronutrientes' };
    }
  }, [step]);

  function calculateTDEE() {
    const w = parseFloat(weight) || 70;
    const h = parseFloat(height) || 170;
    const a = parseInt(age) || 25;

    // Fórmula Harris-Benedict revisada
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
    } else {
      bmr = 447.593 + 9.247 * w + 3.098 * h - 4.33 * a;
    }

    setBmrValue(Math.round(bmr));
    const tdee = bmr * activity;

    let target = tdee;
    if (objective === 'lose') target -= 500;
    if (objective === 'gain') target += 300;

    setCalculatedGoal(Math.max(1200, Math.round(target)));
    setStep('result');
  }

  async function handleFinish() {
    const w = parseFloat(weight) || 70;
    const proteinTarget = Math.round(w * 1.8);

    await updateProfile({
      daily_calorie_goal: calculatedGoal,
      daily_protein_goal: proteinTarget,
      weight_kg: w,
    });

    toast('¡Plan nutricional aplicado con éxito!', 'success');
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
              ⚡
            </div>
            <div>
              <h2 className="text-base font-black text-[#1C1917] tracking-tight leading-tight">
                Asistente TMB
              </h2>
              <p className="text-xs text-[#5C5245] font-medium leading-none mt-1">
                {stepMeta.desc}
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

        {/* Wizard Progress Bar con pasos visuales */}
        <div className="grid grid-cols-4 gap-1.5 pt-0.5 pb-1">
          {[
            { id: 'physical', label: '1. Físico', stepNum: 1 },
            { id: 'activity', label: '2. Actividad', stepNum: 2 },
            { id: 'goal', label: '3. Objetivo', stepNum: 3 },
            { id: 'result', label: '4. Tu Plan', stepNum: 4 },
          ].map((item) => (
            <div key={item.id} className="flex flex-col gap-1 items-center">
              <div
                className="w-full h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: stepMeta.index >= item.stepNum ? '#3BA676' : '#E4DCCE',
                }}
              />
              <span
                className={`text-[9px] font-bold tracking-tight text-center ${
                  stepMeta.index >= item.stepNum ? 'text-[#164E35]' : 'text-[#8C8273]'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Contenido dinámico del Wizard con ref animada por GSAP */}
        <div ref={stepContentRef} className="flex flex-col gap-3 py-1">
          {/* PASO 1: DATOS FÍSICOS */}
          {step === 'physical' && (
            <div className="flex flex-col gap-3.5">
              {/* Selector de Género */}
              <div>
                <label className={labelCls}>
                  <span>Sexo biológico</span>
                  <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className="p-3 rounded-2xl border transition-all flex items-center justify-center gap-2 font-bold text-xs active:scale-[0.98]"
                    style={{
                      background: gender === 'male' ? '#DDF0E4' : '#FFFFFF',
                      border: gender === 'male' ? '2px solid #3BA676' : '1.5px solid #E4DCCE',
                      color: gender === 'male' ? '#164E35' : '#5C5245',
                    }}
                  >
                    <span className="text-lg">👨</span>
                    <span>Hombre</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className="p-3 rounded-2xl border transition-all flex items-center justify-center gap-2 font-bold text-xs active:scale-[0.98]"
                    style={{
                      background: gender === 'female' ? '#DDF0E4' : '#FFFFFF',
                      border: gender === 'female' ? '2px solid #3BA676' : '1.5px solid #E4DCCE',
                      color: gender === 'female' ? '#164E35' : '#5C5245',
                    }}
                  >
                    <span className="text-lg">👩</span>
                    <span>Mujer</span>
                  </button>
                </div>
              </div>

              {/* Fila de Peso y Altura */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="w-input" className={labelCls}>
                    <span>Peso (kg)</span>
                    <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    id="w-input"
                    type="number"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="h-input" className={labelCls}>
                    <span>Altura (cm)</span>
                    <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    id="h-input"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Campo de Edad */}
              <div>
                <label htmlFor="a-input" className={labelCls}>
                  <span>Edad (años)</span>
                  <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  id="a-input"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="28"
                  className={inputCls}
                />
              </div>

              {/* Botón Siguiente */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep('activity')}
                  className="w-full py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
                  style={{
                    background: '#3BA676',
                    border: '1.5px solid #339468',
                    color: '#FFFFFF',
                  }}
                >
                  <span>Continuar</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: NIVEL DE ACTIVIDAD */}
          {step === 'activity' && (
            <div className="flex flex-col gap-2.5">
              {[
                { val: 1.2, label: 'Sedentario', desc: 'Trabajo de escritorio, poco movimiento', icon: '🛋️' },
                { val: 1.375, label: 'Ligero', desc: 'Ejercicio suave 1 a 3 veces por semana', icon: '🚶' },
                { val: 1.55, label: 'Moderado', desc: 'Entrenamiento activo 3 a 5 veces/semana', icon: '🏃' },
                { val: 1.725, label: 'Muy Activo', desc: 'Deporte intenso diario o trabajo físico', icon: '🏋️' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setActivity(item.val)}
                  className="p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all duration-150 active:scale-[0.98]"
                  style={{
                    background: activity === item.val ? '#DDF0E4' : '#FFFFFF',
                    border: activity === item.val ? '2px solid #3BA676' : '1.5px solid #E4DCCE',
                  }}
                >
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-black"
                        style={{ color: activity === item.val ? '#164E35' : '#1C1917' }}
                      >
                        {item.label}
                      </span>
                      {activity === item.val && (
                        <span className="w-5 h-5 rounded-full bg-[#3BA676] text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5C5245] leading-tight mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}

              {/* Botones de navegación */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('physical')}
                  className="px-4 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 shrink-0"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E4DCCE',
                    color: '#5C5245',
                  }}
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep('goal')}
                  className="flex-1 py-3 px-4 rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
                  style={{
                    background: '#3BA676',
                    border: '1.5px solid #339468',
                    color: '#FFFFFF',
                  }}
                >
                  <span>Siguiente</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: OBJETIVO NUTRICIONAL */}
          {step === 'goal' && (
            <div className="flex flex-col gap-2.5">
              {[
                { val: 'lose', label: 'Perder peso', desc: 'Déficit calórico seguro (-500 kcal) para quemar grasa', icon: '📉' },
                { val: 'maintain', label: 'Mantener peso', desc: 'Equilibrio de energía para mantener tu peso actual', icon: '⚖️' },
                { val: 'gain', label: 'Ganar masa muscular', desc: 'Superávit estratégico (+300 kcal) para fuerza', icon: '📈' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setObjective(item.val as 'lose' | 'maintain' | 'gain')}
                  className="p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all duration-150 active:scale-[0.98]"
                  style={{
                    background: objective === item.val ? '#DDF0E4' : '#FFFFFF',
                    border: objective === item.val ? '2px solid #3BA676' : '1.5px solid #E4DCCE',
                  }}
                >
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-black"
                        style={{ color: objective === item.val ? '#164E35' : '#1C1917' }}
                      >
                        {item.label}
                      </span>
                      {objective === item.val && (
                        <span className="w-5 h-5 rounded-full bg-[#3BA676] text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5C5245] leading-tight mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}

              {/* Botones de navegación */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('activity')}
                  className="px-4 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 shrink-0"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E4DCCE',
                    color: '#5C5245',
                  }}
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={calculateTDEE}
                  className="flex-1 py-3 px-4 rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
                  style={{
                    background: '#3BA676',
                    border: '1.5px solid #339468',
                    color: '#FFFFFF',
                  }}
                >
                  <span>Calcular Plan</span>
                  <span>✨</span>
                </button>
              </div>
            </div>
          )}

          {/* PASO 4: RESULTADO Y PLAN DIARIO */}
          {step === 'result' && (
            <div className="flex flex-col gap-3">
              {/* Banner de Calorías Recomendadas */}
              <div
                className="w-full rounded-2xl p-5 text-center flex flex-col items-center gap-1 shadow-sm"
                style={{
                  background: '#3BA676',
                  color: '#FFFFFF',
                }}
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-[#DDF0E4]">
                  Tu Presupuesto Diario Recomendado
                </span>
                <div className="text-4xl sm:text-5xl font-black tracking-tight my-1">
                  <CountUp value={calculatedGoal} />
                </div>
                <span className="text-xs font-bold text-[#EAE4D7]">
                  kcal / día
                </span>
              </div>

              {/* Tarjeta de desglose de datos calculados */}
              <div
                className="rounded-2xl p-3.5 flex flex-col gap-2.5"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E4DCCE',
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E4DCCE]/60 text-xs gap-2">
                  <span className="text-[#5C5245] font-semibold">Meta de Proteína:</span>
                  <span className="font-black text-[#164E35] bg-[#DDF0E4] px-2.5 py-1 rounded-lg border border-[#BEDECB] whitespace-nowrap shrink-0">
                    {Math.round((parseFloat(weight) || 70) * 1.8)}g / día
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E4DCCE]/60 text-xs gap-2">
                  <span className="text-[#5C5245] font-semibold">Tasa Metabólica Basal (TMB):</span>
                  <span className="font-black text-[#1C1917] whitespace-nowrap shrink-0">
                    {String(bmrValue).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} kcal en reposo
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-[#5C5245] font-semibold">Enfoque:</span>
                  <span className="font-bold text-[#3BA676] whitespace-nowrap shrink-0">
                    {objective === 'lose' ? '📉 Déficit (-500 kcal)' : objective === 'gain' ? '📈 Superávit (+300 kcal)' : '⚖️ Mantenimiento'}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('physical')}
                  className="px-4 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 shrink-0"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E4DCCE',
                    color: '#5C5245',
                  }}
                >
                  ← Modificar
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="flex-1 py-3 px-4 rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
                  style={{
                    background: '#3BA676',
                    border: '1.5px solid #339468',
                    color: '#FFFFFF',
                  }}
                >
                  <span>¡Aplicar Plan!</span>
                  <span>✓</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
