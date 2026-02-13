import ingredientsDataRaw from "@/data/ingredients.json";
import dishesDataRaw from "@/data/dishes.json";
import { Ingredient, Dish } from "@/lib/types";
import IngredientDetailClient from "./client";

const ingredientsData = ingredientsDataRaw as Ingredient[];
const dishesData = dishesDataRaw as Dish[];

export function generateStaticParams() {
  return ingredientsData.map((ingredient) => ({
    slug: ingredient.id,
  }));
}

interface PageProps {
  params: {
    slug: string;
  };
}

export default function IngredientDetailPage({ params }: PageProps) {
  const ingredient = ingredientsData.find((i) => i.id === params.slug);

  if (!ingredient) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Ingrédient introuvable</h1>
        <p className="text-muted-foreground">L'ingrédient demandé n'a pas été trouvé.</p>
      </div>
    );
  }

  // Filter dishes that contain this ingredient
  const dishesWithIngredient = dishesData.filter((dish) => 
    dish.ingredients && dish.ingredients.includes(ingredient.name)
  );

  return (
    <IngredientDetailClient 
      ingredient={ingredient} 
      ingredientsData={ingredientsData}
      dishesWithIngredient={dishesWithIngredient}
    />
  );
}
