import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import { authClient } from "@/lib/auth/client";
import { ThemeProvider } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multi-Agent DataOps",
  description: "AI-powered data pipeline automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <NeonAuthUIProvider
            authClient={authClient}
            social={{ providers: ["google"] }}
          >
            {children}
          </NeonAuthUIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
