import { useState, useMemo } from 'react';
import {
  PModal, PHeading, PButton, PText, PInlineNotification, PButtonPure
} from '@porsche-design-system/components-react';
import { useApp } from '../context/AppContext';
import { recalcFoodEntry } from '../lib/calculations';
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
  const { addFoodEntry, theme } = useApp();
  const [step, setStep] = useState<'search' | 'form'>(prefill ? 'form' : 'search');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const recentFoods = useMemo(() => storage.getRecentFoods(5), [open]);
  
  const filteredLibrary = useMemo(() => {
    if (!search) return [];
    const s = search.toLowerCase();
    return COMMON_FOODS.filter(f => f.name.toLowerCase().includes(s));
  }, [search]);

  const calPerServing = parseFloat(form.calories_per_serving) || 0;
  const servingsConsumed = parseFloat(form.servings_consumed) || 1;
  const servingsPerPackage = parseFloat(form.servings_per_package) || 1;
  const proteinPerServing = parseFloat(form.protein_per_serving) || 0;
  const carbsPerServing = parseFloat(form.carbs_per_serving) || 0;
  const fatPerServing = parseFloat(form.fat_per_serving) || 0;
  const sodiumPerServing = parseFloat(form.sodium_per_serving) || 0;

  const totalCalConsumed = Math.round(calPerServing * servingsConsumed);
  const computed = recalcFoodEntry(calPerServing, servingsConsumed, proteinPerServing, carbsPerServing, fatPerServing, sodiumPerServing);

  function update(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  }

  function handleSelectFromLibrary(item: any) {
    setForm({
      name: item.name,
      calories_per_serving: String(item.calories_per_serving),
      protein_per_serving: String(item.protein_g ?? 0),
      carbs_per_serving: String(item.carbs_g ?? 0),
      fat_per_serving: String(item.fat_g ?? 0),
      sodium_per_serving: String(item.sodium_mg ?? 0),
      serving_size_g: String(item.serving_size_g ?? 100),
      servings_per_package: String(item.servings_per_package ?? 1),
      servings_consumed: '1',
    });
    setStep('form');
  }

  function handleDismiss() {
    setForm({
      name: '', calories_per_serving: '', protein_per_serving: '0',
      carbs_per_serving: '0', fat_per_serving: '0', sodium_per_serving: '0',
      serving_size_g: '100', servings_per_package: '1', servings_consumed: '1',
    });
    setError('');
    setSearch('');
    setStep(prefill ? 'form' : 'search');
    onDismiss();
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Ingresá un nombre'); return; }
    if (!form.calories_per_serving || calPerServing <= 0) { setError('Ingresá las calorías'); return; }

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
      icon: form.name ? (COMMON_FOODS.find(f => f.name === form.name)?.icon ?? null) : null,
      notes: '',
    });
    setSaving(false);
    handleDismiss();
  }

  const surfaceColor = theme === 'dark' ? '#212225' : '#f5f5f8';
  const borderColor = theme === 'dark' ? '#2a2a2e' : '#d8d8db';
  const inputCls = `w-full rounded-xl px-4 py-3 text-sm outline-none transition-all ${
    theme === 'dark'
      ? 'bg-[#1a1a1e] border border-[#2a2a2e] text-[#fbfcff] focus:border-[#535457] focus:bg-[#212225]'
      : 'bg-white border border-[#d8d8db] text-[#010205] focus:border-[#afb0b3] focus:shadow-sm'
  }`;

  const labelCls = `text-xs font-bold mb-1.5 ml-1 block ${theme === 'dark' ? 'text-[#afb0b3]' : 'text-[#535457]'}`;

  return (
    <PModal
      open={open}
      onDismiss={handleDismiss}
      theme={theme}
      fullscreen={{ base: true, s: false }}
    >
      <PHeading slot="header" size="medium" tag="h2" theme={theme}>
        {step === 'search' ? '¿Qué comiste?' : 'Detalles de la comida'}
      </PHeading>

      <div className="flex flex-col gap-5 py-2">
        {step === 'search' && (
          <>
            {/* Search Input */}
            <div className="relative">
              <input
                className={inputCls}
                placeholder="Buscar alimento o agregar nuevo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                >
                  <PButtonPure icon="close" hideLabel theme={theme}>Borrar</PButtonPure>
                </button>
              )}
            </div>

            {/* Results */}
            <div className="flex flex-col gap-4">
              {search && (
                <div>
                  <PText size="xx-small" weight="semi-bold" theme={theme} style={{ marginBottom: 8, color: '#018a16' }}>RESULTADOS</PText>
                  <div className="flex flex-col gap-2">
                    {filteredLibrary.length > 0 ? filteredLibrary.map(f => (
                      <button
                        key={f.name}
                        onClick={() => handleSelectFromLibrary(f)}
                        className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all hover:scale-[1.02]"
                        style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
                      >
                        <span className="text-2xl">{f.icon}</span>
                        <div className="flex-1">
                          <PText size="small" weight="semi-bold" theme={theme}>{f.name}</PText>
                          <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                            {f.calories_per_serving} kcal · {f.protein_g}g P
                          </PText>
                        </div>
                        <PButtonPure icon="add" hideLabel theme={theme} />
                      </button>
                    )) : (
                      <button
                        onClick={() => { update('name', search); setStep('form'); }}
                        className="flex items-center gap-3 p-4 rounded-2xl text-left border-2 border-dashed border-[#018a16]"
                      >
                        <span className="text-2xl">➕</span>
                        <div className="flex-1">
                          <PText size="small" weight="semi-bold" theme={theme}>Agregar "{search}" manualmente</PText>
                          <PText size="xx-small" theme={theme}>Presioná para completar los datos</PText>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!search && recentFoods.length > 0 && (
                <div>
                  <PText size="xx-small" weight="semi-bold" theme={theme} style={{ marginBottom: 8, color: theme === 'dark' ? '#afb0b3' : '#535457' }}>RECIENTES</PText>
                  <div className="flex flex-col gap-2">
                    {recentFoods.map(f => (
                      <button
                        key={f.id}
                        onClick={() => handleSelectFromLibrary(f)}
                        className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                        style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
                      >
                        <span className="text-xl">🕒</span>
                        <div className="flex-1">
                          <PText size="small" weight="semi-bold" theme={theme}>{f.name}</PText>
                          <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
                            {f.calories_per_serving} kcal · {f.protein_g}g P
                          </PText>
                        </div>
                        <PButtonPure icon="add" hideLabel theme={theme} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!search && (
                <div>
                  <PText size="xx-small" weight="semi-bold" theme={theme} style={{ marginBottom: 8, color: theme === 'dark' ? '#afb0b3' : '#535457' }}>COMUNES</PText>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_FOODS.slice(0, 6).map(f => (
                      <button
                        key={f.name}
                        onClick={() => handleSelectFromLibrary(f)}
                        className="flex flex-col items-center gap-1 p-3 rounded-2xl text-center transition-all"
                        style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}
                      >
                        <span className="text-2xl">{f.icon}</span>
                        <PText size="xx-small" weight="bold" theme={theme}>{f.name}</PText>
                        <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>{f.calories_per_serving} kcal</PText>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {step === 'form' && (
          <>
            {error && <PInlineNotification state="error" description={error} theme={theme} />}

            {/* Name & Calories Main Card */}
            <div className="rounded-2xl p-4 flex flex-col gap-4 shadow-sm" style={{ background: surfaceColor, border: `1px solid ${borderColor}` }}>
              <div>
                <label className={labelCls}>Nombre del alimento</label>
                <input
                  className={inputCls}
                  placeholder="Ej: Avena..."
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Calorías/porción</label>
                  <input
                    className={inputCls}
                    type="number"
                    inputMode="decimal"
                    placeholder="120"
                    value={form.calories_per_serving}
                    onChange={e => update('calories_per_serving', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Gramos/porción</label>
                  <input
                    className={inputCls}
                    type="number"
                    inputMode="numeric"
                    placeholder="100"
                    value={form.serving_size_g}
                    onChange={e => update('serving_size_g', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Portions Quick Selection */}
            <div>
              <label className={labelCls}>Porciones consumidas</label>
              <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                {[0.5, 1, 1.5, 2].map(v => (
                  <button
                    key={v}
                    onClick={() => update('servings_consumed', String(v))}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex-1"
                    style={{
                      background: form.servings_consumed === String(v) ? (theme === 'dark' ? '#fbfcff' : '#010205') : surfaceColor,
                      color: form.servings_consumed === String(v) ? (theme === 'dark' ? '#010205' : '#fbfcff') : (theme === 'dark' ? '#afb0b3' : '#535457'),
                      border: `1px solid ${form.servings_consumed === String(v) ? 'transparent' : borderColor}`,
                    }}
                  >
                    {v === 1 ? '1 porción' : `${v} porciones`}
                  </button>
                ))}
              </div>
              <input
                className={inputCls}
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="Cantidad manual..."
                value={form.servings_consumed}
                onChange={e => update('servings_consumed', e.target.value)}
              />
            </div>

            {/* Advanced Toggle */}
            <PButtonPure 
              icon={showAdvanced ? 'arrow-up' : 'arrow-down'} 
              theme={theme} 
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Ocultar macros' : 'Agregar proteínas, carbos y grasas'}
            </PButtonPure>

            {showAdvanced && (
              <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className={labelCls}>Proteína (g)</label>
                  <input className={inputCls} type="number" step="0.1" value={form.protein_per_serving} onChange={e => update('protein_per_serving', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Carbos (g)</label>
                  <input className={inputCls} type="number" step="0.1" value={form.carbs_per_serving} onChange={e => update('carbs_per_serving', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Grasa (g)</label>
                  <input className={inputCls} type="number" step="0.1" value={form.fat_per_serving} onChange={e => update('fat_per_serving', e.target.value)} />
                </div>
              </div>
            )}

            {/* Summary Banner */}
            <div className="rounded-2xl p-4 flex items-center justify-between mt-2" style={{ background: '#018a16', color: '#fff' }}>
              <div>
                <PText size="xx-small" weight="bold" style={{ color: 'rgba(255,255,255,0.7)' }}>TOTAL A REGISTRAR</PText>
                <PText size="large" weight="bold" style={{ color: '#fff' }}>{totalCalConsumed} kcal</PText>
              </div>
              <div className="text-right">
                <PText size="xx-small" weight="bold" style={{ color: 'rgba(255,255,255,0.7)' }}>PROTEÍNA</PText>
                <PText size="medium" weight="bold" style={{ color: '#fff' }}>{computed.protein_g}g</PText>
              </div>
            </div>
          </>
        )}
      </div>

      <div slot="footer" className="flex gap-2">
        {step === 'form' && (
          <PButton variant="primary" onClick={handleSave} loading={saving} icon="check" theme={theme}>
            Guardar
          </PButton>
        )}
        {step === 'form' && !prefill && (
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

