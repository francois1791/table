"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Search, Filter } from "lucide-react";
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

// Group dishes by restaurant
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

export default function DatabaseViewer() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredDishes = useMemo(() => {
    let dishes = selectedRestaurant === "all" 
      ? dishesData 
      : restaurantMap.get(selectedRestaurant)?.dishes || [];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      dishes = dishes.filter(d => 
        d.name.toLowerCase().includes(term) ||
        d.ingredients.some(i => i.toLowerCase().includes(term))
      );
    }
    
    return dishes;
  }, [selectedRestaurant, searchTerm]);

  const getIngredientColor = (category: string) => {
    const colors: Record<string, string> = {
      viande: "bg-red-100 text-red-800",
      poisson: "bg-blue-100 text-blue-800",
      crustace: "bg-orange-100 text-orange-800",
      coquillage: "bg-cyan-100 text-cyan-800",
      legume: "bg-green-100 text-green-800",
      fruit: "bg-yellow-100 text-yellow-800",
      champignon: "bg-amber-100 text-amber-800",
      feculent: "bg-stone-100 text-stone-800",
      fruit_sec: "bg-amber-100 text-amber-800",
      epice: "bg-rose-100 text-rose-800",
      herbe: "bg-emerald-100 text-emerald-800",
      produit_laitier: "bg-sky-100 text-sky-800",
      cereale: "bg-orange-100 text-orange-800",
      condiment: "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour
              </Link>
              <h1 className="text-xl font-bold">Explorateur de Database</h1>
            </div>
            <div className="text-sm text-gray-500">
              {filteredDishes.length} plats • {restaurants.length} restaurants
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Restaurant select */}
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant
              </label>
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Tous les restaurants</option>
                {restaurants.map(r => (
                  <option key={r.id} value={r.id}>
                    #{r.id} - {r.city} ({r.stars}) - {r.dishes.length} plats
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom de plat ou ingrédient..."
                  className="w-full border rounded-md pl-10 pr-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* View mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vue
              </label>
              <div className="flex border rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 text-sm ${viewMode === "table" ? "bg-black text-white" : "bg-white"}`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-4 py-2 text-sm ${viewMode === "cards" ? "bg-black text-white" : "bg-white"}`}
                >
                  Cartes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {viewMode === "table" ? (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">ID</th>
                  <th className="text-left px-4 py-3 font-semibold">Plat Original</th>
                  <th className="text-left px-4 py-3 font-semibold">Restaurant</th>
                  <th className="text-left px-4 py-3 font-semibold">Ingrédients Extraits</th>
                  <th className="text-center px-4 py-3 font-semibold">Nb</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDishes.map((dish) => {
                  const resto = restaurantMap.get(dish.restaurantId);
                  return (
                    <tr key={dish.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">#{dish.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{dish.name}</div>
                        <div className="text-xs text-gray-500">{dish.menuType}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{resto?.city}</div>
                        <div className="text-xs text-gray-500">{resto?.stars}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {dish.ingredients.map((ing, idx) => {
                            const ingData = ingredientsData.find(i => i.name === ing);
                            return (
                              <span
                                key={idx}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getIngredientColor(ingData?.category || "")}`}
                                title={ingData?.category}
                              >
                                {ingData?.emoji}
                                {ing}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium">
                          {dish.ingredients.length}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDishes.map((dish) => {
              const resto = restaurantMap.get(dish.restaurantId);
              return (
                <div key={dish.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-500">#{dish.id}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {dish.ingredients.length} ingrédients
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{dish.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {resto?.city} • {resto?.stars}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {dish.ingredients.map((ing, idx) => {
                      const ingData = ingredientsData.find(i => i.name === ing);
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getIngredientColor(ingData?.category || "")}`}
                        >
                          {ingData?.emoji}
                          {ing}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
