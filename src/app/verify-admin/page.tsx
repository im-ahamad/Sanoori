"use client";

import { useActionState, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Timer, RotateCcw, Mail } from "lucide-react";
import { businessConfig } from "@/config/site";
import { verifyOTP, resendOTP, type VerificationActionState } from "@/lib/actions/admin-verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: VerificationActionState = undefined;

export default function VerifyAdminPage() {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(verifyOTP, initialState);
  const [resendState, resendFormAction, resendPending] = useActionState(resendOTP, initialState);
  const [cooldown, setCooldown] = useState(0);
  const email = searchParams.get("email") ?? "";
  const [otp, setOtp] = useState("");

  const error = state?.status === "error" ? state.message : null;
  const success = state?.status === "success" ? state.message : null;
  const resendError = resendState?.status === "error" ? resendState.message : null;
  const resendSuccess = resendState?.status === "success" ? resendState.message : null;

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleResend = () => {
    if (!email) return;
    setCooldown(60);
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="inline-flex items-center">
              <Image
                src={businessConfig.logo.src}
                alt={businessConfig.logo.alt}
                width={1120}
                height={338}
                unoptimized
                priority
                sizes="168px"
                className="h-9 w-auto max-w-full object-contain"
              />
            </Link>

            <h1 className="mt-6 font-heading text-xl font-bold tracking-tight text-foreground">
              Verify your email
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter the 6-digit code sent to your email to activate your admin account.
            </p>

            {email && (
              <p className="mt-2 text-sm text-muted-foreground">
                <Mail className="size-3.5 inline-block mr-1" aria-hidden="true" />
                <span className="font-mono">{email}</span>
              </p>
            )}

            <div className="mt-8">
              {success ? (
                <div className="space-y-4 text-center">
                  <div className="inline-flex size-16 items-center justify-center rounded-full bg-green-100">
                    <Loader2 className="size-8 text-green-600 animate-spin" aria-hidden="true" />
                  </div>
                  <p className="text-green-700 font-medium">{success}</p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to login...
                  </p>
                </div>
              ) : (
                <form action={formAction} noValidate aria-busy={pending}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="otp" className="sr-only">
                        Verification code
                      </Label>
                      <div className="flex gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Input
                            key={i}
                            id={`otp-${i}`}
                            name={`otp-${i}`}
                            type="text"
                            maxLength={1}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="one-time-code"
                            disabled={pending}
                            value={otp[i] ?? ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              const nextOtp = otp.slice(0, i) + value + otp.slice(i + 1);
                              setOtp(nextOtp);
                              if (value && i < 5) {
                                const nextInput = document.getElementById(`otp-${i + 1}`);
                                nextInput?.focus();
                              }
                              if (!value && i > 0) {
                                const prevInput = document.getElementById(`otp-${i - 1}`);
                                prevInput?.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Backspace" && !otp[i] && i > 0) {
                                const prevInput = document.getElementById(`otp-${i - 1}`);
                                prevInput?.focus();
                              }
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                              if (pasted.length === 6) {
                                setOtp(pasted);
                              }
                            }}
                            className="w-12 text-center text-2xl font-mono tracking-widest"
                            aria-label={`Digit ${i + 1} of verification code`}
                          />
                        ))}
                        <input
                          type="hidden"
                          name="otp"
                          value={otp}
                          readOnly
                        />
                        <input
                          type="hidden"
                          name="email"
                          value={email}
                          readOnly
                        />
                      </div>
                    </div>

                    {error ? (
                      <p
                        role="alert"
                        className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                      >
                        {error}
                      </p>
                    ) : null}

                    <Button type="submit" size="lg" className="w-full" disabled={pending || otp.length !== 6}>
                      {pending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                          Verifying...
                        </>
                      ) : (
                        "Verify"
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      {resendError ? (
                        <p className="text-destructive">{resendError}</p>
                      ) : resendSuccess ? (
                        <p className="text-green-600">{resendSuccess}</p>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={cooldown > 0 || resendPending}
                            onClick={() => {
                              resendFormAction(new FormData());
                              handleResend();
                            }}
                            className="gap-1.5"
                          >
                            <RotateCcw className="size-3.5" aria-hidden="true" />
                            {cooldown > 0 ? (
                              <>
                                <Timer className="size-3.5" aria-hidden="true" />
                                Resend in {cooldown}s
                              </>
                            ) : (
                              "Resend code"
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>

            <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
              Didn&apos;t request this? <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">Return to website</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}