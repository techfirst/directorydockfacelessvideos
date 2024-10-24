/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect, useCallback } from "react";

import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Checkbox } from "@/components/ui/checkbox";

import { Label } from "@/components/ui/label";

import { DirectoryDockClient } from "directorydockclient";

import Image from "next/image";

import * as React from "react";

import * as AccordionPrimitive from "@radix-ui/react-accordion";

import clsx from "clsx";

import { truncateText } from "@/lib/utils"; // You'll need to create this utility function

import { useRouter, useSearchParams } from "next/navigation";

import debounce from "lodash/debounce";

import CategoryBrowser from "./components/CategoryBrowser";

const cn = (...classes: (string | undefined)[]) => {
  return clsx(classes);
};

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));

AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",

        className
      )}
      {...props}
    >
      {children}

      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));

AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",

      className
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = "AccordionContent";

export default function Component() {
  const router = useRouter();

  const [searchParamsState, setSearchParamsState] =
    useState<URLSearchParams | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const [services, setServices] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<any[]>([]);

  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const [showAllServices, setShowAllServices] = useState(false);

  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );

  const [searchQuery, setSearchQuery] = useState("");

  const [filteredServices, setFilteredServices] = useState<any[]>([]);

  const [categories, setCategories] = useState<any[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Add this state for category loading

  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  const [isCategoryMapReady, setIsCategoryMapReady] = useState(false);

  const handleAccordionChange = (value: string[]) => {
    setOpenItems(value);
  };

  useEffect(() => {
    // This effect runs only on the client side

    const params = new URLSearchParams(window.location.search);

    setSearchParamsState(params);

    // Parse categories from URL

    const urlCategories = params.get("categories")?.split(",") || [];

    setSelectedCategories(urlCategories);

    // Parse other filters

    const urlFilters: Record<string, string[]> = {};

    params.forEach((value, key) => {
      if (key !== "categories") {
        urlFilters[key] = value.split(",");
      }
    });

    setActiveFilters(urlFilters);
  }, []);

  const debouncedFetchData = useCallback(
    debounce(async (filters: Record<string, string[]>) => {
      const key = process.env.NEXT_PUBLIC_DIRECTORY_DOCK_API_KEY;

      if (!key) {
        setError("API key not found. Please check your environment variables.");

        setIsLoading(false);

        return;
      }

      const client = new DirectoryDockClient(key);

      try {
        setIsCategoriesLoading(true);

        const [servicesResponse, filtersResponse, categoriesResponse] =
          await Promise.all([
            client.getEntries(1, 10),

            client.getFilters(),

            client.getCategories(),
          ]);

        setFilters(filtersResponse);

        console.log("Categories received:", categoriesResponse);

        // Update categories and create a map of category IDs to names

        setCategories(categoriesResponse);

        const newCategoryMap: Record<string, string> = {};

        categoriesResponse.forEach((category: any) => {
          newCategoryMap[category.id] = category.name;
        });

        setCategoryMap(newCategoryMap);

        setIsCategoryMapReady(true);

        // Apply filters to the fetched services

        const filteredServices = applyFiltersToServices(
          servicesResponse.entries,

          filters,

          selectedCategories
        );

        setServices(filteredServices);
      } catch (err) {
        setError("Failed to load data. Please try again later.");

        console.error(err);
      } finally {
        setIsLoading(false);

        setIsCategoriesLoading(false);
      }
    }, 300),

    [selectedCategories]
  );

  useEffect(() => {
    debouncedFetchData(activeFilters);
  }, [activeFilters, debouncedFetchData]);

  const applyFiltersToServices = (
    services: any[],

    filters: Record<string, string[]>,

    selectedCategories: string[]
  ) => {
    return services.filter((service) => {
      // Check if the service belongs to any of the selected categories

      if (selectedCategories.length > 0) {
        const serviceCategories = service.categories || [];

        if (
          !selectedCategories.some((cat) => serviceCategories.includes(cat))
        ) {
          return false;
        }
      }

      return Object.entries(filters).every(([key, values]) => {
        if (values.length === 0) return true;

        const serviceValue = service[key]?.value;

        // Handle boolean comparisons

        if (typeof serviceValue === "boolean") {
          return values.includes(serviceValue.toString());
        }

        // Handle number comparisons

        if (typeof serviceValue === "number") {
          return values.some((value) => parseFloat(value) === serviceValue);
        }

        // Handle date comparisons

        if (serviceValue instanceof Date) {
          return values.some(
            (value) => new Date(value).getTime() === serviceValue.getTime()
          );
        }

        // Handle string comparisons (including partial matches for text fields)

        if (typeof serviceValue === "string") {
          return values.some((value) =>
            serviceValue.toLowerCase().includes(value.toLowerCase())
          );
        }

        return false;
      });
    });
  };

  const handleFilterChange = (
    filterName: string,

    value: string | boolean | null,

    checked?: boolean
  ) => {
    setActiveFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      if (value === null || value === "") {
        // Remove the filter if value is null or empty string

        delete newFilters[filterName];
      } else if (typeof value === "boolean") {
        newFilters[filterName] = [value.toString()];
      } else {
        // Handle multiple selections for dropdown filters

        if (checked !== undefined) {
          if (checked) {
            newFilters[filterName] = [...(newFilters[filterName] || []), value];
          } else {
            newFilters[filterName] = (newFilters[filterName] || []).filter(
              (v) => v !== value
            );
          }

          // Remove the filter if all options are unchecked

          if (newFilters[filterName].length === 0) {
            delete newFilters[filterName];
          }
        } else {
          newFilters[filterName] = [value];
        }
      }

      // Update URL based on the new filters

      const params = new URLSearchParams();

      Object.entries(newFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          params.set(key, values.join(","));
        }
      });

      router.replace(`?${params.toString()}`, { scroll: false });

      return newFilters;
    });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      const newCategories = checked
        ? [...prev, categoryId]
        : prev.filter((id) => id !== categoryId);

      // Update URL

      const params = new URLSearchParams(window.location.search);

      if (newCategories.length > 0) {
        params.set("categories", newCategories.join(","));
      } else {
        params.delete("categories");
      }

      router.replace(`?${params.toString()}`, { scroll: false });

      return newCategories;
    });
  };

  const faqItems = [
    {
      question: "What is AI Video Directory?",
      answer:
        "AI Video Directory is a comprehensive platform that showcases various AI-powered tools and services for creating faceless video content. It helps content creators, marketers, and businesses discover and compare the best AI solutions for their video projects, streamlining the process of finding the right tools for their specific needs.",
    },
    {
      question:
        "How can I use AI Video Directory to find the best AI video tools?",
      answer:
        "You can use AI Video Directory to search for specific AI video tools, compare different services, and find the best solutions for your faceless video creation needs. Simply browse the listings, use the search function to find relevant tools, or apply filters based on categories, pricing, and features to narrow down your options. Our directory provides detailed information about each tool, including key features, pricing, and user reviews.",
    },
    {
      question: "Is the AI Video Directory free to use?",
      answer:
        "Yes, browsing and searching the AI Video Directory is completely free. We believe in providing open access to information about AI video tools to help creators make informed decisions. However, please note that the individual tools and services listed may have their own pricing structures, which you'll need to check directly with the service providers.",
    },
    {
      question:
        "How often is the AI Video Directory updated with new tools and services?",
      answer:
        "We strive to keep the AI Video Directory up-to-date with the latest AI video creation tools and services. Our team regularly reviews and adds new entries to ensure you have access to the most current information. We also encourage service providers to submit their tools for inclusion, which helps us maintain a comprehensive and current directory.",
    },
    {
      question: "What types of AI video tools can I find in the directory?",
      answer:
        "The AI Video Directory covers a wide range of AI-powered video creation tools, including but not limited to: text-to-video generators, video editing software with AI capabilities, AI-powered animation tools, voice synthesis for video narration, automated video captioning and subtitling services, AI-driven video analytics tools, and more. Whether you're looking for tools to create explainer videos, social media content, or educational materials, you'll find relevant options in our directory.",
    },
    {
      question: "How can I add my AI video service to the directory?",
      answer:
        "To add your service to the AI Video Directory, click on the 'Submit Service' button at the top of the page. You'll be guided through a simple process to submit your service for review. Our team will verify the information and, if approved, add your service to the directory. We strive to maintain a high-quality list of services, so please ensure your submission is accurate, relevant, and provides value to our users.",
    },
    {
      question:
        "Can I leave reviews or ratings for the AI video tools listed in the directory?",
      answer:
        "Currently, we don't have a built-in review system, but we're considering adding this feature in the future. In the meantime, we encourage users to share their experiences with specific tools in our community forums or on social media. You can also contact us if you have significant feedback about a listed service that you believe should be reflected in our directory.",
    },
    {
      question:
        "How does AI Video Directory ensure the quality and accuracy of listed services?",
      answer:
        "We have a dedicated team that researches and verifies information about each service before it's added to our directory. We also regularly update existing listings to ensure accuracy. However, as AI technology evolves rapidly, we encourage users to always check the latest information directly with the service providers. If you notice any discrepancies or outdated information, please let us know, and we'll investigate and update accordingly.",
    },
    {
      question:
        "Are the AI video tools in the directory suitable for beginners?",
      answer:
        "Our directory includes AI video tools suitable for users of all skill levels, from beginners to advanced professionals. Many of the listed tools are designed with user-friendly interfaces and offer templates or automated features that make video creation accessible to newcomers. We recommend using our filtering options to find tools that match your experience level and specific needs.",
    },
    {
      question:
        "What is the future of AI in video creation, and how does AI Video Directory stay current?",
      answer:
        "AI is rapidly transforming video creation, making it more accessible, efficient, and innovative. We expect to see advancements in areas like real-time video generation, personalized content creation, and enhanced video editing capabilities. AI Video Directory stays current by continuously monitoring the industry, attending relevant conferences, and maintaining relationships with AI video tool developers. We regularly update our listings and add new categories to reflect the latest trends and technologies in AI-powered video creation.",
    },
  ];

  const visibleServices = showAllServices
    ? filteredServices
    : filteredServices.slice(0, 32);

  const removeFilter = (key: string, value: string) => {
    if (key === "categories") {
      setSelectedCategories((prev) => prev.filter((id) => id !== value));
    } else {
      setActiveFilters((prevFilters) => {
        const newFilters = { ...prevFilters };

        if (Array.isArray(newFilters[key])) {
          newFilters[key] = newFilters[key].filter((v) => v !== value);

          if (newFilters[key].length === 0) {
            delete newFilters[key];
          }
        } else {
          delete newFilters[key];
        }

        return newFilters;
      });
    }

    // Update URL

    const params = new URLSearchParams(window.location.search);

    if (key === "categories") {
      const newCategories = selectedCategories.filter((id) => id !== value);

      if (newCategories.length > 0) {
        params.set("categories", newCategories.join(","));
      } else {
        params.delete("categories");
      }
    } else {
      if (params.has(key)) {
        const values = params

          .get(key)!
          .split(",")

          .filter((v) => v !== value);

        if (values.length > 0) {
          params.set(key, values.join(","));
        } else {
          params.delete(key);
        }
      }
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSearch = () => {
    const lowercasedQuery = searchQuery.toLowerCase();

    const filtered = services.filter(
      (service) =>
        service.Name.value.toLowerCase().includes(lowercasedQuery) ||
        service.Description.value.toLowerCase().includes(lowercasedQuery)
    );

    setFilteredServices(filtered);
  };

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredServices(services);
    } else {
      handleSearch();
    }
  }, [searchQuery, services]);

  // Add this useEffect to log categories when they change

  useEffect(() => {
    console.log("Categories updated:", categories);
  }, [categories]);

  return (
    <>
      <section className="bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Faceless video list: Your ultimate AI video service directory
          </h1>

          <p className="text-xl mb-8">
            Discover and compare top AI-powered tools for creating captivating
            faceless video content
          </p>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Input
                className="w-full pr-10 py-2 border-none rounded-full bg-white/90 backdrop-blur-sm text-black placeholder-gray-500 shadow-lg focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                placeholder={`Search among ${services.length} services ...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-300 ease-in-out"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 relative">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Faceless video services</h2>

          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filter results
          </Button>
        </div>

        {/* Display active filters */}

        {(Object.keys(activeFilters).length > 0 ||
          (selectedCategories.length > 0 && isCategoryMapReady)) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, values]) =>
              (Array.isArray(values) ? values : [values]).map((value) => (
                <Button
                  key={`${key}-${value}`}
                  variant="outline"
                  size="sm"
                  onClick={() => removeFilter(key, value)}
                >
                  {key}:{" "}
                  {value === "true" ? "Yes" : value === "false" ? "No" : value}{" "}
                  <X className="ml-2 h-4 w-4" />
                </Button>
              ))
            )}

            {isCategoryMapReady &&
              selectedCategories.map((categoryId) => (
                <Button
                  key={`category-${categoryId}`}
                  variant="outline"
                  size="sm"
                  onClick={() => removeFilter("categories", categoryId)}
                >
                  Category: {categoryMap[categoryId]}{" "}
                  <X className="ml-2 h-4 w-4" />
                </Button>
              ))}
          </div>
        )}

        {/* Filter Sidebar */}

        <aside
          className={`fixed top-0 right-0 h-full w-80 bg-background shadow-lg transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
            isFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 flex-grow overflow-y-auto">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="absolute top-4 right-4 text-foreground hover:text-muted-foreground"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-semibold mb-6">Filters</h2>

            {/* Category filter section */}

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Categories</h3>

              <div className="space-y-2">
                {isCategoriesLoading ? (
                  <p>Loading categories...</p>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category.id, checked === true)
                        }
                      />

                      <label
                        htmlFor={`category-${category.id}`}
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p>No categories available</p>
                )}
              </div>
            </div>

            {/* Existing filters */}

            <Accordion
              type="multiple"
              value={openItems}
              onValueChange={handleAccordionChange}
              className="w-full"
            >
              {filters.map((filter, index) => (
                <AccordionItem key={filter.fieldName} value={`item-${index}`}>
                  <AccordionTrigger>{filter.fieldName}</AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-2">
                      {(() => {
                        switch (filter.fieldType) {
                          case "text":

                          case "email":

                          case "url":

                          case "phone":
                            return (
                              <Input
                                id={`${filter.fieldName}-input`}
                                type={filter.fieldType}
                                value={
                                  activeFilters[filter.fieldName]?.[0] || ""
                                }
                                onChange={(e) =>
                                  handleFilterChange(
                                    filter.fieldName,

                                    e.target.value
                                  )
                                }
                                placeholder={`Enter ${filter.fieldName.toLowerCase()}`}
                              />
                            );

                          case "number":

                          case "currency":
                            return (
                              <Input
                                id={`${filter.fieldName}-input`}
                                type="number"
                                value={
                                  activeFilters[filter.fieldName]?.[0] || ""
                                }
                                onChange={(e) =>
                                  handleFilterChange(
                                    filter.fieldName,

                                    e.target.value
                                  )
                                }
                                placeholder={`Enter ${filter.fieldName.toLowerCase()}`}
                              />
                            );

                          case "date":
                            return (
                              <Input
                                id={`${filter.fieldName}-input`}
                                type="date"
                                value={
                                  activeFilters[filter.fieldName]?.[0] || ""
                                }
                                onChange={(e) =>
                                  handleFilterChange(
                                    filter.fieldName,

                                    e.target.value
                                  )
                                }
                              />
                            );

                          case "richText":
                            return (
                              <Textarea
                                id={`${filter.fieldName}-input`}
                                value={
                                  activeFilters[filter.fieldName]?.[0] || ""
                                }
                                onChange={(e) =>
                                  handleFilterChange(
                                    filter.fieldName,

                                    e.target.value
                                  )
                                }
                                placeholder={`Enter ${filter.fieldName.toLowerCase()}`}
                              />
                            );

                          case "boolean":
                            return (
                              <div className="flex items-center space-x-2">
                                <Label htmlFor={`${filter.fieldName}-switch`}>
                                  {filter.fieldName}
                                </Label>

                                <select
                                  id={`${filter.fieldName}-switch`}
                                  value={
                                    activeFilters[filter.fieldName]?.[0] || ""
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    if (value === "") {
                                      handleFilterChange(
                                        filter.fieldName,

                                        null
                                      );
                                    } else {
                                      handleFilterChange(
                                        filter.fieldName,

                                        value === "true"
                                      );
                                    }
                                  }}
                                  className="border rounded px-2 py-1"
                                >
                                  <option value="">Any</option>

                                  <option value="true">Yes</option>

                                  <option value="false">No</option>
                                </select>
                              </div>
                            );

                          case "dropdown":
                            return (
                              <div className="space-y-2">
                                {filter.options.map((option: string) => (
                                  <div
                                    key={option}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`${filter.fieldName}-${option}`}
                                      checked={
                                        activeFilters[
                                          filter.fieldName
                                        ]?.includes(option) || false
                                      }
                                      onCheckedChange={(checked) => {
                                        handleFilterChange(
                                          filter.fieldName,

                                          option,

                                          checked === true
                                        );
                                      }}
                                    />

                                    <Label
                                      htmlFor={`${filter.fieldName}-${option}`}
                                    >
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            );

                          default:
                            return null;
                        }
                      })()}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="p-4 border-t border-gray-200 bg-background">
            <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
              Show results
            </Button>
          </div>
        </aside>

        {/* Overlay */}

        {isFilterOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsFilterOpen(false)}
          ></div>
        )}

        {isLoading ? (
          <p>Loading services...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleServices.map((service) => (
                <a
                  key={service.Id}
                  href={`/${service.Slug.value}`}
                  className="block bg-white rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl h-full flex flex-col overflow-hidden"
                >
                  {service.Image && service.Image.value && (
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

                    <p className="text-sm text-muted-foreground">
                      {truncateText(service.Description.value, 100)}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {!showAllServices &&
              filteredServices.length > visibleServices.length && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={() => setShowAllServices(true)}
                    className="bg-orange-300 text-gray-900 hover:bg-orange-400 transition duration-300 ease-in-out"
                  >
                    Show all
                  </Button>
                </div>
              )}

            {filteredServices.length === 0 && (
              <p className="text-center mt-8">
                No services found matching your search criteria.
              </p>
            )}
          </>
        )}
      </section>

      {/* Add the CategoryBrowser component here */}

      <CategoryBrowser />

      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Submit Your AI Video Service
          </h2>

          <form className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="grid gap-6">
              <div>
                <Label htmlFor="service-name">Service Name</Label>

                <Input
                  id="service-name"
                  placeholder="Enter your service name"
                />
              </div>

              <div>
                <Label htmlFor="service-description">Service Description</Label>

                <Textarea
                  id="service-description"
                  placeholder="Describe your AI video service"
                />
              </div>

              <div>
                <Label htmlFor="service-url">Service URL</Label>

                <Input
                  id="service-url"
                  type="url"
                  placeholder="https://your-service-url.com"
                />
              </div>

              <div>
                <Label htmlFor="contact-email">Contact Email</Label>

                <Input
                  id="contact-email"
                  type="email"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label className="flex items-center space-x-2">
                  <Checkbox id="terms" />

                  <span>I agree to the terms and conditions</span>
                </Label>
              </div>

              <Button type="submit">Submit</Button>
            </div>
          </form>
        </div>
      </section>

      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-2">F.A.Q.</h2>

          <p className="text-xl text-center mb-12">
            Got questions? We&apos;ve got answers.
          </p>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedFaq === index ? "ring-2 ring-red-500" : ""
                }`}
              >
                <button
                  className="w-full px-6 py-4 text-left text-gray-900 font-semibold flex justify-between items-center hover:bg-gray-50 transition-colors duration-300"
                  onClick={() =>
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                >
                  {item.question}

                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-red-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>

                {expandedFaq === index && (
                  <div className="px-6 py-4 text-gray-700">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
