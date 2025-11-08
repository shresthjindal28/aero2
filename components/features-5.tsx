import { Brain, FileText, Mic, Stethoscope } from "lucide-react";
import Image from "next/image";

export default function FeaturesSection() {
  return (
    <section id="services" className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
          {/* Text Section */}
          <div className="lg:col-span-2">
            <div className="md:pr-6 lg:pr-0">
              <h2 className="text-4xl font-semibold lg:text-5xl">
                Designed for Smarter Healthcare
              </h2>
              <p className="mt-6 text-muted-foreground">
                Our AI-powered system listens to real doctor–patient
                conversations, understands the context, and generates
                error-free prescriptions instantly — helping doctors focus on
                care, not paperwork.
              </p>
            </div>

            {/* Features List */}
            <ul className="mt-8 divide-y border-y *:flex *:items-center *:gap-3 *:py-3">
              <li>
                <Mic className="size-5 text-emerald-500" />
                Real-time voice transcription
              </li>
              <li>
                <Brain className="size-5 text-blue-500" />
                AI-powered medical understanding
              </li>
              <li>
                <FileText className="size-5 text-indigo-500" />
                Automatic prescription generation
              </li>
              <li>
                <Stethoscope className="size-5 text-rose-500" />
                Built for doctors and healthcare teams
              </li>
            </ul>
          </div>

          {/* Image Section */}
          <div className="border-border/50 relative rounded-3xl border p-3 lg:col-span-3">
            <div className="bg-linear-to-b aspect-76/59 relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
              <Image
                src="/yo.png"
                className="hidden h-full rounded-[15px] dark:block"
                alt="AI prescription dashboard dark"
                width={1207}
                height={929}
              />
              <Image
                src="/yo.png"
                className="rounded-[15px] shadow dark:hidden"
                alt="AI prescription dashboard light"
                width={1207}
                height={929}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
