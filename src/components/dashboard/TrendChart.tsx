"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Star, TrendingUp } from "lucide-react";
import { Ingredient } from "@/lib/types";

interface StarComparisonChartProps {
  ingredients: Ingredient[];
}

export function TrendChart({ ingredients }: StarComparisonChartProps) {
  // Prendre les top 8 ingrédients
  const topIngredients = useMemo(() => {
    return ingredients.slice(0, 8);
  }, [ingredients]);

  // Données pour le graphique : pourcentage par étoile
  const chartData = useMemo(() => {
    return topIngredients.map((ing) => ({
      name: ing.name,
      "1_etoile": ing.star_percentages?.["1 étoile"] || 0,
      "2_etoiles": ing.star_percentages?.["2 étoiles"] || 0,
      "3_etoiles": ing.star_percentages?.["3 étoiles"] || 0,
      emoji: ing.emoji,
    }));
  }, [topIngredients]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-strong rounded-xl p-3 border border-border-strong shadow-xl">
          <p className="text-sm font-semibold mb-2 capitalize">
            {data.emoji} {label}
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">⭐⭐⭐</span>
              <span className="text-foreground">{data["3_etoiles"]}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-300">⭐⭐</span>
              <span className="text-foreground">{data["2_etoiles"]}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-300">⭐</span>
              <span className="text-foreground">{data["1_etoile"]}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent-soft flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent-violet" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Star Distribution</h3>
            <p className="text-xs text-muted-foreground">Usage % by Michelin level</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Star className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-muted-foreground">Top 8</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-yellow-400 to-amber-500" />
          <span className="text-muted-foreground">3★</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-gray-300 to-gray-400" />
          <span className="text-muted-foreground">2★</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-orange-300 to-orange-400" />
          <span className="text-muted-foreground">1★</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#71717a" 
              fontSize={10} 
              tickLine={false} 
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(0, 6)}
            />
            <YAxis 
              stroke="#71717a" 
              fontSize={10} 
              tickLine={false} 
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="3_etoiles" name="3★" fill="url(#gradient3)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="2_etoiles" name="2★" fill="url(#gradient2)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="1_etoile" name="1★" fill="url(#gradient1)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="gradient3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d1d5db" />
                <stop offset="100%" stopColor="#9ca3af" />
              </linearGradient>
              <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fdba74" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
