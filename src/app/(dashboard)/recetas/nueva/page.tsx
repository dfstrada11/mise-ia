import { createClient } from '@/lib/supabase/server'
import { NuevaRecetaForm } from './form'

export default async function NuevaRecetaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: ingredientes }, { data: profile }] = await Promise.all([
    supabase.from('ingredientes')
      .select('id, nombre, unidad, precio_compra, cantidad_comprada, rendimiento')
      .order('nombre', { ascending: true }),
    supabase.from('profiles')
      .select('costo_planilla_mes, platos_por_dia, dias_semana, food_cost_default, moneda')
      .eq('id', user!.id)
      .single(),
  ])

  // Calcular costo de mano de obra por plato
  const planilla = profile?.costo_planilla_mes ?? 0
  const platosDia = profile?.platos_por_dia ?? 50
  const diasSemana = profile?.dias_semana ?? 6
  const costoMOPorPlato = planilla > 0 && platosDia > 0
    ? planilla / (diasSemana * 4.33 * platosDia)
    : 0

  return (
    <NuevaRecetaForm
      ingredientesCatalogo={ingredientes ?? []}
      costoMOPorPlato={costoMOPorPlato}
      foodCostDefault={profile?.food_cost_default ?? 30}
      moneda={profile?.moneda ?? 'USD'}
    />
  )
}
