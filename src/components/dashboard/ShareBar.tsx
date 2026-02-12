"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Ingredient, StarFilter } from "@/lib/types";

interface ShareBarProps {
  ingredient: Ingredient;
  maxFrequency: number;
  rank: number;
  starFilter?: StarFilter;
}

export function ShareBar({ ingredient, maxFrequency, rank, starFilter = "all" }: ShareBarProps) {
  // Valeur à afficher selon le filtre
  const displayFrequency = starFilter === "all" 
    ? ingredient.frequency 
    : (ingredient.by_stars?.[starFilter] || 0);
  
  // Pourcentage AU SEIN de la catégorie sélectionnée
  const displayPercentage = starFilter === "all"
    ? ingredient.frequency_percent
    : (ingredient.star_percentages?.[starFilter] || 0);
  
  const percentage = maxFrequency > 0 ? (displayFrequency / maxFrequency) * 100 : 0;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      viande: "from-red-500 to-rose-600",
      poisson: "from-cyan-500 to-blue-500",
      crustace: "from-pink-500 to-rose-500",
      coquillage: "from-teal-500 to-cyan-500",
      legume: "from-green-500 to-emerald-500",
      fruit: "from-purple-500 to-violet-500",
      champignon: "from-amber-500 to-orange-500",
    };
    return colors[category] || "from-accent-violet to-accent-blue";
  };

  // Pour la comparaison: montrer tous les pourcentages par étoile
  const starBreakdown = ingredient.star_percentages || {};

  return (
    <Link href={`/ingredients/${ingredient.id}`}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: rank * 0.03 }}
        className="group relative flex items-center gap-4 p-3 rounded-xl hover:bg-surface-hover transition-all duration-300 cursor-pointer"
      >
        {/* Rank */}
        <div className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold font-mono flex-shrink-0",
          rank <= 3 ? "bg-gradient-accent text-white" : "bg-surface text-muted-foreground"
        )}>
          {rank}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{ingredient.emoji}</span>
              <h3 className="font-semibold text-foreground group-hover:text-accent-violet transition-colors capitalize">
                {ingredient.name}
              </h3>
              <span className="text-xs text-muted-foreground uppercase tracking-wider hidden sm:inline">
                {ingredient.category}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Afficher le pourcentage pour le filtre actuel */}
              {starFilter !== "all" && (
                <span className="text-xs font-medium text-accent-violet">
                  {displayPercentage}% of {starFilter}
                </span>
              )}
              
              <span className="text-sm font-bold text-foreground w-12 text-right">
                {displayFrequency}
              </span>
              {starFilter === "all" && (
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {ingredient.frequency_percent}%
                </span>
              )}
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, delay: rank * 0.03 + 0.1, ease: "easeOut" }}
              className={cn(
                "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r",
                getCategoryColor(ingredient.category)
              )}
            />
          </div>
          
          {/* Breakdown comparatif: pourcentages dans chaque étoile */}
          <div className="flex items-center gap-3 mt-1.5 text-xs">
            <span className="text-muted-foreground">Share by star:</span>
            {starBreakdown["3 étoiles"] > 0 && (
              <span className={cn(
                "px-1.5 py-0.5 rounded",
                starFilter === "3 étoiles" ? "bg-yellow-500/30 text-yellow-300" : "text-yellow-400/70"
              )}>
                ⭐⭐⭐ {starBreakdown["3 étoiles"]}%
              </span>
            )}
            {starBreakdown["2 étoiles"] > 0 && (
              <span className={cn(
                "px-1.5 py-0.5 rounded",
                starFilter === "2 étoiles" ? "bg-gray-400/30 text-gray-200" : "text-gray-400/70"
              )}>
                ⭐⭐ {starBreakdown["2 étoiles"]}%
              </span>
            )}
            {starBreakdown["1 étoile"] > 0 && (
              <span className={cn(
                "px-1.5 py-0.5 rounded",
                starFilter === "1 étoile" ? "bg-orange-400/30 text-orange-200" : "text-orange-300/70"
              )}>
                ⭐ {starBreakdown["1 étoile"]}%
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
