import { Archivo, DM_Sans } from "next/font/google";

/** Headlines. Variable weight and width, so display sizes can run heavy and expanded. */
export const fontDisplay = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/** Body copy and interface text. Optical sizing keeps small labels crisp. */
export const fontSans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const fontVariables = `${fontDisplay.variable} ${fontSans.variable}`;
