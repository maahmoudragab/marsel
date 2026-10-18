import localFont from "next/font/local";
import { Cairo } from "next/font/google";

export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const supreme = localFont({
  src: [
    {
      path: "./fonts/Supreme-Variable.woff2",
      style: "normal",
    },
    {
      path: "./fonts/Supreme-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-supreme",
  display: "swap",
});
