"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChefHat, Menu, X, BarChart3, UtensilsCrossed, Sun, Moon } from "lucide-react";
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
    { href: "/", label: t("nav.overview"), icon: BarChart3 },
    { href: "/ingredients", label: t("nav.ingredients"), icon: UtensilsCrossed },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border glass-strong">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-accent opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight">
              Menu<span className="gradient-text">Analytics</span>
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              {t("nav.fine_dining")}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-surface-hover rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right side: Theme + Language */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-muted-foreground hover:text-foreground"
            title={theme === "dark" ? "Mode clair" : "Mode sombre"}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
            className="px-3 py-1.5 rounded-lg hover:bg-surface-hover transition-colors text-sm font-medium text-muted-foreground hover:text-foreground border border-border"
            title={language === "fr" ? "Switch to English" : "Passer en français"}
          >
            {language === "fr" ? "EN" : "FR"}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-border glass-strong"
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3",
                    isActive
                      ? "bg-gradient-accent-soft text-foreground border border-accent-violet/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* Mobile Theme & Language */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-surface-hover flex items-center justify-center gap-2"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === "dark" ? "Mode clair" : "Mode sombre"}
              </button>
              <button
                onClick={() => {
                  setLanguage(language === "fr" ? "en" : "fr");
                  setMobileMenuOpen(false);
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-surface-hover font-medium"
              >
                {language === "fr" ? "English" : "Français"}
              </button>
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  );
}
