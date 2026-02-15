import Link from "next/link";
import { Database, Utensils, ArrowLeft, BarChart3 } from "lucide-react";

export default function AdminPage() {
  const tools = [
    {
      title: "Explorateur de Database",
      description: "Voir tous les plats sous forme de tableau avec leurs ingrédients extraits",
      href: "/admin/database",
      icon: Database,
      color: "bg-blue-500"
    },
    {
      title: "Vue par Restaurant",
      description: "Explorer les plats restaurant par restaurant avec détail des ingrédients",
      href: "/admin/restaurants",
      icon: Utensils,
      color: "bg-green-500"
    },
    {
      title: "Dashboard Principal",
      description: "Retourner à l'interface d'analyse principale",
      href: "/",
      icon: BarChart3,
      color: "bg-gray-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              Retour
            </Link>
            <h1 className="text-2xl font-bold">Admin Menu Mine</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-white border-2 border-transparent hover:border-black rounded-xl p-6 transition-all hover:shadow-lg"
            >
              <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">{tool.title}</h2>
              <p className="text-gray-600">{tool.description}</p>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 bg-white border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Statistiques Database</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">214</div>
              <div className="text-sm text-gray-500">Ingrédients</div>
            </div>
            <div>
              <div className="text-3xl font-bold">2,857</div>
              <div className="text-sm text-gray-500">Plats</div>
            </div>
            <div>
              <div className="text-3xl font-bold">188</div>
              <div className="text-sm text-gray-500">Restaurants</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
