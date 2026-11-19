import { useState, useRef } from 'react';
import { PInlineNotification } from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function Settings({ onOpenSetup }: { onOpenSetup?: () => void }) {
  const { profile, updateProfile, theme, toast } = useApp();
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
        { opacity: 0, y: 10 }, 
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
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

  const surfaceColor = '#ffffff';
  const borderColor = '#e4dcce';
  const secondaryText = '#5c5245';
  
  // Font-size: 16px para evitar auto-zoom desagradable en iOS Safari
  const inputCls = 'w-full rounded-2xl px-3.5 py-2.5 text-base font-semibold outline-none transition-all duration-200 bg-[#efe9dc] border border-[#e0d5c3] text-stone-900 focus:border-[#3ba676]';
  
  const labelCls = 'text-[9px] font-bold uppercase tracking-wider mb-1.5 block text-[#5c5245]';
  const CALORIE_PRESETS = [1500, 1800, 2000, 2200, 2500, 3000];

  const formatThousands = (val: string) => {
    if (!val) return '';
    return val.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-4 pb-6">
      {/* Header */}
      <header className="settings-item flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
            Perfil & Preferencias
          </span>
          <h1 
            className="text-lg font-black tracking-tight"
            style={{ color: '#1a1e24' }}
          >
            Ajustes ⚙️
          </h1>
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

      {/* Perfil & Nube (Blanco Pastel, Verde Pastel, Beige) */}
      <div 
        className="settings-item p-4 rounded-3xl mobile-card-shadow flex flex-col gap-3.5" 
        style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
      >
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-2xl bg-[#4eba87] flex items-center justify-center text-2xl shadow-xs overflow-hidden relative group transition-transform active:scale-95 flex-shrink-0"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>👤</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs">📸</span>
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
                  className="bg-transparent border-b-2 border-[#4eba87] text-base font-black outline-none w-full pb-0.5"
                  style={{ color: '#1a1e24' }}
                  autoFocus
                  onBlur={handleNameSave}
                  onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-black truncate" style={{ color: '#1a1e24' }}>
                    {profile?.name || (user?.email?.split('@')[0] ?? 'Usuario')}
                  </h2>
                  <button 
                    onClick={() => setIsEditingProfile(true)} 
                    className="text-[#4eba87] text-xs hover:scale-110 transition-transform"
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

        {/* Cloud Sync Status */}
        <div 
          className="pt-2.5 border-t flex items-center justify-between"
          style={{ borderColor: '#f0ebe1' }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-7 h-7 rounded-xl flex items-center justify-center text-xs"
              style={{
                background: user ? '#e8f5ee' : '#f7f4ee',
                color: user ? '#1d5f3f' : '#706453',
              }}
            >
              {user ? '☁️' : '💾'}
            </div>
            <div>
              <div className="text-xs font-bold" style={{ color: '#1a1e24' }}>
                {user ? 'Sincronizado en Supabase' : 'Almacenamiento Local'}
              </div>
              <div className="text-[10px]" style={{ color: secondaryText }}>
                {user ? 'Datos respaldados en la nube' : 'Inicia sesión para sincronizar'}
              </div>
            </div>
          </div>

          {user ? (
            <button
              onClick={async () => {
                await signOut();
                toast('Sesión cerrada', 'info');
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-bold text-[#c2410c] hover:bg-[#fff0e6] transition-all"
            >
              Cerrar sesión
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-3 py-1 rounded-xl text-xs font-bold bg-[#3BA676] hover:bg-[#339468] text-white shadow-xs transition-all active:scale-95"
            >
              Conectar
            </button>
          )}
        </div>
      </div>

      {/* Metas Nutricionales */}
      <section className="settings-item flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
            Metas Nutricionales
          </span>
          <button
            type="button"
            onClick={() => onOpenSetup?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black transition-all duration-200 active:scale-95 shadow-2xs hover:opacity-90"
            style={{
              background: '#DDF0E4',
              border: '1.5px solid #BEDECB',
              color: '#164E35',
            }}
          >
            <span className="text-xs">⚡</span>
            <span>Asistente TMB</span>
            <span className="text-[10px] opacity-70">➔</span>
          </button>
        </div>

        <div 
          className="p-4 rounded-3xl mobile-card-shadow flex flex-col gap-3" 
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
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {CALORIE_PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => setCalorieGoal(String(p))}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all active:scale-95"
                  style={{
                    background: calorieGoal === String(p) ? '#3ba676' : '#efe9dc',
                    color: calorieGoal === String(p) ? '#ffffff' : '#5c5245',
                    border: '1px solid #e0d5c3',
                  }}
                >
                  {formatThousands(String(p))}
                </button>
              ))}
            </div>
          </div>

          {/* Fila: Meta de Proteína y Peso Corporal en la misma línea */}
          <div className="grid grid-cols-2 gap-3">
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
          </div>

          {/* Botón Guardar Cambios en verde pastel mate */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 mt-1"
            style={{
              background: '#3ba676',
              border: '1.5px solid #339468',
              color: '#ffffff',
            }}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>✓</span>
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Precisión Científica (Beige & Verde Pastel) */}
      <section className="settings-item">
        <div
          className="rounded-3xl p-4 flex flex-col gap-2 mobile-card-shadow"
          style={{ 
            background: '#f7f4ee',
            border: '1px solid #e9e4d8'
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🧬</span>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#1d5f3f] dark:text-[#6ee7b7]">
                Estándar Stanford
              </span>
              <h3 className="text-xs font-black" style={{ color: '#1a1e24' }}>
                Precisión METs
              </h3>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-[#706453] dark:text-slate-300">
            Calorías calculadas con base en tu peso de <span className="font-bold">{weight}kg</span>.
          </p>
        </div>
      </section>
    </div>
  );
}
