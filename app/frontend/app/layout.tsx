import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import { authClient } from "@/lib/auth/client";
import { ThemeProvider } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PRD2Post — Transform PRDs into Blog Posts with AI",
  description: "Transform your Product Requirements Documents into polished, publication-ready blog posts with an AI-powered multi-agent pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
      <NeonAuthUIProvider
            authClient={authClient}
            social={{ providers: ["google"] }}
          >
        <ThemeProvider>
            {children}
        </ThemeProvider>
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
