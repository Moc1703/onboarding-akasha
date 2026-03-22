import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Akasha Yoga Academy — Intern Onboarding",
  description: "Welcome aboard! Your onboarding dashboard for Akasha Yoga Academy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`min-h-screen ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
