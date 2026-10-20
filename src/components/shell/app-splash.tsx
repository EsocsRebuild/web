import { SplashController } from "./splash-controller";

/**
 * Cinematic Opening Splash:
 * - Sacred ESOCS Crest illuminated with celestial golden corona and dual animated halos.
 * - Atmospheric sanctuary background drifting slowly with Ken Burns depth.
 * - Official Holy Order typography with glowing gold foil script.
 * - Divine light rays and ethereal celestial particles.
 * - Interactive: plays the majestic 2.8s cinematic sequence, or dismisses instantly on tap/Esc.
 */
export function AppSplash() {
  return (
    <div
      className="app-splash"
      role="status"
      aria-label="Loading The Eternal Sacred Order of the Cherubim and Seraphim"
    >
      {/* Cinematic Sanctuary Atmosphere */}
      <div aria-hidden className="app-splash__bg" />
      <div aria-hidden className="app-splash__veil" />
      <div aria-hidden className="app-splash__light-beam" />

      {/* Ambient Celestial Gold Particles */}
      <div aria-hidden className="app-splash__particles">
        <span className="app-splash__particle p1" />
        <span className="app-splash__particle p2" />
        <span className="app-splash__particle p3" />
        <span className="app-splash__particle p4" />
        <span className="app-splash__particle p5" />
        <span className="app-splash__particle p6" />
      </div>

      <div className="app-splash__stage">
        {/* Sacred Official Crest with Dual Concentric Radiant Halos */}
        <div className="app-splash__mark">
          <span aria-hidden className="app-splash__glow" />
          <span aria-hidden className="app-splash__glow-secondary" />

          {/* Outer Star Cardinal Halo */}
          <svg aria-hidden className="app-splash__ring-outer" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="76"
              stroke="rgba(245, 158, 11, 0.28)"
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="4 6"
            />
            <circle cx="80" cy="4" r="2.5" fill="#fcd34d" />
            <circle cx="156" cy="80" r="2.5" fill="#fcd34d" />
            <circle cx="80" cy="156" r="2.5" fill="#fcd34d" />
            <circle cx="4" cy="80" r="2.5" fill="#fcd34d" />
          </svg>

          {/* Golden Animated Drawing Ring */}
          <svg aria-hidden className="app-splash__ring" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="66" pathLength="1" />
          </svg>

          {/* Sacred Crest with High-DPI Sharpness */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="app-splash__crest"
            src="/brand/esocs-crest.png"
            srcSet="/brand/esocs-crest-192.webp 1x, /brand/esocs-crest.png 2x"
            alt="The Official Crest of The Eternal Sacred Order of the Cherubim and Seraphim"
            width={124}
            height={124}
          />
        </div>

        {/* Sacred Order Typography */}
        <div aria-hidden className="app-splash__word max-w-lg px-4 text-center">
          <span className="app-splash__overline text-[0.6875rem] font-semibold tracking-[0.26em] text-amber-300/85 uppercase sm:text-xs">
            The Eternal Sacred Order of
          </span>
          <h1 className="app-splash__word-main mt-1 text-base font-extrabold tracking-[0.06em] text-white uppercase sm:text-xl md:text-2xl">
            Cherubim &amp; Seraphim
          </h1>
          <span className="app-splash__word-accent mt-0.5 font-serif text-lg text-gold-300 italic sm:text-2xl md:text-3xl">
            Mount Zion Worldwide
          </span>
          <span className="app-splash__motto mt-2 text-[0.625rem] font-medium tracking-[0.28em] text-white/50 uppercase sm:text-[0.6875rem]">
            One Fold · One Shepherd · Founded 1925
          </span>
        </div>

        {/* Luminous Golden Energy Line */}
        <div aria-hidden className="app-splash__line-wrapper">
          <span className="app-splash__line" />
        </div>
      </div>

      {/* Subtle Skip Hint */}
      <div aria-hidden className="app-splash__skip text-[0.6875rem] tracking-widest text-white/35 uppercase">
        Tap anywhere to enter
      </div>

      <SplashController />
    </div>
  );
}
