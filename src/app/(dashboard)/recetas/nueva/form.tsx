'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearReceta } from '../actions'

type Ingrediente = {
  id: string
  nombre: string
  unidad: string
  precio_compra: number
  cantidad_comprada: number
  rendimiento: number
}

type LineaIngrediente = {
  key: number
  ingrediente_id: string
  cantidad: string
}

const CATEGORIAS = ['Entrada', 'Plato fuerte', 'Postre', 'Bebida', 'Snack', 'Salsa/Base', 'Otro']

function costoIngrediente(ing: Ingrediente, cantidad: number) {
  const precioUnit = ing.precio_compra / ing.cantidad_comprada
  const costoReal = precioUnit / (ing.rendimiento / 100)
  return cantidad * costoReal
}

export function NuevaRecetaForm({ ingredientesCatalogo }: { ingredientesCatalogo: Ingrediente[] }) {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('Plato fuerte')
  const [porciones, setPorciones] = useState('1')
  const [procedimiento, setProcedimiento] = useState('')
  const [foodCostObj, setFoodCostObj] = useState('30')
  const [lineas, setLineas] = useState<LineaIngrediente[]>([{ key: 0, ingrediente_id: '', cantidad: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const keyCounter = { val: 1 }

  function addLinea() {
    setLineas(prev => [...prev, { key: Date.now(), ingrediente_id: '', cantidad: '' }])
  }

  function removeLinea(key: number) {
    setLineas(prev => prev.filter(l => l.key !== key))
  }

  function updateLinea(key: number, field: 'ingrediente_id' | 'cantidad', value: string) {
    setLineas(prev => prev.map(l => l.key === key ? { ...l, [field]: value } : l))
  }

  // Cálculos en vivo
  const porcionesNum = parseInt(porciones) || 1
  const foodCostObjNum = parseFloat(foodCostObj) || 30

  const costoTotal = lineas.reduce((sum, linea) => {
    if (!linea.ingrediente_id || !linea.cantidad) return sum
    const ing = ingredientesCatalogo.find(i => i.id === linea.ingrediente_id)
    if (!ing) return sum
    return sum + costoIngrediente(ing, parseFloat(linea.cantidad) || 0)
  }, 0)

  const costoPorcion = costoTotal / porcionesNum
  const precioSugerido = foodCostObjNum > 0 ? costoPorcion / (foodCostObjNum / 100) : 0
  const lineasValidas = lineas.filter(l => l.ingrediente_id && l.cantidad && parseFloat(l.cantidad) > 0)

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
      ingredientes: lineasValidas.map(l => ({
        ingrediente_id: l.ingrediente_id,
        cantidad: parseFloat(l.cantidad),
      })),
    })

    setLoading(false)
    if ('error' in result && result.error) {
      setError(result.error)
    } else {
      router.push('/recetas')
      router.refresh()
    }
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
                  placeholder="Ej: Pollo a la plancha, Ensalada César..."
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
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold text-sm">Ingredientes</h2>
                <span className="text-[#3A3A3A] text-xs">{lineasValidas.length} seleccionados</span>
              </div>

              {ingredientesCatalogo.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#4A4A4A] text-sm mb-2">No tienes ingredientes en tu catálogo</p>
                  <a href="/ingredientes" className="text-red-500 text-xs hover:text-red-400">Agregar ingredientes →</a>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Header columnas */}
                  <div className="grid grid-cols-[1fr_140px_32px] gap-3 px-1 text-[10px] text-[#333333] uppercase tracking-wider mb-2">
                    <span>Ingrediente</span>
                    <span>Cantidad</span>
                    <span></span>
                  </div>

                  {lineas.map((linea) => {
                    const ingSeleccionado = ingredientesCatalogo.find(i => i.id === linea.ingrediente_id)
                    const costoLinea = ingSeleccionado && linea.cantidad
                      ? costoIngrediente(ingSeleccionado, parseFloat(linea.cantidad) || 0)
                      : null

                    return (
                      <div key={linea.key} className="grid grid-cols-[1fr_140px_32px] gap-3 items-center">
                        <select value={linea.ingrediente_id}
                          onChange={e => updateLinea(linea.key, 'ingrediente_id', e.target.value)}
                          className="w-full bg-[#111111] border border-[#1F1F1F] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600/50 transition-all">
                          <option value="">Seleccionar...</option>
                          {ingredientesCatalogo.map(i => (
                            <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>
                          ))}
                        </select>
                        <div className="relative">
                          <input type="number" value={linea.cantidad}
                            onChange={e => updateLinea(linea.key, 'cantidad', e.target.value)}
                            placeholder="0"
                            step="0.001" min="0"
                            className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
                          {ingSeleccionado && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A3A3A] text-xs">{ingSeleccionado.unidad}</span>
                          )}
                        </div>
                        <button type="button" onClick={() => removeLinea(linea.key)}
                          disabled={lineas.length === 1}
                          className="w-8 h-8 flex items-center justify-center text-[#333333] hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-20">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
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

          {/* Panel lateral — costeo en vivo */}
          <div className="space-y-4">
            {/* Food cost objetivo */}
            <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Objetivo de food cost</h3>
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
              <p className="text-[#3A3A3A] text-xs mt-2">El ideal para restaurantes es 28–32%</p>
            </div>

            {/* Resumen de costos */}
            <div className="bg-red-600 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-red-500/30 rounded-full" />
              <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-red-700/40 rounded-full" />
              <div className="relative z-10">
                <p className="text-red-200 text-xs font-semibold uppercase tracking-wider mb-4">Resumen de costos</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-red-200 text-xs">Costo total receta:</span>
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

            {/* Detalle por ingrediente */}
            {lineasValidas.length > 0 && (
              <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-5">
                <p className="text-[10px] text-[#3A3A3A] uppercase tracking-wider font-semibold mb-3">Desglose</p>
                <div className="space-y-2">
                  {lineasValidas.map(linea => {
                    const ing = ingredientesCatalogo.find(i => i.id === linea.ingrediente_id)!
                    const costo = costoIngrediente(ing, parseFloat(linea.cantidad))
                    const pct = costoTotal > 0 ? (costo / costoTotal) * 100 : 0
                    return (
                      <div key={linea.key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[#6A6A6A] text-xs truncate">{ing.nombre}</span>
                          <span className="text-white text-xs font-mono ml-2 shrink-0">${costo.toFixed(2)}</span>
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
