import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold tracking-tight">mise ai</h1>
        <span className="text-zinc-500 text-sm">{user.email}</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-xl font-semibold mb-8">¿Por dónde empezamos?</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ModuleCard
            title="Ingredientes"
            description="Registra tus productos con precios y rendimientos"
            href="/ingredientes"
            step={1}
          />
          <ModuleCard
            title="Recetas"
            description="Crea recetas y calcula el costo por porción"
            href="/recetas"
            step={2}
            disabled
          />
        </div>
      </main>
    </div>
  )
}

function ModuleCard({ title, description, href, step, disabled }: {
  title: string
  description: string
  href: string
  step: number
  disabled?: boolean
}) {
  return (
    <a
      href={disabled ? undefined : href}
      className={`block border rounded-xl p-6 transition-colors ${
        disabled
          ? 'border-zinc-900 opacity-40 cursor-not-allowed'
          : 'border-zinc-800 hover:border-zinc-600 cursor-pointer'
      }`}
    >
      <span className="text-xs text-zinc-600 font-mono">0{step}</span>
      <h3 className="font-semibold mt-2 mb-1">{title}</h3>
      <p className="text-zinc-400 text-sm">{description}</p>
    </a>
  )
}
