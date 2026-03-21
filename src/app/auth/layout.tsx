import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const MewtwoCanvas = dynamic(() => import('@/components/mewtwo/MewtwoCanvas'), { ssr: false })

export const metadata: Metadata = {
  title: 'Anmelden | PokeDax',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#04020e] overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(75,0,130,0.35)_0%,transparent_65%)]"/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_90%_80%,rgba(50,15,120,0.2)_0%,transparent_55%)]"/>

      {/* Mewtwo subtle background */}
      <MewtwoCanvas/>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
