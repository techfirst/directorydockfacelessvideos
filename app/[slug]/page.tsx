/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { DirectoryDockClient } from "directorydockclient";
import Image from "next/image";

async function getService(slug: string) {
  const key = process.env.NEXT_PUBLIC_DIRECTORY_DOCK_API_KEY;
  if (!key) {
    console.error("API key not found");
    throw new Error(
      "API key not found. Please check your environment variables."
    );
  }

  console.log("Fetching service with slug:", slug);
  const client = new DirectoryDockClient(key);

  try {
    const entry = await client.getEntry(slug);
    console.log("Fetched service:", entry);
    return entry;
  } catch (error) {
    console.error("Failed to fetch service:", error);
    return null;
  }
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const [service, setService] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchService() {
      const fetchedService = await getService(params.slug);
      if (!fetchedService) {
        notFound();
      }
      setService(fetchedService);
    }
    fetchService();
  }, [params.slug]);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <main className="container mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div className="relative h-64 sm:h-80 md:h-96">
            <Image
              src={service.Image.value}
              alt={service.Name.value as string}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="p-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">
              {service.Name.value}
            </h1>
            <div className="prose prose-lg max-w-none text-gray-600 mb-8">
              <p>{service.Description.value}</p>
            </div>
            <a
              href={service.Url.value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              Visit {service.Name.value}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
