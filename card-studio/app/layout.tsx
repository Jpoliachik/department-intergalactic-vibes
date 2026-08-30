import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// The card's wisdom passage is set in an ornate serif. Exposed as a CSS var so
// only the card face uses it; the studio chrome stays on the UI sans.
const cardSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-card-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vibe Corp Card Studio",
  description:
    "View and iterate on the Vibe Corp field-specialty deck.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${cardSerif.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
