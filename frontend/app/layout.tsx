import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cleanslate - Your Personalized Cessation Journey",
  description: "A personalized 8-week smoking cessation plan powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <header className="bg-white shadow-sm py-4">
          <div className="container mx-auto px-4 md:px-6">

          </div>
        </header>
        
        {children}
      </body>
    </html>
  );
}
