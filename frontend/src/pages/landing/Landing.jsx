import { useEffect } from 'react'

import './landing-scroll.css'

import LandingNavbar from './components/LandingNavbar'
import HeroSection from './components/HeroSection'
import ProblemSection from './components/ProblemSection'
import ProposalSection from './components/ProposalSection'
import ServicesSection from './components/ServicesSection'
import AccompanimentSection from './components/AccompanimentSection'
import WhyLuminaSection from './components/WhyLuminaSection'
import OpeningCTASection from './components/OpeningCTASection'
import LandingFooter from './components/LandingFooter'
import ScrollProgressBar from './components/ScrollProgressBar'
import SmoothLandingScroll from './components/SmoothLandingScroll'
import LandingScrollManager from './components/LandingScrollManager'

export default function Landing() {
  useEffect(() => {
    document.documentElement.classList.add('landing-scroll')
    document.body.classList.add('landing-scroll')

    return () => {
      document.documentElement.classList.remove('landing-scroll')
      document.body.classList.remove('landing-scroll')
    }
  }, [])

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <LandingScrollManager />
      <SmoothLandingScroll />
      <ScrollProgressBar />

      <LandingNavbar />
      <HeroSection />
      <ProblemSection />
      <ProposalSection />
      <ServicesSection />
      <AccompanimentSection />
      <WhyLuminaSection />
      <OpeningCTASection />
      <LandingFooter />
    </main>
  )
}