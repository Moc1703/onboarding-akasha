import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
