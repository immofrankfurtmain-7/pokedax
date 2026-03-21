import Navbar        from '@/components/layout/Navbar'
import Hero          from '@/components/layout/Hero'
import TrendingGrid  from '@/components/cards/TrendingGrid'
import ForumSection  from '@/components/forum/ForumSection'
import PremiumSection from '@/components/premium/PremiumSection'
import Footer        from '@/components/layout/Footer'
import { getTrendingCards } from '@/lib/pokemon-api'

export default async function HomePage() {
  const trending = await getTrendingCards()

  return (
    <main className="relative min-h-screen">
      {/* Layered backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(75,0,130,0.3)_0%,transparent_65%)]"/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_88%_55%,rgba(50,15,120,0.22)_0%,transparent_55%)]"/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_35%_35%_at_8%_85%,rgba(18,8,70,0.28)_0%,transparent_55%)]"/>
      </div>

      <Navbar/>
      <Hero/>
      <TrendingGrid cards={trending}/>

      {/* Separator */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-violet-800/30 to-transparent"/>
      </div>

      <ForumSection/>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-violet-800/30 to-transparent"/>
      </div>

      <PremiumSection/>
      <Footer/>
    </main>
  )
}
