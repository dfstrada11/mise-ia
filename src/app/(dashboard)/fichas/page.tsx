import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function FichasPage() {
  const supabase = await createClient()

  const { data: recetas } = await supabase
    .from('recetas')
    .select(`
      id, nombre, categoria, porciones, food_cost_objetivo, created_at,
      receta_ingredientes (
        cantidad,
        ingredientes (precio_compra, cantidad_comprada, rendimiento)
      )
    `)
    .order('created_at', { ascending: false })

  const recetasConCosto = (recetas ?? []).map(r => {
    const costoTotal = (r.receta_ingredientes ?? []).reduce((sum: number, ri: any) => {
      const ing = ri.ingredientes
      if (!ing) return sum
      const precioUnit = ing.precio_compra / ing.cantidad_comprada
      const costoReal = precioUnit / (ing.rendimiento / 100)
      return sum + (ri.cantidad * costoReal)
    }, 0)
    const costoPorcion = costoTotal / r.porciones
    const precioSugerido = r.food_cost_objetivo > 0 ? costoPorcion / (r.food_cost_objetivo / 100) : 0
    const numIngredientes = r.receta_ingredientes?.length ?? 0
    return { ...r, costoTotal, costoPorcion, precioSugerido, numIngredientes }
  })

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1F1F1F] bg-[#080808] sticky top-0 z-10">
        <div>
          <p className="text-[#5A5A5A] text-xs">Módulo 03</p>
          <h1 className="text-white font-semibold text-base">Fichas técnicas</h1>
        </div>
        <Link href="/recetas/nueva"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva receta
        </Link>
      </div>

      <div className="px-8 py-6 pb-28 md:pb-8">
        {recetasConCosto.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] flex items-center justify-center mb-5 text-2xl">📄</div>
            <h3 className="text-white font-semibold text-base mb-2">Sin fichas todavía</h3>
            <p className="text-[#4A4A4A] text-sm max-w-xs leading-relaxed mb-6">
              Las fichas técnicas se generan automáticamente desde tus recetas. Crea tu primera receta para generar una ficha.
            </p>
            <Link href="/recetas/nueva"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors">
              Crear primera receta →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recetasConCosto.map(r => (
              <Link key={r.id} href={`/fichas/${r.id}`}
                className="bg-[#0E0E0E] border border-[#181818] hover:border-red-600/25 hover:bg-[#111111] rounded-2xl p-5 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center text-lg">
                    📄
                  </div>
                  <span className="text-[10px] text-[#4A4A4A] border border-[#1F1F1F] px-2 py-0.5 rounded-full">{r.categoria}</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{r.nombre}</h3>
                <p className="text-[#3A3A3A] text-xs mb-4">{r.numIngredientes} ingredientes · {r.porciones} porciones</p>
                <div className="space-y-1.5 pt-3 border-t border-[#141414]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#4A4A4A] text-xs">Costo/porción</span>
                    <span className="text-white text-xs font-mono">${r.costoPorcion.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#4A4A4A] text-xs">Precio sugerido</span>
                    <span className="text-emerald-400 text-xs font-mono font-semibold">${r.precioSugerido.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#141414] flex items-center justify-between">
                  <span className="text-[#3A3A3A] text-xs">Ver ficha técnica</span>
                  <span className="text-red-500 text-xs group-hover:text-red-400 transition-colors">Abrir →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
