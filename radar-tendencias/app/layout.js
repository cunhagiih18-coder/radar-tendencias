import './globals.css'

export const metadata = {
  title: 'Radar de Tendências',
  description: 'Monitoramento diário de marketing digital e lançamentos'
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
