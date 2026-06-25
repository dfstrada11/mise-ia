-- Migración 003: Mover rendimiento del ingrediente a la línea de receta
-- El rendimiento depende de QUÉ PARTE del ingrediente usas, no del ingrediente en sí.

ALTER TABLE receta_ingredientes
  ADD COLUMN rendimiento decimal(5,2) NOT NULL DEFAULT 100
  CHECK (rendimiento > 0 AND rendimiento <= 100);

COMMENT ON COLUMN receta_ingredientes.rendimiento IS
  'Porcentaje del ingrediente bruto que se aprovecha en ESTA receta específica.
   Ejemplo: pollo entero usado para pechugas = 55%, para muslos = 35%, para huesos de caldo = 30%.
   Esto reemplaza el rendimiento global del ingrediente.';
