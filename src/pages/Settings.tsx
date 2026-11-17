import { useState, useRef } from 'react';
import { PButton, PSwitch, PInlineNotification, PButtonPure } from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function Settings({ onOpenSetup }: { onOpenSetup?: () => void }) {
  const { profile, updateProfile, toggleTheme, theme, toast } = useApp();
  const { user, openAuthModal, signOut } = useAuth();
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
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, { scope: containerRef });

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

  const surfaceColor = theme === 'dark' ? '#171922' : '#ffffff';
  const borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
  const secondaryText = theme === 'dark' ? '#94a3b8' : '#64748b';
  
  const inputCls = `w-full rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition-all duration-200 ${
    theme === 'dark'
      ? 'bg-[#1f222e] border border-white/10 text-slate-100 focus:border-emerald-400'
      : 'bg-[#f8faf9] border border-black/5 text-slate-900 focus:border-emerald-500'
  }`;
  
  const labelCls = `text-[10px] font-bold uppercase tracking-wider mb-2 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`;
  const CALORIE_PRESETS = [1500, 1800, 2000, 2200, 2500, 3000];

  const formatThousands = (val: string) => {
    if (!val) return '';
    return val.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <header className="settings-item flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
            Preferencias & Cuenta
          </span>
          <h1 
            className="text-2xl font-black tracking-tight"
            style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
          >
            Ajustes ⚙️
          </h1>
        </div>

        {/* Quick Dark Mode Button */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 mobile-card-shadow"
          style={{
            background: surfaceColor,
            border: `1px solid ${borderColor}`,
            color: theme === 'dark' ? '#fde047' : '#f59e0b',
          }}
          title={theme === 'dark' ? 'Cambiar a Modo Claro pastel' : 'Cambiar a Modo Oscuro'}
          aria-label="Cambiar tema"
        >
          <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
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

      {/* User & Cloud Account Section */}
      <div 
        className="settings-item p-5 rounded-3xl mobile-card-shadow flex flex-col gap-4" 
        style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-3xl shadow-sm overflow-hidden relative group transition-transform active:scale-95"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>👤</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-base">📸</span>
            </div>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          
          <div className="flex-1 min-w-0">
            {isEditingProfile ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-transparent border-b-2 border-emerald-500 text-lg font-black outline-none w-full pb-0.5"
                  style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                  autoFocus
                  onBlur={handleNameSave}
                  onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-black truncate" style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>
                    {profile?.name || (user?.email?.split('@')[0] ?? 'Usuario')}
                  </h2>
                  <button 
                    onClick={() => setIsEditingProfile(true)} 
                    className="text-emerald-600 dark:text-emerald-400 text-xs hover:scale-110 transition-transform"
                    title="Editar nombre"
                  >
                    ✏️
                  </button>
                </div>
                <span className="text-xs truncate block mt-0.5" style={{ color: secondaryText }}>
                  {user?.email || 'Modo local (Sin cuenta)'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cloud Sync Status & Auth Action */}
        <div 
          className="pt-3 border-t flex items-center justify-between"
          style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{
                background: user 
                  ? (theme === 'dark' ? 'rgba(52, 211, 153, 0.15)' : '#ecfdf5')
                  : (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'),
              }}
            >
              {user ? '☁️' : '💾'}
            </div>
            <div>
              <div className="text-xs font-bold" style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>
                {user ? 'Sincronizado en Supabase' : 'Almacenamiento Local'}
              </div>
              <div className="text-[10px]" style={{ color: secondaryText }}>
                {user ? 'Datos respaldados en la nube' : 'Inicia sesión para respaldar'}
              </div>
            </div>
          </div>

          {user ? (
            <button
              onClick={async () => {
                await signOut();
                toast('Sesión cerrada', 'info');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              Cerrar
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition-all active:scale-95"
            >
              Conectar
            </button>
          )}
        </div>
      </div>

      {/* Goals section */}
      <section className="settings-item flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
            Metas Nutricionales
          </span>
          <PButtonPure icon="configurate" theme={theme} size="small" onClick={() => onOpenSetup?.()}>
            Asistente TMB
          </PButtonPure>
        </div>

        <div 
          className="p-5 rounded-3xl mobile-card-shadow flex flex-col gap-4" 
          style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
        >
          {/* Calorie goal */}
          <div>
            <label htmlFor="calorie-goal" className={labelCls}>Presupuesto Diario de Calorías (kcal)</label>
            <input
              id="calorie-goal"
              className={inputCls}
              type="text"
              inputMode="numeric"
              value={formatThousands(calorieGoal)}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '');
                setCalorieGoal(raw);
              }}
            />
            <div className="flex gap-1.5 mt-2.5 flex-wrap">
              {CALORIE_PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => setCalorieGoal(String(p))}
                  className="px-3 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95"
                  style={{
                    background: calorieGoal === String(p) 
                      ? '#10b981' 
                      : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f5f3'),
                    color: calorieGoal === String(p) ? '#ffffff' : secondaryText,
                  }}
                >
                  {formatThousands(String(p))}
                </button>
              ))}
            </div>
          </div>

          {/* Protein goal */}
          <div>
            <label htmlFor="protein-goal" className={labelCls}>Meta de Proteína (g)</label>
            <input
              id="protein-goal"
              className={inputCls}
              type="text"
              inputMode="numeric"
              placeholder="Ej: 150"
              value={formatThousands(proteinGoal)}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '');
                setProteinGoal(raw);
              }}
            />
          </div>

          {/* Weight */}
          <div>
            <label htmlFor="body-weight" className={labelCls}>Peso Corporal (kg)</label>
            <input
              id="body-weight"
              className={inputCls}
              type="number"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
          </div>

          <div style={{ borderRadius: '9999px', overflow: 'hidden', width: '100%', transform: 'translateZ(0)', marginTop: 8 }}>
            <PButton
              variant="primary"
              onClick={handleSave}
              loading={saving}
              icon="check"
              theme={theme}
              style={{ width: '100%', margin: 0 }}
            >
              Guardar Cambios
            </PButton>
          </div>
        </div>
      </section>

      {/* Preferences Section: Dark Mode Option */}
      <section className="settings-item flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider opacity-60 px-1" style={{ color: secondaryText }}>
          Apariencia & Tema
        </span>
        
        <div 
          className="p-5 rounded-3xl mobile-card-shadow flex items-center justify-between"
          style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
        >
          <div className="flex items-center gap-3.5">
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: theme === 'dark' ? '#202330' : '#f0fdf4' }}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>
                Modo Oscuro
              </div>
              <div className="text-[11px]" style={{ color: secondaryText }}>
                {theme === 'dark' ? 'Activado (Fondo carbón)' : 'Desactivado (Gama clara pastel)'}
              </div>
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

      {/* Info Card */}
      <section className="settings-item">
        <div
          className="rounded-3xl p-5 flex flex-col gap-3 mobile-card-shadow"
          style={{ 
            background: theme === 'dark' 
              ? 'rgba(52, 211, 153, 0.06)' 
              : '#ecfdf5',
            border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.15)' : '#d1fae5'}`
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧬</span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Fórmula METs Estándar
              </span>
              <h3 className="text-sm font-black" style={{ color: theme === 'dark' ? '#f8fafc' : '#065f46' }}>
                Precisión Metabólica
              </h3>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: theme === 'dark' ? '#cbd5e1' : '#047857' }}>
            Las calorías quemadas se calculan ajustadas a tu peso de <span className="font-bold">{weight}kg</span> mediante el compendio de actividades físicas de Stanford.
          </p>
        </div>
      </section>
    </div>
  );
}
