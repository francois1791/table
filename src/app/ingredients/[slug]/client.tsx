"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Ingredient } from "@/lib/types";

interface IngredientDetailClientProps {
  ingredient: Ingredient;
  ingredientsData: Ingredient[];
}

export default function IngredientDetailClient({ 
  ingredient, 
  ingredientsData 
}: IngredientDetailClientProps) {
  const emojis: Record<string, string> = {
    viande: "🥩",
    poisson: "🐟",
    crustace: "🦐",
    coquillage: "🦪",
    legume: "🥬",
    fruit: "🍎",
    champignon: "🍄",
  };

  // Trouver des ingrédients similaires (même catégorie)
  const similarIngredients = ingredientsData
    .filter((i) => i.category === ingredient.category && i.id !== ingredient.id)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to overview
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-8 mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{ingredient.emoji || emojis[ingredient.category] || "🍽️"}</span>
          <div>
            <h1 className="text-4xl font-bold capitalize">{ingredient.name}</h1>
            <span className="text-muted-foreground uppercase tracking-wider text-sm">
              {ingredient.category}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="glass rounded-2xl p-4">
            <div className="text-3xl font-bold font-mono">{ingredient.frequency}</div>
            <div className="text-xs text-muted-foreground uppercase">Total Occurrences</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-3xl font-bold font-mono">{ingredient.frequency_percent}%</div>
            <div className="text-xs text-muted-foreground uppercase">Global Share</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-3xl font-bold font-mono">{ingredient.restaurants}</div>
            <div className="text-xs text-muted-foreground uppercase">Restaurants</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-3xl font-bold font-mono text-yellow-500">
              {ingredient.star_percentages?.["3 étoiles"] || 0}%
            </div>
            <div className="text-xs text-muted-foreground uppercase">In 3★ Restaurants</div>
          </div>
        </div>
      </motion.div>

      {/* Star Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 mb-8"
      >
        <h2 className="text-xl font-semibold mb-6">Distribution by Michelin Stars</h2>
        <div className="space-y-4">
          {[
            { star: "3 étoiles", color: "from-yellow-400 to-amber-500", icon: "⭐⭐⭐" },
            { star: "2 étoiles", color: "from-gray-300 to-gray-400", icon: "⭐⭐" },
            { star: "1 étoile", color: "from-orange-300 to-orange-400", icon: "⭐" },
          ].map(({ star, color, icon }) => {
            const count = ingredient.by_stars?.[star] || 0;
            const percent = ingredient.star_percentages?.[star] || 0;
            
            return (
              <div key={star} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="text-muted-foreground">{star}</span>
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono">{count} occurrences</span>
                    <span className="text-sm font-bold w-16 text-right">{percent}%</span>
                  </div>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(percent * 5, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Similar Ingredients */}
      {similarIngredients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Similar Ingredients</h2>
          <div className="space-y-2">
            {similarIngredients.map((ing) => (
              <Link
                key={ing.id}
                href={`/ingredients/${ing.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span>{ing.emoji || emojis[ing.category] || "🍽️"}</span>
                  <span className="capitalize">{ing.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{ing.frequency}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
