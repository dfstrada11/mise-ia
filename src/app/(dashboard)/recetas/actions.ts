'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function crearReceta(data: {
  nombre: string
  categoria: string
  porciones: number
  procedimiento: string
  food_cost_objetivo: number
  ingredientes: { ingrediente_id: string; cantidad: number; rendimiento: number }[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: receta, error: recetaError } = await supabase
    .from('recetas')
    .insert({
      user_id: user.id,
      nombre: data.nombre,
      categoria: data.categoria,
      porciones: data.porciones,
      procedimiento: data.procedimiento,
      food_cost_objetivo: data.food_cost_objetivo,
    })
    .select('id')
    .single()

  if (recetaError || !receta) return { error: recetaError?.message ?? 'Error al crear receta' }

  if (data.ingredientes.length > 0) {
    const { error: ingError } = await supabase.from('receta_ingredientes').insert(
      data.ingredientes.map(i => ({
        receta_id: receta.id,
        ingrediente_id: i.ingrediente_id,
        cantidad: i.cantidad,
        rendimiento: i.rendimiento,
      }))
    )
    if (ingError) {
      await supabase.from('recetas').delete().eq('id', receta.id)
      return { error: ingError.message }
    }
  }

  revalidatePath('/recetas')
  revalidatePath('/fichas')
  return { success: true, id: receta.id }
}

export async function eliminarReceta(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('recetas').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/recetas')
  revalidatePath('/fichas')
  return { success: true }
}
