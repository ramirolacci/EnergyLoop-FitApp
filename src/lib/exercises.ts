export interface ExerciseTemplate {
  name: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  metLow: number;
  metMedium: number;
  metHigh: number;
  icon: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
  cardio: 'Cardio',
  strength: 'Fuerza',
  flexibility: 'Flexibilidad',
  sports: 'Deportes',
  other: 'Otros',
};

export const EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  { name: 'Caminata', category: 'cardio', metLow: 2.5, metMedium: 3.5, metHigh: 4.5, icon: '🚶' },
  { name: 'Correr', category: 'cardio', metLow: 7.0, metMedium: 9.0, metHigh: 12.0, icon: '🏃' },
  { name: 'Ciclismo', category: 'cardio', metLow: 4.0, metMedium: 7.5, metHigh: 10.0, icon: '🚲' },
  { name: 'Natación', category: 'cardio', metLow: 5.0, metMedium: 7.0, metHigh: 9.0, icon: '🏊' },
  { name: 'Pesas / Fuerza', category: 'strength', metLow: 3.0, metMedium: 5.0, metHigh: 7.0, icon: '🏋️' },
  { name: 'HIIT / Crossfit', category: 'strength', metLow: 6.0, metMedium: 8.0, metHigh: 11.0, icon: '🔥' },
  { name: 'Yoga', category: 'flexibility', metLow: 2.0, metMedium: 2.5, metHigh: 3.5, icon: '🧘' },
  { name: 'Pilates', category: 'flexibility', metLow: 2.5, metMedium: 3.0, metHigh: 4.0, icon: '🤸' },
  { name: 'Fútbol', category: 'sports', metLow: 5.0, metMedium: 7.0, metHigh: 9.0, icon: '⚽' },
  { name: 'Básquet', category: 'sports', metLow: 4.5, metMedium: 6.5, metHigh: 8.5, icon: '🏀' },
  { name: 'Tenis', category: 'sports', metLow: 5.0, metMedium: 7.3, metHigh: 9.5, icon: '🎾' },
  { name: 'Boxeo', category: 'sports', metLow: 7.0, metMedium: 9.0, metHigh: 12.0, icon: '🥊' },
];


export function getMET(template: ExerciseTemplate, intensity: 'low' | 'medium' | 'high'): number {
  if (intensity === 'low') return template.metLow;
  if (intensity === 'high') return template.metHigh;
  return template.metMedium;
}
