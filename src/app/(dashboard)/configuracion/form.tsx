'use client'

import { useState } from 'react'
import { actualizarPerfil } from './actions'

type Profile = {
  nombre?: string
  restaurante?: string
  logo_url?: string
  tipo_servicio?: string
  zona?: string
  pais?: string
  concepto?: string
  num_empleados?: number
  costo_planilla_mes?: number
  platos_por_dia?: number
  dias_semana?: number
  precio_promedio?: number
  moneda?: string
  food_cost_default?: number
}

const TIPOS_SERVICIO = [
  { value: 'comedor',     label: 'Comedor / Menú del día',        desc: 'Platos únicos o combos, alto volumen' },
  { value: 'fonda',       label: 'Fonda / Antojería / Pupusería',  desc: 'Cocina tradicional, precios populares' },
  { value: 'carta',       label: 'Restaurante a la carta',         desc: 'Menú variado, el cliente elige' },
  { value: 'buffet',      label: 'Buffet',                         desc: 'Todo incluido por cubierto' },
  { value: 'degustacion', label: 'Menú degustación / Fine dining', desc: 'Alta cocina, experiencia premium' },
  { value: 'food_truck',  label: 'Food truck / Puesto',            desc: 'Calle o mercado, productos específicos' },
  { value: 'otro',        label: 'Otro tipo',                      desc: '' },
]

const ZONAS = [
  { value: 'ciudad_grande',    label: 'Ciudad grande',        desc: 'Capital o metrópoli' },
  { value: 'ciudad_mediana',   label: 'Ciudad mediana',       desc: 'Ciudad secundaria' },
  { value: 'zona_turistica',   label: 'Zona turística',       desc: 'Playa, centro histórico, resort' },
  { value: 'zona_residencial', label: 'Colonia residencial',  desc: 'Barrio o zona de casas' },
  { value: 'pueblo',           label: 'Pueblo o área rural',  desc: 'Comunidad pequeña' },
]

const PUBLICOS = ['Turistas', 'Familias', 'Ejecutivos', 'Jóvenes', 'Estudiantes', 'Trabajadores', 'Gourmets', 'General']

const MONEDAS = [
  { value: 'USD', label: '$ Dólar (USD)' },
  { value: 'MXN', label: '$ Peso mexicano (MXN)' },
  { value: 'GTQ', label: 'Q Quetzal (GTQ)' },
  { value: 'HNL', label: 'L Lempira (HNL)' },
  { value: 'CRC', label: '₡ Colón costarricense (CRC)' },
  { value: 'COP', label: '$ Peso colombiano (COP)' },
  { value: 'PEN', label: 'S/ Sol peruano (PEN)' },
  { value: 'CLP', label: '$ Peso chileno (CLP)' },
  { value: 'ARS', label: '$ Peso argentino (ARS)' },
]

