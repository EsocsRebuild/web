import { SplashController } from "./splash-controller";

/**
 * Opening loader: the crest settles in the centre as a gold ring draws around it,
 * the wordmark rises, then the screen opens onto the site. Pure CSS, so it shows
 * on the first paint before any JavaScript. It plays on every full page load
 * (opening or refreshing the site) and never on in-app navigation, because the
 * root layout does not re-render between pages.
 */
export function AppSplash() {
  return (
    <div
      className="app-splash"
      role="status"
      aria-label="Loading The Eternal Sacred Order of the Cherubim and Seraphim"
    >
      <div className="app-splash__stage">
        <div className="app-splash__mark">
          <span aria-hidden className="app-splash__glow" />
          <svg aria-hidden className="app-splash__ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="56" pathLength="1" />
          </svg>
          {/* A plain <img>: the splash must not wait for the image optimiser. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="app-splash__crest"
            src="/brand/esocs-crest-192.webp"
            alt=""
            width={96}
            height={96}
          />
        </div>
        <div aria-hidden className="app-splash__word max-w-sm px-4 text-center">
          <span className="app-splash__word-main text-xs font-bold tracking-wider text-white uppercase sm:text-sm">
            The Eternal Sacred Order of the Cherubim and Seraphim
          </span>
          <span className="app-splash__word-accent font-serif text-sm text-gold-300 italic sm:text-base">
            Mount Zion Worldwide
          </span>
        </div>
        <span aria-hidden className="app-splash__line" />
      </div>
      <SplashController />
    </div>
  );
}
