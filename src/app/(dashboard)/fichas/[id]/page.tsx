import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PrintButton } from './print-button'

export default async function FichaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('restaurante').eq('id', user!.id).single()

  const { data: receta } = await supabase
    .from('recetas')
    .select(`
      id, nombre, categoria, porciones, procedimiento, food_cost_objetivo, created_at,
      receta_ingredientes (
        cantidad,
        ingredientes (id, nombre, unidad, precio_compra, cantidad_comprada, rendimiento)
      )
    `)
    .eq('id', id)
    .single()

  if (!receta) notFound()

  type RecetaIngrediente = {
    cantidad: number
    ingredientes: {
      id: string
      nombre: string
      unidad: string
      precio_compra: number
      cantidad_comprada: number
      rendimiento: number
    }
  }

  const ingredientesConCosto = (receta.receta_ingredientes as unknown as RecetaIngrediente[]).map(ri => {
    const ing = ri.ingredientes
    const precioUnit = ing.precio_compra / ing.cantidad_comprada
    const costoReal = precioUnit / (ing.rendimiento / 100)
    const costoLinea = ri.cantidad * costoReal
    return { ...ing, cantidad: ri.cantidad, precioUnit, costoReal, costoLinea }
  })

  const costoTotal = ingredientesConCosto.reduce((s, i) => s + i.costoLinea, 0)
  const costoPorcion = costoTotal / receta.porciones
  const precioSugerido = receta.food_cost_objetivo > 0 ? costoPorcion / (receta.food_cost_objetivo / 100) : 0
  const fecha = new Date(receta.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const restaurante = profile?.restaurante ?? 'Restaurante'

  return (
    <div className="h-full overflow-y-auto">
      {/* Toolbar (se oculta al imprimir) */}
      <div className="no-print flex items-center justify-between px-8 py-5 border-b border-[#1F1F1F] bg-[#080808] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <a href="/fichas"
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[#4A4A4A] hover:text-white hover:bg-[#1A1A1A] transition-all">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </a>
          <div>
            <p className="text-[#5A5A5A] text-xs">Ficha técnica</p>
            <h1 className="text-white font-semibold text-base">{receta.nombre}</h1>
          </div>
        </div>
        <PrintButton />
      </div>

      {/* Ficha técnica — contenido imprimible */}
      <div className="px-8 py-8 pb-24 md:pb-8 max-w-3xl">
        <div className="print-area bg-white rounded-2xl p-8 text-gray-900">
          {/* Header ficha */}
          <div className="flex items-start justify-between pb-6 border-b border-gray-200 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-bold">M</span>
                </div>
                <span className="text-gray-400 text-xs font-medium">{restaurante}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{receta.nombre}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{receta.categoria}</span>
                <span className="text-xs text-gray-400">{fecha}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Rinde</p>
              <p className="text-3xl font-bold text-gray-900">{receta.porciones}</p>
              <p className="text-xs text-gray-500">{receta.porciones === 1 ? 'porción' : 'porciones'}</p>
            </div>
          </div>

          {/* Ingredientes */}
          <div className="mb-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ingredientes</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-medium pb-2">Ingrediente</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Cantidad</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Rendimiento</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-2">Costo</th>
                </tr>
              </thead>
              <tbody>
                {ingredientesConCosto.map((ing, i) => (
                  <tr key={ing.id} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="py-2 pr-4 font-medium text-gray-800">{ing.nombre}</td>
                    <td className="py-2 text-right text-gray-600">{ing.cantidad} {ing.unidad}</td>
                    <td className="py-2 text-right text-gray-500">{ing.rendimiento}%</td>
                    <td className="py-2 text-right font-mono text-gray-800">${ing.costoLinea.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen de costos */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Análisis de costos</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400">Costo total</p>
                <p className="text-lg font-bold text-gray-900 font-mono">${costoTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Costo por porción</p>
                <p className="text-lg font-bold text-gray-900 font-mono">${costoPorcion.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Precio sugerido ({receta.food_cost_objetivo}% FC)</p>
                <p className="text-lg font-bold text-red-600 font-mono">${precioSugerido.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Procedimiento */}
          {receta.procedimiento && (
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Procedimiento</h2>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {receta.procedimiento}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-300">Generado con mise ai · mise-ia.com</span>
            <span className="text-xs text-gray-300">Food cost objetivo: {receta.food_cost_objetivo}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
