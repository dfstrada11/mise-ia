'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function crearIngrediente(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('ingredientes').insert({
    user_id: user.id,
    nombre: formData.get('nombre') as string,
    unidad: formData.get('unidad') as string,
    precio_compra: parseFloat(formData.get('precio_compra') as string),
    cantidad_comprada: parseFloat(formData.get('cantidad_comprada') as string),
    rendimiento: parseFloat(formData.get('rendimiento') as string) || 100,
  })

  if (error) return { error: error.message }
  revalidatePath('/ingredientes')
  return { success: true }
}

export async function editarIngrediente(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('ingredientes')
    .update({
      nombre: formData.get('nombre') as string,
      unidad: formData.get('unidad') as string,
      precio_compra: parseFloat(formData.get('precio_compra') as string),
      cantidad_comprada: parseFloat(formData.get('cantidad_comprada') as string),
      rendimiento: parseFloat(formData.get('rendimiento') as string) || 100,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/ingredientes')
  return { success: true }
}

export async function eliminarIngrediente(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('ingredientes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/ingredientes')
  return { success: true }
}
