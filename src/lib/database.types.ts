export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      user_profile: {
        Row: {
          id: string;
          name: string | null;
          avatar: string | null;
          daily_calorie_goal: number;
          daily_protein_goal: number | null;
          weight_kg: number;
          theme: 'light' | 'dark';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          avatar?: string | null;
          daily_calorie_goal?: number;
          daily_protein_goal?: number | null;
          weight_kg?: number;
          theme?: 'light' | 'dark';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          avatar?: string | null;
          daily_calorie_goal?: number;
          daily_protein_goal?: number | null;
          weight_kg?: number;
          theme?: 'light' | 'dark';
          updated_at?: string;
        };
      };
      food_entries: {
        Row: {
          id: string;
          user_id: string;
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
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at?: string;
          name?: string;
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
          source?: 'scan' | 'manual' | 'quick';
          icon?: string | null;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
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
          source?: 'scan' | 'manual' | 'quick';
          icon?: string | null;
          notes?: string;
        };
      };
      exercise_entries: {
        Row: {
          id: string;
          user_id: string;
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
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at?: string;
          name?: string;
          category?: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
          duration_minutes?: number;
          intensity?: 'low' | 'medium' | 'high';
          calories_burned: number;
          sets?: number | null;
          reps?: number | null;
          met_value?: number;
          icon?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          logged_at?: string;
          name?: string;
          category?: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
          duration_minutes?: number;
          intensity?: 'low' | 'medium' | 'high';
          calories_burned?: number;
          sets?: number | null;
          reps?: number | null;
          met_value?: number;
          icon?: string;
          notes?: string;
        };
      };
    };
  };
}
