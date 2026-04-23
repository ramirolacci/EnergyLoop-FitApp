/*
  # Calorie Tracker - Initial Schema

  ## Summary
  Creates the full schema for a personal calorie and exercise tracking app.

  ## New Tables

  ### user_profile
  - Stores user goals and settings (single row per user).
  - `id` (uuid, pk)
  - `daily_calorie_goal` (int) - target calories per day
  - `daily_protein_goal` (int, nullable) - optional protein target in grams
  - `weight_kg` (numeric) - user weight for calorie burn estimation
  - `theme` (text) - 'light' | 'dark'
  - `created_at`, `updated_at`

  ### food_entries
  - Individual food/meal log entries.
  - `id` (uuid, pk)
  - `logged_at` (timestamptz) - when it was consumed
  - `name` (text) - food name
  - `calories` (numeric) - total calories consumed
  - `protein_g` (numeric) - protein in grams
  - `carbs_g` (numeric) - carbohydrates in grams
  - `fat_g` (numeric) - fat in grams
  - `sodium_mg` (numeric) - sodium in milligrams
  - `serving_size_g` (numeric) - serving size in grams
  - `servings_per_package` (numeric) - total servings in package
  - `servings_consumed` (numeric) - how many servings consumed
  - `calories_per_serving` (numeric) - calories per single serving
  - `scan_confidence` (numeric, nullable) - OCR confidence 0-1
  - `source` (text) - 'scan' | 'manual' | 'quick'
  - `notes` (text)
  - `created_at`

  ### exercise_entries
  - Individual exercise/workout log entries.
  - `id` (uuid, pk)
  - `logged_at` (timestamptz) - when exercise was performed
  - `name` (text) - exercise name
  - `category` (text) - 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other'
  - `duration_minutes` (int) - duration in minutes
  - `intensity` (text) - 'low' | 'medium' | 'high'
  - `calories_burned` (numeric) - estimated calories burned
  - `sets` (int, nullable)
  - `reps` (int, nullable)
  - `met_value` (numeric) - metabolic equivalent used for calculation
  - `notes` (text)
  - `created_at`

  ## Security
  - RLS enabled on all tables
  - Public read/write access (single-user personal app without auth)
*/

-- User profile table (single row settings store)
CREATE TABLE IF NOT EXISTS user_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_calorie_goal integer NOT NULL DEFAULT 2000,
  daily_protein_goal integer,
  weight_kg numeric NOT NULL DEFAULT 70,
  theme text NOT NULL DEFAULT 'light',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to user_profile"
  ON user_profile
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert to user_profile"
  ON user_profile
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update to user_profile"
  ON user_profile
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete to user_profile"
  ON user_profile
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Food entries table
CREATE TABLE IF NOT EXISTS food_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logged_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL DEFAULT '',
  calories numeric NOT NULL DEFAULT 0,
  protein_g numeric NOT NULL DEFAULT 0,
  carbs_g numeric NOT NULL DEFAULT 0,
  fat_g numeric NOT NULL DEFAULT 0,
  sodium_mg numeric NOT NULL DEFAULT 0,
  serving_size_g numeric NOT NULL DEFAULT 100,
  servings_per_package numeric NOT NULL DEFAULT 1,
  servings_consumed numeric NOT NULL DEFAULT 1,
  calories_per_serving numeric NOT NULL DEFAULT 0,
  scan_confidence numeric,
  source text NOT NULL DEFAULT 'manual',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on food_entries"
  ON food_entries
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert on food_entries"
  ON food_entries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update on food_entries"
  ON food_entries
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on food_entries"
  ON food_entries
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Exercise entries table
CREATE TABLE IF NOT EXISTS exercise_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logged_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'other',
  duration_minutes integer NOT NULL DEFAULT 30,
  intensity text NOT NULL DEFAULT 'medium',
  calories_burned numeric NOT NULL DEFAULT 0,
  sets integer,
  reps integer,
  met_value numeric NOT NULL DEFAULT 4,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercise_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on exercise_entries"
  ON exercise_entries
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert on exercise_entries"
  ON exercise_entries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update on exercise_entries"
  ON exercise_entries
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on exercise_entries"
  ON exercise_entries
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Insert default profile if not exists
INSERT INTO user_profile (daily_calorie_goal, daily_protein_goal, weight_kg, theme)
SELECT 2000, 150, 70, 'light'
WHERE NOT EXISTS (SELECT 1 FROM user_profile);
