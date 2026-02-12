"use client";

import { useState } from "react";
import { Award } from "lucide-react";
import { ShareList } from "@/components/dashboard/ShareList";
import ingredientsDataRaw from "@/data/ingredients.json";
import { CategoryFilter, StarFilter, Ingredient } from "@/lib/types";

export default function OverviewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [starFilter, setStarFilter] = useState<StarFilter>("all");

  const ingredients = ingredientsDataRaw as Ingredient[];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Ingredient Share */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ingredient Share Header */}
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
          
          {/* Share List */}
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

        {/* Right Column - Empty */}
        <div className="hidden lg:block">
          {/* Space for future content */}
        </div>
      </div>
    </div>
  );
}
