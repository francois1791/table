import ingredientsDataRaw from "@/data/ingredients.json";
import { Ingredient } from "@/lib/types";
import IngredientDetailClient from "./client";

const ingredientsData = ingredientsDataRaw as Ingredient[];

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
        <h1 className="text-2xl font-bold mb-4">Ingredient not found</h1>
        <p className="text-muted-foreground">The requested ingredient could not be found.</p>
      </div>
    );
  }

  return <IngredientDetailClient ingredient={ingredient} ingredientsData={ingredientsData} />;
}