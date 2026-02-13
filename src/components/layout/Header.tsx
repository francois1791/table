"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { useLanguage } from "@/lib/language";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { href: "/", label: t("nav.overview") },
    { href: "/ingredients", label: t("nav.ingredients") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-surface">
      <div className="flex items-stretch">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 px-6 py-4 border-r-2 border-border hover:bg-accent transition-colors"
        >
          <span className="font-serif text-2xl italic">CARTE</span>
          <span className="font-mono text-xs tracking-wider bg-primary text-surface px-2 py-1">BRUTE</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-stretch">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-6 py-4 border-r-2 border-border font-mono text-sm uppercase tracking-wider transition-colors",
                  isActive
                    ? "bg-primary text-surface"
                    : "hover:bg-accent"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Controls */}
        <div className="hidden md:flex items-stretch">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center px-4 py-4 border-l-2 border-border hover:bg-accent transition-colors"
            title={theme === "dark" ? "LIGHT" : "DARK"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
            className={cn(
              "flex items-center px-4 py-4 border-l-2 border-border font-mono text-sm font-bold tracking-wider transition-colors",
              language === "fr" ? "bg-primary text-surface" : "hover:bg-accent"
            )}
          >
            FR
          </button>
          <button
            onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
            className={cn(
              "flex items-center px-4 py-4 border-l-2 border-border font-mono text-sm font-bold tracking-wider transition-colors",
              language === "en" ? "bg-primary text-surface" : "hover:bg-accent"
            )}
          >
            EN
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center px-6 py-4 border-l-2 border-border hover:bg-accent transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-border bg-surface">
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-6 py-4 border-b-2 border-border font-mono text-sm uppercase tracking-wider transition-colors",
                    isActive
                      ? "bg-primary text-surface"
                      : "hover:bg-accent"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            
            {/* Mobile Controls */}
            <div className="flex">
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-r-2 border-border font-mono text-sm uppercase hover:bg-accent transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === "dark" ? "LIGHT" : "DARK"}
              </button>
              <button
                onClick={() => {
                  setLanguage(language === "fr" ? "en" : "fr");
                  setMobileMenuOpen(false);
                }}
                className="flex-1 px-4 py-4 font-mono text-sm uppercase hover:bg-accent transition-colors"
              >
                {language === "fr" ? "ENGLISH" : "FRANÇAIS"}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
