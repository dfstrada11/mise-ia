'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearReceta } from '../actions'
import { crearIngredienteRapido } from '../../ingredientes/actions'
import { buscarIngredienteRef, type IngredienteRef } from '@/lib/rendimientos-catalogo'

type Ingrediente = {
  id: string
  nombre: string
  unidad: string
  precio_compra: number
  cantidad_comprada: number
  rendimiento: number
}

type Linea = {
  key: number
  ingrediente_id: string
  cantidad: string
  unidad: string  // gr | oz — unidad usada en la receta
}

const CATEGORIAS = ['Entrada', 'Plato fuerte', 'Postre', 'Bebida', 'Snack', 'Salsa/Base', 'Otro']

// Factor de conversión a gramos para cada unidad de compra
const A_GRAMOS: Record<string, number> = {
  'gramo': 1, 'gr': 1,
  'oz': 28.3495,
  'libra (lb)': 453.592, 'lb': 453.592,
  'kg': 1000,
  'ml': 1, 'litro': 1000,
}

// Si el ingrediente tiene factor de peso conocido, convierte; si no, usa la unidad del ingrediente
function precioPorGramo(ing: Ingrediente): number | null {
  const factor = A_GRAMOS[ing.unidad]
  if (!factor) return null  // unidad, pieza, caja — no convertible a gramos
  return (ing.precio_compra / ing.cantidad_comprada) / factor
}

function costoLinea(ing: Ingrediente, cantidad: number, unidadReceta: string) {
  const ppg = precioPorGramo(ing)
  if (ppg !== null) {
    // La cantidad está en gr u oz → convertir a gramos
    const cantGramos = cantidad * (A_GRAMOS[unidadReceta] ?? 1)
    return cantGramos * ppg / (ing.rendimiento / 100)
  }
  // Unidad no convertible: calcular directo en la unidad del ingrediente
  const precioUnit = ing.precio_compra / ing.cantidad_comprada
  return cantidad * precioUnit / (ing.rendimiento / 100)
}

// ¿Este ingrediente soporta selección gr/oz? Solo si tiene factor de peso
function esConvertible(ing: Ingrediente) {
  return ing.unidad in A_GRAMOS
}

