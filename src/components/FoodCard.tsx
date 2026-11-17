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
      {/* Icon Badge */}
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-xs"
        style={{
          background: theme === 'dark' 
            ? 'rgba(52, 211, 153, 0.12)' 
            : '#ecfdf5',
          border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#d1fae5'}`,
        }}
      >
        {entry.icon || (entry.source === 'scan' ? '📷' : '🥗')}
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
          {entry.scan_confidence !== null && entry.scan_confidence !== undefined && (
            <span 
              className="text-[10px] font-bold px-1.5 py-0.2 rounded-md"
              style={{
                background: theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#d1fae5',
                color: theme === 'dark' ? '#6ee7b7' : '#047857'
              }}
            >
              IA {formatNumber(entry.scan_confidence * 100, 0)}%
            </span>
          )}
        </div>

        {/* Pastel Macros Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium" style={{ color: secondaryText }}>
            {timeStr}
          </span>
          <span className="text-[11px] opacity-30">·</span>
          {entry.protein_g > 0 && (
            <span 
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{
                background: theme === 'dark' ? 'rgba(255, 133, 150, 0.15)' : '#fff1f2',
                color: theme === 'dark' ? '#fda4af' : '#e11d48',
              }}
            >
              {formatNumber(entry.protein_g, 0)}g P
            </span>
          )}
          {entry.carbs_g > 0 && (
            <span 
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{
                background: theme === 'dark' ? 'rgba(251, 191, 36, 0.15)' : '#fefce8',
                color: theme === 'dark' ? '#fde68a' : '#b45309',
              }}
            >
              {formatNumber(entry.carbs_g, 0)}g C
            </span>
          )}
          {entry.fat_g > 0 && (
            <span 
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{
                background: theme === 'dark' ? 'rgba(129, 140, 248, 0.15)' : '#eff6ff',
                color: theme === 'dark' ? '#bfdbfe' : '#2563eb',
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
            className="text-base font-black leading-none"
            style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}
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
