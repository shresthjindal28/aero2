import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
            Choose the Right Plan for Your Healthcare Practice
          </h2>
          <p className="mt-4 text-muted-foreground">
            Empower your clinic or hospital with AI that listens, learns, and creates prescriptions — 
            saving time for your medical staff while improving patient outcomes.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mt-12 md:mt-20">
          <div className="bg-card relative rounded-3xl border shadow-2xl shadow-zinc-950/5">
            <div className="grid items-center gap-12 divide-y p-12 md:grid-cols-2 md:divide-x md:divide-y-0">
              {/* Left Side - Pricing Info */}
              <div className="pb-12 text-center md:pb-0 md:pr-12">
                <h3 className="text-2xl font-semibold">Clinic Pro Plan</h3>
                <p className="mt-2 text-lg">Perfect for individual doctors, clinics & small hospitals</p>
                <span className="mb-6 mt-12 inline-block text-6xl font-bold">
                  <span className="text-4xl">₹</span>299
                </span>
                <span className="text-muted-foreground text-sm">/month</span>

                <div className="flex justify-center mt-8">
                  <Button asChild size="lg">
                    <Link href="#">Get Started</Link>
                  </Button>
                </div>

                <p className="text-muted-foreground mt-10 text-sm">
                  Includes: secure data processing, AI prescription automation, 
                  speech-to-text transcription, and smart medical insights.
                </p>
              </div>

              {/* Right Side - Feature List */}
              <div className="relative">
                <ul role="list" className="space-y-4">
                  {[
                    'Real-time doctor–patient transcription',
                    'AI-generated prescriptions within seconds',
                    'HIPAA-grade encryption and cloud storage',
                    'Supports multiple medical specializations',
                    'Multi-user access for assistants and nurses',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="size-3 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-muted-foreground mt-6 text-sm">
                  Trusted by healthcare professionals and innovators worldwide. 
                  Designed to fit clinics, telehealth platforms, and enterprise hospitals.
                </p>

                {/* Partner Logos */}
                <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
                  <Image
                    className="h-5 w-auto dark:invert"
                    src="https://upload.wikimedia.org/wikipedia/commons/7/73/HCA_Healthcare_logo.svg"
                    alt="HCA Healthcare"
                    width={100}
                    height={20}
                  />
                  <Image
                    className="h-5 w-auto dark:invert"
                    src="https://upload.wikimedia.org/wikipedia/commons/8/85/Medtronic_logo.svg"
                    alt="Medtronic"
                    width={100}
                    height={20}
                  />
                  <Image
                    className="h-5 w-auto dark:invert"
                    src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Mayo_Clinic_logo.svg"
                    alt="Mayo Clinic"
                    width={100}
                    height={20}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
