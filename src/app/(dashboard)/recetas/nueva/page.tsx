import { createClient } from '@/lib/supabase/server'
import { NuevaRecetaForm } from './form'

export default async function NuevaRecetaPage() {
  const supabase = await createClient()
  const { data: ingredientes } = await supabase
    .from('ingredientes')
    .select('id, nombre, unidad, precio_compra, cantidad_comprada, rendimiento')
    .order('nombre', { ascending: true })

  return <NuevaRecetaForm ingredientesCatalogo={ingredientes ?? []} />
}
