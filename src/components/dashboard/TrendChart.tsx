"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Calendar } from "lucide-react";
import { Ingredient } from "@/lib/types";

interface TrendChartProps {
  ingredients: Ingredient[];
}

interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export function TrendChart({ ingredients }: TrendChartProps) {
  // Get top 5 ingredients for the chart
  const topIngredients = useMemo(() => {
    return ingredients.slice(0, 5);
  }, [ingredients]);

  // Transform data for the chart
  const chartData = useMemo(() => {
    if (!topIngredients.length || !topIngredients[0].daily_data) return [];

    const dataPoints: ChartDataPoint[] = [];
    const days = topIngredients[0].daily_data.length;

    for (let i = 0; i < days; i++) {
      const point: ChartDataPoint = {
        date: topIngredients[0].daily_data[i].date,
      };

      topIngredients.forEach((ing) => {
        point[ing.name] = ing.daily_data[i]?.value || 0;
      });

      dataPoints.push(point);
    }

    return dataPoints;
  }, [topIngredients]);

  const colors = [
    "#7c3aed", // violet
    "#3b82f6", // blue
    "#06b6d4", // cyan
    "#f59e0b", // amber
    "#ec4899", // pink
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
            <h3 className="font-semibold text-foreground">Ingredient Trends</h3>
            <p className="text-xs text-muted-foreground">30-day usage patterns</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>Last 30 days</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {topIngredients.map((ing, index) => (
          <div key={ing.id} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index] }}
            />
            <span className="text-xs text-muted-foreground capitalize">{ing.name}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              {colors.map((color, index) => (
                <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              interval={6}
            />
            <YAxis
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-strong rounded-xl p-3 border border-border-strong shadow-xl">
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatDate(label as string)}
                      </p>
                      <div className="space-y-1">
                        {payload.map((entry: any) => (
                          <div key={entry.name} className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-xs capitalize text-foreground">
                              {entry.name}:
                            </span>
                            <span className="text-xs font-mono font-medium">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {topIngredients.map((ing, index) => (
              <Line
                key={ing.id}
                type="monotone"
                dataKey={ing.name}
                stroke={colors[index]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}