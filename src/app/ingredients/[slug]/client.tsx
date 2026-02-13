"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Ingredient, Dish } from "@/lib/types";
import { useLanguage } from "@/lib/language";

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

export default function IngredientDetailClient({ 
  ingredient, 
  ingredientsData,
  dishesWithIngredient
}: IngredientDetailClientProps) {
  const [showAllDishes, setShowAllDishes] = useState(false);
  const { t } = useLanguage();

  // Similar ingredients (same category)
  const similarIngredients = ingredientsData
    .filter((i) => i.category === ingredient.category && i.id !== ingredient.id)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // Limit displayed dishes
  const displayedDishes = showAllDishes 
    ? dishesWithIngredient 
    : dishesWithIngredient.slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("detail.back")}
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
              {t(`cat.${ingredient.category}`)}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="glass rounded-2xl p-4">
            <div className="text-3xl font-bold font-mono">{ingredient.frequency}</div>
            <div className="text-xs text-muted-foreground uppercase">{t("detail.total_occurrences")}</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-3xl font-bold font-mono">{ingredient.frequency_percent}%</div>
            <div className="text-xs text-muted-foreground uppercase">{t("detail.global_share")}</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-3xl font-bold font-mono">{ingredient.restaurants}</div>
            <div className="text-xs text-muted-foreground uppercase">{t("detail.restaurants")}</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-3xl font-bold font-mono text-yellow-500">
              {ingredient.star_percentages?.["3 étoiles"] || 0}%
            </div>
            <div className="text-xs text-muted-foreground uppercase">{t("detail.in_3star")}</div>
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
            <h2 className="text-xl font-semibold mb-6">{t("detail.star_distribution")}</h2>
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
                        <span className="text-sm font-mono">{count} {t("detail.occurrences")}</span>
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
              <h2 className="text-xl font-semibold mb-4">{t("detail.similar")}</h2>
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

        {/* Right Column - Dishes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{t("detail.dishes_with", { name: ingredient.name })}</h2>
            <span className="text-sm text-muted-foreground">
              {dishesWithIngredient.length} {t("detail.found")}
            </span>
          </div>

          {dishesWithIngredient.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("detail.no_dishes")}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {t("detail.no_dishes_hint")}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {displayedDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="p-4 rounded-xl bg-surface-hover/50 hover:bg-surface-hover transition-colors"
                  >
                    <p className="font-medium text-sm leading-relaxed">{dish.name}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {dish.city && <span className="capitalize">{dish.city}</span>}
                      {dish.menuType && <span className="capitalize">{dish.menuType}</span>}
                      {dish.stars && (
                        <span className="px-2 py-0.5 rounded-full bg-accent-violet/10 text-accent-violet">
                          {dish.stars}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {dishesWithIngredient.length > 10 && (
                <button
                  onClick={() => setShowAllDishes(!showAllDishes)}
                  className="w-full mt-4 py-3 rounded-xl bg-surface hover:bg-surface-hover transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  {showAllDishes ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      {t("detail.show_less")}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      {t("detail.show_more", { count: dishesWithIngredient.length - 10 })}
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
