import type { ReactNode } from 'react'
import './globals.css'

export const metadata = {
  title: 'Balancing Readability and Fidelity',
  description: 'Structured reading support for legal text simplification.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
