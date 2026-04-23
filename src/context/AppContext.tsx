import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { FoodEntry, ExerciseEntry, UserProfile, ActivePage } from '../lib/types';
import { getDateString } from '../lib/calculations';
import { storage } from '../lib/storage';

interface AppState {
  profile: UserProfile | null;
  todayFoods: FoodEntry[];
  todayExercises: ExerciseEntry[];
  activePage: ActivePage;
  theme: 'light' | 'dark';
  loading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toastRef: React.RefObject<any>;
  setActivePage: (page: ActivePage) => void;
  toggleTheme: () => void;
  refreshToday: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'created_at'>) => Promise<void>;
  updateFoodEntry: (id: string, data: Partial<FoodEntry>) => Promise<void>;
  deleteFoodEntry: (id: string) => Promise<void>;
  addExerciseEntry: (entry: Omit<ExerciseEntry, 'id' | 'created_at'>) => Promise<void>;
  updateExerciseEntry: (id: string, data: Partial<ExerciseEntry>) => Promise<void>;
  deleteExerciseEntry: (id: string) => Promise<void>;
  toast: (text: string, state?: 'info' | 'success') => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayFoods, setTodayFoods] = useState<FoodEntry[]>([]);
  const [todayExercises, setTodayExercises] = useState<ExerciseEntry[]>([]);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toastRef = useRef<any>(null);

  useEffect(() => {
    void init();
  }, []);

  async function init() {
    setLoading(true);
    const p = storage.getProfile();
    setProfile(p);
    setTheme(p.theme);
    document.documentElement.className = p.theme;
    await refreshToday();
    setLoading(false);
  }

  async function refreshToday() {
    const today = getDateString();
    const foods = storage.getFoods(today);
    const exercises = storage.getExercises(today);
    setTodayFoods(foods);
    setTodayExercises(exercises);
  }

  async function updateProfile(data: Partial<UserProfile>) {
    const updated = storage.updateProfile(data);
    setProfile(updated);
    if (data.theme) {
      setTheme(data.theme);
      document.documentElement.className = data.theme;
    }
  }

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    void updateProfile({ theme: next });
  }

  async function addFoodEntry(entry: Omit<FoodEntry, 'id' | 'created_at'>) {
    storage.addFood(entry);
    await refreshToday();
    toast('Comida registrada');
  }

  async function updateFoodEntry(id: string, data: Partial<FoodEntry>) {
    storage.updateFood(id, data);
    await refreshToday();
    toast('Comida actualizada');
  }

  async function deleteFoodEntry(id: string) {
    storage.deleteFood(id);
    await refreshToday();
    toast('Comida eliminada', 'info');
  }

  async function addExerciseEntry(entry: Omit<ExerciseEntry, 'id' | 'created_at'>) {
    storage.addExercise(entry);
    await refreshToday();
    toast('Ejercicio registrado');
  }

  async function updateExerciseEntry(id: string, data: Partial<ExerciseEntry>) {
    storage.updateExercise(id, data);
    await refreshToday();
    toast('Ejercicio actualizado');
  }

  async function deleteExerciseEntry(id: string) {
    storage.deleteExercise(id);
    await refreshToday();
    toast('Ejercicio eliminado', 'info');
  }

  function toast(text: string, state: 'info' | 'success' = 'success') {
    toastRef.current?.addMessage({ text, state });
  }

  return (
    <AppContext.Provider value={{
      profile, todayFoods, todayExercises, activePage, theme, loading, toastRef,
      setActivePage, toggleTheme, refreshToday, updateProfile,
      addFoodEntry, updateFoodEntry, deleteFoodEntry,
      addExerciseEntry, updateExerciseEntry, deleteExerciseEntry,
      toast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

