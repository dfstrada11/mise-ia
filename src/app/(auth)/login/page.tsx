'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [restaurante, setRestaurante] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message || 'Error al crear la cuenta.')
      } else if (data.user) {
        if (restaurante) {
          await supabase.from('profiles').update({ restaurante }).eq('id', data.user.id)
        }
        if (data.session) {
          router.push('/dashboard')
          router.refresh()
        } else {
          setMessage('Revisa tu correo para confirmar tu cuenta.')
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Correo o contraseña incorrectos.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — solo desktop */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#0D0D0A] border-r border-[#222218] relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />

        <div>
          <span className="text-lg font-bold tracking-tight text-white">mise ai</span>
        </div>

        <div className="relative z-10">
          <blockquote className="space-y-6">
            <p className="text-3xl font-light text-white leading-snug">
              Conoce el costo real<br />
              <span className="text-amber-500">de cada plato.</span>
            </p>
            <p className="text-[#78716C] text-base leading-relaxed max-w-sm">
              Fichas técnicas, rendimientos y food cost automatizados. Diseñado por chefs, para chefs.
            </p>
          </blockquote>

          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-[#222218] pt-8">
            {[
              { value: 'Food cost', label: 'calculado al instante' },
              { value: 'Fichas', label: 'técnicas en PDF' },
              { value: 'Mermas', label: 'incluidas en el costo' },
            ].map((s) => (
              <div key={s.value}>
                <p className="text-amber-500 font-semibold text-sm">{s.value}</p>
                <p className="text-[#78716C] text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#3A3A32] text-xs">© 2026 Mise AI · El Salvador</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16 bg-[#0A0A08]">
        <div className="max-w-sm w-full mx-auto">
          {/* Logo mobile */}
          <div className="lg:hidden mb-10">
            <span className="text-xl font-bold text-white tracking-tight">mise ai</span>
            <p className="text-[#78716C] text-sm mt-1">costeo culinario profesional</p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white">
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </h1>
            <p className="text-[#78716C] text-sm mt-1">
              {mode === 'login'
                ? 'Ingresa tus datos para continuar'
                : 'Empieza a calcular el costo real de tus platos'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A8A29E] uppercase tracking-wider">
                  Nombre del restaurante
                </label>
                <input
                  type="text"
                  placeholder="Ej: Restaurante Don Marcos"
                  value={restaurante}
                  onChange={e => setRestaurante(e.target.value)}
                  className="w-full bg-[#131310] border border-[#222218] text-white placeholder-[#3A3A32] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-600/60 focus:ring-1 focus:ring-amber-600/30 transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#A8A29E] uppercase tracking-wider">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="chef@restaurante.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#131310] border border-[#222218] text-white placeholder-[#3A3A32] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-600/60 focus:ring-1 focus:ring-amber-600/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#A8A29E] uppercase tracking-wider">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-[#131310] border border-[#222218] text-white placeholder-[#3A3A32] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-600/60 focus:ring-1 focus:ring-amber-600/30 transition-all"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-950/40 border border-red-900/50 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            {message && (
              <div className="flex items-start gap-2 bg-green-950/40 border border-green-900/50 rounded-lg px-4 py-3">
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg px-4 py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Un momento...' : mode === 'login' ? 'Entrar' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className="text-center text-[#78716C] text-sm mt-6">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setMessage('') }}
              className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
            >
              {mode === 'login' ? 'Créala gratis' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