export function ConfiguracionForm({ profile, email }: { profile: Profile | null; email: string }) {
  const p = profile ?? {}

  const [restaurante, setRestaurante] = useState(p.restaurante ?? '')
  const [nombre, setNombre] = useState(p.nombre ?? '')
  const [tipoServicio, setTipoServicio] = useState(p.tipo_servicio ?? 'carta')
  const [zona, setZona] = useState(p.zona ?? 'ciudad_grande')
  const [pais, setPais] = useState(p.pais ?? 'SV')
  const [concepto, setConcepto] = useState(p.concepto ?? '')
  const [publicoObj, setPublicoObj] = useState<string[]>([])
  const [numEmpleados, setNumEmpleados] = useState(String(p.num_empleados ?? 3))
  const [planilla, setPlanilla] = useState(String(p.costo_planilla_mes ?? ''))
  const [platosDia, setPlatosDia] = useState(String(p.platos_por_dia ?? 50))
  const [diasSemana, setDiasSemana] = useState(String(p.dias_semana ?? 6))
  const [precioPromedio, setPrecioPromedio] = useState(String(p.precio_promedio ?? ''))
  const [moneda, setMoneda] = useState(p.moneda ?? 'USD')
  const [foodCost, setFoodCost] = useState(String(p.food_cost_default ?? 30))
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Cálculo live: costo de mano de obra por plato
  const planillaNum = parseFloat(planilla) || 0
  const platosDiaNum = parseInt(platosDia) || 50
  const diasSemanaNum = parseInt(diasSemana) || 6
  const diasMes = diasSemanaNum * 4.33
  const costoMOPorPlato = planillaNum > 0 && platosDiaNum > 0
    ? planillaNum / (diasMes * platosDiaNum)
    : 0

  function togglePublico(pub: string) {
    setPublicoObj(prev => prev.includes(pub) ? prev.filter(x => x !== pub) : [...prev, pub])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await actualizarPerfil({
      restaurante,
      nombre,
      tipo_servicio: tipoServicio,
      zona,
      pais,
      concepto,
      num_empleados: parseInt(numEmpleados) || 0,
      costo_planilla_mes: planillaNum,
      platos_por_dia: platosDiaNum,
      dias_semana: diasSemanaNum,
      precio_promedio: parseFloat(precioPromedio) || 0,
      moneda,
      food_cost_default: parseFloat(foodCost) || 30,
    })
    setLoading(false)
    if ('error' in result && result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const currSymbol = moneda === 'USD' ? '$' : moneda === 'GTQ' ? 'Q' : moneda === 'HNL' ? 'L' : moneda === 'CRC' ? '₡' : '$'

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-2xl mx-auto px-8 py-8 pb-28 space-y-10">

        {/* ─── IDENTIDAD ─── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-5 h-5 rounded-lg bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">1</span>
            <h2 className="text-white font-semibold text-sm">Tu restaurante</h2>
          </div>

          <div className="flex items-start gap-5 mb-5">
            {/* Logo placeholder */}
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-[#0E0E0E] border-2 border-dashed border-[#1A1A1A] flex flex-col items-center justify-center text-center hover:border-red-600/30 transition-colors cursor-pointer group">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-[#252525] group-hover:text-red-600/40 transition-colors mb-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span className="text-[9px] text-[#252525] leading-tight">Logo<br/>próximo</span>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">Nombre del restaurante</label>
                <input value={restaurante} onChange={e => setRestaurante(e.target.value)}
                  placeholder="Ej: Restaurante Don Chepe"
                  className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">Tu nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Chef Carlos Martínez"
                  className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">País</label>
              <input value={pais} onChange={e => setPais(e.target.value)} placeholder="SV"
                className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">Moneda</label>
              <select value={moneda} onChange={e => setMoneda(e.target.value)}
                className="w-full bg-[#111111] border border-[#1F1F1F] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-600/50 transition-all">
                {MONEDAS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        <div className="border-t border-[#141414]" />

        {/* ─── TIPO DE NEGOCIO ─── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-5 h-5 rounded-lg bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">2</span>
            <h2 className="text-white font-semibold text-sm">Tipo de negocio</h2>
          </div>
          <p className="text-[#3A3A3A] text-xs mb-5">Esto ajusta los benchmarks de costos y rangos de precios para tu contexto.</p>

          <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-3 uppercase tracking-wider">¿Cómo vendes?</label>
          <div className="grid grid-cols-1 gap-2 mb-6">
            {TIPOS_SERVICIO.map(t => (
              <label key={t.value} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                tipoServicio === t.value ? 'border-red-600/50 bg-red-600/5' : 'border-[#1A1A1A] bg-[#0E0E0E] hover:border-[#252525]'
              }`}>
                <input type="radio" value={t.value} checked={tipoServicio === t.value}
                  onChange={() => setTipoServicio(t.value)} className="accent-red-600 shrink-0" />
                <div>
                  <p className={`text-sm font-medium ${tipoServicio === t.value ? 'text-white' : 'text-[#8A8A8A]'}`}>{t.label}</p>
                  {t.desc && <p className="text-[#3A3A3A] text-xs">{t.desc}</p>}
                </div>
              </label>
            ))}
          </div>

          <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-3 uppercase tracking-wider">¿Dónde estás?</label>
          <div className="grid grid-cols-1 gap-2 mb-6">
            {ZONAS.map(z => (
              <label key={z.value} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                zona === z.value ? 'border-red-600/50 bg-red-600/5' : 'border-[#1A1A1A] bg-[#0E0E0E] hover:border-[#252525]'
              }`}>
                <input type="radio" value={z.value} checked={zona === z.value}
                  onChange={() => setZona(z.value)} className="accent-red-600 shrink-0" />
                <div>
                  <p className={`text-sm font-medium ${zona === z.value ? 'text-white' : 'text-[#8A8A8A]'}`}>{z.label}</p>
                  <p className="text-[#3A3A3A] text-xs">{z.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-3 uppercase tracking-wider">¿A quién le vendes?</label>
          <div className="flex flex-wrap gap-2 mb-6">
            {PUBLICOS.map(pub => (
              <button key={pub} type="button" onClick={() => togglePublico(pub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  publicoObj.includes(pub)
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-[#0E0E0E] border-[#1A1A1A] text-[#5A5A5A] hover:border-[#2A2A2A] hover:text-white'
                }`}>
                {pub}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">Describe tu concepto</label>
            <textarea value={concepto} onChange={e => setConcepto(e.target.value)}
              placeholder="Ej: Restaurante de mariscos frescos en la costa, especializado en ceviches y mariscos al vapor. Ambiente familiar, turistas y locales..."
              rows={3}
              className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all resize-none" />
          </div>
        </section>

        <div className="border-t border-[#141414]" />

        {/* ─── EQUIPO ─── */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-lg bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">3</span>
            <h2 className="text-white font-semibold text-sm">Equipo y operación</h2>
          </div>
          <p className="text-[#3A3A3A] text-xs mb-5">
            La mano de obra es un costo real de cada plato. Con esto lo calculamos exacto.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">Personas en cocina</label>
              <input type="number" value={numEmpleados} onChange={e => setNumEmpleados(e.target.value)}
                min="0" step="1" placeholder="3"
                className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
              <p className="text-[#2A2A2A] text-[10px] mt-1">Cocineros + ayudantes</p>
            </div>
            <div>
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">Planilla mensual de cocina</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3A3A3A] text-sm">{currSymbol}</span>
                <input type="number" value={planilla} onChange={e => setPlanilla(e.target.value)}
                  min="0" step="0.01" placeholder="2500"
                  className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
              </div>
              <p className="text-[#2A2A2A] text-[10px] mt-1">Sueldos + cargas sociales totales</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">Días abiertos por semana</label>
              <select value={diasSemana} onChange={e => setDiasSemana(e.target.value)}
                className="w-full bg-[#111111] border border-[#1F1F1F] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all">
                <option value="4">4 días</option>
                <option value="5">5 días</option>
                <option value="6">6 días</option>
                <option value="7">7 días (todos los días)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">Platos que sirven por día</label>
              <input type="number" value={platosDia} onChange={e => setPlatosDia(e.target.value)}
                min="1" step="1" placeholder="50"
                className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
              <p className="text-[#2A2A2A] text-[10px] mt-1">Promedio entre todos los días</p>
            </div>
          </div>

          {/* Resultado en vivo */}
          {costoMOPorPlato > 0 ? (
            <div className="bg-[#0E0E0E] border border-[#181818] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-semibold">Mano de obra por plato</p>
                  <p className="text-[#3A3A3A] text-xs mt-0.5">
                    {currSymbol}{planilla} ÷ ({diasSemana} días/sem × 4.33 sem × {platosDia} platos)
                  </p>
                </div>
                <p className="text-amber-400 text-2xl font-bold font-mono">{currSymbol}{costoMOPorPlato.toFixed(2)}</p>
              </div>
              <p className="text-[#3A3A3A] text-[11px] mt-3 pt-3 border-t border-[#141414]">
                Este costo se suma al de los ingredientes en tus recetas — así conoces el costo real y completo de cada plato.
              </p>
            </div>
          ) : (
            <div className="bg-[#0A0A0A] border border-dashed border-[#1A1A1A] rounded-xl p-4 text-center">
              <p className="text-[#3A3A3A] text-xs">Ingresa la planilla y los platos por día para ver el costo de mano de obra por plato</p>
            </div>
          )}
        </section>

        <div className="border-t border-[#141414]" />

        {/* ─── PRECIO DE REFERENCIA ─── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-5 h-5 rounded-lg bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">4</span>
            <h2 className="text-white font-semibold text-sm">Precios de referencia</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">Precio promedio de un plato</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3A3A3A] text-sm">{currSymbol}</span>
                <input type="number" value={precioPromedio} onChange={e => setPrecioPromedio(e.target.value)}
                  min="0" step="0.01" placeholder="8.00"
                  className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#2A2A2A] rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:border-red-600/50 transition-all" />
              </div>
              <p className="text-[#2A2A2A] text-[10px] mt-1">Plato principal en tu menú actual</p>
            </div>
            <div>
              <label className="block text-[10px] text-[#5A5A5A] font-semibold mb-1.5 uppercase tracking-wider">Food cost objetivo</label>
              <div className="flex items-center gap-2">
                <input type="range" min="15" max="45" value={foodCost}
                  onChange={e => setFoodCost(e.target.value)}
                  className="flex-1 accent-red-600" />
                <div className="flex items-center gap-1">
                  <input type="number" value={foodCost}
                    onChange={e => setFoodCost(String(Math.min(45, Math.max(15, parseInt(e.target.value) || 30))))}
                    className="w-12 bg-[#111111] border border-[#1F1F1F] text-white text-sm text-center rounded-lg px-2 py-2 focus:outline-none" />
                  <span className="text-[#5A5A5A] text-sm">%</span>
                </div>
              </div>
              <p className="text-[#2A2A2A] text-[10px] mt-1">
                {parseInt(foodCost) <= 25 ? 'Fine dining — márgenes altos' :
                 parseInt(foodCost) <= 32 ? 'Restaurante típico — equilibrado' :
                 'Comedor / fonda — alto volumen'}
              </p>
            </div>
          </div>
        </section>

        {/* Info email */}
        <div className="bg-[#0A0A0A] border border-[#141414] rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[#3A3A3A] text-[10px] uppercase tracking-wider font-semibold mb-0.5">Correo de la cuenta</p>
            <p className="text-white text-sm">{email}</p>
          </div>
          <span className="text-[10px] text-[#2A2A2A] border border-[#1A1A1A] px-2 py-1 rounded-lg">No editable</span>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading}
          className={`w-full font-semibold px-6 py-4 rounded-xl text-sm transition-all ${
            saved ? 'bg-emerald-600 text-white' : 'bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white'
          }`}>
          {loading ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar perfil'}
        </button>
      </div>
    </form>
  )
}
