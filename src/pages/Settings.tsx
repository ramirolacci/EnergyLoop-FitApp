import { useEffect, useState, useRef } from 'react';
import { PHeading, PText, PButton, PSwitch, PDivider, PInlineNotification, PButtonPure } from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import { SetupModal } from '../components/SetupModal';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function Settings({ onOpenSetup }: { onOpenSetup?: () => void }) {
  const { profile, updateProfile, toggleTheme, theme, toast } = useApp();
  const [calorieGoal, setCalorieGoal] = useState(String(profile?.daily_calorie_goal ?? 2000));
  const [proteinGoal, setProteinGoal] = useState(String(profile?.daily_protein_goal ?? ''));
  const [weight, setWeight] = useState(String(profile?.weight_kg ?? 70));
  const [name, setName] = useState(profile?.name || 'Usuario');
  const [avatar, setAvatar] = useState(profile?.avatar || null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.settings-item', 
        { opacity: 0, x: -10 }, 
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, { scope: containerRef });

  useEffect(() => {
    if (profile) {
      setCalorieGoal(String(profile.daily_calorie_goal));
      setProteinGoal(profile.daily_protein_goal ? String(profile.daily_protein_goal) : '');
      setWeight(String(profile.weight_kg));
      setName(profile.name || 'Usuario');
      setAvatar(profile.avatar || null);
    }
  }, [profile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatar(result);
        void updateProfile({ avatar: result });
        toast('Foto actualizada', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameSave = () => {
    void updateProfile({ name });
    setIsEditingProfile(false);
    toast('Nombre actualizado', 'success');
  };

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

  const surfaceColor = theme === 'dark' ? 'var(--surface-dark)' : 'var(--surface-light)';
  const borderColor = theme === 'dark' ? 'var(--border-dark)' : 'var(--border-light)';
  const secondaryText = theme === 'dark' ? '#afb0b3' : '#535457';
  
  const inputCls = `w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-300 ${
    theme === 'dark'
      ? 'bg-[#0e0e12] border border-[#2a2a2e] text-[#fbfcff] focus:border-[#018a16] focus:ring-1 focus:ring-[#018a16]'
      : 'bg-[#f8f9fc] border border-[#d8d8db] text-[#010205] focus:border-[#018a16] focus:ring-1 focus:ring-[#018a16]'
  }`;
  
  const labelCls = `text-[10px] font-black uppercase tracking-widest mb-2 block ${theme === 'dark' ? 'text-[#afb0b3]' : 'text-[#535457]'}`;

  const CALORIE_PRESETS = [1500, 1800, 2000, 2200, 2500, 3000];

  return (
    <div ref={containerRef} className="flex flex-col gap-8 pb-24">
      <header className="settings-item flex items-center justify-between mt-2">
        <div>
          <PHeading size="large" theme={theme} style={{ fontWeight: 900 }}>Ajustes ⚙️</PHeading>
          <PText size="small" theme={theme} style={{ color: secondaryText }}>Personaliza tu experiencia</PText>
        </div>
      </header>

      {success && (
        <div className="settings-item">
          <PInlineNotification
            state="success"
            heading="¡Guardado!"
            description="Tu configuración fue actualizada correctamente."
            dismissButton={false}
            theme={theme}
          />
        </div>
      )}

      {/* User Header Section */}
      <div className="settings-item p-6 rounded-[2.5rem] card-shadow flex flex-col gap-4" style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-5">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-[1.5rem] bg-[#018a16] flex items-center justify-center text-4xl shadow-lg shadow-[#018a1644] overflow-hidden relative group transition-transform hover:scale-105 active:scale-95"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>👤</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xl">📸</span>
            </div>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          
          <div className="flex-1">
            {isEditingProfile ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-transparent border-b border-[#018a16] text-xl font-black outline-none w-full pb-1"
                  style={{ color: theme === 'dark' ? '#fbfcff' : '#010205' }}
                  autoFocus
                  onBlur={handleNameSave}
                  onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <PHeading size="small" theme={theme}>{profile?.name || 'Usuario'}</PHeading>
                    <button onClick={() => setIsEditingProfile(true)} className="text-[#018a16] text-sm opacity-70 hover:opacity-100">
                      ✏️
                    </button>
                  </div>
                  <PText size="xx-small" theme={theme} style={{ color: secondaryText }}>Miembro desde 2024</PText>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Goals section */}
      <section className="settings-item flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
           <PHeading size="small" theme={theme} style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mis Objetivos</PHeading>
           <PButtonPure icon="configurate" theme={theme} size="small" onClick={() => onOpenSetup?.()}>Asistente</PButtonPure>
        </div>

        <div className="p-6 rounded-[2.5rem] card-shadow flex flex-col gap-6" style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}>
          <div>
            <label htmlFor="calorie-goal" className={labelCls}>Meta de Calorías (kcal)</label>
            <input
              id="calorie-goal"
              className={inputCls}
              type="number"
              value={calorieGoal}
              onChange={e => setCalorieGoal(e.target.value)}
            />
            <div className="flex gap-2 mt-3 flex-wrap">
              {CALORIE_PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => setCalorieGoal(String(p))}
                  className="px-4 py-1.5 rounded-full text-[10px] font-bold transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: calorieGoal === String(p) ? '#018a16' : 'transparent',
                    color: calorieGoal === String(p) ? '#fff' : secondaryText,
                    border: `1px solid ${calorieGoal === String(p) ? '#018a16' : borderColor}`,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="protein-goal" className={labelCls}>Meta de Proteína (g)</label>
            <input
              id="protein-goal"
              className={inputCls}
              type="number"
              placeholder="Ej: 150"
              value={proteinGoal}
              onChange={e => setProteinGoal(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="body-weight" className={labelCls}>Peso Actual (kg)</label>
            <input
              id="body-weight"
              className={inputCls}
              type="number"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
          </div>

          <PButton
            variant="primary"
            onClick={handleSave}
            loading={saving}
            icon="check"
            theme={theme}
            style={{ borderRadius: '1rem', height: '3.5rem' }}
          >
            Guardar Cambios
          </PButton>
        </div>
      </section>

      {/* Appearance */}
      <section className="settings-item flex flex-col gap-4">
        <PHeading size="small" theme={theme} style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 8 }}>Preferencias</PHeading>
        
        <div 
          className="p-6 rounded-[2rem] card-shadow flex items-center justify-between"
          style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-current opacity-5 flex items-center justify-center text-xl">
              🌙
            </div>
            <div>
              <PText weight="bold" theme={theme}>Modo Oscuro</PText>
              <PText size="xx-small" theme={theme} style={{ color: secondaryText }}>Cambiar tema visual</PText>
            </div>
          </div>
          <PSwitch
            checked={theme === 'dark'}
            onUpdate={toggleTheme}
            theme={theme}
            hideLabel
            compact
          />
        </div>
      </section>

      {/* Info Section */}
      <section className="settings-item">
        <div
          className="rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #1a1a1e 0%, #0e0e12 100%)', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#018a16]/20 border border-[#018a16]/30 flex items-center justify-center text-2xl">
              🧬
            </div>
            <div>
              <PText size="xx-small" weight="bold" style={{ color: '#018a16', letterSpacing: '0.1em' }}>PRECISIÓN CIENTÍFICA</PText>
              <PHeading size="small" style={{ color: '#fff' }}>Metodología METs</PHeading>
            </div>
          </div>
          <PText size="small" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            Tus calorías quemadas se calculan bajo el estándar de oro de la medicina deportiva, ajustado a tus <span className="text-white font-bold">{weight}kg</span>.
          </PText>
          <PDivider theme="dark" />
          <PText size="xx-small" style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
            FitApp Premium v1.5 · Hecho para tu salud
          </PText>
        </div>
      </section>
    </div>
  );
}
