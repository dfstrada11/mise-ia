'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function actualizarPerfil(data: {
  restaurante: string
  nombre: string
  tipo_servicio: string
  zona: string
  pais: string
  concepto: string
  num_empleados: number
  costo_planilla_mes: number
  platos_por_dia: number
  dias_semana: number
  precio_promedio: number
  moneda: string
  food_cost_default: number
  logo_url?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('profiles').update(data).eq('id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function obtenerPerfil() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data
}
