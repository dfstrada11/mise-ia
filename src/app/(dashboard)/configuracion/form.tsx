'use client'

import { useState } from 'react'
import { actualizarPerfil } from './actions'

export function ConfiguracionForm({ email, restaurante, nombre }: {
  email: string
  restaurante: string
  nombre: string
}) {
  const [rest, setRest] = useState(restaurante)
  const [nom, setNom] = useState(nombre)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    setError('')

    const fd = new FormData()
    fd.set('restaurante', rest)
    fd.set('nombre', nom)

    const result = await actualizarPerfil(fd)
    setLoading(false)

    if ('error' in result && result.error) setError(result.error)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Restaurante */}
      <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-semibold text-sm">Tu restaurante</h2>

        <div>
          <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-2 uppercase tracking-wider">Nombre del restaurante</label>
          <input type="text" value={rest} onChange={e => setRest(e.target.value)}
            placeholder="Ej: La Cocina de Mamá"
            className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
          <p className="text-[#333333] text-xs mt-1.5">Se muestra en el sidebar y en las fichas técnicas.</p>
        </div>

        <div>
          <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-2 uppercase tracking-wider">Tu nombre</label>
          <input type="text" value={nom} onChange={e => setNom(e.target.value)}
            placeholder="Ej: Chef Mario"
            className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
        </div>

        <div>
          <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-2 uppercase tracking-wider">Correo electrónico</label>
          <input type="email" value={email} disabled
            className="w-full bg-[#0A0A0A] border border-[#141414] text-[#3A3A3A] rounded-xl px-4 py-3 text-sm cursor-not-allowed" />
          <p className="text-[#282828] text-xs mt-1.5">El correo no se puede cambiar.</p>
        </div>
      </div>

      {/* Plan */}
      <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm">Plan actual</h2>
          <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[#1A1A1A] text-[#5A5A5A] border border-[#252525]">
            Plan gratuito
          </span>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Ingredientes ilimitados', ok: true },
            { label: 'Recetas ilimitadas', ok: true },
            { label: 'Fichas técnicas PDF', ok: true },
            { label: 'Control de mermas', ok: false },
            { label: 'Reportes y análisis', ok: false },
            { label: 'Múltiples sucursales', ok: false },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${f.ok ? 'bg-emerald-400/15 border border-emerald-400/30' : 'bg-[#1A1A1A] border border-[#252525]'}`}>
                {f.ok
                  ? <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} className="w-2.5 h-2.5 text-emerald-400"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  : <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-2.5 h-2.5 text-[#333333]"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                }
              </div>
              <span className={`text-xs ${f.ok ? 'text-[#7A7A7A]' : 'text-[#3A3A3A]'}`}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button type="submit" disabled={loading}
        className={`w-full font-semibold px-4 py-3 rounded-xl text-sm transition-all ${
          saved
            ? 'bg-emerald-600 text-white'
            : 'bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white'
        }`}>
        {loading ? 'Guardando...' : saved ? '✓ Cambios guardados' : 'Guardar cambios'}
      </button>
    </form>
  )
}
