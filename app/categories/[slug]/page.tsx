/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { DirectoryDockClient } from "directorydockclient";

import Link from "next/link";

import Image from "next/image";

import { truncateText } from "@/lib/utils";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [services, setServices] = useState<any[]>([]);

  const [category, setCategory] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchCategoryAndServices() {
      const key = process.env.NEXT_PUBLIC_DIRECTORY_DOCK_API_KEY;

      if (!key) {
        setError("API key not found. Please check your environment variables.");

        setIsLoading(false);

        return;
      }

      const client = new DirectoryDockClient(key);

      try {
        const [categoriesResponse, servicesResponse] = await Promise.all([
          client.getCategories(),

          client.getEntries(1, 100), // Fetch up to 100 services, adjust as needed
        ]);

        const foundCategory = categoriesResponse.find(
          (cat: any) => cat.slug === params.slug
        );

        if (!foundCategory) {
          setError("Category not found");

          setIsLoading(false);

          return;
        }

        setCategory(foundCategory);

        const filteredServices = servicesResponse.entries.filter(
          (service: any) =>
            service.categories && service.categories.includes(foundCategory.id)
        );

        setServices(filteredServices);
      } catch (err) {
        setError(
          "Failed to load category and services. Please try again later."
        );

        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategoryAndServices();
  }, [params.slug]);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <main className="container mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-300 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">{category?.name}</h1>

        <p className="text-gray-600 mb-8">{category?.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              href={`/${service.Slug.value}`}
              key={service.id}
              className="block bg-white rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl h-full flex flex-col overflow-hidden"
            >
              {service.Image && (
                <div className="relative w-full h-40">
                  <Image
                    src={service.Image.value}
                    alt={service.Name.value}
                    fill
                    style={{ objectFit: "cover" }}
                    className="w-full h-full"
                  />
                </div>
              )}

              <div className="p-6 flex-grow">
                <h3 className="font-semibold text-lg mb-2">
                  {service.Name.value}
                </h3>

                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  {truncateText(service.Description.value, 100)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {services.length === 0 && (
          <p className="text-center mt-8">
            No services found in this category.
          </p>
        )}
      </main>
    </div>
  );
}
