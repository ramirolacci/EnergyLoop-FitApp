import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { FoodEntry, ExerciseEntry, UserProfile, ActivePage } from '../lib/types';
import { getDateString } from '../lib/calculations';
import { storage } from '../lib/storage';
import { useAuth } from './AuthContext';

interface AppState {
  profile: UserProfile | null;
  todayFoods: FoodEntry[];
  todayExercises: ExerciseEntry[];
  activePage: ActivePage;
  theme: 'light' | 'dark';
  loading: boolean;
  refreshCount: number;
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
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayFoods, setTodayFoods] = useState<FoodEntry[]>([]);
  const [todayExercises, setTodayExercises] = useState<ExerciseEntry[]>([]);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const theme: 'light' = 'light';
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toastRef = useRef<any>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshToday = useCallback(async () => {
    const today = getDateString();
    const foods = storage.getFoods(today);
    const exercises = storage.getExercises(today);
    setTodayFoods([...foods]);
    setTodayExercises([...exercises]);
    setRefreshCount(prev => prev + 1);
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    let currentProfile = storage.getProfile();

    if (user?.id) {
      currentProfile = await storage.syncAllFromCloud(user.id);
    }

    setProfile(currentProfile);
    await refreshToday();
    setLoading(false);
  }, [user?.id, refreshToday]);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    try {
      document.documentElement.className = 'light';
      localStorage.setItem('pds-theme', 'light');
    } catch {
      // ignore
    }
  }, []);

  async function updateProfile(data: Partial<UserProfile>) {
    const updated = await storage.updateProfile({ ...data, theme: 'light' }, user?.id);
    setProfile(updated);
  }

  function toggleTheme() {
    // Modo claro permanente solicitado por el usuario
  }

  async function addFoodEntry(entry: Omit<FoodEntry, 'id' | 'created_at'>) {
    const newEntry = await storage.addFood(entry, user?.id);
    setTodayFoods(prev => [newEntry, ...prev]);
    setRefreshCount(prev => prev + 1);
    toast('Comida registrada');
  }

  async function updateFoodEntry(id: string, data: Partial<FoodEntry>) {
    await storage.updateFood(id, data, user?.id);
    await refreshToday();
    toast('Comida actualizada');
  }

  async function deleteFoodEntry(id: string) {
    await storage.deleteFood(id, user?.id);
    await refreshToday();
    toast('Comida eliminada', 'info');
  }

  async function addExerciseEntry(entry: Omit<ExerciseEntry, 'id' | 'created_at'>) {
    const newEntry = await storage.addExercise(entry, user?.id);
    setTodayExercises(prev => [newEntry, ...prev]);
    setRefreshCount(prev => prev + 1);
    toast('Ejercicio registrado');
  }

  async function updateExerciseEntry(id: string, data: Partial<ExerciseEntry>) {
    await storage.updateExercise(id, data, user?.id);
    await refreshToday();
    toast('Ejercicio actualizado');
  }

  async function deleteExerciseEntry(id: string) {
    await storage.deleteExercise(id, user?.id);
    await refreshToday();
    toast('Ejercicio eliminado', 'info');
  }

  function toast(text: string, state: 'info' | 'success' = 'success') {
    toastRef.current?.addMessage({ text, state });
  }

  return (
    <AppContext.Provider value={{
      profile, todayFoods, todayExercises, activePage, theme, loading, toastRef, refreshCount,
      setActivePage, toggleTheme, refreshToday, updateProfile,
      addFoodEntry, updateFoodEntry, deleteFoodEntry,
      addExerciseEntry, updateExerciseEntry, deleteExerciseEntry,
      toast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
