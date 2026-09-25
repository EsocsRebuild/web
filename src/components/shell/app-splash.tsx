import { SplashController } from "./splash-controller";

/**
 * Opening loader: the crest settles in the centre as a gold ring draws around it,
 * the wordmark rises, then the screen lifts away. Pure CSS, so it shows on the
 * first paint before any JavaScript; plays once per visit (see SPLASH_SCRIPT).
 */
export function AppSplash() {
  return (
    <div className="app-splash" role="status" aria-label="Loading The ESOCS Church">
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
        <p aria-hidden className="app-splash__word">
          <span className="app-splash__word-main">The ESOCS</span>
          <span className="app-splash__word-accent">Church</span>
        </p>
        <span aria-hidden className="app-splash__line" />
      </div>
      <SplashController />
    </div>
  );
}

/** Runs before first paint: skip the splash if it has already played in this visit. */
export const SPLASH_SCRIPT = `try{if(sessionStorage.getItem("esocs:splash")){document.documentElement.dataset.splash="seen"}}catch(e){}`;
