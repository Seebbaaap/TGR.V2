-- Normaliza regiones duplicadas en compra_agil (NBSP, espacios extra, Unicode NFC).
-- Ejecutar en el SQL Editor de Supabase.

-- ── 1. ANTES: contar regiones distintas y detectar duplicados visuales ──────

SELECT COUNT(DISTINCT region) AS regiones_distintas_antes
FROM compra_agil
WHERE region IS NOT NULL;

SELECT region, COUNT(*) AS compras
FROM compra_agil
WHERE region IS NOT NULL
GROUP BY region
ORDER BY region;

-- Duplicados que se ven iguales pero difieren en bytes (debería listar ~9 pares)
SELECT
  a.region AS region_a,
  b.region AS region_b,
  length(a.region) AS len_a,
  length(b.region) AS len_b,
  a.compras AS compras_a,
  b.compras AS compras_b
FROM (
  SELECT region, COUNT(*) AS compras
  FROM compra_agil
  WHERE region IS NOT NULL
  GROUP BY region
) a
JOIN (
  SELECT region, COUNT(*) AS compras
  FROM compra_agil
  WHERE region IS NOT NULL
  GROUP BY region
) b
  ON trim(both FROM replace(a.region, chr(160), ' ')) = trim(both FROM replace(b.region, chr(160), ' '))
 AND a.region <> b.region
ORDER BY a.region;

-- ── 2. LIMPIEZA ─────────────────────────────────────────────────────────────

UPDATE compra_agil
SET region = normalize(
  trim(both FROM regexp_replace(replace(region, chr(160), ' '), '\s+', ' ', 'g')),
  NFC
)
WHERE region IS NOT NULL;

-- ── 3. DESPUÉS: verificar que quedaron 16 regiones ──────────────────────────

SELECT COUNT(DISTINCT region) AS regiones_distintas_despues
FROM compra_agil
WHERE region IS NOT NULL;

SELECT region, COUNT(*) AS compras
FROM compra_agil
WHERE region IS NOT NULL
GROUP BY region
ORDER BY region;

-- No debería devolver filas si la limpieza fue correcta
SELECT
  a.region AS region_a,
  b.region AS region_b
FROM (
  SELECT region FROM compra_agil WHERE region IS NOT NULL GROUP BY region
) a
JOIN (
  SELECT region FROM compra_agil WHERE region IS NOT NULL GROUP BY region
) b
  ON trim(both FROM replace(a.region, chr(160), ' ')) = trim(both FROM replace(b.region, chr(160), ' '))
 AND a.region <> b.region;
