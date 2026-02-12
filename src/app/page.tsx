"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Award, Filter } from "lucide-react";
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

// Colors for donut segments
const segmentColors = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", 
  "#06b6d4", "#3b82f6", "#8b5cf6", "#a855f7", "#ec4899"
];

// Donut Chart Component with ingredients
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
  const donutData = items.slice(0, 8).map((item, i) => ({
    label: item.name,
    value: item.frequency,
    color: segmentColors[i % segmentColors.length],
    emoji: item.emoji
  }));
  
  // Calculate SVG paths
  let accumulated = 0;
  const paths = donutData.map((slice) => {
    const startAngle = (accumulated / categoryTotal) * 360;
    accumulated += slice.value;
    const endAngle = (accumulated / categoryTotal) * 360;
    
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    
    const x1 = 50 + 35 * Math.cos(startRad);
    const y1 = 50 + 35 * Math.sin(startRad);
    const x2 = 50 + 35 * Math.cos(endRad);
    const y2 = 50 + 35 * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return {
      ...slice,
      d: `M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArc} 1 ${x2} ${y2} Z`,
      percentage: Math.round((slice.value / categoryTotal) * 100)
    };
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.emoji}</span>
          <h2 className="font-bold text-lg">{category.label}</h2>
        </div>
        <span className="text-2xl font-bold" style={{ color: category.color }}>
          {categoryTotal}
        </span>
      </div>
      
      {/* Donut Chart */}
      <div className="flex items-center gap-4">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {paths.map((path, i) => (
              <path
                key={i}
                d={path.d}
                fill={path.color}
                stroke="#0a0a0f"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
            <circle cx="50" cy="50" r="20" fill="#0a0a0f" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">{items.length}</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex-1 space-y-1.5 max-h-40 overflow-y-auto">
          {paths.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <span className="flex-shrink-0">{item.emoji}</span>
              <span className="flex-1 truncate capitalize">{item.label}</span>
              <span className="font-mono text-muted-foreground">{item.value}</span>
              <span className="text-[10px] text-muted-foreground w-8 text-right">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Total percentage */}
      <div className="mt-3 pt-3 border-t border-border text-center">
        <span className="text-xs text-muted-foreground">
          {Math.round((categoryTotal / total) * 100)}% du total
        </span>
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
        .slice(0, 8);
    });
    return grouped;
  }, [filteredIngredients]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent-soft flex items-center justify-center">
            <Award className="w-5 h-5 text-accent-violet" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Menu Analytics</h1>
            <p className="text-xs text-muted-foreground">
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

      {/* 7 Category Donuts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
