'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { crearIngrediente, editarIngrediente, eliminarIngrediente } from './actions'
import { buscarIngredienteRef, type IngredienteRef } from '@/lib/rendimientos-catalogo'

type Ingrediente = {
  id: string
  nombre: string
  unidad: string
  precio_compra: number
  cantidad_comprada: number
  rendimiento: number
}

const UNIDADES = ['kg', 'litro', 'gramo', 'ml', 'unidad', 'lb', 'oz', 'pieza', 'caja', 'bolsa', 'lata', 'manojo', 'sobre', 'taza']

function pu(i: Ingrediente) { return i.precio_compra / i.cantidad_comprada }

export function IngredientesView({ ingredientes }: { ingredientes: Ingrediente[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Ingrediente | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [unidadFilter, setUnidadFilter] = useState('')

  const filtered = ingredientes.filter(i => {
    const matchSearch = i.nombre.toLowerCase().includes(search.toLowerCase())
    const matchUnidad = !unidadFilter || i.unidad === unidadFilter
    return matchSearch && matchUnidad
  })

  const unidadesEnUso = [...new Set(ingredientes.map(i => i.unidad))]

  function openNuevo() { setEditing(null); setShowForm(true) }
  function openEditar(ing: Ingrediente) { setEditing(ing); setShowForm(true) }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este ingrediente?')) return
    setDeleting(id)
    await eliminarIngrediente(id)
    setDeleting(null)
    router.refresh()
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1F1F1F] bg-[#080808] sticky top-0 z-10">
        <div>
          <p className="text-[#5A5A5A] text-xs">Módulo 01</p>
          <h1 className="text-white font-semibold text-base">Ingredientes</h1>
        </div>
        <button onClick={openNuevo}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo ingrediente
        </button>
      </div>

      {/* Filtros */}
      {ingredientes.length > 0 && (
        <div className="px-8 py-3.5 border-b border-[#1F1F1F] flex items-center gap-3">
          <div className="flex-1 relative">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5 text-[#3A3A3A] absolute left-3 top-1/2 -translate-y-1/2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-[#1A1A1A] text-white placeholder-[#333333] rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-red-600/40 transition-all" />
          </div>
          <select value={unidadFilter} onChange={e => setUnidadFilter(e.target.value)}
            className="bg-[#111111] border border-[#1A1A1A] text-[#5A5A5A] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-600/40 transition-all">
            <option value="">Todas las unidades</option>
            {unidadesEnUso.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <span className="text-[#3A3A3A] text-xs">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Content */}
      <div className="px-8 py-6 pb-28 md:pb-8">
        {ingredientes.length === 0 ? (
          <EmptyState onNuevo={openNuevo} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#3A3A3A] text-sm">Sin resultados para "{search}"</p>
            <button onClick={() => { setSearch(''); setUnidadFilter('') }} className="text-red-500 text-xs mt-2 hover:text-red-400">Limpiar filtros</button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-[1fr_70px_140px_72px] gap-3 px-4 py-2 text-[10px] text-[#333333] uppercase tracking-wider font-semibold">
              <span>Ingrediente</span>
              <span>Unidad</span>
              <span className="text-right">Precio por unidad</span>
              <span></span>
            </div>
            <div className="space-y-1.5">
              {filtered.map(ing => {
                const precioU = pu(ing)
                return (
                  <div key={ing.id}
                    className="grid grid-cols-[1fr_70px_140px_72px] gap-3 px-4 py-3.5 bg-[#0E0E0E] border border-[#181818] rounded-xl hover:border-[#252525] hover:bg-[#111111] transition-all items-center group">
                    <p className="text-white text-sm font-medium truncate">{ing.nombre}</p>
                    <p className="text-[#5A5A5A] text-xs">{ing.unidad}</p>
                    <p className="text-white text-sm text-right font-mono font-semibold">${precioU.toFixed(3)}</p>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditar(ing)} className="p-1.5 text-[#3A3A3A] hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-all" title="Editar">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(ing.id)} disabled={deleting === ing.id} className="p-1.5 text-[#3A3A3A] hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-40" title="Eliminar">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            {filtered.length > 1 && (
              <div className="px-4 py-3 mt-3 text-[11px] text-[#3A3A3A] border-t border-[#141414]">
                <span>{filtered.length} ingredientes en catálogo · El rendimiento se configura por receta</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <IngredienteSlideOver
          ingrediente={editing}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); router.refresh() }}
        />
      )}
    </div>
  )
}

function EmptyState({ onNuevo }: { onNuevo: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] flex items-center justify-center mb-5 text-2xl">🥩</div>
      <h3 className="text-white font-semibold text-base mb-2">Sin ingredientes todavía</h3>
      <p className="text-[#4A4A4A] text-sm max-w-xs leading-relaxed mb-6">
        Agrega tus ingredientes con precios y rendimientos para calcular el costo real de tus recetas.
      </p>
      <button onClick={onNuevo} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        Agregar primer ingrediente
      </button>
    </div>
  )
}

// ─── SLIDE-OVER ──────────────────────────────────────────────────────────────

function IngredienteSlideOver({ ingrediente, onClose, onSuccess }: {
  ingrediente: Ingrediente | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [nombre, setNombre] = useState(ingrediente?.nombre ?? '')
  const [unidad, setUnidad] = useState(ingrediente?.unidad ?? 'kg')
  const [precio, setPrecio] = useState(ingrediente ? String(ingrediente.precio_compra) : '')
  const [cantidad, setCantidad] = useState(ingrediente ? String(ingrediente.cantidad_comprada) : '')
  const [rend, setRend] = useState(ingrediente ? String(ingrediente.rendimiento) : '100')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Autocomplete
  const [sugerencias, setSugerencias] = useState<IngredienteRef[]>([])
  const [sugerenciaActiva, setSugerenciaActiva] = useState<IngredienteRef | null>(null)
  const [showSugerencias, setShowSugerencias] = useState(false)
  const nombreRef = useRef<HTMLInputElement>(null)

  // Calculadora de merma
  const [modoCalc, setModoCalc] = useState<'directo' | 'calculadora'>('directo')
  const [comprado, setComprado] = useState('')
  const [descartado, setDescartado] = useState('')

  useEffect(() => {
    if (!ingrediente) {
      const results = buscarIngredienteRef(nombre)
      setSugerencias(results)
      setShowSugerencias(results.length > 0 && document.activeElement === nombreRef.current)
    }
  }, [nombre, ingrediente])

  // Calculadora → auto-fill rendimiento
  useEffect(() => {
    const c = parseFloat(comprado)
    const d = parseFloat(descartado)
    if (c > 0 && d >= 0 && d < c) {
      const r = Math.round(((c - d) / c) * 100)
      setRend(String(r))
    }
  }, [comprado, descartado])

  function seleccionarSugerencia(sug: IngredienteRef) {
    setNombre(sug.nombre)
    setUnidad(sug.unidad)
    setRend(String(sug.rendimiento))
    setSugerenciaActiva(sug)
    setShowSugerencias(false)
  }

  const rendNum = Math.min(100, Math.max(1, parseFloat(rend) || 100))
  const precioNum = parseFloat(precio) || 0
  const cantidadNum = parseFloat(cantidad) || 0
  const precioUnit = cantidadNum > 0 ? precioNum / cantidadNum : null
  const costoRealCalc = precioUnit ? precioUnit / (rendNum / 100) : null
  const hayMerma = rendNum < 100

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre || !precio || !cantidad) return
    setLoading(true)
    setError('')
    const fd = new FormData()
    fd.set('nombre', nombre)
    fd.set('unidad', unidad)
    fd.set('precio_compra', precio)
    fd.set('cantidad_comprada', cantidad)
    fd.set('rendimiento', String(rendNum))
    const result = ingrediente
      ? await editarIngrediente(ingrediente.id, fd)
      : await crearIngrediente(fd)
    setLoading(false)
    if ('error' in result && result.error) setError(result.error)
    else onSuccess()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[460px] bg-[#0A0A0A] border-l border-[#1F1F1F] z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1F1F1F] shrink-0">
          <div>
            <h2 className="text-white font-semibold">{ingrediente ? 'Editar ingrediente' : 'Nuevo ingrediente'}</h2>
            <p className="text-[#4A4A4A] text-xs mt-0.5">El sistema aprende a costear por ti</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4A4A4A] hover:text-white hover:bg-[#1A1A1A] transition-all">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* ── Nombre con autocomplete ── */}
            <div className="relative">
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-2 uppercase tracking-wider">Nombre del ingrediente</label>
              <input
                ref={nombreRef}
                type="text"
                value={nombre}
                onChange={e => { setNombre(e.target.value); setSugerenciaActiva(null) }}
                onFocus={() => sugerencias.length > 0 && setShowSugerencias(true)}
                onBlur={() => setTimeout(() => setShowSugerencias(false), 150)}
                placeholder="Ej: Pollo entero, Tomate, Camarón..."
                required autoFocus
                className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/10 transition-all"
              />

              {/* Dropdown sugerencias */}
              {showSugerencias && sugerencias.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden shadow-2xl">
                  <p className="px-4 pt-3 pb-1.5 text-[10px] text-[#3A3A3A] uppercase tracking-wider font-semibold">Sugerencias de la biblioteca</p>
                  {sugerencias.map(sug => (
                    <button key={sug.nombre} type="button" onMouseDown={() => seleccionarSugerencia(sug)}
                      className="w-full flex items-start justify-between px-4 py-3 hover:bg-[#1A1A1A] text-left transition-colors border-t border-[#181818]">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-white text-sm font-medium">{sug.nombre}</p>
                        <p className="text-[#3A3A3A] text-[11px] mt-0.5 leading-snug truncate">{sug.nota}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xs font-bold font-mono ${sug.rendimiento >= 90 ? 'text-emerald-400' : sug.rendimiento >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                          {sug.rendimiento}% real
                        </p>
                        <p className="text-[#3A3A3A] text-[10px]">{sug.categoria}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tarjeta de sub-producto (cuando hay sugerencia activa con subproducto) */}
            {sugerenciaActiva?.subproducto && (
              <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-amber-400 text-lg shrink-0">💡</span>
                  <div>
                    <p className="text-amber-300 text-xs font-semibold mb-1">Sub-producto aprovechable</p>
                    <p className="text-[#7A6A3A] text-xs leading-relaxed">{sugerenciaActiva.subproducto}</p>
                    <p className="text-[#5A4A2A] text-[11px] mt-2">
                      Esto NO es merma — al crear recetas, usa este ingrediente en cada plato con la cantidad exacta que necesitas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Unidad ── */}
            <div>
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-2 uppercase tracking-wider">Unidad de compra</label>
              <select value={unidad} onChange={e => setUnidad(e.target.value)}
                className="w-full bg-[#111111] border border-[#1F1F1F] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all">
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            {/* ── Costo ── */}
            <div>
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1 uppercase tracking-wider">Costo de compra</label>
              <p className="text-[#333333] text-xs mb-3">¿Cuánto pagaste y cuánta cantidad obtuviste?</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#3A3A3A] text-xs mb-1.5">Precio pagado ($)</label>
                  <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
                    placeholder="0.00" step="0.01" min="0.01" required
                    className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
                </div>
                <div>
                  <label className="block text-[#3A3A3A] text-xs mb-1.5">Cantidad ({unidad})</label>
                  <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)}
                    placeholder="1" step="0.001" min="0.001" required
                    className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
                </div>
              </div>
            </div>

            {/* ── Rendimiento ── */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] text-[#5A5A5A] font-semibold uppercase tracking-wider">Merma real</label>
                {/* Toggle modo */}
                <div className="flex items-center bg-[#111111] border border-[#1F1F1F] rounded-lg p-0.5 text-[10px]">
                  <button type="button" onClick={() => setModoCalc('directo')}
                    className={`px-3 py-1 rounded-md transition-all ${modoCalc === 'directo' ? 'bg-[#1F1F1F] text-white' : 'text-[#3A3A3A]'}`}>
                    Directo
                  </button>
                  <button type="button" onClick={() => setModoCalc('calculadora')}
                    className={`px-3 py-1 rounded-md transition-all ${modoCalc === 'calculadora' ? 'bg-[#1F1F1F] text-white' : 'text-[#3A3A3A]'}`}>
                    Calcular
                  </button>
                </div>
              </div>

              {/* Explicación clave */}
              <div className="bg-[#0D0D0D] border border-[#181818] rounded-xl p-3 mb-3">
                <p className="text-[#4A4A4A] text-[11px] leading-relaxed">
                  <span className="text-white font-medium">Solo cuenta lo que va a la basura definitivamente.</span>
                  {' '}Si las partes "sobrantes" las usas en otra receta (huesos → fondo, cáscaras → caldo), el rendimiento es 100%.
                  En ese caso, pon las cantidades exactas en cada receta.
                </p>
              </div>

              {modoCalc === 'directo' ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <input type="range" min="1" max="100" value={rendNum}
                      onChange={e => setRend(e.target.value)}
                      className="flex-1 h-1.5 accent-red-600 cursor-pointer" />
                    <div className="flex items-center gap-1">
                      <input type="number" value={rend}
                        onChange={e => setRend(String(Math.min(100, Math.max(1, parseInt(e.target.value) || 1))))}
                        min="1" max="100"
                        className="w-14 bg-[#111111] border border-[#1F1F1F] text-white text-sm text-center rounded-lg px-2 py-1.5 focus:outline-none focus:border-red-600/50 transition-all" />
                      <span className="text-[#5A5A5A] text-sm">%</span>
                    </div>
                  </div>
                  {hayMerma && (
                    <p className="text-[#333333] text-xs">
                      De cada {unidad} comprado → tiras {(100 - rendNum).toFixed(0)}% a la basura ({cantidadNum > 0 ? (cantidadNum * (100 - rendNum) / 100).toFixed(3) : '?'} {unidad})
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-[#3A3A3A] text-xs">Ingresa los pesos y calculamos el rendimiento real:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#3A3A3A] text-xs mb-1.5">Total comprado ({unidad})</label>
                      <input type="number" value={comprado} onChange={e => setComprado(e.target.value)}
                        placeholder="Ej: 2.0" step="0.001" min="0.001"
                        className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[#3A3A3A] text-xs mb-1.5">Lo que vas a tirar ({unidad})</label>
                      <input type="number" value={descartado} onChange={e => setDescartado(e.target.value)}
                        placeholder="Ej: 0.2" step="0.001" min="0"
                        className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
                    </div>
                  </div>
                  {comprado && descartado && parseFloat(comprado) > parseFloat(descartado) && (
                    <div className="flex items-center justify-between bg-[#111111] border border-[#1F1F1F] rounded-xl px-4 py-3">
                      <span className="text-[#5A5A5A] text-xs">Rendimiento calculado:</span>
                      <span className="text-white font-bold text-base font-mono">{rendNum}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Vista previa ── */}
            {precioUnit !== null && precioUnit > 0 && (
              <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl p-4">
                <p className="text-[10px] text-[#3A3A3A] uppercase tracking-wider font-semibold mb-3">Cálculo automático</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#4A4A4A] text-xs">Precio por {unidad}:</span>
                    <span className="text-[#9A9A9A] text-sm font-mono">${precioUnit.toFixed(4)}</span>
                  </div>
                  {costoRealCalc !== null && (
                    <div className="flex items-start justify-between pt-2.5 border-t border-[#1A1A1A]">
                      <div>
                        <span className="text-white text-xs font-semibold">Costo real por {unidad}:</span>
                        <p className="text-[#3A3A3A] text-[10px] mt-0.5">
                          {hayMerma
                            ? `Incluye ${100 - rendNum}% que se pierde`
                            : 'Sin pérdida — 100% aprovechable'}
                        </p>
                      </div>
                      <span className={`text-sm font-mono font-bold ${hayMerma ? 'text-amber-400' : 'text-emerald-400'}`}>
                        ${costoRealCalc.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#1A1A1A] flex gap-3 shrink-0">
            <button type="button" onClick={onClose}
              className="flex-1 bg-[#111111] border border-[#1F1F1F] text-[#6B6B6B] hover:text-white hover:border-[#2A2A2A] font-medium px-4 py-3 rounded-xl text-sm transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !nombre || !precio || !cantidad}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors">
              {loading ? 'Guardando...' : ingrediente ? 'Actualizar' : 'Guardar ingrediente'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