export function NuevaRecetaForm({
  ingredientesCatalogo,
  costoMOPorPlato = 0,
  foodCostDefault = 30,
  moneda = 'USD',
}: {
  ingredientesCatalogo: Ingrediente[]
  costoMOPorPlato?: number
  foodCostDefault?: number
  moneda?: string
}) {
  const router = useRouter()
  const [catalogo, setCatalogo] = useState<Ingrediente[]>(ingredientesCatalogo)
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('Plato fuerte')
  const [porciones, setPorciones] = useState('1')
  const [procedimiento, setProcedimiento] = useState('')
  const [foodCostObj, setFoodCostObj] = useState(String(foodCostDefault))
  const [lineas, setLineas] = useState<Linea[]>([{ key: 0, ingrediente_id: '', cantidad: '', unidad: 'gr' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddLineaKey, setQuickAddLineaKey] = useState<number | null>(null)

  function addLinea() {
    setLineas(prev => [...prev, { key: Date.now(), ingrediente_id: '', cantidad: '', unidad: 'gr' }])
  }

  function removeLinea(key: number) {
    setLineas(prev => prev.filter(l => l.key !== key))
  }

  function updateLinea(key: number, field: keyof Linea, value: string) {
    setLineas(prev => prev.map(l => l.key === key ? { ...l, [field]: value } : l))
  }

  const porcionesNum = parseInt(porciones) || 1
  const foodCostObjNum = parseFloat(foodCostObj) || 30
  const currSymbol = moneda === 'GTQ' ? 'Q' : moneda === 'HNL' ? 'L' : moneda === 'CRC' ? '₡' : '$'

  const lineasValidas = lineas.filter(l => l.ingrediente_id && l.cantidad && parseFloat(l.cantidad) > 0)

  const costoIngredientes = lineasValidas.reduce((sum, l) => {
    const ing = catalogo.find(i => i.id === l.ingrediente_id)
    if (!ing) return sum
    return sum + costoLinea(ing, parseFloat(l.cantidad), l.unidad)
  }, 0)

  const costoTotal = costoIngredientes  // base para el panel
  const costoTotalConMO = costoTotal + (costoMOPorPlato * porcionesNum)
  const costoPorcion = costoTotal / porcionesNum
  const costoPorcionConMO = costoPorcion + costoMOPorPlato
  const precioSugerido = foodCostObjNum > 0 ? costoPorcion / (foodCostObjNum / 100) : 0
  const precioSugeridoConMO = foodCostObjNum > 0 ? costoPorcionConMO / (foodCostObjNum / 100) : 0

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
        unidad: l.unidad,
        rendimiento: catalogo.find(i => i.id === l.ingrediente_id)?.rendimiento ?? 100,
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
        <div className="px-8 py-8 pb-24 md:pb-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

          {/* Columna principal */}
          <div className="space-y-6">

            {/* Info básica */}
            <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-6 space-y-5">
              <h2 className="text-white font-semibold text-sm">Información</h2>
              <div>
                <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-2 uppercase tracking-wider">Nombre del plato</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Pollo a la plancha..."
                  required autoFocus
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
                  <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-2 uppercase tracking-wider">¿Para cuántos platos?</label>
                  <input type="number" value={porciones} onChange={e => setPorciones(e.target.value)}
                    min="1" required
                    className="w-full bg-[#111111] border border-[#1F1F1F] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
                  <p className="text-[#2A2A2A] text-[10px] mt-1.5">
                    {porcionesNum === 1
                      ? 'Receta individual — para 1 plato'
                      : `Esta receta alcanza para ${porcionesNum} platos — el costo se divide entre ellos`}
                  </p>
                </div>
              </div>
            </div>

            {/* Ingredientes — solo ingrediente + cantidad */}
            <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold text-sm">¿Qué lleva este plato?</h2>
                <span className="text-[#3A3A3A] text-xs">{lineasValidas.length} ingredientes</span>
              </div>

              {ingredientesCatalogo.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#4A4A4A] text-sm mb-1">Primero agrega ingredientes a tu catálogo</p>
                  <a href="/ingredientes" className="text-red-500 text-xs hover:text-red-400">Ir a ingredientes →</a>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {lineas.map((linea) => {
                    const ing = catalogo.find(i => i.id === linea.ingrediente_id)
                    const cantNum = parseFloat(linea.cantidad) || 0
                    const costo = ing && cantNum > 0 ? costoLinea(ing, cantNum, linea.unidad) : null

                    const convertible = ing ? esConvertible(ing) : true

                    return (
                      <div key={linea.key} className="flex items-center gap-3">
                        <select value={linea.ingrediente_id}
                          onChange={e => updateLinea(linea.key, 'ingrediente_id', e.target.value)}
                          className="flex-1 bg-[#111111] border border-[#1F1F1F] text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all">
                          <option value="">Seleccionar ingrediente...</option>
                          {ingredientesCatalogo.map(i => (
                            <option key={i.id} value={i.id}>{i.nombre}</option>
                          ))}
                        </select>

                        {/* Cantidad + unidad receta */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input type="number" value={linea.cantidad}
                            onChange={e => updateLinea(linea.key, 'cantidad', e.target.value)}
                            placeholder="0"
                            step="1" min="0"
                            className="w-24 bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
                          {convertible ? (
                            <div className="flex rounded-xl border border-[#1F1F1F] overflow-hidden">
                              {(['gr', 'oz'] as const).map(u => (
                                <button key={u} type="button"
                                  onClick={() => updateLinea(linea.key, 'unidad', u)}
                                  className={`px-2.5 py-3 text-xs font-semibold transition-colors ${
                                    linea.unidad === u
                                      ? 'bg-red-600 text-white'
                                      : 'bg-[#111111] text-[#3A3A3A] hover:text-[#7A7A7A]'
                                  }`}>
                                  {u}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#3A3A3A] text-xs w-10 text-center">{ing?.unidad ?? ''}</span>
                          )}
                        </div>

                        <div className="w-16 text-right shrink-0">
                          {costo !== null
                            ? <span className="text-white text-sm font-mono font-semibold">${costo.toFixed(2)}</span>
                            : <span className="text-[#2A2A2A] text-sm">—</span>
                          }
                        </div>

                        <button type="button" onClick={() => removeLinea(linea.key)}
                          disabled={lineas.length === 1}
                          className="w-8 h-8 shrink-0 flex items-center justify-center text-[#2A2A2A] hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-20">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )
                  })}

                  <div className="flex items-center justify-between mt-1">
                    <button type="button" onClick={addLinea}
                      className="flex items-center gap-2 text-[#4A4A4A] hover:text-white text-xs px-1 py-2 transition-colors">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Agregar otro ingrediente
                    </button>
                    <button type="button"
                      onClick={() => { setQuickAddLineaKey(null); setShowQuickAdd(true) }}
                      className="flex items-center gap-1.5 text-[#3A3A3A] hover:text-red-400 text-xs px-1 py-2 transition-colors">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Nuevo ingrediente al catálogo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Procedimiento */}
            <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-6">
              <h2 className="text-white font-semibold text-sm mb-4">
                Procedimiento <span className="text-[#3A3A3A] font-normal text-xs ml-1">(opcional)</span>
              </h2>
              <textarea value={procedimiento} onChange={e => setProcedimiento(e.target.value)}
                placeholder="Pasos de preparación..."
                rows={5}
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
              <h3 className="text-white font-semibold text-sm mb-1">Food cost objetivo</h3>
              <p className="text-[#3A3A3A] text-xs mb-4">¿Qué % del precio de venta es materia prima?</p>
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
              <p className="text-[#2A2A2A] text-[11px] mt-2">Recomendado para restaurantes: 28–32%</p>
            </div>

            {/* Resumen de costos */}
            <div className="bg-red-600 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-red-500/30 rounded-full" />
              <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-red-700/40 rounded-full" />
              <div className="relative z-10">
                <p className="text-red-200 text-xs font-semibold uppercase tracking-wider mb-4">Costo real por porción</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-red-200 text-sm">Ingredientes:</span>
                    <span className="text-white text-sm font-mono">{currSymbol}{costoPorcion.toFixed(2)}</span>
                  </div>
                  {costoMOPorPlato > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-red-200 text-sm">Mano de obra:</span>
                      <span className="text-white text-sm font-mono">{currSymbol}{costoMOPorPlato.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2.5 border-t border-red-500/40">
                    <span className="text-red-100 text-sm font-semibold">Costo total:</span>
                    <span className="text-white text-xl font-mono font-bold">
                      {currSymbol}{(costoMOPorPlato > 0 ? costoPorcionConMO : costoPorcion).toFixed(2)}
                    </span>
                  </div>
                </div>
                {precioSugerido > 0 && (
                  <div className="mt-4 pt-4 border-t border-red-500/40">
                    <p className="text-red-200 text-[11px] uppercase tracking-wider mb-1">Precio de venta sugerido</p>
                    <p className="text-white text-3xl font-bold font-mono">
                      {currSymbol}{(costoMOPorPlato > 0 ? precioSugeridoConMO : precioSugerido).toFixed(2)}
                    </p>
                    {costoMOPorPlato > 0 && (
                      <p className="text-red-300/60 text-[10px] mt-1">Incluye ingredientes + mano de obra</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desglose */}
            {lineasValidas.length > 0 && (
              <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-5">
                <p className="text-[10px] text-[#3A3A3A] uppercase tracking-wider font-semibold mb-3">Desglose por ingrediente</p>
                <div className="space-y-2.5">
                  {lineasValidas.map(l => {
                    const ing = catalogo.find(i => i.id === l.ingrediente_id)!
                    const costo = costoLinea(ing, parseFloat(l.cantidad), l.unidad)
                    const pct = costoTotal > 0 ? (costo / costoTotal) * 100 : 0
                    return (
                      <div key={l.key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[#6A6A6A] text-xs truncate flex-1 pr-2">{ing.nombre}</span>
                          <span className="text-white text-xs font-mono">${costo.toFixed(2)}</span>
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

      {/* Modal: añadir ingrediente rápido sin salir del form */}
      {showQuickAdd && (
        <QuickAddIngredienteModal
          onClose={() => setShowQuickAdd(false)}
          onSuccess={(ing) => {
            setCatalogo(prev => [...prev, ing])
            // Si había una línea vacía, auto-seleccionar; si no, agregar línea nueva
            const lineaVacia = lineas.find(l => !l.ingrediente_id)
            if (lineaVacia) {
              updateLinea(lineaVacia.key, 'ingrediente_id', ing.id)
            } else {
              const newKey = Date.now()
              setLineas(prev => [...prev, { key: newKey, ingrediente_id: ing.id, cantidad: '', unidad: 'gr' }])
            }
            setShowQuickAdd(false)
          }}
        />
      )}
    </div>
  )
}

// ─── MODAL QUICK-ADD ──────────────────────────────────────────────────────────

const UNIDADES_COMPRA = ['libra (lb)', 'kg', 'litro', 'unidad', 'gramo', 'oz', 'ml', 'pieza', 'caja', 'bolsa', 'lata', 'manojo', 'docena']

function QuickAddIngredienteModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (ing: { id: string; nombre: string; unidad: string; precio_compra: number; cantidad_comprada: number; rendimiento: number }) => void
}) {
  const [nombre, setNombre] = useState('')
  const [unidad, setUnidad] = useState('libra (lb)')
  const [precio, setPrecio] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Autocomplete
  const [sugerencias, setSugerencias] = useState<IngredienteRef[]>([])
  const [showSug, setShowSug] = useState(false)

  function onNombreChange(v: string) {
    setNombre(v)
    const r = buscarIngredienteRef(v)
    setSugerencias(r)
    setShowSug(r.length > 0)
  }

  function seleccionar(sug: IngredienteRef) {
    setNombre(sug.nombre)
    setUnidad(sug.unidad)
    setShowSug(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const p = parseFloat(precio)
    const c = parseFloat(cantidad)
    if (!nombre || !p || !c) return
    setLoading(true)
    const result = await crearIngredienteRapido({
      nombre, unidad, precio_compra: p, cantidad_comprada: c, rendimiento: 100,
    })
    setLoading(false)
    if ('error' in result && result.error) { setError(result.error); return }
    if ('ingrediente' in result && result.ingrediente) onSuccess(result.ingrediente)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0E0E0E] border border-[#1F1F1F] rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm">Nuevo ingrediente</h3>
            <p className="text-[#3A3A3A] text-xs mt-0.5">Se guardará en tu catálogo y se agregará a la receta</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#3A3A3A] hover:text-white hover:bg-[#1A1A1A] rounded-xl transition-all">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre con autocomplete */}
          <div className="relative">
            <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">Ingrediente</label>
            <input
              value={nombre} onChange={e => onNombreChange(e.target.value)}
              onBlur={() => setTimeout(() => setShowSug(false), 150)}
              onFocus={() => sugerencias.length > 0 && setShowSug(true)}
              placeholder="Ej: Pollo entero..." autoFocus required
              className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
            {showSug && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden shadow-2xl">
                {sugerencias.map(s => (
                  <button key={s.nombre} type="button" onMouseDown={() => seleccionar(s)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#1A1A1A] text-left transition-colors border-t border-[#181818] first:border-0">
                    <span className="text-white text-sm">{s.nombre}</span>
                    <span className="text-[#3A3A3A] text-xs">{s.unidad}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Unidad de compra */}
          <div>
            <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">Unidad de compra</label>
            <select value={unidad} onChange={e => setUnidad(e.target.value)}
              className="w-full bg-[#111111] border border-[#1F1F1F] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all">
              {UNIDADES_COMPRA.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">¿Cuánto pagaste?</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3A3A3A] text-sm">$</span>
                <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
                  placeholder="0.00" step="0.01" min="0.01" required
                  className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
              </div>
              <div className="relative">
                <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)}
                  placeholder="1" step="0.001" min="0.001" required
                  className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl pl-3 pr-14 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3A3A3A] text-xs">{unidad}</span>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit" disabled={loading || !nombre || !precio || !cantidad}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-sm font-semibold py-3 rounded-xl transition-colors">
            {loading ? 'Guardando...' : 'Guardar y agregar a la receta'}
          </button>
        </form>
      </div>
    </div>
  )
}
