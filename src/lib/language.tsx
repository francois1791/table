"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    "nav.overview": "Vue d'ensemble",
    "nav.ingredients": "Ingrédients",
    "nav.fine_dining": "Intelligence Gastronomique",
    
    // Header stats
    "stats.restaurants": "Restaurants",
    "stats.dishes": "Plats",
    "stats.ingredients": "Ingrédients",
    
    // Filters
    "filter.all": "Toutes",
    "filter.stars": "étoiles",
    "filter.star": "étoile",
    
    // Categories
    "cat.viande": "Viandes",
    "cat.poisson": "Poissons",
    "cat.crustace": "Crustacés",
    "cat.coquillage": "Coquillages",
    "cat.champignon": "Champignons",
    "cat.legume": "Légumes",
    "cat.fruit": "Fruits",
    "cat.fruit_sec": "Fruits secs",
    
    // Overview page
    "overview.title": "Menu Analytics",
    "overview.subtitle": "{ingredients} ingrédients • {occurrences} occurrences",
    "overview.distribution": "Répartition par catégorie",
    "overview.percent_of_total": "% du total",
    
    // Dish suggestions
    "dishes.with": "Plats avec",
    "dishes.suggested": "Suggestions de plats",
    "dishes.similar": "Plats similaires",
    "dishes.no_dishes": "Aucun plat trouvé",
    
    // Common
    "common.loading": "Chargement...",
    "common.back": "Retour",
    "common.search": "Rechercher",
    "common.frequency": "Fréquence",
    "common.restaurants": "restaurants",
  },
  en: {
    // Navigation
    "nav.overview": "Overview",
    "nav.ingredients": "Ingredients",
    "nav.fine_dining": "Fine Dining Intelligence",
    
    // Header stats
    "stats.restaurants": "Restaurants",
    "stats.dishes": "Dishes",
    "stats.ingredients": "Ingredients",
    
    // Filters
    "filter.all": "All",
    "filter.stars": "stars",
    "filter.star": "star",
    
    // Categories
    "cat.viande": "Meats",
    "cat.poisson": "Fish",
    "cat.crustace": "Crustaceans",
    "cat.coquillage": "Shellfish",
    "cat.champignon": "Mushrooms",
    "cat.legume": "Vegetables",
    "cat.fruit": "Fruits",
    "cat.fruit_sec": "Dried Fruits",
    
    // Overview page
    "overview.title": "Menu Analytics",
    "overview.subtitle": "{ingredients} ingredients • {occurrences} occurrences",
    "overview.distribution": "Distribution by category",
    "overview.percent_of_total": "% of total",
    
    // Dish suggestions
    "dishes.with": "Dishes with",
    "dishes.suggested": "Suggested dishes",
    "dishes.similar": "Similar dishes",
    "dishes.no_dishes": "No dishes found",
    
    // Common
    "common.loading": "Loading...",
    "common.back": "Back",
    "common.search": "Search",
    "common.frequency": "Frequency",
    "common.restaurants": "restaurants",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "fr" || saved === "en")) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language][key as keyof typeof translations.fr] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
