"use client";

import { useActionState, useState, FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticate, verifyOtpAndSignIn, type PasswordVerifyState, type OtpVerifyState } from "@/lib/actions/auth";
import { OtpForm } from "@/components/admin/otp-form";

export function LoginForm() {
  const [stage, setStage] = useState<"password" | "otp">("password");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  
  // Use action state for error display only
  const [passwordState, , passwordPending] = useActionState<PasswordVerifyState, FormData>(
    authenticate,
    undefined
  );
  const [otpState, , otpPending] = useActionState<OtpVerifyState, FormData>(
    verifyOtpAndSignIn,
    undefined
  );

  const passwordError = passwordState?.stage === "password" && "error" in passwordState 
    ? passwordState.error 
    : null;
  const otpError = otpState?.stage === "otp" && "error" in otpState 
    ? otpState.error 
    : null;

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Call server action directly for result
    const result = await authenticate(undefined, formData);
    
    if (result && result.stage === "password" && "requiresOtp" in result && result.requiresOtp && result.challengeId) {
      setChallengeId(result.challengeId);
      setEmail(formData.get("email") as string);
      setStage("otp");
    }
  };

  const handleOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("challengeId", challengeId!);
    // Call server action directly - will redirect on success
    await verifyOtpAndSignIn(undefined, formData);
  };

  const currentError = stage === "password" ? passwordError : otpError;
  const currentPending = stage === "password" ? passwordPending : otpPending;
  const currentAction = stage === "password" ? handlePasswordSubmit : handleOtpSubmit;

  return (
    <form onSubmit={currentAction} noValidate aria-busy={currentPending}>
      <div className="space-y-4">
        {stage === "password" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@sanoori.test"
                required
                autoFocus
                disabled={currentPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                disabled={currentPending}
              />
            </div>

            {currentError ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {currentError}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={currentPending}>
              {currentPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </>
        ) : (
          <OtpForm challengeId={challengeId!} email={email} />
        )}
      </div>
    </form>
  );
}