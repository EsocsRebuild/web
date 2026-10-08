"use client";

import {
  AlertCircle,
  Activity,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Copy,
  Home,
  MapPin,
  PhoneCall,
  RotateCcw,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface ErrorViewProps {
  error: Error & { digest?: string };
  reset?: () => void;
  /** Whether this is being rendered inside global-error.tsx (full screen viewport). */
  isGlobal?: boolean;
  className?: string;
}

type HealthStatus = "idle" | "testing" | "online" | "degraded" | "unreachable";

/**
 * World-class Error Boundary & Downtime Experience Component:
 *
 * Renders when the application encounters a runtime crash, network offline state,
 * or server interruption. Provides real-time network detection, server health ping,
 * pastoral care hotlines, and collapsible developer diagnostic reporting.
 */
export function ErrorView({ error, reset, isGlobal = false, className }: ErrorViewProps) {
  const [isOffline, setIsOffline] = React.useState<boolean>(() =>
    typeof window !== "undefined" ? !window.navigator.onLine : false,
  );
  const [isRetrying, setIsRetrying] = React.useState<boolean>(false);
  const [healthStatus, setHealthStatus] = React.useState<HealthStatus>("idle");
  const [healthLatency, setHealthLatency] = React.useState<number | null>(null);
  const [showDiagnostics, setShowDiagnostics] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);

  // Monitor network status in real-time
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Ping /api/health to check server availability
  const checkServerHealth = React.useCallback(async () => {
    setHealthStatus("testing");
    const start = Date.now();
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const duration = Date.now() - start;
      setHealthLatency(duration);

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.status === "ok") {
          setHealthStatus("online");
        } else {
          setHealthStatus("degraded");
        }
      } else {
        setHealthStatus("degraded");
      }
    } catch {
      setHealthStatus("unreachable");
    }
  }, []);

  const handleReset = React.useCallback(() => {
    setIsRetrying(true);
    if (reset) {
      reset();
    } else if (typeof window !== "undefined") {
      window.location.reload();
    }
    const timer = setTimeout(() => setIsRetrying(false), 2000);
    return () => clearTimeout(timer);
  }, [reset]);

  const copyDiagnosticReport = React.useCallback(() => {
    if (typeof window === "undefined") return;

    const report = [
      `=== ESOCS Church App Error Diagnostic Report ===`,
      `Timestamp: ${new Date().toISOString()}`,
      `Error Name: ${error?.name || "UnknownError"}`,
      `Error Message: ${error?.message || "No error message provided"}`,
      `Digest Code: ${error?.digest || "N/A"}`,
      `Network Status: ${isOffline ? "Offline" : "Online"}`,
      `User Agent: ${navigator.userAgent}`,
      `URL: ${window.location.href}`,
      `===============================================`,
    ].join("\n");

    navigator.clipboard.writeText(report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }, [error, isOffline]);

  const headline = isOffline
    ? "You are currently offline"
    : healthStatus === "unreachable"
      ? "Temporary Server Disruption"
      : "We couldn't load this page";

  const subline = isOffline
    ? "Please check your internet or Wi-Fi connection. Once reconnected, click 'Try again' to restore the page."
    : "The Holy Order's servers are experiencing a brief interruption or heavy traffic. Reassure yourself that your data is safe.";

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center p-gutter transition-all duration-300",
        isGlobal ? "min-h-screen bg-background py-16 text-foreground" : "min-h-[70vh] py-12",
        className,
      )}
    >
      {/* Decorative ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 dark:opacity-20"
      >
        <div className="absolute top-1/3 left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 size-80 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Top Status Indicator Badge */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {isOffline ? (
            <Badge variant="warning" dot className="px-3 py-1 text-xs font-bold tracking-wide uppercase">
              Connection Disconnected
            </Badge>
          ) : healthStatus === "online" ? (
            <Badge variant="success" dot className="px-3 py-1 text-xs font-bold tracking-wide uppercase">
              Server Online ({healthLatency}ms)
            </Badge>
          ) : healthStatus === "unreachable" ? (
            <Badge variant="danger" dot className="px-3 py-1 text-xs font-bold tracking-wide uppercase">
              Server Unreachable
            </Badge>
          ) : (
            <Badge variant="accent" dot className="px-3 py-1 text-xs font-bold tracking-wide uppercase">
              System Interruption
            </Badge>
          )}
        </div>

        {/* Central Brand Shield / Icon Container */}
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl border border-gold-500/30 bg-surface-muted/80 shadow-lg backdrop-blur-md">
          {isOffline ? (
            <WifiOff className="size-10 text-warning" />
          ) : healthStatus === "unreachable" ? (
            <ShieldAlert className="size-10 text-danger" />
          ) : (
            <AlertCircle className="size-10 text-gold-500" />
          )}
        </div>

        {/* Header Titles */}
        <h1 className="mb-3 font-display text-2xl font-extrabold tracking-tight text-balance sm:text-3xl lg:text-4xl">
          {headline}
        </h1>
        <p className="mx-auto mb-8 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
          {subline}
        </p>

        {/* Action Buttons */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            variant="gold"
            shape="pill"
            loading={isRetrying}
            leftIcon={<RotateCcw className={cn("size-5", isRetrying && "animate-spin")} />}
            onClick={handleReset}
          >
            Try again
          </Button>

          <Button
            size="lg"
            variant="outline"
            shape="pill"
            leftIcon={<Activity className="size-5 text-accent" />}
            onClick={checkServerHealth}
            loading={healthStatus === "testing"}
          >
            Check server health
          </Button>

          <Button asChild size="lg" variant="secondary" shape="pill" leftIcon={<Home className="size-5" />}>
            <Link href={routes.home()}>Go to homepage</Link>
          </Button>
        </div>

        {/* Health status feedback toast inline */}
        {healthStatus !== "idle" && (
          <div
            className={cn(
              "mx-auto mb-8 max-w-md rounded-xl border p-3.5 text-xs transition-all duration-200",
              healthStatus === "online"
                ? "border-success/30 bg-success-soft text-success"
                : healthStatus === "degraded"
                  ? "border-warning/30 bg-warning-soft text-warning"
                  : healthStatus === "unreachable"
                    ? "border-danger/30 bg-danger-soft text-danger"
                    : "border-border bg-surface-muted text-muted-foreground",
            )}
          >
            {healthStatus === "testing" && "Pinging church backend server health endpoint..."}
            {healthStatus === "online" &&
              `Server is responding normally! Latency: ${healthLatency}ms. Try refreshing the page now.`}
            {healthStatus === "degraded" &&
              "Server responded with degraded readiness. System maintenance may be underway."}
            {healthStatus === "unreachable" &&
              "Unable to reach server API endpoint. Please check your network or try again in a few moments."}
          </div>
        )}

        {/* Helpful Emergency Pastoral Care & Navigation Links */}
        <div className="grid gap-4 text-left sm:grid-cols-2">
          {/* Card 1: Pastoral Care Hotline */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-gold-500/40">
            <div className="mb-2.5 flex items-center gap-2 text-gold-500">
              <PhoneCall className="size-5 shrink-0" />
              <h3 className="font-display text-sm font-bold tracking-tight text-foreground">
                Pastoral Care Hotline
              </h3>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              If you require urgent prayer or spiritual counseling while the site is being restored, our
              ministers are available.
            </p>
            <a
              href={`tel:${siteConfig.contact.phones[1]?.number ?? siteConfig.contact.phones[0].number}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
            >
              Call {siteConfig.contact.phones[1]?.display ?? siteConfig.contact.phones[0].display}
            </a>
          </div>

          {/* Card 2: Find Local Sanctuary */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-gold-500/40">
            <div className="mb-2.5 flex items-center gap-2 text-gold-500">
              <MapPin className="size-5 shrink-0" />
              <h3 className="font-display text-sm font-bold tracking-tight text-foreground">
                Find a Local House of Prayer
              </h3>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Locate your nearest ESOCS CMC, Provincial Headquarters, or local Branch across the worldwide
              Order.
            </p>
            <Link
              href={routes.find()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
            >
              Explore directory <Compass className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Technical Diagnostics Accordion */}
        <div className="mt-8 border-t border-border/60 pt-6">
          <button
            type="button"
            onClick={() => setShowDiagnostics((prev) => !prev)}
            className="mx-auto flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors select-none hover:text-foreground"
          >
            <span>Technical diagnostic details</span>
            {showDiagnostics ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>

          {showDiagnostics && (
            <div className="mt-4 rounded-xl border border-border/80 bg-surface-muted/90 p-4 text-left font-mono text-xs text-muted-foreground shadow-inner">
              <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-2">
                <span className="font-semibold text-foreground">Diagnostic Log</span>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={
                    copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />
                  }
                  onClick={copyDiagnosticReport}
                >
                  {copied ? "Copied" : "Copy report"}
                </Button>
              </div>

              <div className="grid gap-1.5 overflow-x-auto text-[11px] leading-relaxed">
                <p>
                  <strong className="text-foreground">Error Name:</strong> {error?.name || "Error"}
                </p>
                <p>
                  <strong className="text-foreground">Message:</strong>{" "}
                  {error?.message || "An unexpected error occurred."}
                </p>
                {error?.digest && (
                  <p>
                    <strong className="text-foreground">Digest Code:</strong>{" "}
                    <code className="rounded bg-surface px-1.5 py-0.5 text-accent">{error.digest}</code>
                  </p>
                )}
                <p>
                  <strong className="text-foreground">Time:</strong> {new Date().toUTCString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
