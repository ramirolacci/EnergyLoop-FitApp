-- ==============================================================================
-- EnergyLoop - Esquema de Base de Datos para Producción con Supabase
-- Incluye: Tablas relacionales, Claves foráneas a auth.users, RLS y Triggers
-- ==============================================================================

-- 1. TABLA: user_profile
CREATE TABLE IF NOT EXISTS public.user_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  avatar text,
  daily_calorie_goal integer NOT NULL DEFAULT 2000,
  daily_protein_goal integer DEFAULT 150,
  weight_kg numeric NOT NULL DEFAULT 70,
  theme text NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. TABLA: food_entries
CREATE TABLE IF NOT EXISTS public.food_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('scan', 'manual', 'quick')),
  icon text,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. TABLA: exercise_entries
CREATE TABLE IF NOT EXISTS public.exercise_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('cardio', 'strength', 'flexibility', 'sports', 'other')),
  duration_minutes integer NOT NULL DEFAULT 30,
  intensity text NOT NULL DEFAULT 'medium' CHECK (intensity IN ('low', 'medium', 'high')),
  calories_burned numeric NOT NULL DEFAULT 0,
  sets integer,
  reps integer,
  met_value numeric NOT NULL DEFAULT 4,
  icon text NOT NULL DEFAULT '🏃',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices de alto rendimiento para búsquedas por fecha y usuario
CREATE INDEX IF NOT EXISTS idx_food_entries_user_logged 
  ON public.food_entries(user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_exercise_entries_user_logged 
  ON public.exercise_entries(user_id, logged_at DESC);

-- ==============================================================================
-- SEGURIDAD: Habilitar Row Level Security (RLS) en todas las tablas
-- ==============================================================================
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_entries ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas previas si existieran
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profile;

DROP POLICY IF EXISTS "Users can view own food entries" ON public.food_entries;
DROP POLICY IF EXISTS "Users can insert own food entries" ON public.food_entries;
DROP POLICY IF EXISTS "Users can update own food entries" ON public.food_entries;
DROP POLICY IF EXISTS "Users can delete own food entries" ON public.food_entries;

DROP POLICY IF EXISTS "Users can view own exercise entries" ON public.exercise_entries;
DROP POLICY IF EXISTS "Users can insert own exercise entries" ON public.exercise_entries;
DROP POLICY IF EXISTS "Users can update own exercise entries" ON public.exercise_entries;
DROP POLICY IF EXISTS "Users can delete own exercise entries" ON public.exercise_entries;

-- Políticas para user_profile
CREATE POLICY "Users can view own profile"
  ON public.user_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Políticas para food_entries
CREATE POLICY "Users can view own food entries"
  ON public.food_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food entries"
  ON public.food_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food entries"
  ON public.food_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food entries"
  ON public.food_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para exercise_entries
CREATE POLICY "Users can view own exercise entries"
  ON public.exercise_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise entries"
  ON public.exercise_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise entries"
  ON public.exercise_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise entries"
  ON public.exercise_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIZACIÓN (TRIGGERS):
-- 1. Crear automáticamente fila en user_profile al registrarse en auth.users
-- 2. Mantener updated_at actualizado automáticamente
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profile (id, name, daily_calorie_goal, daily_protein_goal, weight_kg, theme)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    2000,
    150,
    70,
    'dark'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS set_user_profile_updated_at ON public.user_profile;
CREATE TRIGGER set_user_profile_updated_at
  BEFORE UPDATE ON public.user_profile
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
