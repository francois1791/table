"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Award, BarChart3, PieChart } from "lucide-react";
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

// Donut Chart Component
function DonutChart({ data, size = 80 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;
  
  let accumulated = 0;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {data.map((slice, i) => {
          const start = (accumulated / total) * 360;
          accumulated += slice.value;
          const end = (accumulated / total) * 360;
          const largeArc = end - start > 180 ? 1 : 0;
          
          const startRad = (start * Math.PI) / 180;
          const endRad = (end * Math.PI) / 180;
          
          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);
          
          return (
            <path
              key={i}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={slice.color}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1"
            />
          );
        })}
        <circle cx="50" cy="50" r="20" fill="#0a0a0f" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold">{total}</span>
      </div>
    </div>
  );
}

// Bar Chart Component
function BarChart({ data, color }: { data: { name: string; value: number; emoji: string }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  
  return (
    <div className="space-y-1.5">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs w-6 text-center text-muted-foreground">{i + 1}</span>
          <span className="text-base">{item.emoji}</span>
          <span className="text-sm w-20 truncate" title={item.name}>
            {item.name}
          </span>
          <div className="flex-1 h-5 bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
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

// Category Card Component
function CategoryCard({ 
  cat, 
  items, 
  starFilter,
  onStarChange,
  viewMode 
}: { 
  cat: typeof categories[number]; 
  items: Ingredient[]; 
  starFilter: StarFilter;
  onStarChange: (star: StarFilter) => void;
  viewMode: "bars" | "donut";
}) {
  const total = items.reduce((sum, ing) => sum + ing.frequency, 0);
  
  // Data for donut chart (by star)
  const starData = [
    { label: "3★", value: items.reduce((s, i) => s + (i.by_stars?.["3 étoiles"] || 0), 0), color: "#fbbf24" },
    { label: "2★", value: items.reduce((s, i) => s + (i.by_stars?.["2 étoiles"] || 0), 0), color: "#9ca3af" },
    { label: "1★", value: items.reduce((s, i) => s + (i.by_stars?.["1 étoile"] || 0), 0), color: "#fb923c" },
  ].filter(d => d.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `${cat.color}20` }}
          >
            {cat.emoji}
          </div>
          <div>
            <h2 className="font-semibold text-sm">{cat.label}</h2>
            <p className="text-xs text-muted-foreground">{total} occ.</p>
          </div>
        </div>
        
        {/* Star Filter per category */}
        <div className="flex gap-0.5">
          {stars.map((star) => (
            <button
              key={star.value}
              onClick={() => onStarChange(star.value)}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                starFilter === star.value
                  ? "bg-accent-violet text-white"
                  : "text-muted-foreground hover:bg-surface-hover"
              }`}
              title={star.label}
            >
              {star.stars}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex gap-4">
        {/* Donut by stars */}
        {starData.length > 0 && (
          <div className="flex-shrink-0">
            <DonutChart data={starData} size={70} />
            <div className="text-[10px] text-center text-muted-foreground mt-1">par étoile</div>
          </div>
        )}
        
        {/* Bar chart */}
        <div className="flex-1 min-w-0">
          {viewMode === "bars" ? (
            <BarChart
              data={items.map((i) => ({ name: i.name, value: i.frequency, emoji: i.emoji }))}
              color={cat.color}
            />
          ) : (
            <div className="space-y-1">
              {items.slice(0, 5).map((ing, i) => (
                <a
                  key={ing.id}
                  href={`/ingredients/${ing.id}`}
                  className="flex items-center justify-between py-1 px-2 rounded hover:bg-surface-hover text-sm"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span>{i + 1}.</span>
                    <span>{ing.emoji}</span>
                    <span className="capitalize truncate">{ing.name}</span>
                  </span>
                  <span className="font-mono text-xs">{ing.frequency}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function OverviewPage() {
  const [viewMode, setViewMode] = useState<"bars" | "donut">("bars");
  
  // Star filter per category
  const [starFilters, setStarFilters] = useState<Record<string, StarFilter>>(
    Object.fromEntries(categories.map(c => [c.key, "all"]))
  );

  // Get items per category with their specific star filter
  const byCategory = useMemo(() => {
    const grouped: Record<string, Ingredient[]> = {};
    categories.forEach((cat) => {
      const starFilter = starFilters[cat.key];
      grouped[cat.key] = ingredientsData
        .filter((ing) => {
          if (ing.category !== cat.key) return false;
          if (starFilter === "all") return true;
          return ing.by_stars && ing.by_stars[starFilter] > 0;
        })
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10); // Top 10
    });
    return grouped;
  }, [starFilters]);

  const handleStarChange = (catKey: string, star: StarFilter) => {
    setStarFilters(prev => ({ ...prev, [catKey]: star }));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent-soft flex items-center justify-center">
            <Award className="w-5 h-5 text-accent-violet" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Ingredient Analytics</h1>
            <p className="text-xs text-muted-foreground">Top 10 par catégorie</p>
          </div>
        </div>

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
            title="Liste"
          >
            <PieChart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.key}
            cat={cat}
            items={byCategory[cat.key] || []}
            starFilter={starFilters[cat.key]}
            onStarChange={(star) => handleStarChange(cat.key, star)}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}
