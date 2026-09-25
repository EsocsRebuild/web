import { Bricolage_Grotesque, DM_Sans, Instrument_Serif } from "next/font/google";

/** Headlines: a characterful grotesk whose optical sizes sharpen as type grows. */
export const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});

/** Elegant accent: key words in headlines, the wordmark, scripture and quotes. */
export const fontSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

/** Body copy and interface text. Optical sizing keeps small labels crisp. */
export const fontSans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const fontVariables = `${fontDisplay.variable} ${fontSerif.variable} ${fontSans.variable}`;
