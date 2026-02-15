"use client";

import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Utensils } from "lucide-react";
import Link from "next/link";
import dishesDataRaw from "@/data/dishes.json";
import ingredientsDataRaw from "@/data/ingredients.json";

interface Dish {
  id: number;
  name: string;
  restaurantId: number;
  stars: string;
  menuType: string;
  city: string;
  ingredients: string[];
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
  emoji: string;
}

const dishesData = dishesDataRaw as Dish[];
const ingredientsData = ingredientsDataRaw as Ingredient[];

// Group by restaurant
const restaurantMap = new Map<number, {
  id: number;
  city: string;
  stars: string;
  dishes: Dish[];
}>();

dishesData.forEach(dish => {
  if (!restaurantMap.has(dish.restaurantId)) {
    restaurantMap.set(dish.restaurantId, {
      id: dish.restaurantId,
      city: dish.city,
      stars: dish.stars,
      dishes: []
    });
  }
  restaurantMap.get(dish.restaurantId)!.dishes.push(dish);
});

const restaurants = Array.from(restaurantMap.values()).sort((a, b) => a.id - b.id);

export default function RestaurantViewer() {
  const [expandedRestaurant, setExpandedRestaurant] = useState<number | null>(null);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const getIngredientColor = (category: string) => {
    const colors: Record<string, string> = {
      viande: "bg-red-100 text-red-800 border-red-200",
      poisson: "bg-blue-100 text-blue-800 border-blue-200",
      crustace: "bg-orange-100 text-orange-800 border-orange-200",
      coquillage: "bg-cyan-100 text-cyan-800 border-cyan-200",
      legume: "bg-green-100 text-green-800 border-green-200",
      fruit: "bg-yellow-100 text-yellow-800 border-yellow-200",
      champignon: "bg-amber-100 text-amber-800 border-amber-200",
      feculent: "bg-stone-100 text-stone-800 border-stone-200",
      fruit_sec: "bg-amber-100 text-amber-800 border-amber-200",
      epice: "bg-rose-100 text-rose-800 border-rose-200",
      herbe: "bg-emerald-100 text-emerald-800 border-emerald-200",
      produit_laitier: "bg-sky-100 text-sky-800 border-sky-200",
      cereale: "bg-orange-100 text-orange-800 border-orange-200",
      condiment: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                Retour
              </Link>
              <h1 className="text-xl font-bold">Vue par Restaurant</h1>
            </div>
            <div className="text-sm text-gray-500">
              {restaurants.length} restaurants • {dishesData.length} plats
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Restaurant List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Restaurants</h2>
            {restaurants.map((resto) => (
              <div
                key={resto.id}
                className="bg-white border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedRestaurant(
                    expandedRestaurant === resto.id ? null : resto.id
                  )}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">#{resto.id}</span>
                    <div className="text-left">
                      <div className="font-medium">{resto.city}</div>
                      <div className="text-sm text-gray-500">{resto.stars}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {resto.dishes.length} plats
                    </span>
                    {expandedRestaurant === resto.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedRestaurant === resto.id && (
                  <div className="border-t">
                    {resto.dishes.map((dish) => (
                      <button
                        key={dish.id}
                        onClick={() => setSelectedDish(dish)}
                        className={`w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between ${
                          selectedDish?.id === dish.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <div>
                          <div className="font-medium text-sm">{dish.name}</div>
                          <div className="text-xs text-gray-500">{dish.menuType}</div>
                        </div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {dish.ingredients.length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right: Dish Detail */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Détail du Plat</h2>
            {selectedDish ? (
              <div className="bg-white border rounded-lg p-6 sticky top-24">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-sm text-gray-500">#{selectedDish.id}</span>
                    <h3 className="text-xl font-bold mt-1">{selectedDish.name}</h3>
                    <p className="text-gray-500">{selectedDish.menuType}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{selectedDish.city}</div>
                    <div className="text-sm text-gray-500">{selectedDish.stars}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Ingrédients extraits ({selectedDish.ingredients.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDish.ingredients.map((ing, idx) => {
                      const ingData = ingredientsData.find(i => i.name === ing);
                      return (
                        <Link
                          key={idx}
                          href={`/ingredients/${ingData?.id || '#'}`}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:shadow-md transition-shadow ${getIngredientColor(ingData?.category || "")}`}
                        >
                          <span className="text-lg">{ingData?.emoji}</span>
                          <span className="font-medium">{ing}</span>
                          <span className="text-xs opacity-60">({ingData?.category})</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-2">Texte original complet</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono">
                    {selectedDish.name}
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-2">Statistiques</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-gray-500">Catégories présentes</div>
                      <div className="font-medium">
                        {Array.from(new Set(selectedDish.ingredients.map(ing => 
                          ingredientsData.find(i => i.name === ing)?.category
                        ))).filter(Boolean).join(', ') || 'N/A'}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-gray-500">Restaurant ID</div>
                      <div className="font-medium">#{selectedDish.restaurantId}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 border-2 border-dashed rounded-lg p-12 text-center">
                <Utensils className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Sélectionnez un plat pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
