import localFont from "next/font/local";

export const alexandria = localFont({
  src: "./fonts/Alexandria-Variable.ttf",
  variable: "--font-alexandria",
  display: "swap",
  weight: "300 900",
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
