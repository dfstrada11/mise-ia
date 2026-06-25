import { createClient } from '@/lib/supabase/server'
import { ConfiguracionForm } from './form'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('restaurante, nombre').eq('id', user!.id).single()

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1F1F1F] bg-[#080808] sticky top-0 z-10">
        <div>
          <p className="text-[#5A5A5A] text-xs">Ajustes</p>
          <h1 className="text-white font-semibold text-base">Configuración</h1>
        </div>
      </div>

      <div className="px-8 py-8 max-w-lg">
        <ConfiguracionForm
          email={user!.email ?? ''}
          restaurante={profile?.restaurante ?? ''}
          nombre={profile?.nombre ?? ''}
        />
      </div>
    </div>
  )
}
