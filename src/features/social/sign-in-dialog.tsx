"use client";

import { ArrowLeft, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { toast } from "@/components/ui/toaster";
import { isSocialError } from "@/data/errors";
import { getSocial } from "@/data/social";
import { routes } from "@/lib/routes";

import { useSocial } from "./provider";

type Step = "contact" | "code" | "unavailable";

const DEMO = process.env.NODE_ENV !== "production";

/** The one sign-in flow, opened from any member action. People stay where they were. */
export function SignInDialog() {
  const { signInOpen, setSignInOpen } = useSocial();
  return (
    <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
      <DialogContent className="sm:max-w-md">
        {/* Mounted only while open, so every visit starts fresh. */}
        <SignInFlow />
      </DialogContent>
    </Dialog>
  );
}

function SignInFlow() {
  const { setSignInOpen, signInReason } = useSocial();
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("contact");
  const [name, setName] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [resendIn, setResendIn] = React.useState(0);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  const sendCode = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await getSocial().requestCode(contact);
      setStep("code");
      setResendIn(30);
    } catch (err) {
      if (isSocialError(err, "unavailable")) setStep("unavailable");
      else setError(isSocialError(err) ? err.message : "We couldn't send a code. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value = code) => {
    setBusy(true);
    setError(null);
    try {
      const member = await getSocial().verifyCode(contact, value, name);
      setSignInOpen(false);
      toast.success(`Welcome, ${member.displayName}`);
      if (!member.homeUnitSlug) router.push(routes.onboarding());
    } catch (err) {
      setError(isSocialError(err) ? err.message : "We couldn't check that code. Please try again.");
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {step === "contact" && (
        <form onSubmit={sendCode} className="grid gap-5" noValidate>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-extrabold">
              Join your church family
            </DialogTitle>
            <DialogDescription>
              {signInReason ?? "Sign in to follow your church, respond to posts and RSVP to events."}{" "}
              We&apos;ll send a 6-digit code; there is no password to remember.
            </DialogDescription>
          </DialogHeader>
          <Field label="Your name" htmlFor="sign-in-name" hint="Shown with your comments.">
            <Input
              id="sign-in-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserRound />}
              aria-describedby="sign-in-name-msg"
            />
          </Field>
          <Field label="Email or phone number" htmlFor="sign-in-contact" error={error ?? undefined} required>
            <Input
              id="sign-in-contact"
              autoComplete="username"
              inputMode="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              leftIcon={<Mail />}
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "sign-in-contact-msg" : undefined}
              required
            />
          </Field>
          <Button type="submit" size="lg" loading={busy} disabled={!contact.trim()}>
            Send my code
          </Button>
        </form>
      )}

      {step === "code" && (
        <div className="grid gap-5">
          <DialogHeader>
            <button
              type="button"
              onClick={() => setStep("contact")}
              className="-ml-1 inline-flex w-fit cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft aria-hidden className="size-4" /> Change details
            </button>
            <DialogTitle className="font-display text-2xl font-extrabold">Enter your code</DialogTitle>
            <DialogDescription>
              We sent a 6-digit code to <strong className="text-foreground">{contact}</strong>.
            </DialogDescription>
          </DialogHeader>
          <OtpInput
            id="sign-in-code"
            value={code}
            onChange={setCode}
            onComplete={verify}
            invalid={!!error}
            disabled={busy}
          />
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          {DEMO && (
            <p className="rounded-control bg-info-soft px-3 py-2 text-sm text-info">
              Development preview: no messages are sent. Use code <strong>000000</strong>.
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" onClick={() => verify()} loading={busy} disabled={code.length < 6}>
              Continue
            </Button>
            <button
              type="button"
              disabled={resendIn > 0 || busy}
              onClick={() => sendCode()}
              className="cursor-pointer text-sm font-semibold text-foreground underline-offset-4 hover:underline disabled:cursor-default disabled:text-subtle-foreground disabled:no-underline"
            >
              {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
            </button>
          </div>
        </div>
      )}

      {step === "unavailable" && (
        <div className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-extrabold">
              Member accounts are coming soon
            </DialogTitle>
            <DialogDescription>
              You&apos;ll soon be able to follow your church, respond to posts and RSVP to events. Until then,
              everything on the site is open to read.
            </DialogDescription>
          </DialogHeader>
          <Button asChild variant="outline">
            <Link href={routes.find()} onClick={() => setSignInOpen(false)}>
              Find a church near you
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
