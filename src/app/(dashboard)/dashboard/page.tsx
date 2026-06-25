import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('restaurante').eq('id', user!.id).single()

  const [{ count: totalIngredientes }, { count: totalRecetas }] = await Promise.all([
    supabase.from('ingredientes').select('*', { count: 'exact', head: true }),
    supabase.from('recetas').select('*', { count: 'exact', head: true }),
  ])

  const restaurante = profile?.restaurante ?? 'tu restaurante'
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1F1F1F] bg-[#080808] sticky top-0 z-10">
        <div>
          <p className="text-[#5A5A5A] text-xs">{saludo} —</p>
          <h1 className="text-white font-semibold text-base">{restaurante}</h1>
        </div>
        <Link href="/ingredientes"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar ingrediente
        </Link>
      </div>

      <div className="px-8 py-8 pb-24 md:pb-8 space-y-8">

        {/* Tarjetas métricas estilo referencia */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Food Cost — tarjeta roja destacada */}
          <div className="col-span-2 lg:col-span-1 bg-red-600 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-500/40 rounded-full" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-red-700/50 rounded-full" />
            <div className="relative z-10">
              <p className="text-red-200 text-xs font-medium uppercase tracking-wider mb-3">Food Cost</p>
              <p className="text-white text-4xl font-bold">—</p>
              <p className="text-red-200 text-xs mt-2">Agrega recetas para calcular</p>
              <div className="mt-4 pt-4 border-t border-red-500/40">
                <p className="text-red-100 text-xs">Objetivo: 30%</p>
              </div>
            </div>
          </div>

          {/* Ingredientes — blanco */}
          <div className="bg-white rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gray-100 rounded-full" />
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Ingredientes</p>
            <p className="text-gray-900 text-4xl font-bold">{totalIngredientes ?? 0}</p>
            <p className="text-gray-400 text-xs mt-2">en tu catálogo</p>
            <Link href="/ingredientes" className="mt-4 pt-4 border-t border-gray-200 block">
              <p className="text-gray-900 text-xs font-semibold">Ver catálogo →</p>
            </Link>
          </div>

          {/* Recetas — oscuro */}
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/3 rounded-full" />
            <p className="text-[#5A5A5A] text-xs font-medium uppercase tracking-wider mb-3">Recetas</p>
            <p className="text-white text-4xl font-bold">{totalRecetas ?? 0}</p>
            <p className="text-[#5A5A5A] text-xs mt-2">estandarizadas</p>
            <Link href="/recetas" className="mt-4 pt-4 border-t border-[#1F1F1F] block">
              <p className="text-white text-xs font-semibold">Ver recetas →</p>
            </Link>
          </div>

          {/* Fichas PDF — oscuro con borde rojo */}
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-[#5A5A5A] text-xs font-medium uppercase tracking-wider mb-3">Fichas PDF</p>
            <p className="text-white text-4xl font-bold">0</p>
            <p className="text-[#5A5A5A] text-xs mt-2">generadas</p>
            <div className="mt-4 pt-4 border-t border-[#1F1F1F]">
              <p className="text-[#5A5A5A] text-xs">Disponible en recetas</p>
            </div>
          </div>
        </div>

        {/* Módulos disponibles */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Módulos activos</h2>
            <span className="text-[#5A5A5A] text-xs">Plan gratuito</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <ModuleCard href="/ingredientes" active icon="🥩" title="Ingredientes" desc="Registra precios, unidades y % de rendimiento por producto." badge="Activo" />
            <ModuleCard href="/recetas" active={false} icon="📖" title="Recetas & Costeo" desc="Crea recetas y obtén el costo por porción al instante." badge="Próximo" />
            <ModuleCard href="/fichas" active={false} icon="📄" title="Fichas Técnicas PDF" desc="Genera fichas profesionales para estandarizar tu cocina." badge="Próximo" />
            <ModuleCard href="/mermas" active={false} icon="📉" title="Control de Mermas" desc="Registra desperdicios y optimiza tu inventario real." badge="Próximo" />
            <ModuleCard href="/proveedores" active={false} icon="🚚" title="Proveedores" desc="Gestiona cotizaciones y órdenes de compra a tus proveedores." badge="V2" />
            <ModuleCard href="/reportes" active={false} icon="📊" title="Reportes & Análisis" desc="Visualiza tendencias de food cost y rentabilidad por plato." badge="V2" />
          </div>
        </div>

        {/* Inicio rápido */}
        {(totalIngredientes ?? 0) === 0 && (
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center text-lg shrink-0">🚀</div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Empieza en 3 pasos</h3>
                <div className="space-y-2 mt-3">
                  {[
                    { n: '1', text: 'Agrega tus ingredientes con precios y rendimientos' },
                    { n: '2', text: 'Crea tu primera receta seleccionando ingredientes' },
                    { n: '3', text: 'Genera la ficha técnica en PDF y compártela con tu equipo' },
                  ].map(s => (
                    <div key={s.n} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#5A5A5A] text-[10px] font-bold flex items-center justify-center shrink-0">{s.n}</span>
                      <p className="text-[#6B6B6B] text-xs">{s.text}</p>
                    </div>
                  ))}
                </div>
                <Link href="/ingredientes" className="inline-flex items-center gap-1.5 mt-4 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                  Comenzar ahora →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ModuleCard({ href, active, icon, title, desc, badge }: {
  href: string; active: boolean; icon: string; title: string; desc: string; badge: string
}) {
  if (active) {
    return (
      <Link href={href} className={`bg-[#111111] border rounded-2xl p-5 transition-all group border-[#1F1F1F] hover:border-red-600/30 hover:bg-[#141414] cursor-pointer`}>
        <div className="flex items-start justify-between mb-3">
          <span className="text-xl">{icon}</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-600/15 text-red-400 border border-red-600/20">{badge}</span>
        </div>
        <h3 className="text-white text-sm font-semibold mb-1">{title}</h3>
        <p className="text-[#5A5A5A] text-xs leading-relaxed">{desc}</p>
        <p className="text-red-500 text-xs mt-3 font-medium">Abrir →</p>
      </Link>
    )
  }
  return (
    <div
      className={`bg-[#111111] border rounded-2xl p-5 transition-all group ${
        active ? 'border-[#1F1F1F] hover:border-red-600/30 hover:bg-[#141414] cursor-pointer' : 'border-[#181818] opacity-50 cursor-default'
      }`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xl">{icon}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          badge === 'Activo' ? 'bg-red-600/15 text-red-400 border border-red-600/20' :
          badge === 'Próximo' ? 'bg-[#1A1A1A] text-[#5A5A5A] border border-[#252525]' :
          'bg-[#1A1A1A] text-[#3A3A3A] border border-[#1F1F1F]'
        }`}>{badge}</span>
      </div>
      <h3 className="text-white text-sm font-semibold mb-1">{title}</h3>
      <p className="text-[#5A5A5A] text-xs leading-relaxed">{desc}</p>
    </div>
  )
}
