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

  const surfaceColor = theme === 'dark' ? '#171922' : '#ffffff';
  const borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
  const secondaryText = theme === 'dark' ? '#94a3b8' : '#64748b';
  const timeStr = new Date(entry.logged_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="rounded-2xl p-3.5 flex items-center gap-3.5 mobile-card-shadow active-press transition-all"
      style={{
        background: surfaceColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Icon Badge - Pastel Mandarina */}
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-xs"
        style={{
          background: theme === 'dark' 
            ? 'rgba(251, 146, 60, 0.12)' 
            : '#fff7ed',
          border: `1px solid ${theme === 'dark' ? 'rgba(251, 146, 60, 0.2)' : '#ffedd5'}`,
        }}
      >
        {entry.icon || '🏃'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span 
            className="font-bold text-sm truncate"
            style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}
          >
            {entry.name}
          </span>
          <span 
            className="text-[10px] font-bold px-1.5 py-0.2 rounded-md"
            style={{
              background: theme === 'dark' ? 'rgba(251, 146, 60, 0.15)' : '#ffedd5',
              color: theme === 'dark' ? '#fed7aa' : '#c2410c',
            }}
          >
            {INTENSITY_LABELS[entry.intensity] || 'Normal'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium" style={{ color: secondaryText }}>
            {timeStr}
          </span>
          <span className="text-[11px] opacity-30">·</span>
          <span className="text-[11px] font-bold" style={{ color: theme === 'dark' ? '#cbd5e1' : '#475569' }}>
            {entry.duration_minutes} min
          </span>
          {CATEGORY_LABELS[entry.category] && (
            <>
              <span className="text-[11px] opacity-30">·</span>
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
            className="text-base font-black leading-none text-[#ea580c] dark:text-[#fb923c]"
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
          className="w-8 h-8 rounded-full flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity active:scale-90"
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
