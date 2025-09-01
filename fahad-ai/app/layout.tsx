import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Fahad AI - Realtime Voice Assistant",
  description: "A realtime voice-first assistant powered by Muhammad Fahad Imdad's knowledge",
  keywords: ["AI", "voice assistant", "realtime", "Fahad Imdad"],
  authors: [{ name: "Muhammad Fahad Imdad" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans h-full antialiased bg-black text-white overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
