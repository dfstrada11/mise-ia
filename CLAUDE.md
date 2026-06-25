# Mise AI

Plataforma SaaS de costeo y estandarización culinaria para restaurantes de Latinoamérica.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth)
- Deploy: Vercel

## Principios de desarrollo

1. Mobile-first siempre
2. Simplicidad extrema — sin complejidad innecesaria
3. Proponer arquitectura antes de implementar cambios grandes
4. Priorizar experiencia del usuario sobre elegancia técnica
5. No agregar funcionalidades fuera del roadmap del MVP

## MVP — Módulos en orden de dependencia

1. **Ingredientes** — nombre, unidad, precio compra, cantidad
2. **Rendimientos** — peso bruto, peso limpio, % rendimiento
3. **Recetas** — nombre, categoría, porciones, ingredientes, cantidades
4. **Costeo** — costo total receta, costo por porción, precio sugerido (food cost objetivo)
5. **Ficha técnica PDF** — ingredientes, procedimiento, rendimientos, costos, precio sugerido

## Mercado objetivo

Restaurantes independientes, cafeterías, dark kitchens, panaderías. Primer mercado: El Salvador.

## Reglas para IA

- Antes de escribir código: analiza, detecta dependencias, propone plan, espera aprobación si el cambio es grande
- No agregar features fuera del roadmap
- Generar código listo para producción
- Usar el skill `/frontend-design` para cualquier UI nueva
