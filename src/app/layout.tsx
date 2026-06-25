import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Mise AI — Costeo culinario para restaurantes',
  description: 'Calcula el costo real de cada plato. Fichas técnicas, rendimientos y food cost para restaurantes de Latinoamérica.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={geist.variable}>
      <body>{children}</body>
    </html>
  )
}
