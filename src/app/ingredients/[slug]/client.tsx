"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Ingredient, Dish } from "@/lib/types";

interface IngredientDetailClientProps {
  ingredient: Ingredient;
  ingredientsData: Ingredient[];
  dishesWithIngredient: Dish[];
}

const categoryEmojis: Record<string, string> = {
  viande: "🥩",
  poisson: "🐟",
  crustace: "🦐",
  coquillage: "🦪",
  legume: "🥬",
  fruit: "🍎",
  champignon: "🍄",
  fruit_sec: "🥜",
  epice: "🌶️",
  herbe: "🌿",
  produit_laitier: "🧀",
  cereale: "🌾",
  condiment: "🧂",
};

const categoryLabels: Record<string, string> = {
  viande: "Viandes",
  poisson: "Poissons",
  crustace: "Crustacés",
  coquillage: "Coquillages",
  legume: "Légumes",
  fruit: "Fruits",
  champignon: "Champignons",
  fruit_sec: "Fruits secs",
  epice: "Épices",
  herbe: "Herbes",
  produit_laitier: "Produits laitiers",
  cereale: "Céréales",
  condiment: "Condiments",
};

export default function IngredientDetailClient({ 
  ingredient, 
  ingredientsData,
  dishesWithIngredient
}: IngredientDetailClientProps) {
  const [showAllAssociations, setShowAllAssociations] = useState(false);

  // Similar ingredients (same category)
  const similarIngredients = ingredientsData
    .filter((i) => i.category === ingredient.category && i.id !== ingredient.id)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // Calculate ingredient associations (co-occurrences)
  const associations = useMemo(() => {
    const cooccurrenceMap = new Map<string, { count: number; ingredient: Ingredient }>();
    
    dishesWithIngredient.forEach((dish) => {
      dish.ingredients.forEach((ingName) => {
        if (ingName !== ingredient.name) {
          const existing = cooccurrenceMap.get(ingName);
          if (existing) {
            existing.count++;
          } else {
            // Find the ingredient data
            const ingData = ingredientsData.find((i) => i.name === ingName);
            if (ingData) {
              cooccurrenceMap.set(ingName, { count: 1, ingredient: ingData });
            }
          }
        }
      });
    });
    
    // Convert to array and sort by count
    return Array.from(cooccurrenceMap.values())
      .sort((a, b) => b.count - a.count);
  }, [dishesWithIngredient, ingredient.name, ingredientsData]);

  // Limit displayed associations
  const displayedAssociations = showAllAssociations 
    ? associations 
    : associations.slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-8 mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{ingredient.emoji || categoryEmojis[ingredient.category] || "🍽️"}</span>
          <div>
            <h1 className="text-4xl font-bold capitalize">{ingredient.name}</h1>
            <span className="text-muted-foreground uppercase tracking-wider text-sm">
              {categoryLabels[ingredient.category] || ingredient.category}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="glass rounded-2xl p-4">
            <div className="text-3xl font-bold font-mono">{ingredient.frequency}</div>
            <div className="text-xs text-muted-foreground uppercase">Occurrences</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-3xl font-bold font-mono">{ingredient.frequency_percent}%</div>
            <div className="text-xs text-muted-foreground uppercase">Part globale</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-3xl font-bold font-mono">{ingredient.restaurants}</div>
            <div className="text-xs text-muted-foreground uppercase">Restaurants</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-3xl font-bold font-mono text-yellow-500">
              {ingredient.star_percentages?.["3 étoiles"] || 0}%
            </div>
            <div className="text-xs text-muted-foreground uppercase">Dans les 3★</div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Star Distribution & Similar */}
        <div className="space-y-8">
          {/* Star Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold mb-6">Répartition par étoiles</h2>
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
              <h2 className="text-xl font-semibold mb-4">Ingrédients similaires</h2>
              <div className="space-y-2">
                {similarIngredients.map((ing) => (
                  <Link
                    key={ing.id}
                    href={`/ingredients/${ing.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span>{ing.emoji || categoryEmojis[ing.category] || "🍽️"}</span>
                      <span className="capitalize">{ing.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{ing.frequency}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Ingredient Associations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Associations avec {ingredient.name}</h2>
            <span className="text-sm text-muted-foreground">
              {associations.length} produits liés
            </span>
          </div>

          {associations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucune association trouvée.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {displayedAssociations.map((assoc) => (
                  <Link
                    key={assoc.ingredient.id}
                    href={`/ingredients/${assoc.ingredient.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-surface-hover/50 hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{assoc.ingredient.emoji || categoryEmojis[assoc.ingredient.category] || "🍽️"}</span>
                      <div>
                        <p className="font-medium capitalize">{assoc.ingredient.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryLabels[assoc.ingredient.category] || assoc.ingredient.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono">{assoc.count}</span>
                      <span className="text-xs text-muted-foreground block">
                        {Math.round((assoc.count / dishesWithIngredient.length) * 100)}% des plats
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {associations.length > 10 && (
                <button
                  onClick={() => setShowAllAssociations(!showAllAssociations)}
                  className="w-full mt-4 py-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  {showAllAssociations ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Voir moins
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Voir {associations.length - 10} associations de plus
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
