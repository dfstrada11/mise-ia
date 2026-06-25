-- Migración 005: Unidad por línea de receta
-- Las recetas trabajan en gr/oz aunque el ingrediente se compre en lb/kg

ALTER TABLE receta_ingredientes
  ADD COLUMN IF NOT EXISTS unidad text DEFAULT 'gr';
