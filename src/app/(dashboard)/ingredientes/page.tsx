export default function IngredientesPage() {
  return (
    <div className="px-6 py-8 md:px-10 md:py-10 pb-24 md:pb-10">
      <div className="mb-8">
        <p className="text-[#78716C] text-sm mb-1">Módulo 01</p>
        <h1 className="text-2xl font-semibold text-white">Ingredientes</h1>
        <p className="text-[#78716C] text-sm mt-1">
          Registra tus productos con precios, unidades y rendimientos.
        </p>
      </div>

      {/* Estado vacío */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#131310] border border-[#1E1E1A] flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-[#3A3A32]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
        </div>
        <h3 className="text-white font-medium mb-2">Sin ingredientes todavía</h3>
        <p className="text-[#78716C] text-sm max-w-xs">
          Agrega tu primer ingrediente para empezar a calcular costos.
        </p>
        <button className="mt-6 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          + Agregar ingrediente
        </button>
      </div>
    </div>
  )
}
