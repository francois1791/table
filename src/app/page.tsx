"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Award, Filter, BarChart3, PieChart } from "lucide-react";
import ingredientsDataRaw from "@/data/ingredients.json";
import { StarFilter, Ingredient } from "@/lib/types";

const ingredientsData = ingredientsDataRaw as Ingredient[];

const categories = [
  { key: "viande", label: "Viandes", emoji: "🥩", color: "#ef4444" },
  { key: "poisson", label: "Poissons", emoji: "🐟", color: "#06b6d4" },
  { key: "crustace", label: "Crustacés", emoji: "🦐", color: "#ec4899" },
  { key: "coquillage", label: "Coquillages", emoji: "🦪", color: "#14b8a6" },
  { key: "champignon", label: "Champignons", emoji: "🍄", color: "#f59e0b" },
  { key: "legume", label: "Légumes", emoji: "🥬", color: "#22c55e" },
  { key: "fruit", label: "Fruits", emoji: "🍎", color: "#a855f7" },
] as const;

const stars = [
  { value: "all" as StarFilter, label: "Toutes", stars: "⭐" },
  { value: "3 étoiles" as StarFilter, label: "3★", stars: "⭐⭐⭐" },
  { value: "2 étoiles" as StarFilter, label: "2★", stars: "⭐⭐" },
  { value: "1 étoile" as StarFilter, label: "1★", stars: "⭐" },
];

// Donut Chart Component - Simple with category color
function DonutChart({ 
  value, 
  total,
  color,
  size = 100
}: { 
  value: number;
  total: number;
  color: string;
  size?: number;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
        />
        {/* Value arc */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold">{value}</span>
        <span className="text-[10px] text-muted-foreground">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

// Bar Chart Component
function BarChart({ data, color }: { data: { name: string; value: number; emoji: string }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-sm w-24 truncate" title={item.name}>
            {item.emoji} {item.name}
          </span>
          <div className="flex-1 h-6 bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="h-full rounded-full flex items-center justify-end pr-2"
              style={{ backgroundColor: color }}
            >
              <span className="text-xs text-white font-medium">{item.value}</span>
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OverviewPage() {
  const [starFilter, setStarFilter] = useState<StarFilter>("all");
  const [viewMode, setViewMode] = useState<"bars" | "donut">("bars");

  // Filtrer les ingrédients
  const filteredIngredients = useMemo(() => {
    return ingredientsData.filter((ing) => {
      if (starFilter === "all") return true;
      return ing.by_stars && ing.by_stars[starFilter] > 0;
    });
  }, [starFilter]);

  // Stats globales par catégorie
  const stats = useMemo(() => {
    const byCat: Record<string, number> = {};
    categories.forEach((cat) => {
      byCat[cat.key] = filteredIngredients
        .filter((ing) => ing.category === cat.key)
        .reduce((sum, ing) => sum + ing.frequency, 0);
    });
    return byCat;
  }, [filteredIngredients]);

  const totalAll = useMemo(() => Object.values(stats).reduce((a, b) => a + b, 0), [stats]);

  // Top 5 par catégorie
  const byCategory = useMemo(() => {
    const grouped: Record<string, Ingredient[]> = {};
    categories.forEach((cat) => {
      grouped[cat.key] = filteredIngredients
        .filter((ing) => ing.category === cat.key)
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5);
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
            <h1 className="font-bold text-xl">Ingredient Analytics</h1>
            <p className="text-xs text-muted-foreground">
              {filteredIngredients.length} ingrédients • {totalAll} occurrences
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-surface rounded-lg p-1">
            <button
              onClick={() => setViewMode("bars")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "bars" ? "bg-accent-violet/20 text-accent-violet" : "text-muted-foreground"
              }`}
              title="Barres"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("donut")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "donut" ? "bg-accent-violet/20 text-accent-violet" : "text-muted-foreground"
              }`}
              title="Camembert"
            >
              <PieChart className="w-4 h-4" />
            </button>
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
                  {star.stars}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Donuts Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold mb-6 text-center">Répartition par catégorie</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat) => {
            const value = stats[cat.key] || 0;
            
            return (
              <div key={cat.key} className="flex flex-col items-center">
                <DonutChart 
                  value={value}
                  total={totalAll}
                  color={cat.color}
                  size={90}
                />
                <div className="mt-2 text-center">
                  <span className="text-xl">{cat.emoji}</span>
                  <p className="text-xs font-medium">{cat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((cat, idx) => {
          const items = byCategory[cat.key] || [];
          if (items.length === 0) return null;

          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass rounded-2xl p-5"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${cat.color}30` }}
                >
                  {cat.emoji}
                </div>
                <div>
                  <h2 className="font-semibold">{cat.label}</h2>
                  <p className="text-xs text-muted-foreground">{stats[cat.key] || 0} occurrences</p>
                </div>
              </div>

              {/* Chart */}
              {viewMode === "bars" ? (
                <BarChart
                  data={items.map((i) => ({ name: i.name, value: i.frequency, emoji: i.emoji }))}
                  color={cat.color}
                />
              ) : (
                <div className="space-y-2">
                  {items.slice(0, 5).map((ing, i) => (
                    <a
                      key={ing.id}
                      href={`/ingredients/${ing.id}`}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-hover transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">{i + 1}.</span>
                        <span>{ing.emoji}</span>
                        <span className="capitalize">{ing.name}</span>
                      </span>
                      <span className="font-mono text-sm">{ing.frequency}</span>
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
