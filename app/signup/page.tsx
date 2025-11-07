"use client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Create your account</h1>
        <p className="text-muted-foreground mb-6">Join us to get started</p>
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: "bg-[#6c47ff] hover:bg-[#5a3bdb] text-white",
              card: "shadow-lg border border-border",
            },
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}