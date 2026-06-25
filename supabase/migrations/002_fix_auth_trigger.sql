-- Fix: el trigger handle_new_user falla porque RLS bloquea el INSERT
-- durante el proceso de signup (auth.uid() es NULL en ese contexto).
-- Solución: política explícita de INSERT que usa WITH CHECK (true)
-- para el rol postgres (security definer), y search_path correcto.

-- Recrear la función con search_path explícito (práctica recomendada en Supabase)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Política de INSERT separada para permitir que el trigger funcione
-- (la política "for all" con solo USING no cubre INSERT correctamente)
DROP POLICY IF EXISTS "users_own_profile" ON profiles;

CREATE POLICY "profiles_select_update_delete"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_delete"
  ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Permitir INSERT desde el trigger (security definer corre como postgres)
-- En Supabase, la alternativa es WITH CHECK (true) para no bloquear el trigger
CREATE POLICY "profiles_insert"
  ON profiles
  FOR INSERT
  WITH CHECK (true);
