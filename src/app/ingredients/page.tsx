"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";
import ingredientsDataRaw from "@/data/ingredients.json";
import { Ingredient, CategoryFilter, TrendFilter } from "@/lib/types";

const ingredientsData = ingredientsDataRaw as Ingredient[];
import { cn } from "@/lib/utils";

const categories: { value: CategoryFilter; label: string; color: string }[] = [
  { value: "all", label: "All", color: "from-accent-violet to-accent-blue" },
  { value: "produit_luxe", label: "Luxury", color: "from-amber-500 to-orange-500" },
  { value: "poisson", label: "Fish", color: "from-cyan-500 to-blue-500" },
  { value: "fruit_de_mer", label: "Seafood", color: "from-teal-500 to-cyan-500" },
  { value: "crustace", label: "Crustacean", color: "from-pink-500 to-rose-500" },
  { value: "viande", label: "Meat", color: "from-red-500 to-rose-600" },
  { value: "volaille", label: "Poultry", color: "from-orange-400 to-amber-500" },
  { value: "laitier", label: "Dairy", color: "from-yellow-400 to-amber-400" },
  { value: "legume", label: "Vegetable", color: "from-green-500 to-emerald-500" },
  { value: "fruit", label: "Fruit", color: "from-purple-500 to-violet-500" },
];

export default function IngredientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [trendFilter, setTrendFilter] = useState<TrendFilter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredIngredients = useMemo(() => {
    return ingredientsData.filter((ing) => {
      const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || ing.category === categoryFilter;
      const matchesTrend = trendFilter === "all" || ing.trend === trendFilter;
      return matchesSearch && matchesCategory && matchesTrend;
    });
  }, [searchQuery, categoryFilter, trendFilter]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-danger" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCategoryGradient = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.color || "from-accent-violet to-accent-blue";
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
            Ingredient <span className="gradient-text">Directory</span>
          </h1>
          <p className="text-muted-foreground">
            Browse and analyze {ingredientsData.length} ingredients from fine dining menus
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
                placeholder="Search ingredients..."
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
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  categoryFilter === cat.value
                    ? `bg-gradient-to-r ${cat.color} text-white border-transparent`
                    : "bg-surface text-muted-foreground border-border hover:border-border-strong"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Trend Filter */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="flex gap-2">
              {[
                { value: "all" as TrendFilter, label: "All" },
                { value: "up" as TrendFilter, label: "Rising" },
                { value: "down" as TrendFilter, label: "Declining" },
                { value: "stable" as TrendFilter, label: "Stable" },
              ].map((trend) => (
                <button
                  key={trend.value}
                  onClick={() => setTrendFilter(trend.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                    trendFilter === trend.value
                      ? "bg-accent-violet/20 text-accent-violet"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {trend.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Showing <span className="text-foreground font-medium">{filteredIngredients.length}</span> ingredients
        </span>
        <span className="text-xs text-muted-foreground">
          Sorted by popularity
        </span>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredIngredients.map((ingredient, index) => (
            <Link key={ingredient.id} href={`/ingredients/${ingredient.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="group glass rounded-2xl p-5 card-hover cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg font-bold text-white shadow-lg",
                      getCategoryGradient(ingredient.category)
                    )}
                  >
                    {ingredient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface">
                    {getTrendIcon(ingredient.trend)}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        ingredient.trend === "up" && "text-success",
                        ingredient.trend === "down" && "text-danger",
                        ingredient.trend === "stable" && "text-muted-foreground"
                      )}
                    >
                      {ingredient.trend_value > 0 ? "+" : ""}
                      {ingredient.trend_value}%
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mb-1 capitalize group-hover:text-accent-violet transition-colors">
                  {ingredient.name}
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                  {ingredient.category}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <div className="text-lg font-bold font-mono">{ingredient.frequency}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Mentions</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="glass rounded-2xl overflow-hidden divide-y divide-border">
          {filteredIngredients.map((ingredient, index) => (
            <Link key={ingredient.id} href={`/ingredients/${ingredient.slug}`}>
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
                    "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white",
                    getCategoryGradient(ingredient.category)
                  )}
                >
                  {ingredient.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium capitalize group-hover:text-accent-violet transition-colors">
                    {ingredient.name}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase">{ingredient.category}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    {getTrendIcon(ingredient.trend)}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        ingredient.trend === "up" && "text-success",
                        ingredient.trend === "down" && "text-danger",
                        ingredient.trend === "stable" && "text-muted-foreground"
                      )}
                    >
                      {ingredient.trend_value > 0 ? "+" : ""}
                      {ingredient.trend_value}%
                    </span>
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
          <h3 className="font-semibold text-foreground mb-2">No ingredients found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}