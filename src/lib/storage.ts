import type { FoodEntry, ExerciseEntry, UserProfile } from './types';
import { getDateString } from './calculations';

const KEYS = {
  PROFILE: 'calorapp_profile',
  FOODS: 'calorapp_foods',
  EXERCISES: 'calorapp_exercises',
};

// Default profile for new users - initialized as empty to force configuration
const DEFAULT_PROFILE: UserProfile = {
  id: 'local-user',
  daily_calorie_goal: 0,
  daily_protein_goal: 0,
  weight_kg: 0,
  theme: 'dark',
};

export const storage = {
  getProfile: (): UserProfile => {
    const saved = localStorage.getItem(KEYS.PROFILE);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    return DEFAULT_PROFILE;
  },

  updateProfile: (data: Partial<UserProfile>): UserProfile => {
    const current = storage.getProfile();
    const updated = { ...current, ...data };
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  getFoods: (date?: string): FoodEntry[] => {
    const all = JSON.parse(localStorage.getItem(KEYS.FOODS) || '[]');
    if (!date) return all;
    return all.filter((f: FoodEntry) => f.logged_at.startsWith(date));
  },

  addFood: (entry: Omit<FoodEntry, 'id' | 'created_at'>): FoodEntry => {
    const all = storage.getFoods();
    const newEntry: FoodEntry = {
      ...entry,
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.FOODS, JSON.stringify([newEntry, ...all]));
    return newEntry;
  },

  updateFood: (id: string, data: Partial<FoodEntry>): void => {
    const all = storage.getFoods();
    const updated = all.map(f => f.id === id ? { ...f, ...data } : f);
    localStorage.setItem(KEYS.FOODS, JSON.stringify(updated));
  },

  deleteFood: (id: string): void => {
    const all = storage.getFoods();
    const filtered = all.filter(f => f.id !== id);
    localStorage.setItem(KEYS.FOODS, JSON.stringify(filtered));
  },

  getExercises: (date?: string): ExerciseEntry[] => {
    const all = JSON.parse(localStorage.getItem(KEYS.EXERCISES) || '[]');
    if (!date) return all;
    return all.filter((e: ExerciseEntry) => e.logged_at.startsWith(date));
  },

  addExercise: (entry: Omit<ExerciseEntry, 'id' | 'created_at'>): ExerciseEntry => {
    const all = storage.getExercises();
    const newEntry: ExerciseEntry = {
      ...entry,
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.EXERCISES, JSON.stringify([newEntry, ...all]));
    return newEntry;
  },

  updateExercise: (id: string, data: Partial<ExerciseEntry>): void => {
    const all = storage.getExercises();
    const updated = all.map(e => e.id === id ? { ...e, ...data } : e);
    localStorage.setItem(KEYS.EXERCISES, JSON.stringify(updated));
  },

  deleteExercise: (id: string): void => {
    const all = storage.getExercises();
    const filtered = all.filter(e => e.id !== id);
    localStorage.setItem(KEYS.EXERCISES, JSON.stringify(filtered));
  },

  getRecentFoods: (limit: number = 10): FoodEntry[] => {
    const all = storage.getFoods();
    // Unique by name, take the most recent ones
    const seen = new Set();
    const recent: FoodEntry[] = [];
    for (const f of all) {
      if (!seen.has(f.name.toLowerCase())) {
        seen.add(f.name.toLowerCase());
        recent.push(f);
      }
      if (recent.length >= limit) break;
    }
    return recent;
  },

  getRecentExercises: (limit: number = 6): ExerciseEntry[] => {
    const all = storage.getExercises();
    const seen = new Set();
    const recent: ExerciseEntry[] = [];
    for (const e of all) {
      if (!seen.has(e.name.toLowerCase())) {
        seen.add(e.name.toLowerCase());
        recent.push(e);
      }
      if (recent.length >= limit) break;
    }
    return recent;
  },

  getStatsByRange: (days: number = 7) => {
    const foods = storage.getFoods();
    const exercises = storage.getExercises();
    const stats: Record<string, { consumed: number; burned: number; protein: number }> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getDateString(d);
      stats[dateStr] = { consumed: 0, burned: 0, protein: 0 };
    }

    foods.forEach(f => {
      const date = f.logged_at.split('T')[0];
      if (stats[date]) {
        stats[date].consumed += f.calories;
        stats[date].protein += f.protein_g;
      }
    });

    exercises.forEach(e => {
      const date = e.logged_at.split('T')[0];
      if (stats[date]) {
        stats[date].burned += e.calories_burned;
      }
    });

    return stats;
  }
};
