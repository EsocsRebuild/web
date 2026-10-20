"use client";

import * as React from "react";
import { Activity, Sparkles, X, ChevronUp } from "lucide-react";

interface Ripple {
  id: number;
  x: number;
  y: number;
  color?: string;
}

interface Spark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface TelemetryState {
  clicks: number;
  scrollY: number;
  scrollPercent: number;
  scrollDirection: "down" | "up" | "idle";
  scrollVelocity: number;
  activeSection: string;
  sessionSeconds: number;
}

/**
 * InteractionMonitor:
 * 1. Monitors user actions (clicks, scroll depth, scroll velocity, active section).
 * 2. Visual Effects Engine:
 *    - Celestial gold pulse & sparks on click/tap
 *    - Ambient cursor spotlight on desktop
 *    - Top-edge golden scroll progress filament
 * 3. Live Action Telemetry HUD (toggleable via UI button or Ctrl+Shift+M / Cmd+Shift+M).
 */
export function InteractionMonitor() {
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const [sparks, setSparks] = React.useState<Spark[]>([]);
  const [hudOpen, setHudOpen] = React.useState(false);
  const [effectsEnabled, setEffectsEnabled] = React.useState(true);
  const [cursorPos, setCursorPos] = React.useState<{ x: number; y: number } | null>(null);

  const [telemetry, setTelemetry] = React.useState<TelemetryState>({
    clicks: 0,
    scrollY: 0,
    scrollPercent: 0,
    scrollDirection: "idle",
    scrollVelocity: 0,
    activeSection: "Top of Page",
    sessionSeconds: 0,
  });

  const lastScrollYRef = React.useRef(0);
  const lastScrollTimeRef = React.useRef(0);
  const rippleIdRef = React.useRef(0);
  const sparkIdRef = React.useRef(0);

  // Session duration timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({ ...prev, sessionSeconds: prev.sessionSeconds + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut Ctrl+Shift+M or Cmd+Shift+M to toggle HUD
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setHudOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click & Tap Action Monitor + Celestial Golden Ripple Effect
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      setTelemetry((prev) => ({ ...prev, clicks: prev.clicks + 1 }));

      if (!effectsEnabled) return;

      const rippleId = ++rippleIdRef.current;
      setRipples((prev) => [...prev.slice(-4), { id: rippleId, x: e.clientX, y: e.clientY }]);

      // Generate 4 micro celestial golden sparks
      const newSparks: Spark[] = Array.from({ length: 4 }).map(() => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 24 + 10;
        return {
          id: ++sparkIdRef.current,
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        };
      });

      setSparks((prev) => [...prev.slice(-8), ...newSparks]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 700);

      setTimeout(() => {
        setSparks((prev) => prev.filter((s) => !newSparks.some((ns) => ns.id === s.id)));
      }, 600);
    };

    window.addEventListener("click", handleClick, { passive: true });
    return () => window.removeEventListener("click", handleClick);
  }, [effectsEnabled]);

  // Scroll Action & Telemetry Monitor
  React.useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const now = Date.now();
        const lastTime = lastScrollTimeRef.current || now;
        const dt = Math.max(1, now - lastTime);
        const dy = currentY - lastScrollYRef.current;
        const velocity = Math.abs(Math.round((dy / dt) * 1000)); // px/sec

        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const percent = Math.min(100, Math.max(0, Math.round((currentY / maxScroll) * 100)));
        const direction = dy > 0 ? "down" : dy < 0 ? "up" : "idle";

        // Update root CSS variables for dynamic CSS binding
        document.documentElement.style.setProperty("--scroll-progress", `${percent}%`);
        document.documentElement.style.setProperty("--scroll-velocity", `${velocity}`);
        document.documentElement.style.setProperty("--scroll-y", `${currentY}px`);

        setTelemetry((prev) => ({
          ...prev,
          scrollY: currentY,
          scrollPercent: percent,
          scrollDirection: direction,
          scrollVelocity: velocity,
        }));

        lastScrollYRef.current = currentY;
        lastScrollTimeRef.current = now;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section Observer to detect current active viewport section
  React.useEffect(() => {
    const sections = document.querySelectorAll("section[id], main > section, section[aria-labelledby]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const heading = entry.target.querySelector("h1, h2, h3")?.textContent?.trim();
            const id = entry.target.getAttribute("id");
            const label = heading || (id ? `#${id}` : "Sanctuary View");
            setTelemetry((prev) => ({ ...prev, activeSection: label }));
            break;
          }
        }
      },
      { threshold: 0.25 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Mouse Movement Spotlight Monitor (Desktop pointer)
  React.useEffect(() => {
    if (!effectsEnabled) return;

    const handlePointerMove = (e: PointerEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [effectsEnabled]);

  return (
    <>
      {/* 1. Top-edge Golden Scroll Progress Filament */}
      {effectsEnabled && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-9990 h-[2.5px] bg-transparent"
        >
          <div
            className="h-full bg-linear-to-r from-amber-500 via-amber-300 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.8)] transition-[width] duration-150 ease-out"
            style={{ width: `${telemetry.scrollPercent}%` }}
          />
        </div>
      )}

      {/* 2. Celestial Gold Click Ripples */}
      {effectsEnabled && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-9998 overflow-hidden">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 animate-[celestialRipple_0.65s_cubic-bezier(0.16,1,0.3,1)_forwards] rounded-full border border-amber-400/80 bg-[radial-gradient(circle,rgba(254,240,138,0.7)_0%,rgba(245,158,11,0.35)_40%,transparent_70%)]"
              style={{
                left: `${ripple.x}px`,
                top: `${ripple.y}px`,
                width: "90px",
                height: "90px",
              }}
            />
          ))}

          {/* Spark Particles */}
          {sparks.map((spark) => (
            <span
              key={spark.id}
              className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 animate-[sparkFade_0.55s_ease-out_forwards] rounded-full bg-amber-300 shadow-[0_0_6px_#fde047]"
              style={
                {
                  left: `${spark.x}px`,
                  top: `${spark.y}px`,
                  "--tx": `${spark.vx}px`,
                  "--ty": `${spark.vy}px`,
                } as React.CSSProperties
              }
            />
          ))}

          {/* Desktop Ambient Cursor Spotlight */}
          {cursorPos && (
            <div
              className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.035)_0%,transparent_70%)] blur-2xl transition-opacity duration-300"
              style={{
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
                width: "450px",
                height: "450px",
              }}
            />
          )}
        </div>
      )}

      {/* 3. Live Action Monitor & Telemetry Pill / HUD */}
      <div className="fixed bottom-4 left-4 z-9997 hidden font-sans text-xs select-none md:block">
        {!hudOpen ? (
          <button
            type="button"
            onClick={() => setHudOpen(true)}
            title="Open Action Monitor & Telemetry (Ctrl+Shift+M)"
            className="group flex items-center gap-2 rounded-full border border-amber-500/30 bg-slate-950/80 px-3 py-1.5 text-slate-300 shadow-lg backdrop-blur-md transition-all hover:border-amber-400 hover:bg-slate-900 hover:text-white"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <Activity className="size-3.5 text-amber-400" />
            <span className="font-mono text-[0.6875rem] font-medium tracking-wide">
              {telemetry.scrollPercent}% · {telemetry.clicks} clicks
            </span>
            <ChevronUp className="size-3 text-slate-500 transition-transform group-hover:-translate-y-px" />
          </button>
        ) : (
          <div className="w-80 rounded-xl border border-amber-500/40 bg-slate-950/95 p-3.5 text-slate-200 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-amber-400" />
                <span className="font-semibold tracking-wide text-white">Action Monitor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEffectsEnabled((prev) => !prev)}
                  title={effectsEnabled ? "Disable Visual FX" : "Enable Visual FX"}
                  className={`rounded px-1.5 py-0.5 text-[0.625rem] font-bold tracking-wider uppercase transition-colors ${
                    effectsEnabled
                      ? "border border-amber-500/40 bg-amber-500/20 text-amber-300"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  FX: {effectsEnabled ? "ON" : "OFF"}
                </button>
                <button
                  type="button"
                  onClick={() => setHudOpen(false)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[0.6875rem]">
              <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2">
                <span className="block text-[0.625rem] tracking-wider text-slate-400 uppercase">
                  Total Clicks
                </span>
                <span className="font-mono text-sm font-bold text-amber-300">{telemetry.clicks}</span>
              </div>

              <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2">
                <span className="block text-[0.625rem] tracking-wider text-slate-400 uppercase">
                  Scroll Depth
                </span>
                <span className="font-mono text-sm font-bold text-amber-300">
                  {telemetry.scrollPercent}%{" "}
                  <span className="text-xs font-normal text-slate-400">
                    (
                    {telemetry.scrollDirection === "down"
                      ? "↓"
                      : telemetry.scrollDirection === "up"
                        ? "↑"
                        : "–"}
                    )
                  </span>
                </span>
              </div>

              <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2">
                <span className="block text-[0.625rem] tracking-wider text-slate-400 uppercase">
                  Scroll Velocity
                </span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {telemetry.scrollVelocity}{" "}
                  <span className="text-[0.625rem] font-normal text-slate-400">px/s</span>
                </span>
              </div>

              <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2">
                <span className="block text-[0.625rem] tracking-wider text-slate-400 uppercase">
                  Session Time
                </span>
                <span className="font-mono text-sm font-bold text-slate-300">
                  {Math.floor(telemetry.sessionSeconds / 60)}m {telemetry.sessionSeconds % 60}s
                </span>
              </div>
            </div>

            {/* Current Active Section */}
            <div className="mt-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2">
              <span className="block text-[0.625rem] tracking-wider text-slate-400 uppercase">
                Active Section Focus
              </span>
              <span className="mt-0.5 block truncate text-xs font-medium text-white">
                {telemetry.activeSection}
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[0.625rem] text-slate-500">
              <span>Shortcut: Ctrl+Shift+M</span>
              <span className="flex items-center gap-1 text-amber-400/80">
                <Sparkles className="size-3" /> Celestial FX Live
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
