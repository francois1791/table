"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
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

// Donut Chart Component - Full width with hover
function CategoryDonut({ 
  category,
  items,
  total
}: { 
  category: typeof categories[number];
  items: Ingredient[];
  total: number;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const categoryTotal = items.reduce((sum, item) => sum + item.frequency, 0);
  
  // Prepare data for donut (tous les ingrédients)
  const donutData = items.map((item, i) => ({
    ...item,
    label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    value: item.frequency,
    color: segmentColors[i % segmentColors.length],
    percentage: ((item.frequency / categoryTotal) * 100).toFixed(1)
  }));
  
  // Calculate SVG paths
  let accumulated = 0;
  const paths = donutData.map((slice, i) => {
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
      index: i,
      d: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
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
          <h2 className="font-bold text-2xl" style={{ color: category.color }}>
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
      
      {/* Donut Chart and Legend */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Chart */}
        <div className="relative w-64 h-64 flex-shrink-0 mx-auto md:mx-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {paths.map((path, i) => (
              <Link
                key={i}
                href={`/ingredients/${path.id}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <path
                  d={path.d}
                  fill={path.color}
                  stroke="#0a0a0f"
                  strokeWidth="1.5"
                  className={`transition-all duration-200 cursor-pointer ${
                    hoveredIndex === null 
                      ? "opacity-100" 
                      : hoveredIndex === i 
                        ? "opacity-100 scale-105" 
                        : "opacity-40"
                  }`}
                  style={{ 
                    transformOrigin: '50px 50px',
                    filter: hoveredIndex === i ? 'brightness(1.2)' : 'none'
                  }}
                />
              </Link>
            ))}
            <circle cx="50" cy="50" r="22" fill="#0a0a0f" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold">{items.length}</span>
          </div>
        </div>
        
        {/* Legend - Vertical list */}
        <div className="flex-1 space-y-2">
          {donutData.map((item, i) => (
            <Link
              key={i}
              href={`/ingredients/${item.id}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                hoveredIndex === i 
                  ? "bg-accent-violet/20 scale-[1.02]" 
                  : hoveredIndex !== null 
                    ? "opacity-40" 
                    : "hover:bg-surface-hover"
              }`}
            >
              <div 
                className="w-5 h-5 rounded-full flex-shrink-0 transition-transform"
                style={{ 
                  backgroundColor: item.color,
                  transform: hoveredIndex === i ? 'scale(1.2)' : 'scale(1)'
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-base capitalize truncate">
                  {item.label}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-base">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.percentage}%</p>
              </div>
            </Link>
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

  // Tous les ingrédients par catégorie
  const byCategory = useMemo(() => {
    const grouped: Record<string, Ingredient[]> = {};
    categories.forEach((cat) => {
      grouped[cat.key] = filteredIngredients
        .filter((ing) => ing.category === cat.key)
        .sort((a, b) => b.frequency - a.frequency);
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
            <h1 className="font-bold text-2xl">Menu Analytics</h1>
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
