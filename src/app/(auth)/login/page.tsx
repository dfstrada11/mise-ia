'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const FEATURES = [
  { icon: '📊', title: 'Food Cost automatizado', desc: 'Calcula el costo real de cada plato con mermas incluidas.' },
  { icon: '📋', title: 'Fichas técnicas PDF', desc: 'Genera fichas profesionales con un clic para estandarizar tu cocina.' },
  { icon: '⚖️', title: 'Control de rendimientos', desc: 'Registra mermas y optimiza tu inventario de ingredientes.' },
  { icon: '💰', title: 'Precio de venta sugerido', desc: 'Calcula el precio ideal según tu food cost objetivo.' },
]

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
      if (error) { setError(error.message || 'Error al crear la cuenta.') }
      else if (data.user) {
        if (restaurante) await supabase.from('profiles').update({ restaurante }).eq('id', data.user.id)
        if (data.session) { router.push('/dashboard'); router.refresh() }
        else setMessage('Revisa tu correo para confirmar tu cuenta.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Correo o contraseña incorrectos.')
      else { router.push('/dashboard'); router.refresh() }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-[#080808]">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-14 relative overflow-hidden border-r border-[#1F1F1F]">
        {/* Fondo decorativo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-red-900/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-white font-semibold text-base tracking-tight">mise ai</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-medium">Software para restaurantes profesionales</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Conoce el costo real<br />
            <span className="text-red-500">de cada plato.</span>
          </h1>
          <p className="text-[#6B6B6B] text-base leading-relaxed mb-10">
            La plataforma que usan los mejores restaurantes de Latinoamérica para calcular food cost, estandarizar recetas y controlar sus márgenes.
          </p>

          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#111111] border border-[#1F1F1F] flex items-center justify-center text-base shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{f.title}</p>
                  <p className="text-[#6B6B6B] text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="flex -space-x-2">
            {['R', 'C', 'M', 'J'].map((l, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-[#1A1A1A] border-2 border-[#080808] flex items-center justify-center text-xs text-white font-medium">{l}</div>
            ))}
          </div>
          <div>
            <p className="text-white text-sm font-medium">+120 restaurantes activos</p>
            <p className="text-[#6B6B6B] text-xs">El Salvador · Guatemala · Honduras</p>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 sm:px-12">
        <div className="max-w-[380px] w-full mx-auto">
          {/* Logo mobile */}
          <div className="lg:hidden mb-10 flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-white font-semibold tracking-tight">mise ai</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta gratis'}
          </h2>
          <p className="text-[#6B6B6B] text-sm mb-8">
            {mode === 'login' ? 'Accede a tu panel de costeo' : 'Empieza a controlar tu food cost hoy'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs text-[#6B6B6B] font-medium mb-2 uppercase tracking-wider">Restaurante</label>
                <input type="text" placeholder="Nombre de tu restaurante" value={restaurante} onChange={e => setRestaurante(e.target.value)}
                  className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#333333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 transition-all" />
              </div>
            )}
            <div>
              <label className="block text-xs text-[#6B6B6B] font-medium mb-2 uppercase tracking-wider">Correo</label>
              <input type="email" placeholder="chef@restaurante.com" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#333333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-[#6B6B6B] font-medium mb-2 uppercase tracking-wider">Contraseña</label>
              <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#333333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 transition-all" />
            </div>

            {error && <div className="bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3"><p className="text-red-400 text-sm">{error}</p></div>}
            {message && <div className="bg-green-950/40 border border-green-900/50 rounded-xl px-4 py-3"><p className="text-green-400 text-sm">{message}</p></div>}

            <button type="submit" disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl px-4 py-3.5 text-sm transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Un momento...' : mode === 'login' ? 'Entrar al panel' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className="text-center text-[#6B6B6B] text-sm mt-6">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setMessage('') }}
              className="text-red-500 hover:text-red-400 font-medium transition-colors">
              {mode === 'login' ? 'Créala gratis' : 'Iniciar sesión'}
            </button>
          </p>

          {mode === 'register' && (
            <p className="text-center text-[#444444] text-xs mt-4">
              Al registrarte aceptas nuestros términos de servicio.<br />Sin tarjeta de crédito requerida.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
