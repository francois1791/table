export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  frequency: number;
  frequency_percent: number;
  restaurants: number;
  by_stars: Record<string, number>;
  star_percentages: Record<string, number>;
}

export type Category = 
  | "viande" 
  | "poisson" 
  | "crustace" 
  | "coquillage" 
  | "legume" 
  | "fruit" 
  | "champignon"
  | "fruit_sec";

export interface DailyDataPoint {
  date: string;
  value: number;
}

export interface Restaurant {
  id: string;
  city: string;
  postal: string;
  distinction: string;
  dishes: number;
  menus: number;
}

export interface Dish {
  id: number;
  name: string;
  restaurantId: number;
  stars: string;
  menuType: string;
  ingredients: string[];
  categories: string[];
}

export interface Technique {
  name: string;
  frequency: number;
}

export type CategoryFilter = "all" | Category;

export type StarFilter = "all" | "1 étoile" | "2 étoiles" | "3 étoiles" | "Sélectionné";
