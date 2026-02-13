"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ingredientsDataRaw from "@/data/ingredients.json";
import { Ingredient } from "@/lib/types";

const ingredientsData = ingredientsDataRaw as Ingredient[];

const segmentColors = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", 
  "#06b6d4", "#3b82f6", "#8b5cf6", "#a855f7", "#ec4899"
];

// Catégories en français direct
const categories = [
  { key: "viande", label: "Viandes", emoji: "🥩", color: "#ef4444" },
  { key: "poisson", label: "Poissons", emoji: "🐟", color: "#06b6d4" },
  { key: "crustace", label: "Crustacés", emoji: "🦐", color: "#ec4899" },
  { key: "coquillage", label: "Coquillages", emoji: "🦪", color: "#14b8a6" },
  { key: "champignon", label: "Champignons", emoji: "🍄", color: "#f59e0b" },
  { key: "legume", label: "Légumes", emoji: "🥬", color: "#22c55e" },
  { key: "fruit", label: "Fruits", emoji: "🍎", color: "#a855f7" },
  { key: "fruit_sec", label: "Fruits secs", emoji: "🥜", color: "#d97706" },
  { key: "epice", label: "Épices", emoji: "🌶️", color: "#dc2626" },
  { key: "herbe", label: "Herbes", emoji: "🌿", color: "#16a34a" },
  { key: "produit_laitier", label: "Produits laitiers", emoji: "🧀", color: "#fbbf24" },
  { key: "cereale", label: "Céréales", emoji: "🌾", color: "#d97706" },
  { key: "condiment", label: "Condiments", emoji: "🧂", color: "#6b7280" },
];

// Donut Chart Component - Full width with hover
function CategoryDonut({ 
  categoryLabel,
  emoji,
  color,
  items,
  total
}: { 
  categoryLabel: string;
  emoji: string;
  color: string;
  items: Ingredient[];
  total: number;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const categoryTotal = items.reduce((sum, item) => sum + item.frequency, 0);
  
  const donutData = items.map((item, i) => ({
    ...item,
    label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    value: item.frequency,
    color: segmentColors[i % segmentColors.length],
    percentage: ((item.frequency / categoryTotal) * 100).toFixed(1)
  }));
  
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
      className="glass rounded-2xl p-4 mb-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <h2 className="font-bold text-xl" style={{ color }}>
            {categoryLabel}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold">{categoryTotal.toLocaleString()}</span>
          <p className="text-xs text-muted-foreground">
            {Math.round((categoryTotal / total) * 100)}% du total
          </p>
        </div>
      </div>
      
      {/* Donut Chart and Legend */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Chart */}
        <div className="relative w-48 h-48 flex-shrink-0 mx-auto md:mx-0">
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
                  stroke="var(--background)"
                  strokeWidth="1.5"
                  className={`transition-all duration-200 cursor-pointer ${
                    hoveredIndex === null 
                      ? "opacity-100" 
                      : hoveredIndex === i 
                        ? "opacity-100" 
                        : "opacity-40"
                  }`}
                  style={{ 
                    transformOrigin: '50px 50px',
                    transform: hoveredIndex === i ? 'scale(1.05)' : 'scale(1)',
                    filter: hoveredIndex === i ? 'brightness(1.2)' : 'none'
                  }}
                />
              </Link>
            ))}
            <circle cx="50" cy="50" r="22" fill="var(--background)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xl font-bold">{items.length}</span>
          </div>
        </div>
        
        {/* Legend - Compact grid */}
        <div className="flex-1 grid grid-cols-2 xl:grid-cols-3 gap-1">
          {donutData.map((item, i) => (
            <Link
              key={i}
              href={`/ingredients/${item.id}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-sm ${
                hoveredIndex === i 
                  ? "bg-accent-violet/20" 
                  : hoveredIndex !== null 
                    ? "opacity-40" 
                    : "hover:bg-surface-hover"
              }`}
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="flex-1 min-w-0 truncate capitalize">
                {item.label}
              </span>
              <span className="text-muted-foreground text-xs whitespace-nowrap">
                {item.value}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function OverviewPage() {
  const totalAll = useMemo(() => 
    ingredientsData.reduce((sum, ing) => sum + ing.frequency, 0),
    []
  );

  // Tous les ingrédients par catégorie
  const byCategory = useMemo(() => {
    const grouped: Record<string, Ingredient[]> = {};
    categories.forEach((cat) => {
      grouped[cat.key] = ingredientsData
        .filter((ing) => ing.category === cat.key)
        .sort((a, b) => b.frequency - a.frequency);
    });
    return grouped;
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Stats simples */}
      <div className="mb-8 text-sm text-muted-foreground">
        {ingredientsData.length} ingrédients • {totalAll.toLocaleString()} occurrences
      </div>

      {/* Category Donuts */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <CategoryDonut
            key={cat.key}
            categoryLabel={cat.label}
            emoji={cat.emoji}
            color={cat.color}
            items={byCategory[cat.key] || []}
            total={totalAll}
          />
        ))}
      </div>
    </div>
  );
}
