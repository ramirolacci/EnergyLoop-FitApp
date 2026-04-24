import { useState } from 'react';
import { PButtonPure, PTag, PText } from '@porsche-design-system/components-react';
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
    toast('Comida eliminada', 'success');
    setDeleting(false);
  }

  const surfaceColor = theme === 'dark' ? '#212225' : '#fff';
  const borderColor = theme === 'dark' ? '#2a2a2e' : '#d8d8db';
  const timeStr = new Date(entry.logged_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="rounded-xl p-3 flex items-center gap-3"
      style={{
        background: surfaceColor,
        border: `1px solid ${borderColor}`,
        boxShadow: theme === 'dark' ? 'none' : '0px 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
        style={{ background: theme === 'dark' ? '#2a2a2e' : '#f5f5f8' }}
      >
        {entry.source === 'scan' ? '📷' : '🍽️'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <PText weight="semi-bold" size="small" theme={theme} className="truncate">
            {entry.name}
          </PText>
          {entry.scan_confidence !== null && entry.scan_confidence !== undefined && (
            <PTag compact variant={entry.scan_confidence >= 0.8 ? 'success' : 'warning'} theme={theme}>
              {formatNumber(entry.scan_confidence * 100, 0)}%
            </PTag>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
            {timeStr}
          </PText>
          {entry.protein_g > 0 && (
            <PText size="xx-small" theme={theme} style={{ color: '#ff6b00' }}>
              P: {formatNumber(entry.protein_g, 1)}g
            </PText>
          )}
          {entry.carbs_g > 0 && (
            <PText size="xx-small" theme={theme} style={{ color: '#0076ff' }}>
              C: {formatNumber(entry.carbs_g, 1)}g
            </PText>
          )}
          {entry.fat_g > 0 && (
            <PText size="xx-small" theme={theme} style={{ color: '#b8960c' }}>
              G: {formatNumber(entry.fat_g, 1)}g
            </PText>
          )}
        </div>
      </div>

      {/* Calories + delete */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <PText weight="semi-bold" theme={theme}>
          {formatNumber(entry.calories)}
        </PText>
        <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
          kcal
        </PText>
        <PButtonPure
          size="x-small"
          icon="delete"
          hideLabel
          theme={theme}
          onClick={handleDelete}
          loading={deleting}
          aria={{ 'aria-label': 'Eliminar' }}
        >
          Eliminar
        </PButtonPure>
      </div>
    </div>
  );
}
