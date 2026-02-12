"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Award, Filter } from "lucide-react";
import ingredientsDataRaw from "@/data/ingredients.json";
import { StarFilter, Ingredient } from "@/lib/types";

const ingredientsData = ingredientsDataRaw as Ingredient[];

const categories = [
  { key: "viande", label: "VIANDES", emoji: "🥩", color: "#ef4444" },
  { key: "poisson", label: "POISSONS", emoji: "🐟", color: "#06b6d4" },
  { key: "crustace", label: "CRUSTACÉS", emoji: "🦐", color: "#ec4899" },
  { key: "coquillage", label: "COQUILLAGES", emoji: "🦪", color: "#14b8a6" },
  { key: "champignon", label: "CHAMPIGNONS", emoji: "🍄", color: "#f59e0b" },
  { key: "legume", label: "LÉGUMES", emoji: "🥬", color: "#22c55e" },
  { key: "fruit", label: "FRUITS", emoji: "🍎", color: "#a855f7" },
] as const;

const stars = [
  { value: "all" as StarFilter, label: "Toutes", stars: "⭐" },
  { value: "3 étoiles" as StarFilter, label: "3★", stars: "⭐⭐⭐" },
  { value: "2 étoiles" as StarFilter, label: "2★", stars: "⭐⭐" },
  { value: "1 étoile" as StarFilter, label: "1★", stars: "⭐" },
];

// Colors for donut segments
const segmentColors = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", 
  "#06b6d4", "#3b82f6", "#8b5cf6", "#a855f7", "#ec4899"
];

// Donut Chart Component - Full width
function CategoryDonut({ 
  category,
  items,
  total
}: { 
  category: typeof categories[number];
  items: Ingredient[];
  total: number;
}) {
  const categoryTotal = items.reduce((sum, item) => sum + item.frequency, 0);
  
  // Prepare data for donut
  const donutData = items.slice(0, 10).map((item, i) => ({
    label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    value: item.frequency,
    color: segmentColors[i % segmentColors.length],
  }));
  
  // Calculate SVG paths
  let accumulated = 0;
  const paths = donutData.map((slice) => {
    const startAngle = (accumulated / categoryTotal) * 360;
    accumulated += slice.value;
    const endAngle = (accumulated / categoryTotal) * 360;
    
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return {
      ...slice,
      d: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      percentage: ((slice.value / categoryTotal) * 100).toFixed(1)
    };
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-6 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{category.emoji}</span>
          <h2 className="font-bold text-2xl tracking-wide" style={{ color: category.color }}>
            {category.label}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold">{categoryTotal.toLocaleString()}</span>
          <p className="text-sm text-muted-foreground">
            {Math.round((categoryTotal / total) * 100)}% du total
          </p>
        </div>
      </div>
      
      {/* Donut Chart - Large */}
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Chart */}
        <div className="relative w-64 h-64 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {paths.map((path, i) => (
              <path
                key={i}
                d={path.d}
                fill={path.color}
                stroke="#0a0a0f"
                strokeWidth="1.5"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
            <circle cx="50" cy="50" r="22" fill="#0a0a0f" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{items.length}</span>
          </div>
        </div>
        
        {/* Legend - Full width */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {paths.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate capitalize">{item.label}</p>
                <p className="text-xs text-muted-foreground">
                  {item.value} ({item.percentage}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function OverviewPage() {
  const [starFilter, setStarFilter] = useState<StarFilter>("all");

  // Filtrer les ingrédients
  const filteredIngredients = useMemo(() => {
    return ingredientsData.filter((ing) => {
      if (starFilter === "all") return true;
      return ing.by_stars && ing.by_stars[starFilter] > 0;
    });
  }, [starFilter]);

  const totalAll = useMemo(() => 
    filteredIngredients.reduce((sum, ing) => sum + ing.frequency, 0),
    [filteredIngredients]
  );

  // Top ingrédients par catégorie
  const byCategory = useMemo(() => {
    const grouped: Record<string, Ingredient[]> = {};
    categories.forEach((cat) => {
      grouped[cat.key] = filteredIngredients
        .filter((ing) => ing.category === cat.key)
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);
    });
    return grouped;
  }, [filteredIngredients]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-accent-soft flex items-center justify-center">
            <Award className="w-6 h-6 text-accent-violet" />
          </div>
          <div>
            <h1 className="font-bold text-2xl">MENU ANALYTICS</h1>
            <p className="text-sm text-muted-foreground">
              {filteredIngredients.length} ingrédients • {totalAll.toLocaleString()} occurrences
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
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

      {/* 7 Category Donuts - Full width, scrollable */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <CategoryDonut
            key={cat.key}
            category={cat}
            items={byCategory[cat.key] || []}
            total={totalAll}
          />
        ))}
      </div>
    </div>
  );
}
