import type { FoodEntry, ExerciseEntry, UserProfile } from './types';
import { supabase } from './supabase';

const KEYS = {
  PROFILE: 'calorapp_profile',
  FOODS: 'calorapp_foods',
  EXERCISES: 'calorapp_exercises',
};

// Perfil por defecto
const DEFAULT_PROFILE: UserProfile = {
  id: 'local-user',
  daily_calorie_goal: 0,
  daily_protein_goal: 0,
  weight_kg: 0,
  theme: 'light',
};

export const storage = {
  // ==========================================
  // PERFIL DE USUARIO
  // ==========================================
  getProfile: (): UserProfile => {
    try {
      const saved = localStorage.getItem(KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    return DEFAULT_PROFILE;
  },

  updateProfile: async (data: Partial<UserProfile>, userId?: string): Promise<UserProfile> => {
    const current = storage.getProfile();
    const updated: UserProfile = { ...current, ...data };
    if (userId) updated.id = userId;
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(updated));

    if (userId) {
      try {
        await supabase.from('user_profile').upsert({
          id: userId,
          name: updated.name ?? null,
          avatar: updated.avatar ?? null,
          daily_calorie_goal: updated.daily_calorie_goal,
          daily_protein_goal: updated.daily_protein_goal,
          weight_kg: updated.weight_kg,
          theme: updated.theme,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error sincronizando perfil con Supabase:', err);
      }
    }

    return updated;
  },

  // ==========================================
  // COMIDAS
  // ==========================================
  getFoods: (date?: string): FoodEntry[] => {
    try {
      const all: FoodEntry[] = JSON.parse(localStorage.getItem(KEYS.FOODS) || '[]');
      if (!date) return all;
      return all.filter((f: FoodEntry) => f.logged_at.startsWith(date));
    } catch {
      return [];
    }
  },

  addFood: async (entry: Omit<FoodEntry, 'id' | 'created_at'>, userId?: string): Promise<FoodEntry> => {
    const all = storage.getFoods();
    const newEntry: FoodEntry = {
      ...entry,
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(KEYS.FOODS, JSON.stringify([newEntry, ...all]));

    if (userId) {
      try {
        await supabase.from('food_entries').insert({
          id: newEntry.id,
          user_id: userId,
          logged_at: newEntry.logged_at,
          name: newEntry.name,
          calories: newEntry.calories,
          protein_g: newEntry.protein_g,
          carbs_g: newEntry.carbs_g,
          fat_g: newEntry.fat_g,
          sodium_mg: newEntry.sodium_mg,
          serving_size_g: newEntry.serving_size_g,
          servings_per_package: newEntry.servings_per_package,
          servings_consumed: newEntry.servings_consumed,
          calories_per_serving: newEntry.calories_per_serving,
          scan_confidence: newEntry.scan_confidence,
          source: newEntry.source,
          icon: newEntry.icon,
          notes: newEntry.notes,
        });
      } catch (err) {
        console.error('Error guardando comida en Supabase:', err);
      }
    }

    return newEntry;
  },

  updateFood: async (id: string, data: Partial<FoodEntry>, userId?: string): Promise<void> => {
    const all = storage.getFoods();
    const updated = all.map(f => f.id === id ? { ...f, ...data } : f);
    localStorage.setItem(KEYS.FOODS, JSON.stringify(updated));

    if (userId) {
      try {
        await supabase.from('food_entries').update({
          ...data,
        }).eq('id', id).eq('user_id', userId);
      } catch (err) {
        console.error('Error actualizando comida en Supabase:', err);
      }
    }
  },

  deleteFood: async (id: string, userId?: string): Promise<void> => {
    const all = storage.getFoods();
    const filtered = all.filter(f => f.id !== id);
    localStorage.setItem(KEYS.FOODS, JSON.stringify(filtered));

    if (userId) {
      try {
        await supabase.from('food_entries').delete().eq('id', id).eq('user_id', userId);
      } catch (err) {
        console.error('Error eliminando comida en Supabase:', err);
      }
    }
  },

  // ==========================================
  // EJERCICIOS
  // ==========================================
  getExercises: (date?: string): ExerciseEntry[] => {
    try {
      const all: ExerciseEntry[] = JSON.parse(localStorage.getItem(KEYS.EXERCISES) || '[]');
      if (!date) return all;
      return all.filter((e: ExerciseEntry) => e.logged_at.startsWith(date));
    } catch {
      return [];
    }
  },

  addExercise: async (entry: Omit<ExerciseEntry, 'id' | 'created_at'>, userId?: string): Promise<ExerciseEntry> => {
    const all = storage.getExercises();
    const newEntry: ExerciseEntry = {
      ...entry,
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(KEYS.EXERCISES, JSON.stringify([newEntry, ...all]));

    if (userId) {
      try {
        await supabase.from('exercise_entries').insert({
          id: newEntry.id,
          user_id: userId,
          logged_at: newEntry.logged_at,
          name: newEntry.name,
          category: newEntry.category,
          duration_minutes: newEntry.duration_minutes,
          intensity: newEntry.intensity,
          calories_burned: newEntry.calories_burned,
          sets: newEntry.sets,
          reps: newEntry.reps,
          met_value: newEntry.met_value,
          icon: newEntry.icon,
          notes: newEntry.notes,
        });
      } catch (err) {
        console.error('Error guardando ejercicio en Supabase:', err);
      }
    }

    return newEntry;
  },

  updateExercise: async (id: string, data: Partial<ExerciseEntry>, userId?: string): Promise<void> => {
    const all = storage.getExercises();
    const updated = all.map(e => e.id === id ? { ...e, ...data } : e);
    localStorage.setItem(KEYS.EXERCISES, JSON.stringify(updated));

    if (userId) {
      try {
        await supabase.from('exercise_entries').update({
          ...data,
        }).eq('id', id).eq('user_id', userId);
      } catch (err) {
        console.error('Error actualizando ejercicio en Supabase:', err);
      }
    }
  },

  deleteExercise: async (id: string, userId?: string): Promise<void> => {
    const all = storage.getExercises();
    const filtered = all.filter(e => e.id !== id);
    localStorage.setItem(KEYS.EXERCISES, JSON.stringify(filtered));

    if (userId) {
      try {
        await supabase.from('exercise_entries').delete().eq('id', id).eq('user_id', userId);
      } catch (err) {
        console.error('Error eliminando ejercicio en Supabase:', err);
      }
    }
  },

  // ==========================================
  // RECIENTES
  // ==========================================
  getRecentFoods: (limit: number = 10): FoodEntry[] => {
    const all = storage.getFoods();
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

  // ==========================================
  // SINCRONIZACIÓN NUBE <-> LOCAL AL INICIAR SESIÓN
  // ==========================================
  syncAllFromCloud: async (userId: string): Promise<UserProfile> => {
    try {
      // 1. Sincronizar Perfil
      const { data: cloudProfile } = await supabase
        .from('user_profile')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      let activeProfile = storage.getProfile();

      if (cloudProfile) {
        activeProfile = {
          id: cloudProfile.id,
          name: cloudProfile.name ?? undefined,
          avatar: cloudProfile.avatar ?? null,
          daily_calorie_goal: cloudProfile.daily_calorie_goal,
          daily_protein_goal: cloudProfile.daily_protein_goal,
          weight_kg: Number(cloudProfile.weight_kg),
          theme: cloudProfile.theme as 'light' | 'dark',
        };
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(activeProfile));
      } else {
        // Si no existe perfil en la nube, subir el local
        await storage.updateProfile(activeProfile, userId);
      }

      // 2. Sincronizar Comidas de la nube
      const { data: cloudFoods } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false });

      if (cloudFoods && cloudFoods.length > 0) {
        const mappedFoods: FoodEntry[] = cloudFoods.map(f => ({
          id: f.id,
          logged_at: f.logged_at,
          name: f.name,
          calories: Number(f.calories),
          protein_g: Number(f.protein_g),
          carbs_g: Number(f.carbs_g),
          fat_g: Number(f.fat_g),
          sodium_mg: Number(f.sodium_mg),
          serving_size_g: Number(f.serving_size_g),
          servings_per_package: Number(f.servings_per_package),
          servings_consumed: Number(f.servings_consumed),
          calories_per_serving: Number(f.calories_per_serving),
          scan_confidence: f.scan_confidence ? Number(f.scan_confidence) : null,
          source: f.source as 'scan' | 'manual' | 'quick',
          icon: f.icon,
          notes: f.notes,
          created_at: f.created_at,
        }));
        localStorage.setItem(KEYS.FOODS, JSON.stringify(mappedFoods));
      } else {
        // Si la nube está vacía pero hay datos locales, migrarlos a Supabase
        const localFoods = storage.getFoods();
        for (const lf of localFoods) {
          await supabase.from('food_entries').insert({
            id: lf.id,
            user_id: userId,
            logged_at: lf.logged_at,
            name: lf.name,
            calories: lf.calories,
            protein_g: lf.protein_g,
            carbs_g: lf.carbs_g,
            fat_g: lf.fat_g,
            sodium_mg: lf.sodium_mg,
            serving_size_g: lf.serving_size_g,
            servings_per_package: lf.servings_per_package,
            servings_consumed: lf.servings_consumed,
            calories_per_serving: lf.calories_per_serving,
            scan_confidence: lf.scan_confidence,
            source: lf.source,
            icon: lf.icon,
            notes: lf.notes,
          });
        }
      }

      // 3. Sincronizar Ejercicios de la nube
      const { data: cloudExercises } = await supabase
        .from('exercise_entries')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false });

      if (cloudExercises && cloudExercises.length > 0) {
        const mappedExercises: ExerciseEntry[] = cloudExercises.map(e => ({
          id: e.id,
          logged_at: e.logged_at,
          name: e.name,
          category: e.category as ExerciseEntry['category'],
          duration_minutes: e.duration_minutes,
          intensity: e.intensity as 'low' | 'medium' | 'high',
          calories_burned: Number(e.calories_burned),
          sets: e.sets,
          reps: e.reps,
          met_value: Number(e.met_value),
          icon: e.icon,
          notes: e.notes,
          created_at: e.created_at,
        }));
        localStorage.setItem(KEYS.EXERCISES, JSON.stringify(mappedExercises));
      } else {
        // Si la nube está vacía pero hay datos locales, migrarlos a Supabase
        const localExercises = storage.getExercises();
        for (const le of localExercises) {
          await supabase.from('exercise_entries').insert({
            id: le.id,
            user_id: userId,
            logged_at: le.logged_at,
            name: le.name,
            category: le.category,
            duration_minutes: le.duration_minutes,
            intensity: le.intensity,
            calories_burned: le.calories_burned,
            sets: le.sets,
            reps: le.reps,
            met_value: le.met_value,
            icon: le.icon,
            notes: le.notes,
          });
        }
      }

      return activeProfile;
    } catch (err) {
      console.error('Error sincronizando con la nube:', err);
      return storage.getProfile();
    }
  },

  clearUserData: () => {
    localStorage.removeItem(KEYS.PROFILE);
    localStorage.removeItem(KEYS.FOODS);
    localStorage.removeItem(KEYS.EXERCISES);
  }
};
