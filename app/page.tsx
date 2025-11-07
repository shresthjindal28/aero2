import FeaturesSection from '@/components/features-5'
import HeroSection from '@/components/hero-section'
import IntegrationsSection from '@/components/integrations-4'
import ContactSection from '@/components/content-5'
import PricingSection from '@/components/pricing'
import Footer from '@/components/footer'
import CursorTracker from '@/components/CursorTracker' 

import React from 'react'

const page = () => {
  return (
    <div>
      <CursorTracker />
      <HeroSection />
      <FeaturesSection />
      <IntegrationsSection />
      <ContactSection />
      <PricingSection />
      <Footer />
    </div>
  )
}

export default page