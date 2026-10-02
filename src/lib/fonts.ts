import { DM_Sans, Raleway, Roboto, Work_Sans } from "next/font/google";

/**
 * Headlines & display: Work Sans provides a clean, modern, architectural grotesque
 * that looks dignified, contemporary, and relatable for church media.
 */
export const fontDisplay = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

/**
 * Primary body copy & interface text: DM Sans offers a friendly, warm geometric-humanist
 * tone with optical sizing for exceptional readability across mobile and desktop.
 */
export const fontSans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-dm-sans",
  display: "swap",
});

/**
 * Modern elegant accent: Raleway brings sophisticated, geometric styling for scripture,
 * pull quotes, testimonials, and wordmark subtitles.
 */
export const fontAccent = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

/**
 * Secondary neutral sans: Roboto offers universally legible, balanced utility
 * for dates, tabular data, metadata chips, and form controls.
 */
export const fontRoboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

/* Aliases for backwards compatibility and explicit semantic imports */
export const fontSerif = fontAccent;
export const fontWorkSans = fontDisplay;
export const fontDMSans = fontSans;
export const fontRaleway = fontAccent;

export const fontVariables = `${fontSans.variable} ${fontDisplay.variable} ${fontAccent.variable} ${fontRoboto.variable}`;
