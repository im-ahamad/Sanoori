"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Timer, RotateCcw, Mail } from "lucide-react";
import { businessConfig } from "@/config/site";
import { verifyOtpAndSignIn, type OtpVerifyState } from "@/lib/actions/auth";
import { resendLoginOtp, type LoginOtpActionState } from "@/lib/actions/login-otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: OtpVerifyState = undefined;
const initialResendState: LoginOtpActionState = undefined;

interface OtpFormProps {
  challengeId: string;
  email: string;
}

export function OtpForm({ challengeId, email }: OtpFormProps) {
  const [state, formAction, pending] = useActionState(verifyOtpAndSignIn, initialState);
  const [resendState, resendFormAction, resendPending] = useActionState(resendLoginOtp, initialResendState);
  const [cooldown, setCooldown] = useState(0);
  const [otp, setOtp] = useState("");

  const error = state?.stage === "otp" && "error" in state ? state.error : null;
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
    setCooldown(60);
  };

  const handleResendClick = () => {
    const fd = new FormData();
    fd.append("challengeId", challengeId);
    resendFormAction(fd);
    handleResend();
  };

  return (
    <div className="mt-8">
      <form action={formAction} noValidate aria-busy={pending}>
        <input type="hidden" name="challengeId" value={challengeId} />
        <div className="space-y-4">
          <div>
            <Label htmlFor="otp" className="sr-only">
              Verification code
            </Label>
            <div className="flex gap-1.5 sm:gap-2">
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
                  className="w-10 sm:w-12 text-center text-xl sm:text-2xl font-mono tracking-widest"
                  aria-label={`Digit ${i + 1} of verification code`}
                />
              ))}
              <input
                type="hidden"
                name="otp"
                value={otp}
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
                  onClick={handleResendClick}
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
    </div>
  );
}