import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { eliminarReceta } from './actions'
import { revalidatePath } from 'next/cache'

const CATEGORIA_COLORS: Record<string, string> = {
  'Entrada': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'Plato fuerte': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Postre': 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  'Bebida': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  'Snack': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'Salsa/Base': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
}

export default async function RecetasPage() {
  const supabase = await createClient()

  const { data: recetas } = await supabase
    .from('recetas')
    .select(`
      id, nombre, categoria, porciones, food_cost_objetivo, created_at,
      receta_ingredientes (
        cantidad, rendimiento,
        ingredientes (precio_compra, cantidad_comprada)
      )
    `)
    .order('created_at', { ascending: false })

  // Calcular costo por receta usando el rendimiento por línea
  const recetasConCosto = (recetas ?? []).map(r => {
    const costoTotal = (r.receta_ingredientes ?? []).reduce((sum: number, ri: any) => {
      const ing = ri.ingredientes
      if (!ing) return sum
      const precioUnit = ing.precio_compra / ing.cantidad_comprada
      // Costo = cantidad bruta × precio unitario
      return sum + (ri.cantidad * precioUnit)
    }, 0)
    const costoPorcion = costoTotal / r.porciones
    const precioSugerido = r.food_cost_objetivo > 0 ? costoPorcion / (r.food_cost_objetivo / 100) : 0
    return { ...r, costoTotal, costoPorcion, precioSugerido }
  })

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1F1F1F] bg-[#080808] sticky top-0 z-10">
        <div>
          <p className="text-[#5A5A5A] text-xs">Módulo 02</p>
          <h1 className="text-white font-semibold text-base">Recetas</h1>
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
            <div className="w-16 h-16 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] flex items-center justify-center mb-5 text-2xl">📖</div>
            <h3 className="text-white font-semibold text-base mb-2">Sin recetas todavía</h3>
            <p className="text-[#4A4A4A] text-sm max-w-xs leading-relaxed mb-6">
              Crea tu primera receta seleccionando ingredientes de tu catálogo. El sistema calculará el costo por porción automáticamente.
            </p>
            <Link href="/recetas/nueva"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Crear primera receta
            </Link>
          </div>
        ) : (
          <div>
            {/* Header tabla */}
            <div className="grid grid-cols-[1fr_100px_110px_110px_120px_100px] gap-3 px-4 py-2 text-[10px] text-[#333333] uppercase tracking-wider font-semibold">
              <span>Receta</span>
              <span>Categoría</span>
              <span className="text-right">Costo total</span>
              <span className="text-right">Costo/porción</span>
              <span className="text-right">Precio sugerido</span>
              <span></span>
            </div>
            <div className="space-y-1.5">
              {recetasConCosto.map(r => {
                const catColor = CATEGORIA_COLORS[r.categoria] ?? 'text-[#6A6A6A] bg-[#1A1A1A] border-[#252525]'
                return (
                  <div key={r.id}
                    className="grid grid-cols-[1fr_100px_110px_110px_120px_100px] gap-3 px-4 py-4 bg-[#0E0E0E] border border-[#181818] rounded-xl hover:border-[#252525] hover:bg-[#111111] transition-all items-center group">
                    <div>
                      <p className="text-white text-sm font-medium">{r.nombre}</p>
                      <p className="text-[#3A3A3A] text-xs mt-0.5">{r.porciones} porción{r.porciones !== 1 ? 'es' : ''}</p>
                    </div>
                    <div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColor}`}>
                        {r.categoria}
                      </span>
                    </div>
                    <p className="text-[#9A9A9A] text-sm text-right font-mono">${r.costoTotal.toFixed(2)}</p>
                    <p className="text-white text-sm text-right font-mono font-semibold">${r.costoPorcion.toFixed(2)}</p>
                    <p className="text-emerald-400 text-sm text-right font-mono font-semibold">${r.precioSugerido.toFixed(2)}</p>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/fichas/${r.id}`}
                        className="p-1.5 text-[#3A3A3A] hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-all"
                        title="Ver ficha PDF">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </Link>
                      <DeleteRecetaButton id={r.id} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DeleteRecetaButton({ id }: { id: string }) {
  async function action() {
    'use server'
    await eliminarReceta(id)
    revalidatePath('/recetas')
  }
  return (
    <form action={action}>
      <button type="submit"
        className="p-1.5 text-[#3A3A3A] hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
        title="Eliminar">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>
    </form>
  )
}
