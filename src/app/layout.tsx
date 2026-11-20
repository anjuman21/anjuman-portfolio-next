import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "../styles/tokens.css";
import "./globals.css";

// Variable font: weights 200–900, normal + italic (Accent Italic styles use Light Italic).
const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anjuman Sharear — UI/UX Designer",
  description: "UI/UX designer turning ideas into calm, token-driven products.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" className={monaSans.variable}>
      <body>{children}</body>
    </html>
  );
}
