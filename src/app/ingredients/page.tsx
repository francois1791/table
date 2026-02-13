"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, ArrowRight, Grid3X3, List } from "lucide-react";
import ingredientsDataRaw from "@/data/ingredients.json";
import { Ingredient, CategoryFilter } from "@/lib/types";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

const ingredientsData = ingredientsDataRaw as Ingredient[];

const categoryDefs = [
  { value: "all" as CategoryFilter, key: "all", emoji: "🍽️", color: "from-accent-violet to-accent-blue" },
  { value: "viande" as CategoryFilter, key: "viande", emoji: "🥩", color: "from-red-500 to-rose-600" },
  { value: "poisson" as CategoryFilter, key: "poisson", emoji: "🐟", color: "from-cyan-500 to-blue-500" },
  { value: "crustace" as CategoryFilter, key: "crustace", emoji: "🦐", color: "from-pink-500 to-rose-500" },
  { value: "coquillage" as CategoryFilter, key: "coquillage", emoji: "🦪", color: "from-teal-500 to-cyan-500" },
  { value: "legume" as CategoryFilter, key: "legume", emoji: "🥬", color: "from-green-500 to-emerald-500" },
  { value: "fruit" as CategoryFilter, key: "fruit", emoji: "🍎", color: "from-purple-500 to-violet-500" },
  { value: "champignon" as CategoryFilter, key: "champignon", emoji: "🍄", color: "from-amber-500 to-orange-500" },
  { value: "fruit_sec" as CategoryFilter, key: "fruit_sec", emoji: "🥜", color: "from-yellow-600 to-amber-700" },
  { value: "epice" as CategoryFilter, key: "epice", emoji: "🌶️", color: "from-red-600 to-red-700" },
  { value: "herbe" as CategoryFilter, key: "herbe", emoji: "🌿", color: "from-green-600 to-emerald-600" },
  { value: "produit_laitier" as CategoryFilter, key: "produit_laitier", emoji: "🧀", color: "from-yellow-400 to-amber-500" },
  { value: "cereale" as CategoryFilter, key: "cereale", emoji: "🌾", color: "from-amber-600 to-yellow-700" },
  { value: "condiment" as CategoryFilter, key: "condiment", emoji: "🧂", color: "from-gray-500 to-gray-600" },
];

export default function IngredientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { t } = useLanguage();

  const categories = useMemo(() => 
    categoryDefs.map(c => ({ ...c, label: t(`cat.${c.key}`) })),
    [t]
  );

  const filteredIngredients = useMemo(() => {
    return ingredientsData.filter((ing) => {
      const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || ing.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  const getCategoryGradient = (category: string) => {
    const cat = categoryDefs.find((c) => c.value === category);
    return cat?.color || "from-accent-violet to-accent-blue";
  };

  const getCategoryEmoji = (category: string) => {
    const cat = categoryDefs.find((c) => c.value === category);
    return cat?.emoji || "🍽️";
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {t("ingredients.title")} <span className="gradient-text">{t("ingredients.title_accent")}</span>
          </h1>
          <p className="text-muted-foreground">
            {t("ingredients.subtitle", { count: ingredientsData.length })}
          </p>
        </div>

        {/* Filters Bar */}
        <div className="glass rounded-2xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("ingredients.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent-violet/50 transition-all"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-surface rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "grid" ? "bg-surface-hover text-foreground" : "text-muted-foreground"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "list" ? "bg-surface-hover text-foreground" : "text-muted-foreground"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5",
                  categoryFilter === cat.value
                    ? `bg-gradient-to-r ${cat.color} text-white border-transparent`
                    : "bg-surface text-muted-foreground border-border hover:border-border-strong"
                )}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t("ingredients.showing")} <span className="text-foreground font-medium">{filteredIngredients.length}</span> {t("ingredients.results")}
        </span>
        <span className="text-xs text-muted-foreground">
          {t("ingredients.sorted_by")}
        </span>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredIngredients.map((ingredient, index) => (
            <Link key={ingredient.id} href={`/ingredients/${ingredient.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="group glass rounded-2xl p-5 card-hover cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl shadow-lg",
                      getCategoryGradient(ingredient.category)
                    )}
                  >
                    {ingredient.emoji || getCategoryEmoji(ingredient.category)}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono">{ingredient.frequency}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{t("ingredients.mentions")}</div>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mb-1 capitalize group-hover:text-accent-violet transition-colors">
                  {ingredient.name}
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                  {t(`cat.${ingredient.category}`)}
                </p>

                {/* Star distribution preview */}
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  {ingredient.star_percentages?.["3 étoiles"] > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                      ⭐⭐⭐ {ingredient.star_percentages["3 étoiles"]}%
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="glass rounded-2xl overflow-hidden divide-y divide-border">
          {filteredIngredients.map((ingredient, index) => (
            <Link key={ingredient.id} href={`/ingredients/${ingredient.id}`}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.01 }}
                className="group flex items-center gap-4 p-4 hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <div className="w-8 text-center text-sm font-mono text-muted-foreground">
                  {index + 1}
                </div>
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-lg",
                    getCategoryGradient(ingredient.category)
                  )}
                >
                  {ingredient.emoji || getCategoryEmoji(ingredient.category)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium capitalize group-hover:text-accent-violet transition-colors">
                    {ingredient.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{t(`cat.${ingredient.category}`)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2">
                    {ingredient.star_percentages?.["3 étoiles"] > 0 && (
                      <span className="text-xs text-yellow-400">⭐⭐⭐ {ingredient.star_percentages["3 étoiles"]}%</span>
                    )}
                  </div>
                  <div className="text-right w-16">
                    <div className="font-bold font-mono">{ingredient.frequency}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      {filteredIngredients.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">{t("ingredients.no_results")}</h3>
          <p className="text-muted-foreground">{t("ingredients.no_results_hint")}</p>
        </div>
      )}
    </div>
  );
}
