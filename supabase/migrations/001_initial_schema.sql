-- ============================================================
-- Mise AI — Schema inicial MVP
-- ============================================================

-- --------------------------------------------------------
-- 1. PROFILES (extiende auth.users de Supabase)
-- --------------------------------------------------------
create table profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  nombre        text,
  restaurante   text,
  created_at    timestamptz default now()
);

-- --------------------------------------------------------
-- 2. INGREDIENTES
-- precio_unitario = precio_compra / cantidad_comprada
-- costo_real_en_receta incluye merma via rendimiento
-- --------------------------------------------------------
create table ingredientes (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references profiles(id) on delete cascade not null,
  nombre              text not null,
  unidad              text not null,           -- kg, litro, unidad, gramo, etc.
  precio_compra       decimal(10,4) not null,  -- precio total pagado
  cantidad_comprada   decimal(10,4) not null,  -- cantidad obtenida por ese precio
  rendimiento         decimal(5,2) default 100 not null check (rendimiento > 0 and rendimiento <= 100),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- precio_unitario: precio_compra / cantidad_comprada
-- costo_bruto_en_receta: cantidad_usada * precio_unitario / (rendimiento / 100)

-- --------------------------------------------------------
-- 3. RECETAS
-- --------------------------------------------------------
create table recetas (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references profiles(id) on delete cascade not null,
  nombre              text not null,
  categoria           text,
  porciones           integer default 1 not null check (porciones > 0),
  procedimiento       text,
  food_cost_objetivo  decimal(5,2) default 30 not null, -- % objetivo (ej: 30 = 30%)
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- --------------------------------------------------------
-- 4. RECETA_INGREDIENTES (tabla intermedia)
-- --------------------------------------------------------
create table receta_ingredientes (
  id              uuid default gen_random_uuid() primary key,
  receta_id       uuid references recetas(id) on delete cascade not null,
  ingrediente_id  uuid references ingredientes(id) on delete restrict not null,
  cantidad        decimal(10,4) not null check (cantidad > 0),
  unique(receta_id, ingrediente_id)
);

-- --------------------------------------------------------
-- 5. FUNCIÓN: auto-actualizar updated_at
-- --------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger ingredientes_updated_at
  before update on ingredientes
  for each row execute function set_updated_at();

create trigger recetas_updated_at
  before update on recetas
  for each row execute function set_updated_at();

-- --------------------------------------------------------
-- 6. FUNCIÓN: crear profile automáticamente al registrarse
-- --------------------------------------------------------
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- --------------------------------------------------------
-- 7. ROW LEVEL SECURITY — cada usuario solo ve sus datos
-- --------------------------------------------------------
alter table profiles          enable row level security;
alter table ingredientes       enable row level security;
alter table recetas            enable row level security;
alter table receta_ingredientes enable row level security;

-- Profiles
create policy "users_own_profile"
  on profiles for all
  using (auth.uid() = id);

-- Ingredientes
create policy "users_own_ingredientes"
  on ingredientes for all
  using (auth.uid() = user_id);

-- Recetas
create policy "users_own_recetas"
  on recetas for all
  using (auth.uid() = user_id);

-- Receta_ingredientes (acceso via receta del usuario)
create policy "users_own_receta_ingredientes"
  on receta_ingredientes for all
  using (
    exists (
      select 1 from recetas
      where recetas.id = receta_ingredientes.receta_id
      and recetas.user_id = auth.uid()
    )
  );
