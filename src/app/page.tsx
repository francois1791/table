"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Award, Filter } from "lucide-react";
import ingredientsDataRaw from "@/data/ingredients.json";
import { StarFilter, Ingredient } from "@/lib/types";
import { useLanguage } from "@/lib/language";

const ingredientsData = ingredientsDataRaw as Ingredient[];

const segmentColors = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", 
  "#06b6d4", "#3b82f6", "#8b5cf6", "#a855f7", "#ec4899"
];

// Donut Chart Component - Full width with hover
function CategoryDonut({ 
  categoryKey,
  categoryLabel,
  emoji,
  color,
  items,
  total,
  t
}: { 
  categoryKey: string;
  categoryLabel: string;
  emoji: string;
  color: string;
  items: Ingredient[];
  total: number;
  t: (key: string, params?: Record<string, string | number>) => string;
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
            {Math.round((categoryTotal / total) * 100)}% {t("overview.percent_of_total")}
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
  const [starFilter, setStarFilter] = useState<StarFilter>("all");
  const { t, language } = useLanguage();

  // Categories with translations
  const categories = useMemo(() => [
    { key: "viande", label: t("cat.viande"), emoji: "🥩", color: "#ef4444" },
    { key: "poisson", label: t("cat.poisson"), emoji: "🐟", color: "#06b6d4" },
    { key: "crustace", label: t("cat.crustace"), emoji: "🦐", color: "#ec4899" },
    { key: "coquillage", label: t("cat.coquillage"), emoji: "🦪", color: "#14b8a6" },
    { key: "champignon", label: t("cat.champignon"), emoji: "🍄", color: "#f59e0b" },
    { key: "legume", label: t("cat.legume"), emoji: "🥬", color: "#22c55e" },
    { key: "fruit", label: t("cat.fruit"), emoji: "🍎", color: "#a855f7" },
    { key: "fruit_sec", label: t("cat.fruit_sec"), emoji: "🥜", color: "#d97706" },
  ], [t, language]);

  const stars = useMemo(() => [
    { value: "all" as StarFilter, label: t("filter.all"), stars: "⭐" },
    { value: "3 étoiles" as StarFilter, label: "3★", stars: "⭐⭐⭐" },
    { value: "2 étoiles" as StarFilter, label: "2★", stars: "⭐⭐" },
    { value: "1 étoile" as StarFilter, label: "1★", stars: "⭐" },
  ], [t, language]);

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
  }, [filteredIngredients, categories]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-accent-soft flex items-center justify-center">
            <Award className="w-6 h-6 text-accent-violet" />
          </div>
          <div>
            <h1 className="font-bold text-2xl">{t("overview.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("overview.subtitle", { 
                ingredients: filteredIngredients.length, 
                occurrences: totalAll.toLocaleString() 
              })}
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

      {/* Category Donuts - Full width, scrollable */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <CategoryDonut
            key={cat.key}
            categoryKey={cat.key}
            categoryLabel={cat.label}
            emoji={cat.emoji}
            color={cat.color}
            items={byCategory[cat.key] || []}
            total={totalAll}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
