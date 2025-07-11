import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/template/header";

import { ThemeProvider } from "@/components/darkmode/theme-provider";

export const metadata: Metadata = {
  title: "Central Contact Plus",
  description: "A modern contact management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {/* Add padding top to offset fixed header height (e.g., 64px = 16*4) */}
          <main className="flex-1 pt-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
