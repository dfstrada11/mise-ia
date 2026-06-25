export default function IngredientesPage() {
  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1F1F1F] bg-[#080808] sticky top-0 z-10">
        <div>
          <p className="text-[#5A5A5A] text-xs">Módulo 01</p>
          <h1 className="text-white font-semibold text-base">Ingredientes</h1>
        </div>
        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo ingrediente
        </button>
      </div>

      {/* Filtros */}
      <div className="px-8 py-4 border-b border-[#1F1F1F] flex items-center gap-3">
        <div className="flex-1 relative">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 text-[#3A3A3A] absolute left-3 top-1/2 -translate-y-1/2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input placeholder="Buscar ingrediente..." className="w-full bg-[#111111] border border-[#1F1F1F] text-white placeholder-[#333333] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-600/40 transition-all" />
        </div>
        <select className="bg-[#111111] border border-[#1F1F1F] text-[#5A5A5A] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-600/40 transition-all">
          <option>Todas las unidades</option>
          <option>kg</option>
          <option>litro</option>
          <option>unidad</option>
          <option>gramo</option>
        </select>
      </div>

      {/* Estado vacío */}
      <div className="flex flex-col items-center justify-center py-24 text-center px-8 pb-32 md:pb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#111111] border border-[#1F1F1F] flex items-center justify-center mb-5 text-2xl">🥩</div>
        <h3 className="text-white font-semibold text-base mb-2">Sin ingredientes todavía</h3>
        <p className="text-[#5A5A5A] text-sm max-w-xs leading-relaxed mb-6">
          Agrega tus ingredientes con precios y rendimientos para empezar a calcular el costo real de tus recetas.
        </p>
        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar primer ingrediente
        </button>

        <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm w-full">
          {[
            { icon: '💰', label: 'Precio por unidad' },
            { icon: '⚖️', label: 'Rendimiento %' },
            { icon: '📊', label: 'Costo real' },
          ].map(f => (
            <div key={f.label} className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-3 text-center">
              <p className="text-lg mb-1">{f.icon}</p>
              <p className="text-[#5A5A5A] text-[10px] leading-tight">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
