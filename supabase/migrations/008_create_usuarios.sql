-- Usuarios de la aplicación (registro + conteo de actividad)
-- Vinculada a auth.users: cada fila es una persona que inició sesión con Google.
CREATE TABLE IF NOT EXISTS public.usuarios (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  nombre        TEXT,
  avatar_url    TEXT,
  proveedor     TEXT DEFAULT 'google',
  creado_en     TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acceso TIMESTAMPTZ DEFAULT NOW()
);

-- Búsqueda rápida de quién está "activo" (accedió recientemente).
CREATE INDEX IF NOT EXISTS idx_usuarios_ultimo_acceso ON public.usuarios(ultimo_acceso DESC);

-- Seguridad a nivel de fila ya que cada usuario solo ve/edita su propia fila.
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_select_propio" ON public.usuarios;
CREATE POLICY "usuarios_select_propio" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_insert_propio" ON public.usuarios;
CREATE POLICY "usuarios_insert_propio" ON public.usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_update_propio" ON public.usuarios;
CREATE POLICY "usuarios_update_propio" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);
