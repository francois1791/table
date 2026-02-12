import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/lib/theme";
import { LanguageProvider } from "@/lib/language";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Menu Analytics | Fine Dining Intelligence",
  description: "Premium culinary analytics platform for Michelin-starred gastronomy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}>
        <ThemeProvider>
          <LanguageProvider>
            <div className="relative flex min-h-screen flex-col">
              <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-violet/10 via-background to-background pointer-events-none dark:block hidden" />
              <Header />
              <main className="flex-1 relative z-10">
                {children}
              </main>
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
