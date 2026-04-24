import { useState, useRef } from 'react';
import { PModal, PHeading, PText, PButton, PDivider } from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CountUp } from './CountUp';

interface Props {
  open: boolean;
  onDismiss: () => void;
}

type Step = 'welcome' | 'physical' | 'activity' | 'goal' | 'result';

export function SetupModal({ open, onDismiss }: Props) {
  const { updateProfile, theme } = useApp();
  const [step, setStep] = useState<Step>('welcome');
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (contentRef.current) {
      // Clear any ongoing animations to prevent DOM conflicts
      gsap.killTweensOf(contentRef.current);
      
      gsap.fromTo(contentRef.current, 
        { opacity: 0, y: 10 }, 
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, { dependencies: [step] });
  
  // Form State
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState<number>(1.2); 
  const [objective, setObjective] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  
  const [calculatedGoal, setCalculatedGoal] = useState(2000);

  function calculateTDEE() {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
    } else {
      bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    }
    
    const tdee = bmr * activity;
    
    let target = tdee;
    if (objective === 'lose') target -= 500;
    if (objective === 'gain') target += 300;
    
    setCalculatedGoal(Math.round(target));
    setStep('result');
  }

  async function handleFinish() {
    await updateProfile({
      daily_calorie_goal: calculatedGoal,
      daily_protein_goal: Math.round(parseFloat(weight) * 1.8),
      weight_kg: parseFloat(weight),
    });
    onDismiss();
  }

  const surfaceColor = theme === 'dark' ? '#212225' : '#fff';
  const borderColor = theme === 'dark' ? '#2a2a2e' : '#d8d8db';
  const inputCls = `w-full rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all ${
    theme === 'dark'
      ? 'bg-[#1a1a1e] border border-[#2a2a2e] text-[#fbfcff] focus:border-[#018a16]'
      : 'bg-white border border-[#d8d8db] text-[#010205] focus:border-[#018a16]'
  }`;

  return (
    <PModal
      open={open}
      onDismiss={onDismiss}
      theme={theme}
      dismissButton={step !== 'welcome'}
      fullscreen={{ base: true, s: false }}
    >
      <PHeading slot="header" size="medium" tag="h2" theme={theme}>
        {step === 'welcome' ? 'Bienvenido' : 
         step === 'physical' ? 'Tus datos' : 
         step === 'activity' ? 'Actividad' : 
         step === 'goal' ? 'Objetivo' : 'Tu Plan'}
      </PHeading>

      <div className="flex flex-col gap-6 py-4" ref={contentRef} key={step}>
        
        {step === 'welcome' && (
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 rounded-full bg-[#018a16] flex items-center justify-center text-5xl shadow-2xl shadow-[#018a1666]">
              🥗
            </div>
            <div className="space-y-2">
              <PHeading size="large" theme={theme}>¡Personaliza tu meta!</PHeading>
              <PText theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                Para darte resultados precisos, necesitamos conocerte un poco mejor.
              </PText>
            </div>
            <PButton variant="primary" onClick={() => setStep('physical')} theme={theme} style={{ width: '100%' }}>
              Comenzar configuración
            </PButton>
          </div>
        )}

        {step === 'physical' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setGender('male')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 flex-1 ${gender === 'male' ? 'border-[#018a16] bg-[#018a1622]' : 'border-transparent'}`}
                style={{ 
                  background: gender === 'male' ? undefined : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'), 
                  borderColor: gender === 'male' ? undefined : borderColor 
                }}
              >
                <span className="text-3xl">👨</span>
                <PText weight="bold" theme={theme}>Hombre</PText>
              </button>
              <button 
                onClick={() => setGender('female')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 flex-1 ${gender === 'female' ? 'border-[#018a16] bg-[#018a1622]' : 'border-transparent'}`}
                style={{ 
                  background: gender === 'female' ? undefined : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'), 
                  borderColor: gender === 'female' ? undefined : borderColor 
                }}
              >
                <span className="text-3xl">👩</span>
                <PText weight="bold" theme={theme}>Mujer</PText>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="setup-weight" style={{ fontSize: '10px', fontWeight: 'bold', color: theme === 'dark' ? '#afb0b3' : '#535457', marginLeft: 8, marginBottom: 4, display: 'block' }}>PESO (KG)</label>
                <input id="setup-weight" name="weight" className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
              <div>
                <label htmlFor="setup-height" style={{ fontSize: '10px', fontWeight: 'bold', color: theme === 'dark' ? '#afb0b3' : '#535457', marginLeft: 8, marginBottom: 4, display: 'block' }}>ALTURA (CM)</label>
                <input id="setup-height" name="height" className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="setup-age" style={{ fontSize: '10px', fontWeight: 'bold', color: theme === 'dark' ? '#afb0b3' : '#535457', marginLeft: 8, marginBottom: 4, display: 'block' }}>EDAD</label>
              <input id="setup-age" name="age" className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} />
            </div>
            <PButton variant="primary" onClick={() => setStep('activity')} theme={theme} style={{ width: '100%' }}>Siguiente</PButton>
          </div>
        )}

        {step === 'activity' && (
          <div className="flex flex-col gap-4">
            <PHeading size="small" theme={theme}>¿Qué tan activo eres?</PHeading>
            {[
              { label: 'Sedentario', desc: 'Trabajo de oficina, poco movimiento', val: 1.2, icon: '🛋️' },
              { label: 'Ligero', desc: 'Actividad física 1-3 veces/semana', val: 1.375, icon: '🚶' },
              { label: 'Moderado', desc: 'Actividad física 3-5 veces/semana', val: 1.55, icon: '🏃' },
              { label: 'Muy Activo', desc: 'Entrenamiento diario intenso', val: 1.725, icon: '🏋️' },
            ].map(a => (
              <button 
                key={a.val}
                onClick={() => setActivity(a.val)}
                className={`p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${activity === a.val ? 'border-[#018a16] bg-[#018a1611]' : 'border-transparent'}`}
                style={{ background: activity === a.val ? undefined : surfaceColor, borderColor: activity === a.val ? undefined : borderColor }}
              >
                <span className="text-3xl">{a.icon}</span>
                <div className="flex-1">
                  <PText weight="bold" theme={theme}>{a.label}</PText>
                  <PText size="x-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>{a.desc}</PText>
                </div>
              </button>
            ))}
            <PButton variant="primary" onClick={() => setStep('goal')} theme={theme} style={{ width: '100%', marginTop: 8 }}>Siguiente</PButton>
          </div>
        )}

        {step === 'goal' && (
          <div className="flex flex-col gap-4">
            <PHeading size="small" theme={theme}>¿Cuál es tu meta?</PHeading>
            {[
              { label: 'Perder peso', desc: 'Déficit calórico saludable', val: 'lose', icon: '📉' },
              { label: 'Mantener peso', desc: 'Equilibrio de energía', val: 'maintain', icon: '⚖️' },
              { label: 'Ganar músculo', desc: 'Superávit para fuerza', val: 'gain', icon: '📈' },
            ].map(o => (
              <button 
                key={o.val}
                onClick={() => setObjective(o.val as any)}
                className={`p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${objective === o.val ? 'border-[#018a16] bg-[#018a1611]' : 'border-transparent'}`}
                style={{ background: objective === o.val ? undefined : surfaceColor, borderColor: objective === o.val ? undefined : borderColor }}
              >
                <span className="text-3xl">{o.icon}</span>
                <div className="flex-1">
                  <PText weight="bold" theme={theme}>{o.label}</PText>
                  <PText size="x-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>{o.desc}</PText>
                </div>
              </button>
            ))}
            <PButton variant="primary" onClick={calculateTDEE} theme={theme} style={{ width: '100%', marginTop: 8 }}>Ver mi plan</PButton>
          </div>
        )}

        {step === 'result' && (
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-full rounded-3xl p-8 flex flex-col items-center gap-2" style={{ background: '#018a16', color: '#fff' }}>
              <PText size="small" weight="bold" style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em' }}>OBJETIVO DIARIO</PText>
              <div className="text-6xl font-black">
                <CountUp value={calculatedGoal} />
              </div>
              <PText size="large" weight="bold" style={{ color: '#fff' }}>kcal</PText>
            </div>
            
            <div className="w-full text-left p-4 rounded-2xl border" style={{ borderColor }}>
              <PText size="small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                Tu plan ha sido calculado con éxito. Para <span className="font-bold text-[#018a16]">
                  {objective === 'lose' ? 'bajar de peso' : objective === 'gain' ? 'ganar músculo' : 'mantenerte'}
                </span> de forma saludable, esta es tu meta recomendada.
              </PText>
            </div>

            <div className="flex gap-2 w-full">
              <PButton variant="secondary" onClick={() => setStep('physical')} theme={theme} style={{ flex: 1 }}>Corregir</PButton>
              <PButton variant="primary" onClick={handleFinish} theme={theme} style={{ flex: 2 }}>¡Comenzar!</PButton>
            </div>
          </div>
        )}

      </div>
    </PModal>
  );
}
