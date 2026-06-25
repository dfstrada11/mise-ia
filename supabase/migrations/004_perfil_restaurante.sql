-- Migración 004: Perfil completo del restaurante
-- Incluye tipo de negocio, planilla, operación diaria para calcular costo real por plato

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS logo_url           text,
  ADD COLUMN IF NOT EXISTS tipo_servicio      text DEFAULT 'carta'
    CHECK (tipo_servicio IN ('comedor','fonda','carta','buffet','degustacion','food_truck','otro')),
  ADD COLUMN IF NOT EXISTS zona               text DEFAULT 'ciudad_grande'
    CHECK (zona IN ('ciudad_grande','ciudad_mediana','pueblo','zona_turistica','zona_residencial')),
  ADD COLUMN IF NOT EXISTS pais               text DEFAULT 'SV',
  ADD COLUMN IF NOT EXISTS concepto           text,
  ADD COLUMN IF NOT EXISTS publico_objetivo   text[],
  ADD COLUMN IF NOT EXISTS num_empleados      integer DEFAULT 1 CHECK (num_empleados >= 0),
  ADD COLUMN IF NOT EXISTS costo_planilla_mes decimal(10,2) DEFAULT 0 CHECK (costo_planilla_mes >= 0),
  ADD COLUMN IF NOT EXISTS platos_por_dia     integer DEFAULT 50 CHECK (platos_por_dia > 0),
  ADD COLUMN IF NOT EXISTS dias_semana        integer DEFAULT 6 CHECK (dias_semana BETWEEN 1 AND 7),
  ADD COLUMN IF NOT EXISTS precio_promedio    decimal(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moneda             text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS food_cost_default  decimal(5,2) DEFAULT 30;

COMMENT ON COLUMN profiles.costo_planilla_mes IS
  'Costo mensual total del personal de cocina en la moneda del restaurante';
COMMENT ON COLUMN profiles.platos_por_dia IS
  'Promedio de platos servidos por día — se usa para calcular el costo de mano de obra por plato';
COMMENT ON COLUMN profiles.dias_semana IS
  'Días que opera el restaurante por semana — para calcular el costo mensual real';
