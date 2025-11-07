"use client";
import { useSignIn } from "@clerk/nextjs";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomSignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
// Add OAuth sign-in helper
const signInWith = async (strategy: 'oauth_google' | 'oauth_facebook' | 'oauth_apple') => {
  if (!isLoaded || !signIn) return;
  try {
    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/dashboard",
    });
  } catch (err) {
    setError(getErrorMessage(err));
  }
};

  function getErrorMessage(e: unknown): string {
    if (typeof e === "object" && e !== null && "errors" in e) {
      const errs = (e as { errors?: Array<{ message?: string }> }).errors;
      const msg = errs && errs[0]?.message;
      if (msg) return msg;
    }
    if (e instanceof Error) return e.message;
    return "Sign in failed";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // Initialize sign-in with the identifier (email)
      await signIn.create({ identifier: email });

      // Attempt first factor using the password strategy
      const res = await signIn.attemptFirstFactor({
        strategy: "password",
        password,
      });

      if (res.status === "complete" && res.createdSessionId) {
        await setActive({ session: res.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Additional verification required. Please complete any pending steps.");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column: Image */}
      <div className="relative hidden lg:flex w-1/2 items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Image
          src="/doctor.jpeg" // Requested Unsplash image
          alt="Login background"
          fill
          priority
          unoptimized
          sizes="(min-width:1024px) 50vw, 100vw"
          className="absolute inset-0 z-0 object-cover object-center opacity-80"
        />
        
      </div>

      {/* Right Column: Custom Sign-In Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2 text-center lg:text-left">Welcome back</h1>
          <p className="text-muted-foreground mb-8 text-center lg:text-left">Log in to continue to your dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-[#6c47ff] hover:bg-[#5a3bdb]" disabled={isSubmitting || !isLoaded}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button type="button" variant="outline" onClick={() => signInWith('oauth_google')} disabled={!isLoaded}>Google</Button>
              <Button type="button" variant="outline" onClick={() => signInWith('oauth_facebook')} disabled={!isLoaded}>Facebook</Button>
              <Button type="button" variant="outline" onClick={() => signInWith('oauth_apple')} disabled={!isLoaded}>Apple</Button>
            </div>

            <div className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account? <a href="/signup" className="text-primary underline">Create one</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}