import { Brain, Lock, Sparkles, Zap } from 'lucide-react'
import Image from 'next/image'

export default function ContentSection() {
  return (
    <section id="about" className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
        {/* Header Section */}
        <div className="mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            AI that Listens, Learns & Writes for Healthcare
          </h2>
          <p className="text-muted-foreground">
            Our self-learning AI agent bridges the gap between doctors and patients — understanding real-time medical conversations, identifying key entities like symptoms and medications, and generating accurate digital prescriptions instantly. Save time, reduce errors, and focus more on patient care.
          </p>
        </div>

        {/* Image */}
        <div className="relative w-full overflow-hidden rounded-3xl">
          <Image
            src="/doctor-and-patient.jpg"
            alt="Doctor consulting patient using AI assistant"
            width={1600}
            height={900}
            className="rounded-3xl object-cover grayscale"
            priority
          />
        </div>

        {/* Features Grid */}
        <div className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              <h3 className="text-sm font-medium">Real-time Transcription</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Captures and processes doctor–patient conversations live with medical-grade accuracy.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="size-4 text-primary" />
              <h3 className="text-sm font-medium">Self-Learning AI</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Continuously improves through every interaction, adapting to medical terms, tone, and doctor preferences.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-primary" />
              <h3 className="text-sm font-medium">HIPAA-Grade Security</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              All data and prescriptions are encrypted and stored securely with healthcare compliance.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-medium">Automated Prescriptions</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Converts conversations into structured prescriptions — ready to share or integrate with EMR systems.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
