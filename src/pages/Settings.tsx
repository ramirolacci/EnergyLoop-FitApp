import { useEffect, useState } from 'react';
import { PHeading, PText, PButton, PSwitch, PDivider, PInlineNotification, PButtonPure } from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import { SetupModal } from '../components/SetupModal';

export function Settings() {
  const { profile, updateProfile, toggleTheme, theme, toast } = useApp();
  const [showSetup, setShowSetup] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState(String(profile?.daily_calorie_goal ?? 2000));
  const [proteinGoal, setProteinGoal] = useState(String(profile?.daily_protein_goal ?? ''));
  const [weight, setWeight] = useState(String(profile?.weight_kg ?? 70));
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setCalorieGoal(String(profile.daily_calorie_goal));
      setProteinGoal(profile.daily_protein_goal ? String(profile.daily_protein_goal) : '');
      setWeight(String(profile.weight_kg));
    }
  }, [profile]);

  async function handleSave() {
    const cal = parseInt(calorieGoal);
    const prot = proteinGoal ? parseInt(proteinGoal) : null;
    const w = parseFloat(weight);

    if (isNaN(cal) || cal < 500 || cal > 10000) return;
    if (isNaN(w) || w < 20 || w > 500) return;

    setSaving(true);
    await updateProfile({
      daily_calorie_goal: cal,
      daily_protein_goal: prot,
      weight_kg: w,
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    toast('Configuración guardada', 'success');
    setSaving(false);
  }

  const surfaceColor = theme === 'dark' ? '#212225' : '#fff';
  const borderColor = theme === 'dark' ? '#2a2a2e' : '#d8d8db';
  const inputCls = `w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${
    theme === 'dark'
      ? 'bg-[#0e0e12] border border-[#2a2a2e] text-[#fbfcff] focus:border-[#535457]'
      : 'bg-white border border-[#d8d8db] text-[#010205] focus:border-[#535457]'
  }`;
  const labelCls = `text-xs font-medium mb-1.5 block ${theme === 'dark' ? 'text-[#afb0b3]' : 'text-[#535457]'}`;

  const CALORIE_PRESETS = [1500, 1800, 2000, 2200, 2500, 3000];

  return (
    <div className="flex flex-col gap-4 pb-24">
      <PHeading size="large" tag="h1" theme={theme}>Configuración</PHeading>

      {success && (
        <PInlineNotification
          state="success"
          heading="Guardado"
          description="Tu configuración fue actualizada correctamente."
          dismissButton={false}
          theme={theme}
        />
      )}

      {/* Goals section */}
      <div
        className="rounded-2xl p-4 flex flex-col gap-4"
        style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
      >
        <PHeading size="small" tag="h2" theme={theme}>Objetivos diarios</PHeading>

        <div className="flex justify-between items-end">
          <label htmlFor="calorie-goal" className={labelCls}>Objetivo calórico diario (kcal)</label>
          <PButtonPure 
            icon="configurate" 
            size="x-small" 
            theme={theme} 
            onClick={() => setShowSetup(true)}
            style={{ marginBottom: 6 }}
          >
            Usar asistente
          </PButtonPure>
        </div>
        <div>
          <input
            id="calorie-goal"
            name="calorie-goal"
            className={inputCls}
            type="number"
            min="500"
            max="10000"
            value={calorieGoal}
            onChange={e => setCalorieGoal(e.target.value)}
          />
          {/* Presets */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {CALORIE_PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setCalorieGoal(String(p))}
                className="px-3 py-1 rounded-lg text-xs transition-colors"
                style={{
                  background: calorieGoal === String(p) ? (theme === 'dark' ? '#fbfcff' : '#010205') : (theme === 'dark' ? '#2a2a2e' : '#f5f5f8'),
                  color: calorieGoal === String(p) ? (theme === 'dark' ? '#010205' : '#fbfcff') : (theme === 'dark' ? '#afb0b3' : '#535457'),
                  border: `1px solid ${borderColor}`,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="protein-goal" className={labelCls}>Objetivo de proteína diaria (g) — opcional</label>
          <input
            id="protein-goal"
            name="protein-goal"
            className={inputCls}
            type="number"
            min="0"
            max="500"
            placeholder="Ej: 150"
            value={proteinGoal}
            onChange={e => setProteinGoal(e.target.value)}
          />
          <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#535457' : '#afb0b3', marginTop: 4 }}>
            Recomendado: 1.6–2.2g por kg de peso corporal
          </PText>
        </div>

        <PDivider theme={theme} />

        <div>
          <label htmlFor="body-weight" className={labelCls}>Peso corporal (kg)</label>
          <input
            id="body-weight"
            name="body-weight"
            className={inputCls}
            type="number"
            min="20"
            max="500"
            step="0.1"
            value={weight}
            onChange={e => setWeight(e.target.value)}
          />
          <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#535457' : '#afb0b3', marginTop: 4 }}>
            Se usa para calcular las calorías quemadas por ejercicio
          </PText>
        </div>

        <PButton
          variant="primary"
          onClick={handleSave}
          loading={saving}
          icon="check"
          theme={theme}
        >
          Guardar cambios
        </PButton>
      </div>

      {/* Appearance */}
      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
      >
        <PHeading size="small" tag="h2" theme={theme}>Apariencia</PHeading>

        <div className="flex items-center justify-between">
          <div>
            <PText weight="semi-bold" theme={theme}>Modo oscuro</PText>
            <PText size="small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
              Activar tema oscuro
            </PText>
          </div>
          <PSwitch
            checked={theme === 'dark'}
            onUpdate={toggleTheme}
            theme={theme}
            hideLabel
            compact
          >
            Modo oscuro
          </PSwitch>
        </div>
      </div>

      {/* Science & Methodology Section */}
      <div
        className="rounded-3xl p-6 flex flex-col gap-6 shadow-sm"
        style={{ 
          background: surfaceColor, 
          border: `1px solid ${borderColor}`,
          marginTop: 12
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#018a16] flex items-center justify-center text-2xl shadow-lg shadow-[#018a1633]">
            🧬
          </div>
          <div>
            <PHeading size="small" tag="h2" theme={theme}>La Ciencia de CalorAPP</PHeading>
            <PText size="xx-small" weight="bold" theme={theme} style={{ color: '#018a16', letterSpacing: '0.05em' }}>
              METODOLOGÍA Y PRECISIÓN
            </PText>
          </div>
        </div>

        <div className="space-y-4">
          <div 
            className="p-5 rounded-2xl border" 
            style={{ 
              background: theme === 'dark' ? '#1a1a1e' : '#f8f9fa',
              borderColor: theme === 'dark' ? '#2a2a2e' : '#e9ecef'
            }}
          >
            <PText weight="bold" size="small" theme={theme} style={{ marginBottom: 8, color: theme === 'dark' ? '#fbfcff' : '#010205' }}>
              Sistema METs
            </PText>
            <PText size="small" theme={theme} style={{ color: theme === 'dark' ? '#d8d8db' : '#535457', lineHeight: 1.6 }}>
              Calculamos tus calorías quemadas usando el Equivalente Metabólico (MET). Es el estándar de oro en medicina deportiva, ajustado dinámicamente según tu peso corporal y la intensidad del ejercicio.
            </PText>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div 
              className="p-4 rounded-2xl border" 
              style={{ 
                background: theme === 'dark' ? '#1a1a1e' : '#f8f9fa',
                borderColor: theme === 'dark' ? '#2a2a2e' : '#e9ecef'
              }}
            >
              <PText weight="bold" size="x-small" theme={theme} style={{ marginBottom: 6, color: '#ff6b00' }}>
                ⚖️ Personalizado
              </PText>
              <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457', lineHeight: 1.4 }}>
                Tus cálculos se ajustan a tus <span style={{ fontWeight: 'bold', color: theme === 'dark' ? '#fbfcff' : '#010205' }}>{profile?.weight_kg ?? 70} kg</span>, garantizando resultados realistas.
              </PText>
            </div>
            <div 
              className="p-4 rounded-2xl border" 
              style={{ 
                background: theme === 'dark' ? '#1a1a1e' : '#f8f9fa',
                borderColor: theme === 'dark' ? '#2a2a2e' : '#e9ecef'
              }}
            >
              <PText weight="bold" size="x-small" theme={theme} style={{ marginBottom: 6, color: '#0076ff' }}>
                ⚡ Intensidad
              </PText>
              <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457', lineHeight: 1.4 }}>
                Diferenciamos entre esfuerzo leve, moderado y vigoroso para cada actividad física.
              </PText>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-1">
            <div className="flex items-start gap-3">
              <span className="text-sm mt-0.5">✅</span>
              <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                Basado en el Compendio de Actividades Físicas de Stanford.
              </PText>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm mt-0.5">✅</span>
              <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                Algoritmo de balance neto diario (Ingesta - Gasto).
              </PText>
            </div>
          </div>
        </div>

        <PDivider theme={theme} />
        
        <div className="text-center opacity-40">
          <PText size="xx-small" theme={theme}>
            CalorAPP v1.2 — Ingeniería de datos para tu salud
          </PText>
        </div>
      </div>


    <SetupModal open={showSetup} onDismiss={() => setShowSetup(false)} />
    </div>
  );
}
