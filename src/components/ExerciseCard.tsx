import { useState } from 'react';
import { PButtonPure, PTag, PText } from '@porsche-design-system/components-react';
import type { ExerciseEntry } from '../lib/types';
import { useApp } from '../context/AppContext';
import { CATEGORY_LABELS } from '../lib/exercises';
import { formatNumber } from '../lib/calculations';

const INTENSITY_LABELS: Record<string, string> = { low: 'Baja', medium: 'Media', high: 'Alta' };
const INTENSITY_COLORS: Record<string, 'info' | 'warning' | 'error'> = { low: 'info', medium: 'warning', high: 'error' };


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
    toast('Ejercicio eliminado', 'success');
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
        style={{ background: theme === 'dark' ? '#1a2a1c' : '#edf7ee' }}
      >
        {entry.icon || '🏋️'}
      </div>


      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <PText weight="semi-bold" size="small" theme={theme} className="truncate">
            {entry.name}
          </PText>
          <PTag compact variant={INTENSITY_COLORS[entry.intensity]} theme={theme}>
            {INTENSITY_LABELS[entry.intensity]}
          </PTag>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
            {timeStr}
          </PText>
          <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
            {CATEGORY_LABELS[entry.category]}
          </PText>
          <PText size="xx-small" theme={theme} style={{ color: theme === 'dark' ? '#afb0b3' : '#535457' }}>
            {entry.duration_minutes} min
          </PText>
        </div>
      </div>

      {/* Calories burned + delete */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <PText weight="semi-bold" theme={theme} style={{ color: '#018a16' }}>
          -{formatNumber(entry.calories_burned)}
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
