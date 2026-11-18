import { useState } from 'react';
import type { FoodEntry } from '../lib/types';
import { useApp } from '../context/AppContext';
import { formatNumber } from '../lib/calculations';

interface Props {
  entry: FoodEntry;
  theme: 'light' | 'dark';
}

export function FoodCard({ entry, theme }: Props) {
  const { deleteFoodEntry, toast } = useApp();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteFoodEntry(entry.id);
    toast('Comida eliminada', 'info');
    setDeleting(false);
  }

  const surfaceColor = '#ffffff';
  const borderColor = '#f0ebe1';
  const secondaryText = '#706453';
  const timeStr = new Date(entry.logged_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="rounded-2xl p-3 flex items-center gap-3 mobile-card-shadow active-press transition-all"
      style={{
        background: surfaceColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Icon Badge - Verde Pastel Suave */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg shadow-xs"
        style={{
          background: '#e8f5ee',
          border: '1px solid #b7e4ce',
        }}
      >
        {entry.icon || (entry.source === 'scan' ? '📷' : '🥗')}
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
          {entry.scan_confidence !== null && entry.scan_confidence !== undefined && (
            <span 
              className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md"
              style={{
                background: theme === 'dark' ? 'rgba(78, 186, 135, 0.2)' : '#e8f5ee',
                color: theme === 'dark' ? '#6ee7b7' : '#1d5f3f'
              }}
            >
              IA {formatNumber(entry.scan_confidence * 100, 0)}%
            </span>
          )}
        </div>

        {/* Chips en la gama pastel solicitada */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-medium" style={{ color: secondaryText }}>
            {timeStr}
          </span>
          <span className="text-[10px] opacity-30">·</span>
          {/* Proteína - Naranja pastel */}
          {entry.protein_g > 0 && (
            <span 
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
              style={{
                background: theme === 'dark' ? 'rgba(251, 164, 113, 0.15)' : '#fff0e6',
                color: theme === 'dark' ? '#fdba74' : '#c2410c',
              }}
            >
              {formatNumber(entry.protein_g, 0)}g P
            </span>
          )}
          {/* Carbos - Beige pastel */}
          {entry.carbs_g > 0 && (
            <span 
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
              style={{
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f7f4ee',
                color: theme === 'dark' ? '#cbd5e1' : '#706453',
              }}
            >
              {formatNumber(entry.carbs_g, 0)}g C
            </span>
          )}
          {/* Grasas - Celeste pastel */}
          {entry.fat_g > 0 && (
            <span 
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
              style={{
                background: theme === 'dark' ? 'rgba(126, 200, 227, 0.15)' : '#e1f5fe',
                color: theme === 'dark' ? '#93c5fd' : '#0277bd',
              }}
            >
              {formatNumber(entry.fat_g, 0)}g G
            </span>
          )}
        </div>
      </div>

      {/* Calories & Delete */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <div 
            className="text-sm font-black leading-none"
            style={{ color: theme === 'dark' ? '#f8fafc' : '#1a1e24' }}
          >
            {formatNumber(entry.calories)}
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
