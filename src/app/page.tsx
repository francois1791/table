"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChefHat,
  UtensilsCrossed,
  MapPin,
  Award,
  Sparkles,
  Star,
} from "lucide-react";
import { ShareList } from "@/components/dashboard/ShareList";
import ingredientsDataRaw from "@/data/ingredients.json";
import restaurantsData from "@/data/restaurants.json";
import { CategoryFilter, StarFilter, Ingredient } from "@/lib/types";

export default function OverviewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [starFilter, setStarFilter] = useState<StarFilter>("all");

  const ingredients = ingredientsDataRaw as Ingredient[];
  const restaurants = restaurantsData;

  const stats = useMemo(() => {
    const totalRestaurants = restaurants.length;
    const totalIngredients = ingredients.length;
    const totalOccurrences = ingredients.reduce((sum, i) => sum + i.frequency, 0);
    
    // Compter par étoile
    const byStars = {
      "3 étoiles": 0,
      "2 étoiles": 0,
      "1 étoile": 0,
    };
    
    ingredients.forEach(ing => {
      Object.entries(ing.by_stars || {}).forEach(([star, count]) => {
        if (star in byStars) {
          byStars[star as keyof typeof byStars] += count;
        }
      });
    });

    return [
      {
        label: "Restaurants",
        value: totalRestaurants,
        icon: MapPin,
        color: "from-blue-500 to-cyan-500",
      },
      {
        label: "Ingredients",
        value: totalIngredients,
        icon: UtensilsCrossed,
        color: "from-violet-500 to-purple-500",
      },
      {
        label: "Occurrences",
        value: totalOccurrences,
        icon: Award,
        color: "from-amber-500 to-orange-500",
      },
      {
        label: "3★ Mentions",
        value: byStars["3 étoiles"],
        icon: Star,
        color: "from-yellow-500 to-amber-500",
      },
    ];
  }, [ingredients, restaurants]);

  // Top ingrédients par catégorie
  const topByCategory = useMemo(() => {
    const categories: Record<string, Ingredient[]> = {};
    
    ingredients.forEach(ing => {
      if (!categories[ing.category]) {
        categories[ing.category] = [];
      }
      categories[ing.category].push(ing);
    });
    
    // Prendre le top 1 de chaque catégorie
    return Object.entries(categories)
      .map(([cat, ings]) => ({
        category: cat,
        top: ings.sort((a, b) => b.frequency - a.frequency)[0],
      }))
      .filter(item => item.top)
      .slice(0, 7);
  }, [ingredients]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass-strong p-8 md:p-12"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/10 via-transparent to-accent-blue/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-violet/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-accent flex items-center justify-center glow-accent">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div className="px-3 py-1 rounded-full bg-accent-violet/20 border border-accent-violet/30">
              <span className="text-xs font-medium text-accent-violet flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-pulse" />
                Michelin Analytics
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Fine Dining
            <span className="gradient-text"> Intelligence</span>
          </h1>
          
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
            Advanced analytics for Michelin-starred gastronomy. Analyze ingredient usage 
            across 1★, 2★ and 3★ restaurants. Filter by star rating to discover what 
            differentiates each level.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="glass rounded-2xl p-4 card-hover"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold font-mono">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Ingredient Share List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent-soft flex items-center justify-center">
                <Award className="w-5 h-5 text-accent-violet" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Ingredient Share</h2>
                <p className="text-xs text-muted-foreground">
                  Usage frequency across all menus
                  {starFilter !== "all" && (
                    <span className="text-accent-violet ml-1">• {starFilter}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <ShareList
            ingredients={ingredients}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            starFilter={starFilter}
            onSearchChange={setSearchQuery}
            onCategoryChange={setCategoryFilter}
            onStarChange={setStarFilter}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Category Leaders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Category Leaders</h3>
                <p className="text-xs text-muted-foreground">Top by category</p>
              </div>
            </div>

            <div className="space-y-3">
              {topByCategory.map(({ category, top }) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-hover/50 hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{top.emoji}</span>
                    <div>
                      <span className="font-medium text-sm capitalize block">{top.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{category}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {top.frequency}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Star Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Star Distribution</h3>
                <p className="text-xs text-muted-foreground">Usage by Michelin level</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { star: "3 étoiles", color: "from-yellow-400 to-amber-500", icon: "⭐⭐⭐" },
                { star: "2 étoiles", color: "from-gray-300 to-gray-400", icon: "⭐⭐" },
                { star: "1 étoile", color: "from-orange-300 to-orange-400", icon: "⭐" },
              ].map(({ star, color, icon }) => {
                const total = ingredients.reduce((sum, ing) => 
                  sum + (ing.by_stars?.[star] || 0), 0
                );
                const maxTotal = 500; // Approximation pour la barre
                
                return (
                  <div key={star} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{icon}</span>
                        <span className="text-muted-foreground">{star}</span>
                      </span>
                      <span className="font-mono">{total}</span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${color} rounded-full`}
                        style={{ width: `${Math.min((total / maxTotal) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Usage Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-semibold text-foreground mb-3">How to Use</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent-violet">•</span>
                <span>Filter by star rating to see what differentiates 1★, 2★, 3★</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-violet">•</span>
                <span>Percentages show ingredient distribution by Michelin level</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-violet">•</span>
                <span>Click an ingredient for detailed usage analysis</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
