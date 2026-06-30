ALTER TABLE compra_agil
  ADD COLUMN IF NOT EXISTS estado_convocatoria           TEXT,
  ADD COLUMN IF NOT EXISTS fecha_cierre_primer_llamado   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fecha_cierre_segundo_llamado  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fecha_cancelacion             TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS direccion_entrega             TEXT,
  ADD COLUMN IF NOT EXISTS plazo_entrega_dias            INTEGER,
  ADD COLUMN IF NOT EXISTS total_ofertas_recibidas       INTEGER,
  ADD COLUMN IF NOT EXISTS productos                     JSONB DEFAULT '[]'::jsonb;
