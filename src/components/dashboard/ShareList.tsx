"use client";

import { useMemo } from "react";
import { ShareBar } from "./ShareBar";
import { Ingredient, CategoryFilter, StarFilter } from "@/lib/types";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareListProps {
  ingredients: Ingredient[];
  searchQuery: string;
  categoryFilter: CategoryFilter;
  starFilter: StarFilter;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: CategoryFilter) => void;
  onStarChange: (star: StarFilter) => void;
}

const categories: { value: CategoryFilter; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "🍽️" },
  { value: "viande", label: "Meat", emoji: "🥩" },
  { value: "poisson", label: "Fish", emoji: "🐟" },
  { value: "crustace", label: "Shellfish", emoji: "🦐" },
  { value: "coquillage", label: "Shell", emoji: "🦪" },
  { value: "legume", label: "Vegetable", emoji: "🥬" },
  { value: "fruit", label: "Fruit", emoji: "🍎" },
  { value: "champignon", label: "Mushroom", emoji: "🍄" },
];

const stars: { value: StarFilter; label: string; stars: string }[] = [
  { value: "all", label: "All Stars", stars: "⭐" },
  { value: "1 étoile", label: "1 Star", stars: "⭐" },
  { value: "2 étoiles", label: "2 Stars", stars: "⭐⭐" },
  { value: "3 étoiles", label: "3 Stars", stars: "⭐⭐⭐" },
];

export function ShareList({
  ingredients,
  searchQuery,
  categoryFilter,
  starFilter,
  onSearchChange,
  onCategoryChange,
  onStarChange,
}: ShareListProps) {
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || ing.category === categoryFilter;
      const matchesStar = starFilter === "all" || (ing.by_stars && ing.by_stars[starFilter] > 0);
      return matchesSearch && matchesCategory && matchesStar;
    });
  }, [ingredients, searchQuery, categoryFilter, starFilter]);

  // Calculer le max selon le filtre étoile
  const maxFrequency = useMemo(() => {
    if (starFilter === "all") {
      return Math.max(...filteredIngredients.map((i) => i.frequency), 1);
    } else {
      return Math.max(...filteredIngredients.map((i) => i.by_stars?.[starFilter] || 0), 1);
    }
  }, [filteredIngredients, starFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass rounded-2xl p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/50 transition-all"
          />
        </div>

        {/* Star Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {stars.map((star) => (
              <button
                key={star.value}
                onClick={() => onStarChange(star.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  starFilter === star.value
                    ? "bg-gradient-accent text-white border-transparent"
                    : "bg-surface text-muted-foreground border-border hover:border-border-strong hover:text-foreground"
                )}
                title={star.label}
              >
                <span className="mr-1">{star.stars}</span>
                {star.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                categoryFilter === cat.value
                  ? "bg-accent-violet/20 text-accent-violet border-accent-violet/30"
                  : "bg-surface text-muted-foreground border-border hover:border-border-strong hover:text-foreground"
              )}
            >
              <span className="mr-1">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-muted-foreground">
          Showing <span className="text-foreground font-medium">{filteredIngredients.length}</span> ingredients
          {starFilter !== "all" && (
            <span className="ml-1 text-accent-violet">({starFilter})</span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          Sorted by frequency
        </span>
      </div>

      {/* List */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="divide-y divide-border">
          {filteredIngredients.slice(0, 20).map((ingredient, index) => (
            <ShareBar
              key={ingredient.id}
              ingredient={ingredient}
              maxFrequency={maxFrequency}
              rank={index + 1}
              starFilter={starFilter}
            />
          ))}
        </div>
        
        {filteredIngredients.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No ingredients found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
