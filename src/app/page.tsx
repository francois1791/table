"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Award, Filter } from "lucide-react";
import ingredientsDataRaw from "@/data/ingredients.json";
import { CategoryFilter, StarFilter, Ingredient } from "@/lib/types";

const ingredientsData = ingredientsDataRaw as Ingredient[];

const categories = [
  { key: "viande", label: "Viandes", emoji: "🥩", color: "from-red-500 to-rose-600" },
  { key: "poisson", label: "Poissons", emoji: "🐟", color: "from-cyan-500 to-blue-500" },
  { key: "crustace", label: "Crustacés", emoji: "🦐", color: "from-pink-500 to-rose-500" },
  { key: "coquillage", label: "Coquillages", emoji: "🦪", color: "from-teal-500 to-cyan-500" },
  { key: "champignon", label: "Champignons", emoji: "🍄", color: "from-amber-500 to-orange-500" },
  { key: "legume", label: "Légumes", emoji: "🥬", color: "from-green-500 to-emerald-500" },
  { key: "fruit", label: "Fruits", emoji: "🍎", color: "from-purple-500 to-violet-500" },
  { key: "feculent", label: "Féculents", emoji: "🍚", color: "from-stone-400 to-stone-500" },
] as const;

const stars = [
  { value: "all" as StarFilter, label: "Toutes", stars: "⭐" },
  { value: "3 étoiles" as StarFilter, label: "3★", stars: "⭐⭐⭐" },
  { value: "2 étoiles" as StarFilter, label: "2★", stars: "⭐⭐" },
  { value: "1 étoile" as StarFilter, label: "1★", stars: "⭐" },
];

export default function OverviewPage() {
  const [starFilter, setStarFilter] = useState<StarFilter>("all");

  // Filtrer les ingrédients selon l'étoile
  const filteredIngredients = useMemo(() => {
    return ingredientsData.filter((ing) => {
      if (starFilter === "all") return true;
      return ing.by_stars && ing.by_stars[starFilter] > 0;
    });
  }, [starFilter]);

  // Grouper par catégorie
  const byCategory = useMemo(() => {
    const grouped: Record<string, Ingredient[]> = {};
    categories.forEach((cat) => {
      grouped[cat.key] = filteredIngredients
        .filter((ing) => ing.category === cat.key)
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10); // Top 10 par catégorie
    });
    return grouped;
  }, [filteredIngredients]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent-soft flex items-center justify-center">
            <Award className="w-5 h-5 text-accent-violet" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Ingredient Share</h1>
            <p className="text-xs text-muted-foreground">
              Classement par catégorie • {starFilter !== "all" && starFilter}
            </p>
          </div>
        </div>

        {/* Star Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {stars.map((star) => (
              <button
                key={star.value}
                onClick={() => setStarFilter(star.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  starFilter === star.value
                    ? "bg-gradient-accent text-white border-transparent"
                    : "bg-surface text-muted-foreground border-border hover:border-border-strong"
                }`}
              >
                <span className="mr-1">{star.stars}</span>
                {star.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((cat, idx) => {
          const items = byCategory[cat.key] || [];
          if (items.length === 0) return null;

          const maxFreq = Math.max(...items.map((i) => i.frequency), 1);

          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass rounded-2xl p-5"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl`}>
                  {cat.emoji}
                </div>
                <div>
                  <h2 className="font-semibold">{cat.label}</h2>
                  <p className="text-xs text-muted-foreground">{items.length} ingrédients</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {items.map((ing, rank) => (
                  <a
                    key={ing.id}
                    href={`/ingredients/${ing.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors group"
                  >
                    <span className="w-6 text-center text-sm font-mono text-muted-foreground">
                      {rank + 1}
                    </span>
                    <span className="text-lg">{ing.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize truncate group-hover:text-accent-violet transition-colors">
                          {ing.name}
                        </span>
                        <span className="text-sm font-mono ml-2">{ing.frequency}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-surface rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full bg-gradient-to-r ${cat.color} rounded-full`}
                          style={{ width: `${(ing.frequency / maxFreq) * 100}%` }}
                        />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
