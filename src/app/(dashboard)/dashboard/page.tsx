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

  const nombre = profile?.restaurante ?? 'tu restaurante'

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 pb-24 md:pb-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[#78716C] text-sm mb-1">Panel principal</p>
        <h1 className="text-2xl font-semibold text-white">
          Bienvenido a <span className="text-amber-500">{nombre}</span>
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-10 md:grid-cols-4">
        <StatCard value={totalIngredientes ?? 0} label="Ingredientes" />
        <StatCard value={totalRecetas ?? 0} label="Recetas" />
        <StatCard value={0} label="Fichas PDF" />
        <StatCard value="—" label="Food cost prom." />
      </div>

      {/* Módulos */}
      <div className="mb-6">
        <h2 className="text-xs font-medium text-[#78716C] uppercase tracking-wider mb-4">Módulos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ModuleCard
            number="01"
            title="Ingredientes"
            description="Registra precios, unidades y rendimientos de cada producto."
            href="/ingredientes"
            active
          />
          <ModuleCard
            number="02"
            title="Recetas"
            description="Crea recetas y obtén el costo real por porción al instante."
            href="/recetas"
            active={false}
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="bg-[#131310] border border-[#1E1E1A] rounded-xl p-4">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-[#78716C] mt-1">{label}</p>
    </div>
  )
}

function ModuleCard({
  number, title, description, href, active,
}: {
  number: string
  title: string
  description: string
  href: string
  active: boolean
}) {
  const Wrapper = active ? Link : 'div'
  return (
    <Wrapper
      {...(active ? { href } : {})}
      className={`block bg-[#131310] border rounded-xl p-5 transition-all ${
        active
          ? 'border-[#1E1E1A] hover:border-amber-600/40 hover:bg-[#161613] cursor-pointer'
          : 'border-[#161613] opacity-40 cursor-not-allowed'
      }`}
    >
      <span className="text-[10px] font-mono text-[#3A3A32]">{number}</span>
      <h3 className="text-white font-semibold mt-2 mb-1 text-sm">{title}</h3>
      <p className="text-[#78716C] text-xs leading-relaxed">{description}</p>
      {active && (
        <p className="text-amber-600 text-xs mt-3 font-medium">Abrir →</p>
      )}
      {!active && (
        <p className="text-[#3A3A32] text-xs mt-3">Próximamente</p>
      )}
    </Wrapper>
  )
}
