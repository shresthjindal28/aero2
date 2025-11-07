import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import Navbar from "@/components/Navbar";

// const transitionVariants = {
//   item: {
//     hidden: {
//       opacity: 0,
//       filter: "blur(12px)",
//       y: 12,
//     },
//     visible: {
//       opacity: 1,
//       filter: "blur(0px)",
//       y: 0,
//       transition: {
//         type: "spring",
//         stiffness: 300,
//         damping: 20,
//       },
//     },
//   },
// };

export default function HeroSection() {
  return (
    <>
      <main className="overflow-hidden [--color-primary-foreground:var(--color-white)] [--color-primary:var(--color-green-600)]">
        <Navbar />
        <section>
          <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-32 lg:pt-48">
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              {/* Hero Heading */}
              <TextEffect
                preset="fade-in-blur"
                speedSegment={0.3}
                as="h1"
                className="text-balance text-5xl font-medium md:text-6xl"
              >
                AI-Powered Prescription Generator
              </TextEffect>

              {/* Subheading */}
              <TextEffect
                per="line"
                preset="fade-in-blur"
                speedSegment={0.3}
                delay={0.5}
                as="p"
                className="mx-auto mt-6 max-w-2xl text-pretty text-lg"
              >
                Listen. Understand. Prescribe. Automatically convert
                doctor–patient conversations into structured, accurate digital
                prescriptions using intelligent speech recognition and AI
                analysis.
              </TextEffect>

              {/* Form & Mockup */}
              <AnimatedGroup
                variants={{
                  container: {
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75,
                      },
                    },
                  },
                  item: {
                    hidden: {
                      opacity: 0,
                      filter: "blur(12px)",
                      y: 12,
                    },
                    visible: {
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    },
                  },
                }}
                className="mt-10"
              >
                

                {/* Mocked Preview Section */}
                <div
                  aria-hidden
                  className="bg-radial from-primary/50 dark:from-primary/25 relative mx-auto mt-36 max-w-2xl to-transparent to-55% text-left"
                >
                  <div className="bg-background border-border/50 absolute inset-0 mx-auto w-80 -translate-x-3 -translate-y-12 rounded-4xl border p-2 mask-[linear-gradient(to_bottom,#000_50%,transparent_90%)] sm:-translate-x-6">
                    <div className="relative h-96 overflow-hidden rounded-3xl border p-2 pb-12 before:absolute before:inset-0 before:bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] before:opacity-50"></div>
                  </div>
                  <div className="bg-muted dark:bg-background/50 border-border/50 mx-auto w-80 translate-x-4 rounded-4xl border p-2 backdrop-blur-3xl mask-[linear-gradient(to_bottom,#000_50%,transparent_90%)] sm:translate-x-8">
                    <div className="bg-background space-y-2 overflow-hidden rounded-3xl border p-2 shadow-xl dark:bg-white/5 dark:shadow-black dark:backdrop-blur-3xl">
                      <AppComponent />
                      <div className="bg-muted rounded-2xl p-4 pb-16 dark:bg-white/5"></div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] mix-blend-overlay bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:opacity-5"></div>
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const AppComponent = () => {
  return (
    <div className="relative space-y-3 rounded-2xl bg-white/5 p-4">
      <div className="flex items-center gap-1.5 text-emerald-400">
        <svg
          className="size-5"
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 32 32"
        >
          <path
            fill="#10b981"
            d="M16 2a14 14 0 1 0 14 14A14.016 14.016 0 0 0 16 2m0 26a12 12 0 1 1 12-12a12.013 12.013 0 0 1-12 12"
          ></path>
          <path
            fill="#10b981"
            d="M23 10.5L13.5 20L9 15.5l1.5-1.5l3 3l8.5-8.5z"
          ></path>
        </svg>
        <div className="text-sm font-medium">Live Transcription</div>
      </div>

      <div className="space-y-3">
        {/* <div className="text-foreground border-b border-white/10 pb-3 text-sm font-medium">
          AI is listening to your consultation and generating structured notes
          and prescriptions in real time.
        </div> */}

        <div className="space-y-3 text-sm">
          <div className="bg-muted rounded-[0.8rem] p-3 dark:bg-white/10">
            <span className="font-semibold text-foreground">Doctor:</span>{" "}
            Please take one tablet of Paracetamol twice daily after meals.
          </div>
          <div className="bg-muted rounded-[0.8rem] p-3 dark:bg-white/10">
            <span className="font-semibold text-foreground">Patient:</span> Okay
            doctor, for how many days?
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="text-muted-foreground text-xs">Generated Summary</div>
          <div className="rounded-[0.8rem] border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
            <strong>Prescription:</strong> Paracetamol 500mg, 1 tablet twice
            daily after meals for 5 days.
            <br />
            <strong>Notes:</strong> Cough syrup optional.
          </div>
        </div>
      </div>
    </div>
  );
};
