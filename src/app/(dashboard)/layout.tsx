import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavSidebar from '@/components/nav-sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurante')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-[#0A0A08] overflow-hidden">
      <NavSidebar
        email={user.email ?? ''}
        restaurante={profile?.restaurante ?? null}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
