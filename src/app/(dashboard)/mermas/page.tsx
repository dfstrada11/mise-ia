import Link from 'next/link'

export default function MermasPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1F1F1F] bg-[#080808] sticky top-0 z-10">
        <div>
          <p className="text-[#5A5A5A] text-xs">Módulo 04</p>
          <h1 className="text-white font-semibold text-base">Control de mermas</h1>
        </div>
        <span className="text-[10px] font-semibold px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
          Próximamente
        </span>
      </div>

      <div className="px-8 py-16 max-w-2xl">
        <div className="bg-[#0E0E0E] border border-[#181818] rounded-2xl p-8">
          <div className="w-14 h-14 bg-amber-400/10 border border-amber-400/20 rounded-2xl flex items-center justify-center text-2xl mb-6">
            📉
          </div>
          <h2 className="text-white text-xl font-bold mb-3">Control de mermas</h2>
          <p className="text-[#5A5A5A] text-sm leading-relaxed mb-8">
            Registra los desperdicios reales de tu cocina día a día. Compara con el rendimiento teórico de tus ingredientes para identificar dónde estás perdiendo dinero.
          </p>

          <div className="space-y-3 mb-8">
            {[
              { icon: '📦', title: 'Registro de merma diaria', desc: 'Anota qué ingrediente, cuánto se perdió y por qué.' },
              { icon: '📊', title: 'Comparación teórico vs real', desc: 'Detecta si el pollo realmente rinde el 70% que calculaste.' },
              { icon: '💡', title: 'Alertas de desvío', desc: 'Notificaciones cuando la merma real supera el objetivo.' },
              { icon: '📈', title: 'Reportes históricos', desc: 'Tendencias de desperdicio por semana y por ingrediente.' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4 p-4 bg-[#111111] border border-[#1A1A1A] rounded-xl">
                <span className="text-xl shrink-0">{f.icon}</span>
                <div>
                  <p className="text-white text-sm font-medium">{f.title}</p>
                  <p className="text-[#4A4A4A] text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4">
            <p className="text-amber-400 text-xs font-medium mb-1">¿Por qué importa el control de mermas?</p>
            <p className="text-[#5A5A5A] text-xs leading-relaxed">
              Un restaurante promedio pierde entre 4-10% de sus insumos por merma no controlada. En un negocio con $5,000 de compras mensuales, eso son $200–$500 perdidos cada mes.
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[#3A3A3A] text-xs mb-3">Mientras tanto, controla la merma desde el rendimiento de ingredientes</p>
          <Link href="/ingredientes" className="text-red-500 text-xs hover:text-red-400 transition-colors">
            Ir a ingredientes →
          </Link>
        </div>
      </div>
    </div>
  )
}
