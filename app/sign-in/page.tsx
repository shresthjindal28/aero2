"use client";
import { SignIn } from "@clerk/nextjs";
import Image from 'next/image'; // Import next/image for optimized images

export default function CustomSignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Column: Image */}
      <div className="relative hidden lg:flex w-1/2 items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Image
          src="/path/to/your/login-image.jpg" // Replace with your image path
          alt="Login background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0 opacity-80"
        />
        <div className="relative z-10 p-8 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Your Brand Here</h2>
          <p className="text-lg">Seamless access to your medical transcriptions.</p>
        </div>
      </div>

      {/* Right Column: Clerk Sign-In Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2 text-center lg:text-left">Welcome back</h1>
          <p className="text-muted-foreground mb-8 text-center lg:text-left">Log in to continue to your dashboard.</p>
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-[#6c47ff] hover:bg-[#5a3bdb] text-white",
                card: "shadow-none border-none", // Remove card styling as outer div provides it
              },
            }}
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}