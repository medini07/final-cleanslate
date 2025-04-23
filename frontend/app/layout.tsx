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
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white shadow-sm py-4">
          <div className="container mx-auto px-4 md:px-6">
            <nav className="flex justify-between items-center">
              <div className="font-bold text-xl text-primary">Cleanslate</div>
              <div className="flex space-x-4">
                <a href="/" className="text-gray-600 hover:text-primary">Home</a>
                <a href="#about" className="text-gray-600 hover:text-primary">About</a>
                <a href="#contact" className="text-gray-600 hover:text-primary">Contact</a>
              </div>
            </nav>
          </div>
        </header>
        
        {children}
      </body>
    </html>
  );
}
