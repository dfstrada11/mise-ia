'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearReceta } from '../actions'
import { buscarIngredienteRef } from '@/lib/rendimientos-catalogo'

type Ingrediente = {
  id: string
  nombre: string
  unidad: string
  precio_compra: number
  cantidad_comprada: number
}

type Linea = {
  key: number
  ingrediente_id: string
  cantidad: string      // cantidad del producto bruto que asignas a este plato
  rendimiento: string   // % de esa cantidad que termina en el plato
}

const CATEGORIAS = ['Entrada', 'Plato fuerte', 'Postre', 'Bebida', 'Snack', 'Salsa/Base', 'Otro']

function precioUnitario(ing: Ingrediente) {
  return ing.precio_compra / ing.cantidad_comprada
}

// Costo de una línea: el chef asigna X cantidad bruta, el rendimiento dice cuánto termina en el plato.
// El costo se basa en la cantidad BRUTA (lo que realmente se consume/descuenta del inventario).
function costoLinea(ing: Ingrediente, cantidad: number, rendimiento: number) {
  // cantidad = gramos/kg/unidad que tomas del stock para esta receta
  // Para obtener X gramos "en el plato" necesitas cantidad / (rendimiento/100) del bruto.
  // Pero aquí el chef ya ingresa la cantidad BRUTA, así que el costo es directo.
  const pu = precioUnitario(ing)
  return cantidad * pu
}

// Cuánto queda aprovechable (en el plato) después del rendimiento
function cantidadAprovechable(cantidad: number, rendimiento: number) {
  return cantidad * (rendimiento / 100)
}

