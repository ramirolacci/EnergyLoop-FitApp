import { useState } from 'react';
import type { ExerciseEntry } from '../lib/types';
import { useApp } from '../context/AppContext';
import { CATEGORY_LABELS } from '../lib/exercises';
import { formatNumber } from '../lib/calculations';

const INTENSITY_LABELS: Record<string, string> = { low: 'Suave', medium: 'Media', high: 'Intensa' };

interface Props {
  entry: ExerciseEntry;
  theme: 'light' | 'dark';
}

export function ExerciseCard({ entry, theme }: Props) {
  const { deleteExerciseEntry, toast } = useApp();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteExerciseEntry(entry.id);
    toast('Ejercicio eliminado', 'info');
    setDeleting(false);
  }

  const surfaceColor = theme === 'dark' ? '#181b22' : '#ffffff';
  const borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#f0ebe1';
  const secondaryText = theme === 'dark' ? '#94a3b8' : '#78716c';
  const timeStr = new Date(entry.logged_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="rounded-2xl p-3 flex items-center gap-3 mobile-card-shadow active-press transition-all"
      style={{
        background: surfaceColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Icon Badge - Naranja Pastel */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg shadow-xs"
        style={{
          background: theme === 'dark' 
            ? 'rgba(251, 164, 113, 0.15)' 
            : '#fff0e6',
          border: `1px solid ${theme === 'dark' ? 'rgba(251, 164, 113, 0.3)' : '#fed7aa'}`,
        }}
      >
        {entry.icon || '🏃'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span 
            className="font-bold text-sm truncate"
            style={{ color: theme === 'dark' ? '#f8fafc' : '#1a1e24' }}
          >
            {entry.name}
          </span>
          <span 
            className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md"
            style={{
              background: theme === 'dark' ? 'rgba(251, 164, 113, 0.2)' : '#fff0e6',
              color: theme === 'dark' ? '#fdba74' : '#c2410c',
            }}
          >
            {INTENSITY_LABELS[entry.intensity] || 'Normal'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-medium" style={{ color: secondaryText }}>
            {timeStr}
          </span>
          <span className="text-[10px] opacity-30">·</span>
          <span className="text-[10px] font-bold" style={{ color: theme === 'dark' ? '#cbd5e1' : '#475569' }}>
            {entry.duration_minutes} min
          </span>
          {CATEGORY_LABELS[entry.category] && (
            <>
              <span className="text-[10px] opacity-30">·</span>
              <span className="text-[10px] font-medium opacity-70" style={{ color: secondaryText }}>
                {CATEGORY_LABELS[entry.category]}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Calories Burned & Delete */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <div 
            className="text-sm font-black leading-none text-[#ea580c] dark:text-[#fdba74]"
          >
            -{formatNumber(entry.calories_burned)}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider opacity-60" style={{ color: secondaryText }}>
            kcal
          </span>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-7 h-7 rounded-full flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity active:scale-90"
          style={{ 
            color: '#ef4444', 
            background: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2' 
          }}
          title="Eliminar registro"
        >
          {deleting ? '⏳' : '×'}
        </button>
      </div>
    </div>
  );
}
