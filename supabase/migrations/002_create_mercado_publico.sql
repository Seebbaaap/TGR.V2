-- Licitaciones
CREATE TABLE IF NOT EXISTS licitaciones (
  codigo          TEXT PRIMARY KEY,
  nombre          TEXT,
  estado          TEXT,
  organismo       TEXT,
  fecha_cierre    TIMESTAMPTZ,
  fecha_creacion  TIMESTAMPTZ,
  descripcion     TEXT,
  payload         JSONB,
  sincronizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_licitaciones_estado ON licitaciones(estado);
CREATE INDEX IF NOT EXISTS idx_licitaciones_fecha_cierre ON licitaciones(fecha_cierre DESC);

-- Órdenes de compra
CREATE TABLE IF NOT EXISTS ordenes_compra (
  codigo          TEXT PRIMARY KEY,
  proveedor       TEXT,
  comprador       TEXT,
  monto_total     NUMERIC,
  moneda          TEXT DEFAULT 'CLP',
  fecha           TIMESTAMPTZ,
  estado          TEXT,
  payload         JSONB,
  sincronizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordenes_compra_estado ON ordenes_compra(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_fecha ON ordenes_compra(fecha DESC);

-- Compra ágil
CREATE TABLE IF NOT EXISTS compra_agil (
  codigo          TEXT PRIMARY KEY,
  nombre          TEXT,
  estado          TEXT,
  organismo       TEXT,
  region          TEXT,
  monto           NUMERIC,
  moneda          TEXT DEFAULT 'CLP',
  fecha_cierre    TIMESTAMPTZ,
  fecha_creacion  TIMESTAMPTZ,
  descripcion     TEXT,
  payload         JSONB,
  sincronizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compra_agil_estado ON compra_agil(estado);
CREATE INDEX IF NOT EXISTS idx_compra_agil_region ON compra_agil(region);
CREATE INDEX IF NOT EXISTS idx_compra_agil_fecha_cierre ON compra_agil(fecha_cierre DESC);