export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      user_profile: {
        Row: {
          id: string;
          daily_calorie_goal: number;
          daily_protein_goal: number | null;
          weight_kg: number;
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          daily_calorie_goal?: number;
          daily_protein_goal?: number | null;
          weight_kg?: number;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          daily_calorie_goal?: number;
          daily_protein_goal?: number | null;
          weight_kg?: number;
          theme?: string;
          updated_at?: string;
        };
      };
      food_entries: {
        Row: {
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
          source: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          logged_at?: string;
          name: string;
          calories: number;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
          sodium_mg?: number;
          serving_size_g?: number;
          servings_per_package?: number;
          servings_consumed?: number;
          calories_per_serving?: number;
          scan_confidence?: number | null;
          source?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          logged_at?: string;
          name?: string;
          calories?: number;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
          sodium_mg?: number;
          serving_size_g?: number;
          servings_per_package?: number;
          servings_consumed?: number;
          calories_per_serving?: number;
          scan_confidence?: number | null;
          source?: string;
          notes?: string;
        };
      };
      exercise_entries: {
        Row: {
          id: string;
          logged_at: string;
          name: string;
          category: string;
          duration_minutes: number;
          intensity: string;
          calories_burned: number;
          sets: number | null;
          reps: number | null;
          met_value: number;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          logged_at?: string;
          name: string;
          category?: string;
          duration_minutes?: number;
          intensity?: string;
          calories_burned: number;
          sets?: number | null;
          reps?: number | null;
          met_value?: number;
          notes?: string;
          created_at?: string;
        };
        Update: {
          logged_at?: string;
          name?: string;
          category?: string;
          duration_minutes?: number;
          intensity?: string;
          calories_burned?: number;
          sets?: number | null;
          reps?: number | null;
          met_value?: number;
          notes?: string;
        };
      };
    };
  };
}
