ALTER TABLE licitaciones
  ADD COLUMN IF NOT EXISTS nombre_unidad      TEXT,
  ADD COLUMN IF NOT EXISTS direccion_unidad   TEXT,
  ADD COLUMN IF NOT EXISTS region_unidad      TEXT,
  ADD COLUMN IF NOT EXISTS cantidad_reclamos  INTEGER,
  ADD COLUMN IF NOT EXISTS fecha_inicio       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fecha_final        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS items              JSONB DEFAULT '[]'::jsonb;