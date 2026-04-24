export interface UserProfile {
  id: string;
  name?: string;
  avatar?: string | null;
  daily_calorie_goal: number;
  daily_protein_goal: number | null;
  weight_kg: number;
  theme: 'light' | 'dark';
}

export interface FoodEntry {
  id: string;
  logged_at: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sodium_mg: number;
  serving_size_g: number;
  servings_per_package: number;
  servings_consumed: number;
  calories_per_serving: number;
  scan_confidence: number | null;
  source: 'scan' | 'manual' | 'quick';
  icon: string | null;
  notes: string;
  created_at: string;
}


export interface ExerciseEntry {
  id: string;
  logged_at: string;
  name: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  duration_minutes: number;
  intensity: 'low' | 'medium' | 'high';
  calories_burned: number;
  sets: number | null;
  reps: number | null;
  met_value: number;
  icon: string;
  notes: string;
  created_at: string;
}


export interface DayStats {
  date: string;
  calories_consumed: number;
  calories_burned: number;
  net_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface ScannedNutrition {
  name: string;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sodium_mg: number;
  serving_size_g: number;
  servings_per_package: number;
  confidence: number;
}

export interface ExerciseTemplate {
  name: string;
  category: ExerciseEntry['category'];
  metLow: number;
  metMedium: number;
  metHigh: number;
  icon: string;
}


export type ActivePage = 'dashboard' | 'history' | 'settings';
