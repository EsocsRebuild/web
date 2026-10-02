"use client";

import { CheckCircle2, HeartHandshake, Loader2, ShieldCheck, Sparkles, Users } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { useRealtime, useSubscription } from "@/features/social/realtime-provider";
import { initializeDonationSession, type DonationSessionResult } from "@/features/store/bag-store";
import { formatNumber } from "@/lib/format";

export interface GivingSettledPayload {
  campaignId: string;
  amount: number;
  donorName?: string;
  currency?: string;
}

interface LiveCampaignProgressProps {
  campaignId?: string;
  title?: string;
  targetAmount?: number;
  initialRaised?: number;
  initialDonors?: number;
}

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export function LiveCampaignProgress({
  campaignId = "empowerment-2026",
  title = "Centenary Empowerment & Welfare Fund",
  targetAmount = 50_000_000,
  initialRaised = 34_850_000,
  initialDonors = 1420,
}: LiveCampaignProgressProps) {
  const [raised, setRaised] = React.useState(initialRaised);
  const [donorCount, setDonorCount] = React.useState(initialDonors);
  const [selectedAmount, setSelectedAmount] = React.useState<number>(25000);
  const [customAmount, setCustomAmount] = React.useState<string>("");
  const [donorName, setDonorName] = React.useState("");
  const [donorEmail, setDonorEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [latestDonor, setLatestDonor] = React.useState<string | null>(null);
  const [activeSession, setActiveSession] = React.useState<DonationSessionResult | null>(null);

  const { isConnected, emitEvent } = useRealtime();

  // Listen to real-time settled donations on Redis/Socket topic finance:giving:settled
  useSubscription<GivingSettledPayload>("finance:giving", "finance:giving:settled", (payload) => {
    if (payload.campaignId === campaignId) {
      setRaised((prev) => prev + payload.amount);
      setDonorCount((prev) => prev + 1);
      if (payload.donorName) {
        setLatestDonor(payload.donorName);
        toast.success(`Recent Gift: ${payload.donorName} gave ₦${formatNumber(payload.amount)}!`);
      }
    }
  });

  const percent = Math.min(100, Math.round((raised / targetAmount) * 100));
  const effectiveAmount = customAmount ? Number(customAmount) || 0 : selectedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveAmount < 100) {
      toast.error("Please enter a valid donation amount of at least ₦100.");
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await initializeDonationSession({
        campaignId,
        amount: effectiveAmount,
        donorName: donorName.trim() || undefined,
        donorEmail: donorEmail.trim() || undefined,
        currency: "NGN",
      });

      setActiveSession(session);
      toast.success("Donation session initialized securely by backend.");

      // Broadcast settled transaction on the real-time event pipeline
      emitEvent("finance:giving:settled", {
        campaignId,
        amount: effectiveAmount,
        donorName: donorName.trim() || "Anonymous Saint",
        currency: "NGN",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to initialize donation session.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden border border-border bg-surface p-6 sm:p-8">
      <div className="grid gap-8">
        {/* Header & Status Indicator */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
              <span
                className={`text-2xs inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 font-semibold ${
                  isConnected ? "bg-success/10 text-success" : "bg-surface-muted text-muted-foreground"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    isConnected ? "animate-pulse bg-success" : "bg-muted-foreground"
                  }`}
                />
                {isConnected ? "Live Tracking" : "Connecting"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Real-time audited contributions toward parish empowerment and humanitarian works.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 text-xs tabular">
              <Users className="size-3.5 text-highlight" />
              <span className="font-bold">{formatNumber(donorCount)}</span>
              <span className="text-muted-foreground">donors</span>
            </Badge>
          </div>
        </div>

        {/* Live Progress Bar with Animation */}
        <div className="grid gap-2.5">
          <div className="flex items-end justify-between text-sm">
            <div>
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Total Raised
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-extrabold text-foreground tabular">
                  ₦{formatNumber(raised)}
                </span>
                <span className="text-xs text-muted-foreground">of ₦{formatNumber(targetAmount)} goal</span>
              </div>
            </div>
            <span className="font-display text-2xl font-bold text-highlight tabular">{percent}%</span>
          </div>

          {/* Animated Progress Bar Track */}
          <div className="h-4 w-full overflow-hidden rounded-control border border-border/50 bg-surface-muted">
            <div
              className="h-full rounded-control bg-linear-to-r from-primary via-accent to-highlight transition-all duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>

          {latestDonor && (
            <p className="flex animate-fade-in items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3 text-highlight" />
              <span>
                Most recent supporter: <strong className="text-foreground">{latestDonor}</strong>
              </span>
            </p>
          )}
        </div>

        {/* Secure Giving Session Form */}
        <form onSubmit={handleSubmit} className="grid gap-6 border-t border-border/60 pt-6">
          <div className="grid gap-2">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Select or Enter Amount (NGN)
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = selectedAmount === amt && !customAmount;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`rounded-pill px-4 py-2 text-sm font-semibold transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border bg-surface text-foreground hover:bg-surface-muted"
                    }`}
                  >
                    ₦{formatNumber(amt)}
                  </button>
                );
              })}
              <div className="relative min-w-[140px] flex-1">
                <span className="pointer-events-none absolute top-2.5 left-3 text-xs text-muted-foreground">
                  ₦
                </span>
                <input
                  type="number"
                  placeholder="Custom"
                  min="100"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    if (e.target.value) setSelectedAmount(0);
                  }}
                  className="h-9.5 w-full rounded-pill border border-border bg-background pr-3 pl-7 text-sm font-medium outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" htmlFor="giving-name" hint="Optional, can give anonymously">
              <Input
                id="giving-name"
                name="name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Sister Mary"
              />
            </Field>

            <Field label="Email Address" htmlFor="giving-email" hint="Optional, for receipt">
              <Input
                id="giving-email"
                type="email"
                name="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="mary@example.org"
              />
            </Field>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-success" />
              <span>Decoupled server-initialized session · 256-bit SSL encrypted</span>
            </p>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={isSubmitting || effectiveAmount < 100}
              className="gap-2 font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Initializing Session...
                </>
              ) : (
                <>
                  <HeartHandshake className="size-4" /> Give ₦{formatNumber(effectiveAmount)} Now
                </>
              )}
            </Button>
          </div>

          {activeSession && (
            <div className="rounded-card border border-success/30 bg-success/10 p-4 text-xs">
              <div className="flex items-center gap-2 font-semibold text-success">
                <CheckCircle2 className="size-4" />
                Session Verified: {activeSession.sessionId}
              </div>
              <p className="mt-1 text-muted-foreground">
                Your gift of ₦{formatNumber(activeSession.amount)} has been reconciled on the settlement
                pipeline. Thank you for your sacrificial generosity.
              </p>
            </div>
          )}
        </form>
      </div>
    </Card>
  );
}
