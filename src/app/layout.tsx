import type { Metadata } from "next";
import "./globals.css";

import Header from "@/app/components/template/header";
import { ThemeProvider } from "@/app/components/darkmode/theme-provider";

export const metadata: Metadata = {
  title: "Central Contact Plus",
  description: "A modern contact management system",
  themeColor: "#000000", // required for PWA
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Support */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1 pt-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
