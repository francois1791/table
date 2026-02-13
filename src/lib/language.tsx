"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, Record<string, string>> = {
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
    "cat.all": "Toutes",
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
    "overview.percent_of_total": "du total",
    
    // Ingredients page
    "ingredients.title": "Répertoire",
    "ingredients.title_accent": "d'Ingrédients",
    "ingredients.subtitle": "Parcourez et analysez {count} ingrédients issus de menus gastronomiques",
    "ingredients.search": "Rechercher un ingrédient...",
    "ingredients.showing": "Affichage de",
    "ingredients.results": "ingrédients",
    "ingredients.sorted_by": "Triés par popularité",
    "ingredients.mentions": "mentions",
    "ingredients.no_results": "Aucun ingrédient trouvé",
    "ingredients.no_results_hint": "Essayez de modifier vos filtres",
    
    // Ingredient detail page
    "detail.back": "Retour à la vue d'ensemble",
    "detail.total_occurrences": "Occurrences totales",
    "detail.global_share": "Part globale",
    "detail.restaurants": "Restaurants",
    "detail.in_3star": "Dans les 3★",
    "detail.star_distribution": "Répartition par étoiles Michelin",
    "detail.occurrences": "occurrences",
    "detail.similar": "Ingrédients similaires",
    "detail.dishes_with": "Plats avec {name}",
    "detail.found": "trouvés",
    "detail.no_dishes": "Aucun plat trouvé avec cet ingrédient.",
    "detail.no_dishes_hint": "Les données d'extraction sont peut-être incomplètes.",
    "detail.show_less": "Voir moins",
    "detail.show_more": "Voir {count} plats de plus",
    "detail.not_found": "Ingrédient introuvable",
    "detail.not_found_hint": "L'ingrédient demandé n'a pas été trouvé.",
    
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
    "cat.all": "All",
    "cat.viande": "Meats",
    "cat.poisson": "Fish",
    "cat.crustace": "Crustaceans",
    "cat.coquillage": "Shellfish",
    "cat.champignon": "Mushrooms",
    "cat.legume": "Vegetables",
    "cat.fruit": "Fruits",
    "cat.fruit_sec": "Dried Fruits & Nuts",
    
    // Overview page
    "overview.title": "Menu Analytics",
    "overview.subtitle": "{ingredients} ingredients • {occurrences} occurrences",
    "overview.distribution": "Distribution by category",
    "overview.percent_of_total": "of total",
    
    // Ingredients page
    "ingredients.title": "Ingredient",
    "ingredients.title_accent": "Directory",
    "ingredients.subtitle": "Browse and analyze {count} ingredients from fine dining menus",
    "ingredients.search": "Search ingredients...",
    "ingredients.showing": "Showing",
    "ingredients.results": "ingredients",
    "ingredients.sorted_by": "Sorted by popularity",
    "ingredients.mentions": "mentions",
    "ingredients.no_results": "No ingredients found",
    "ingredients.no_results_hint": "Try adjusting your filters",
    
    // Ingredient detail page
    "detail.back": "Back to overview",
    "detail.total_occurrences": "Total Occurrences",
    "detail.global_share": "Global Share",
    "detail.restaurants": "Restaurants",
    "detail.in_3star": "In 3★ Restaurants",
    "detail.star_distribution": "Distribution by Michelin Stars",
    "detail.occurrences": "occurrences",
    "detail.similar": "Similar Ingredients",
    "detail.dishes_with": "Dishes with {name}",
    "detail.found": "found",
    "detail.no_dishes": "No dishes found with this ingredient.",
    "detail.no_dishes_hint": "This may be due to incomplete data extraction.",
    "detail.show_less": "Show less",
    "detail.show_more": "Show {count} more dishes",
    "detail.not_found": "Ingredient not found",
    "detail.not_found_hint": "The requested ingredient could not be found.",
    
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
    let text = translations[language][key] || key;
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
