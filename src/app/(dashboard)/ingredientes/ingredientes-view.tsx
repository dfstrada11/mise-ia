'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearIngrediente, editarIngrediente, eliminarIngrediente } from './actions'

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
function cr(i: Ingrediente) { return pu(i) / (i.rendimiento / 100) }
function rColor(r: number) {
  if (r >= 90) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
  if (r >= 70) return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
  return 'text-red-400 bg-red-400/10 border-red-400/20'
}

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

      {/* Filtros (solo si hay ingredientes) */}
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
            {/* Tabla header */}
            <div className="grid grid-cols-[1fr_70px_110px_106px_110px_72px] gap-3 px-4 py-2 text-[10px] text-[#333333] uppercase tracking-wider font-semibold">
              <span>Ingrediente</span>
              <span>Unidad</span>
              <span className="text-right">Precio/unit</span>
              <span className="text-center">Rendimiento</span>
              <span className="text-right">Costo real</span>
              <span></span>
            </div>
            {/* Filas */}
            <div className="space-y-1.5">
              {filtered.map(ing => {
                const precioU = pu(ing)
                const costoR = cr(ing)
                return (
                  <div key={ing.id}
                    className="grid grid-cols-[1fr_70px_110px_106px_110px_72px] gap-3 px-4 py-3.5 bg-[#0E0E0E] border border-[#181818] rounded-xl hover:border-[#252525] hover:bg-[#111111] transition-all items-center group">
                    <p className="text-white text-sm font-medium truncate">{ing.nombre}</p>
                    <p className="text-[#5A5A5A] text-xs">{ing.unidad}</p>
                    <p className="text-[#9A9A9A] text-xs text-right font-mono">${precioU.toFixed(3)}</p>
                    <div className="flex justify-center">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${rColor(ing.rendimiento)}`}>
                        {ing.rendimiento}%
                      </span>
                    </div>
                    <p className={`text-sm text-right font-mono font-semibold ${ing.rendimiento < 100 ? 'text-amber-400' : 'text-white'}`}>
                      ${costoR.toFixed(3)}
                    </p>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditar(ing)}
                        className="p-1.5 text-[#3A3A3A] hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-all"
                        title="Editar">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(ing.id)} disabled={deleting === ing.id}
                        className="p-1.5 text-[#3A3A3A] hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-40"
                        title="Eliminar">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Footer stats */}
            {filtered.length > 1 && (
              <div className="flex items-center justify-between px-4 py-3 mt-3 text-[11px] text-[#3A3A3A] border-t border-[#141414]">
                <span>{filtered.length} ingredientes en catálogo</span>
                <span>Rendimiento promedio: {Math.round(filtered.reduce((s, i) => s + i.rendimiento, 0) / filtered.length)}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-over */}
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
      <button onClick={onNuevo}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Agregar primer ingrediente
      </button>
      <div className="mt-8 grid grid-cols-3 gap-3 max-w-xs w-full">
        {[{ icon: '💰', label: 'Precio unitario' }, { icon: '⚖️', label: 'Rendimiento %' }, { icon: '📊', label: 'Costo real' }].map(f => (
          <div key={f.label} className="bg-[#0E0E0E] border border-[#181818] rounded-xl p-3 text-center">
            <p className="text-lg mb-1">{f.icon}</p>
            <p className="text-[#3A3A3A] text-[10px] leading-tight">{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

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

  const precioNum = parseFloat(precio) || 0
  const cantidadNum = parseFloat(cantidad) || 0
  const rendNum = parseFloat(rend) || 100

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
    fd.set('rendimiento', rend)

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
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-[#0A0A0A] border-l border-[#1F1F1F] z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1F1F1F] shrink-0">
          <div>
            <h2 className="text-white font-semibold">{ingrediente ? 'Editar ingrediente' : 'Nuevo ingrediente'}</h2>
            <p className="text-[#4A4A4A] text-xs mt-0.5">Registra precio y rendimiento</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#4A4A4A] hover:text-white hover:bg-[#1A1A1A] transition-all">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-2 uppercase tracking-wider">Nombre del ingrediente</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Pollo entero, Tomate, Aceite de oliva..."
                required autoFocus
                className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/10 transition-all" />
            </div>

            {/* Unidad */}
            <div>
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-2 uppercase tracking-wider">Unidad de compra</label>
              <select value={unidad} onChange={e => setUnidad(e.target.value)}
                className="w-full bg-[#111111] border border-[#1F1F1F] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all">
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            {/* Costo */}
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

            {/* Rendimiento */}
            <div>
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1 uppercase tracking-wider">Rendimiento %</label>
              <p className="text-[#333333] text-xs mb-3">
                ¿Qué porcentaje del ingrediente es aprovechable después de limpiarlo, pelarlo o deshuesar?
              </p>
              <div className="flex items-center gap-3 mb-2">
                <input type="range" min="1" max="100" value={rend}
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
                  Por cada {unidad} comprado → solo aprovechas el {rendNum}% ({(cantidadNum * rendNum / 100).toFixed(3)} {unidad} usables)
                </p>
              )}
            </div>

            {/* Preview calculado */}
            {precioUnit !== null && precioUnit > 0 && (
              <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl p-4">
                <p className="text-[10px] text-[#3A3A3A] uppercase tracking-wider font-semibold mb-3">Cálculo automático</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#4A4A4A] text-xs">Precio por {unidad}:</span>
                    <span className="text-[#9A9A9A] text-sm font-mono">${precioUnit.toFixed(4)}</span>
                  </div>
                  {costoRealCalc !== null && hayMerma && (
                    <div className="flex items-start justify-between pt-2.5 border-t border-[#1A1A1A]">
                      <div>
                        <span className="text-white text-xs font-semibold">Costo real por {unidad}:</span>
                        <p className="text-[#3A3A3A] text-[10px] mt-0.5">Precio ajustado por {100 - rendNum}% de merma</p>
                      </div>
                      <span className="text-amber-400 text-sm font-mono font-bold">${costoRealCalc.toFixed(4)}</span>
                    </div>
                  )}
                  {!hayMerma && (
                    <div className="flex items-center justify-between pt-2.5 border-t border-[#1A1A1A]">
                      <span className="text-[#4A4A4A] text-xs">Sin merma</span>
                      <span className="text-emerald-400 text-xs">100% aprovechable ✓</span>
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
