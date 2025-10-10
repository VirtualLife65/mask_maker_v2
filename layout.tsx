import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Audio Chord Analyzer - Professional Music Analysis",
  description: "AI-powered audio chord analyzer with real stem separation using Demucs and Librosa. Extract chords, separate stems, and convert to MIDI.",
  keywords: ["AI", "audio", "chord", "analyzer", "stem separation", "Demucs", "Librosa", "music", "MIDI"],
  authors: [{ name: "AI Audio Chord Analyzer Team" }],
  openGraph: {
    title: "AI Audio Chord Analyzer",
    description: "Professional AI-powered music analysis with real stem separation",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Audio Chord Analyzer",
    description: "Professional AI-powered music analysis with real stem separation",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}