/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";

import { DirectoryDockClient } from "directorydockclient";

import Link from "next/link";

export default function CategoryBrowser() {
  const [categories, setCategories] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      const key = process.env.NEXT_PUBLIC_DIRECTORY_DOCK_API_KEY;

      if (!key) {
        setError("API key not found. Please check your environment variables.");

        setIsLoading(false);

        return;
      }

      const client = new DirectoryDockClient(key);

      try {
        const categoriesResponse = await client.getCategories();

        console.log(categoriesResponse);

        setCategories(categoriesResponse);
      } catch (err) {
        setError("Failed to load categories. Please try again later.");

        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Browse by categories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              href={`/categories/${category.slug}`}
              key={category.id}
              className="block"
            >
              <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl h-full flex flex-col">
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>

                <p className="text-gray-600 flex-grow">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
