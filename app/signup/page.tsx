"use client";
import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [gender, setGender] = useState<"male" | "female">("male");
  const imgSrc = gender === "male" ? "/male.jpg" : "/female1.jpg";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const imageClassName = `absolute inset-0 z-0 ${gender === "female" ? "object-cover" : "object-cover object-center"} opacity-80`;

  // Social OAuth handler
  const signUpWith = async (strategy: 'oauth_google' | 'oauth_facebook' | 'oauth_apple') => {
    if (!isLoaded || !signUp) return;
    try {
      await signUp.authenticateWithRedirect({
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
    return "Sign up failed";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // Create the account
      await signUp.create({ emailAddress: email, password });

      // Set the user's full name if provided
      if (name) {
        await signUp.update({ firstName: name });
      }

      // Send email verification code
      const res = await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      if (res.status === "complete" && res.createdSessionId) {
        // Sometimes sign up completes immediately
        await setActive({ session: res.createdSessionId });
        router.push("/dashboard");
      } else {
        // Show the OTP form
        setPendingVerification(true);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (attempt.status === "complete" && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Verification incomplete. Please check the code and try again.");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column: Custom Sign-Up Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2 text-center lg:text-left">{pendingVerification ? "Enter verification code" : "Create your account"}</h1>
          <p className="text-muted-foreground mb-6 text-center lg:text-left">
            {pendingVerification ? "We sent a 6-digit code to your email. Enter it below to verify your account." : "Join us to get started"}
          </p>

          {!pendingVerification && (
            <>
              {/* Gender selection controls image on the right */}
              <div className="mb-6">
                <Label className="mb-2 block">Select gender (controls right image)</Label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <Input type="radio" name="gender" value="male" checked={gender === "male"} onChange={() => setGender("male")} />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Input type="radio" name="gender" value="female" checked={gender === "female"} onChange={() => setGender("female")} />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              {/* Custom Sign-Up Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                  {/* Optional helper to avoid common password issues */}
                  <p className="text-xs text-muted-foreground">Use a strong, unique password. Avoid commonly used or compromised passwords.</p>
                </div>

                {/* CAPTCHA placeholder required for Clerk Smart CAPTCHA in custom flows */}
                <div id="clerk-captcha" data-cl-theme="auto" data-cl-size="flexible" />

                {error && <div className="text-sm text-destructive">{error}</div>}

                <Button type="submit" className="w-full bg-[#6c47ff] hover:bg-[#5a3bdb]" disabled={isSubmitting || !isLoaded}>
                  {isSubmitting ? "Creating account..." : "Sign up"}
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
                  <Button type="button" variant="outline" onClick={() => signUpWith('oauth_google')} disabled={!isLoaded}>Google</Button>
                  <Button type="button" variant="outline" onClick={() => signUpWith('oauth_facebook')} disabled={!isLoaded}>Facebook</Button>
                  <Button type="button" variant="outline" onClick={() => signUpWith('oauth_apple')} disabled={!isLoaded}>Apple</Button>
                </div>
                <div className="text-sm text-center text-muted-foreground">
                  Already have an account? <a href="/sign-in" className="text-primary underline">Sign in</a>
                </div>
              </form>
            </>
          )}

          {pendingVerification && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input id="code" type="text" inputMode="numeric" pattern="[0-9]*" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="123456" required />
              </div>

              {error && <div className="text-sm text-destructive">{error}</div>}

              <Button type="submit" className="w-full bg-[#6c47ff] hover:bg-[#5a3bdb]" disabled={isSubmitting || !isLoaded}>
                {isSubmitting ? "Verifying..." : "Verify email"}
              </Button>

              <button type="button" onClick={handleResend} className="text-sm underline text-primary disabled:opacity-50" disabled={isSubmitting || !isLoaded}>
                Resend code
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Column: Image */}
      <div className="relative hidden lg:flex w-1/2 items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Image src={imgSrc} alt="Signup illustration" fill priority unoptimized sizes="(min-width:1024px) 50vw, 100vw" className={imageClassName} />
      </div>
    </div>
  );
}