export function NuevaRecetaForm({ ingredientesCatalogo }: { ingredientesCatalogo: Ingrediente[] }) {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('Plato fuerte')
  const [porciones, setPorciones] = useState('1')
  const [procedimiento, setProcedimiento] = useState('')
  const [foodCostObj, setFoodCostObj] = useState('30')
  const [lineas, setLineas] = useState<Linea[]>([{ key: 0, ingrediente_id: '', cantidad: '', rendimiento: '100' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addLinea() {
    setLineas(prev => [...prev, { key: Date.now(), ingrediente_id: '', cantidad: '', rendimiento: '100' }])
  }

  function removeLinea(key: number) {
    setLineas(prev => prev.filter(l => l.key !== key))
  }

  function updateLinea(key: number, field: keyof Linea, value: string) {
    setLineas(prev => prev.map(l => {
      if (l.key !== key) return l
      const updated = { ...l, [field]: value }
      // Al cambiar el ingrediente, sugerir rendimiento de la biblioteca
      if (field === 'ingrediente_id') {
        const ing = ingredientesCatalogo.find(i => i.id === value)
        if (ing) {
          const sugs = buscarIngredienteRef(ing.nombre)
          if (sugs.length > 0) updated.rendimiento = String(sugs[0].rendimiento)
          else updated.rendimiento = '100'
        }
        updated.cantidad = ''
      }
      return updated
    }))
  }

  const porcionesNum = parseInt(porciones) || 1
  const foodCostObjNum = parseFloat(foodCostObj) || 30

  const lineasConDatos = lineas.filter(l => l.ingrediente_id && l.cantidad && parseFloat(l.cantidad) > 0)

  const costoTotal = lineasConDatos.reduce((sum, l) => {
    const ing = ingredientesCatalogo.find(i => i.id === l.ingrediente_id)
    if (!ing) return sum
    return sum + costoLinea(ing, parseFloat(l.cantidad), parseFloat(l.rendimiento) || 100)
  }, 0)

  const costoPorcion = costoTotal / porcionesNum
  const precioSugerido = foodCostObjNum > 0 ? costoPorcion / (foodCostObjNum / 100) : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre) return
    setLoading(true)
    setError('')

    const result = await crearReceta({
      nombre,
      categoria,
      porciones: porcionesNum,
      procedimiento,
      food_cost_objetivo: foodCostObjNum,
      ingredientes: lineasConDatos.map(l => ({
        ingrediente_id: l.ingrediente_id,
        cantidad: parseFloat(l.cantidad),
        rendimiento: parseFloat(l.rendimiento) || 100,
      })),
    })

    setLoading(false)
    if ('error' in result && result.error) setError(result.error)
    else { router.push('/recetas'); router.refresh() }
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1F1F1F] bg-[#080808] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[#4A4A4A] hover:text-white hover:bg-[#1A1A1A] transition-all">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <p className="text-[#5A5A5A] text-xs">Módulo 02</p>
            <h1 className="text-white font-semibold text-base">Nueva receta</h1>
          </div>
        </div>
        <button type="submit" form="receta-form" disabled={loading || !nombre}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors">
          {loading ? 'Guardando...' : 'Guardar receta'}
        </button>
      </div>

      <form id="receta-form" onSubmit={handleSubmit}>
        <div className="px-8 py-8 pb-24 md:pb-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* Columna principal */}
          <div className="space-y-6">

            {/* Info básica */}
            <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-6 space-y-5">
              <h2 className="text-white font-semibold text-sm">Información de la receta</h2>
              <div>
                <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-2 uppercase tracking-wider">Nombre del plato</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Pollo a la plancha, Consomé de res..."
                  required
                  className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-2 uppercase tracking-wider">Categoría</label>
                  <select value={categoria} onChange={e => setCategoria(e.target.value)}
                    className="w-full bg-[#111111] border border-[#1F1F1F] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all">
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-2 uppercase tracking-wider">Porciones que rinde</label>
                  <input type="number" value={porciones} onChange={e => setPorciones(e.target.value)}
                    min="1" required
                    className="w-full bg-[#111111] border border-[#1F1F1F] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
                </div>
              </div>
            </div>

            {/* Ingredientes */}
            <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-white font-semibold text-sm">Ingredientes de esta receta</h2>
                <span className="text-[#3A3A3A] text-xs">{lineasConDatos.length} seleccionados</span>
              </div>

              {/* Explicación del modelo */}
              <div className="bg-[#0A0A0A] border border-[#161616] rounded-xl p-4 mb-5">
                <p className="text-[#5A5A5A] text-[11px] leading-relaxed">
                  <span className="text-white font-medium">Cantidad bruta + rendimiento por uso.</span>
                  {' '}Ejemplo: compras pollo entero, pero en este plato solo usas la pechuga.
                  Pon la cantidad bruta que tomas del stock (ej: 500g de pollo entero)
                  y el rendimiento para este corte (ej: 55% → 275g de pechuga en el plato).
                  El mismo pollo puede tener 35% de rendimiento en otra receta que usa los muslos.
                </p>
              </div>

              {ingredientesCatalogo.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#4A4A4A] text-sm mb-2">No tienes ingredientes en tu catálogo</p>
                  <a href="/ingredientes" className="text-red-500 text-xs hover:text-red-400">Agregar ingredientes →</a>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Header columnas */}
                  <div className="grid grid-cols-[1fr_130px_90px_32px] gap-3 px-1 pb-1 text-[10px] text-[#333333] uppercase tracking-wider font-semibold">
                    <span>Ingrediente</span>
                    <span>Cantidad bruta</span>
                    <span className="text-center">Rendimiento</span>
                    <span></span>
                  </div>

                  {lineas.map((linea) => {
                    const ing = ingredientesCatalogo.find(i => i.id === linea.ingrediente_id)
                    const rendNum = parseFloat(linea.rendimiento) || 100
                    const cantNum = parseFloat(linea.cantidad) || 0
                    const aprovechable = cantNum > 0 ? cantidadAprovechable(cantNum, rendNum) : null
                    const costo = ing && cantNum > 0 ? costoLinea(ing, cantNum, rendNum) : null
                    const hayMerma = rendNum < 100

                    // Sugerencia de rendimiento de la biblioteca
                    const sugs = ing ? buscarIngredienteRef(ing.nombre) : []
                    const rendSugerido = sugs.length > 0 ? sugs[0].rendimiento : null

                    return (
                      <div key={linea.key} className="space-y-1.5">
                        <div className="grid grid-cols-[1fr_130px_90px_32px] gap-3 items-center">
                          <select value={linea.ingrediente_id}
                            onChange={e => updateLinea(linea.key, 'ingrediente_id', e.target.value)}
                            className="w-full bg-[#111111] border border-[#1F1F1F] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600/50 transition-all">
                            <option value="">Seleccionar ingrediente...</option>
                            {ingredientesCatalogo.map(i => (
                              <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>
                            ))}
                          </select>

                          <div className="relative">
                            <input type="number" value={linea.cantidad}
                              onChange={e => updateLinea(linea.key, 'cantidad', e.target.value)}
                              placeholder="0"
                              step="0.001" min="0"
                              className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
                            {ing && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#333333] text-xs">{ing.unidad}</span>
                            )}
                          </div>

                          {/* Rendimiento por receta */}
                          <div className="relative">
                            <input type="number" value={linea.rendimiento}
                              onChange={e => updateLinea(linea.key, 'rendimiento', String(Math.min(100, Math.max(1, parseInt(e.target.value) || 1))))}
                              min="1" max="100"
                              className={`w-full bg-[#111111] border rounded-xl pl-3 pr-7 py-2.5 text-sm text-center focus:outline-none transition-all ${
                                rendNum >= 90 ? 'border-emerald-600/30 text-emerald-400 focus:border-emerald-500/50' :
                                rendNum >= 65 ? 'border-amber-600/30 text-amber-400 focus:border-amber-500/50' :
                                'border-red-600/30 text-red-400 focus:border-red-500/50'
                              }`} />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#333333] text-xs">%</span>
                          </div>

                          <button type="button" onClick={() => removeLinea(linea.key)}
                            disabled={lineas.length === 1}
                            className="w-8 h-8 flex items-center justify-center text-[#333333] hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-20">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Fila de detalle cuando hay datos */}
                        {ing && cantNum > 0 && (
                          <div className="grid grid-cols-[1fr_130px_90px_32px] gap-3 pl-1">
                            <div className="flex items-center gap-2">
                              {rendSugerido && rendSugerido !== rendNum && (
                                <button type="button"
                                  onClick={() => updateLinea(linea.key, 'rendimiento', String(rendSugerido))}
                                  className="text-[10px] text-[#3A3A3A] hover:text-amber-400 border border-[#1F1F1F] hover:border-amber-400/30 px-2 py-0.5 rounded-md transition-all">
                                  Usar {rendSugerido}% típico
                                </button>
                              )}
                              {sugs[0]?.subproducto && (
                                <span className="text-[10px] text-[#3A3A3A]">💡 {sugs[0].subproducto}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              {aprovechable !== null && (
                                <span className="text-[10px] text-[#3A3A3A]">
                                  {hayMerma
                                    ? `→ ${aprovechable.toFixed(0)}${ing.unidad.slice(0,1)} en el plato`
                                    : `→ 100% al plato`
                                  }
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              {costo !== null && (
                                <span className="text-[11px] text-white font-mono font-semibold">${costo.toFixed(3)}</span>
                              )}
                            </div>
                            <div />
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <button type="button" onClick={addLinea}
                    className="flex items-center gap-2 text-[#4A4A4A] hover:text-white text-xs mt-3 px-1 py-2 transition-colors">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Agregar ingrediente
                  </button>
                </div>
              )}
            </div>

            {/* Procedimiento */}
            <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-6">
              <h2 className="text-white font-semibold text-sm mb-4">Procedimiento</h2>
              <textarea value={procedimiento} onChange={e => setProcedimiento(e.target.value)}
                placeholder="Describe los pasos de preparación..."
                rows={6}
                className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all resize-none" />
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Panel lateral */}
          <div className="space-y-4">
            {/* Food cost objetivo */}
            <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Food cost objetivo</h3>
              <div className="flex items-center gap-3">
                <input type="range" min="10" max="60" value={foodCostObj}
                  onChange={e => setFoodCostObj(e.target.value)}
                  className="flex-1 accent-red-600" />
                <div className="flex items-center gap-1">
                  <input type="number" value={foodCostObj}
                    onChange={e => setFoodCostObj(String(Math.min(60, Math.max(10, parseInt(e.target.value) || 30))))}
                    min="10" max="60"
                    className="w-12 bg-[#111111] border border-[#1F1F1F] text-white text-sm text-center rounded-lg px-2 py-1.5 focus:outline-none" />
                  <span className="text-[#5A5A5A] text-sm">%</span>
                </div>
              </div>
              <p className="text-[#3A3A3A] text-xs mt-2">Ideal para restaurantes: 28–32%</p>
            </div>

            {/* Resumen de costos */}
            <div className="bg-red-600 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-red-500/30 rounded-full" />
              <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-red-700/40 rounded-full" />
              <div className="relative z-10">
                <p className="text-red-200 text-xs font-semibold uppercase tracking-wider mb-4">Resumen de costos</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-red-200 text-xs">Materia prima total:</span>
                    <span className="text-white text-sm font-mono font-bold">${costoTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-200 text-xs">Porciones:</span>
                    <span className="text-white text-sm font-mono">{porcionesNum}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-red-500/40">
                    <span className="text-red-100 text-xs font-semibold">Costo por porción:</span>
                    <span className="text-white text-base font-mono font-bold">${costoPorcion.toFixed(2)}</span>
                  </div>
                </div>
                {precioSugerido > 0 && (
                  <div className="mt-4 pt-4 border-t border-red-500/40">
                    <p className="text-red-200 text-[10px] uppercase tracking-wider mb-1">Precio sugerido ({foodCostObj}% FC)</p>
                    <p className="text-white text-2xl font-bold font-mono">${precioSugerido.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Desglose por ingrediente */}
            {lineasConDatos.length > 0 && (
              <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-5">
                <p className="text-[10px] text-[#3A3A3A] uppercase tracking-wider font-semibold mb-3">Desglose</p>
                <div className="space-y-3">
                  {lineasConDatos.map(l => {
                    const ing = ingredientesCatalogo.find(i => i.id === l.ingrediente_id)!
                    const rendNum = parseFloat(l.rendimiento) || 100
                    const costo = costoLinea(ing, parseFloat(l.cantidad), rendNum)
                    const pct = costoTotal > 0 ? (costo / costoTotal) * 100 : 0
                    const hayMerma = rendNum < 100
                    return (
                      <div key={l.key}>
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <div className="min-w-0">
                            <span className="text-[#6A6A6A] text-xs block truncate">{ing.nombre}</span>
                            {hayMerma && (
                              <span className="text-[10px] text-[#3A3A3A]">{rendNum}% rendimiento</span>
                            )}
                          </div>
                          <span className="text-white text-xs font-mono shrink-0">${costo.toFixed(3)}</span>
                        </div>
                        <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                          <div className="h-full bg-red-600/60 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
