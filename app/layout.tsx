import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-barlow",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IDEA StatiCa Term Trainer",
  description: "Learn structural engineering terminology with flashcards and quizzes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${barlowCondensed.variable} ${inter.variable} bg-[#1A1A1A] text-[#F0F0F0] min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
