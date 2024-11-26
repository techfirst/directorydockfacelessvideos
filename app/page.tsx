/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import CategoryButtons from "./components/CategoryButtons";

import { getFieldValue } from '@/lib/helpers';

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

  const [submitFields, setSubmitFields] = useState<any[]>([]);
  const [submitFormData, setSubmitFormData] = useState<Record<string, any>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFirstRender = useRef(true);

  const handleAccordionChange = (value: string[]) => {
    setOpenItems(value);
  };

  useEffect(() => {
    if (!isFirstRender.current) return;

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

  // Modify the initial data fetch
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsCategoriesLoading(true);
        setIsLoading(true);

        // Fetch categories, entries, and filters in parallel
        const [categoriesResponse, entriesResponse, filtersResponse] =
          await Promise.all([
            fetch("/api/categories").then((res) => res.json()),
            fetch("/api/entries?page=1&limit=10").then((res) => res.json()),
            fetch("/api/filters").then((res) => res.json()),
          ]);

        if (categoriesResponse.error) {
          throw new Error(categoriesResponse.error);
        }
        if (entriesResponse.error) {
          throw new Error(entriesResponse.error);
        }
        if (filtersResponse.error) {
          throw new Error(filtersResponse.error);
        }

        setFilters(filtersResponse.filters);
        setCategories(categoriesResponse.categories);

        // Create category map
        const newCategoryMap: Record<string, string> = {};
        categoriesResponse.categories.forEach((category: any) => {
          newCategoryMap[category.id] = category.name;
        });
        setCategoryMap(newCategoryMap);
        setIsCategoryMapReady(true);

        // Set initial services
        setServices(entriesResponse.services);
        setFilteredServices(entriesResponse.services);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
        setIsCategoriesLoading(false);
      }
    }

    fetchInitialData();
  }, []); // Only run once on mount

  // Modify the debouncedFetchData to only handle filtering
  const debouncedFetchData = useCallback(
    debounce((services: any[], filters: Record<string, string[]>) => {
      const filteredServices = applyFiltersToServices(
        services,
        filters,
        selectedCategories
      );
      setFilteredServices(filteredServices);
    }, 300),
    [selectedCategories]
  );

  // Update useEffect for filter changes
  useEffect(() => {
    if (services.length > 0) {
      debouncedFetchData(services, activeFilters);
    }
  }, [activeFilters, services, debouncedFetchData]);

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

        // Special handling for Tags field which has a nested value array
        if (key === "Tags") {
          const tagValues = service[key]?.value || [];
          return values.some((value) => tagValues.includes(value));
        }

        const serviceValue = service[key]?.value;

        // Rest of your existing comparisons...
        if (typeof serviceValue === "boolean") {
          return values.includes(serviceValue.toString());
        }

        if (typeof serviceValue === "number") {
          return values.some((value) => parseFloat(value) === serviceValue);
        }

        if (serviceValue instanceof Date) {
          return values.some(
            (value) => new Date(value).getTime() === serviceValue.getTime()
          );
        }

        if (typeof serviceValue === "string") {
          return values.some((value) =>
            serviceValue.toLowerCase().includes(value.toLowerCase())
          );
        }

        return false;
      });
    });
  };

  // First, create a function to update the URL outside of the render cycle
  const updateURL = useCallback(
    (filters: Record<string, string[]>) => {
      // Wrap the router update in a setTimeout to move it out of the render cycle
      setTimeout(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, values]) => {
          if (values.length > 0) {
            params.set(key, values.join(","));
          }
        });

        // Add categories to URL if they exist
        if (selectedCategories.length > 0) {
          params.set("categories", selectedCategories.join(","));
        }

        router.replace(`?${params.toString()}`, { scroll: false });
      }, 0);
    },
    [router, selectedCategories]
  );

  // Modify handleFilterChange to batch state updates
  const handleFilterChange = (
    filterName: string,
    value: string | boolean | null,
    checked?: boolean
  ) => {
    // Use a callback to ensure we're working with latest state
    setActiveFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      if (value === null || value === "") {
        delete newFilters[filterName];
      } else if (typeof value === "boolean") {
        newFilters[filterName] = [value.toString()];
      } else {
        if (checked !== undefined) {
          if (checked) {
            newFilters[filterName] = [...(newFilters[filterName] || []), value];
          } else {
            newFilters[filterName] = (newFilters[filterName] || []).filter(
              (v) => v !== value
            );
          }

          if (newFilters[filterName]?.length === 0) {
            delete newFilters[filterName];
          }
        } else {
          newFilters[filterName] = [value];
        }
      }

      return newFilters;
    });
  };

  // Create a state update handler for categories
  const handleCategoryChange = useCallback(
    (categoryId: string, checked: boolean) => {
      setSelectedCategories((prev) => {
        const newCategories = checked
          ? [...prev, categoryId]
          : prev.filter((id) => id !== categoryId);

        // Use requestAnimationFrame to defer the URL update
        requestAnimationFrame(() => {
          const params = new URLSearchParams(window.location.search);
          if (newCategories.length > 0) {
            params.set("categories", newCategories.join(","));
          } else {
            params.delete("categories");
          }
          router.replace(`?${params.toString()}`, { scroll: false });
        });

        return newCategories;
      });
    },
    [router]
  );

  const faqItems = [
    {
      question: "What is Faceless video list?",
      answer:
        "Faceless video list is a comprehensive platform that showcases various AI-powered tools and services for creating faceless video content. It helps content creators, marketers, and businesses discover and compare the best AI solutions for their video projects, streamlining the process of finding the right tools for their specific needs.",
    },
    {
      question:
        "How can I use Faceless video list to find the best AI video tools?",
      answer:
        "You can use Faceless video list to search for specific AI video tools, compare different services, and find the best solutions for your faceless video creation needs. Simply browse the listings, use the search function to find relevant tools, or apply filters based on categories, pricing, and features to narrow down your options. Our directory provides detailed information about each tool, including key features, pricing, and user reviews.",
    },
    {
      question: "Is Faceless video list free to use?",
      answer:
        "Yes, browsing and searching Faceless video list is completely free. We believe in providing open access to information about AI video tools to help creators make informed decisions. However, please note that the individual tools and services listed may have their own pricing structures, which you'll need to check directly with the service providers.",
    },
    {
      question:
        "How often is Faceless video list updated with new tools and services?",
      answer:
        "We strive to keep Faceless video list up-to-date with the latest AI video creation tools and services. Our team regularly reviews and adds new entries to ensure you have access to the most current information. We also encourage service providers to submit their tools for inclusion, which helps us maintain a comprehensive and current directory.",
    },
    {
      question: "What types of AI video tools can I find in the directory?",
      answer:
        "Faceless video list covers a wide range of AI-powered video creation tools, including but not limited to: text-to-video generators, video editing software with AI capabilities, AI-powered animation tools, voice synthesis for video narration, automated video captioning and subtitling services, AI-driven video analytics tools, and more. Whether you're looking for tools to create explainer videos, social media content, or educational materials, you'll find relevant options in our directory.",
    },
    {
      question: "How can I add my AI video service to Faceless video list?",
      answer:
        "To add your service to Faceless video list, click on the 'Submit Service' button at the top of the page. You'll be guided through a simple process to submit your service for review. Our team will verify the information and, if approved, add your service to the directory. We strive to maintain a high-quality list of services, so please ensure your submission is accurate, relevant, and provides value to our users.",
    },
    {
      question:
        "Can I leave reviews or ratings for the AI video tools listed in Faceless video list?",
      answer:
        "Currently, we don't have a built-in review system, but we're considering adding this feature in the future. In the meantime, we encourage users to share their experiences with specific tools in our community forums or on social media. You can also contact us if you have significant feedback about a listed service that you believe should be reflected in our directory.",
    },
    {
      question:
        "How does Faceless video list ensure the quality and accuracy of listed services?",
      answer:
        "We have a dedicated team that researches and verifies information about each service before it's added to our directory. We also regularly update existing listings to ensure accuracy. However, as AI technology evolves rapidly, we encourage users to always check the latest information directly with the service providers. If you notice any discrepancies or outdated information, please let us know, and we'll investigate and update accordingly.",
    },
    {
      question:
        "Are the AI video tools in Faceless video list suitable for beginners?",
      answer:
        "Our directory includes AI video tools suitable for users of all skill levels, from beginners to advanced professionals. Many of the listed tools are designed with user-friendly interfaces and offer templates or automated features that make video creation accessible to newcomers. We recommend using our filtering options to find tools that match your experience level and specific needs.",
    },
    {
      question:
        "What is the future of AI in video creation, and how does Faceless video list stay current?",
      answer:
        "AI is rapidly transforming video creation, making it more accessible, efficient, and innovative. We expect to see advancements in areas like real-time video generation, personalized content creation, and enhanced video editing capabilities. Faceless video list stays current by continuously monitoring the industry, attending relevant conferences, and maintaining relationships with AI video tool developers. We regularly update our listings and add new categories to reflect the latest trends and technologies in AI-powered video creation.",
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
    async function fetchSubmitFields() {
      try {
        const response = await fetch("/api/submit-fields");
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setSubmitFields(data.submitFields);
      } catch (err) {
        console.error("Error fetching submit fields:", err);
        setSubmitError(
          "Failed to load submission form. Please try again later."
        );
      }
    }

    fetchSubmitFields();
  }, []);

  const handleSubmitFormChange = (fieldName: string, value: any) => {
    setSubmitFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitFormData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSubmitSuccess(true);
      setSubmitFormData({}); // Clear the form after successful submission
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      if (error instanceof Error) {
        setSubmitError(`Failed to submit the form: ${error.message}`);
      } else {
        setSubmitError("Failed to submit the form: An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const commonProps = {
      id: field.FieldName,
      name: field.FieldName,
      required: field.Required,
      value: submitFormData[field.FieldName] || "",
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => handleSubmitFormChange(field.FieldName, e.target.value),
    };

    switch (field.FieldType) {
      case "text":
      case "email":
      case "url":
      case "phone":
        return <Input {...commonProps} type={field.FieldType} />;

      case "number":
      case "currency":
        return <Input {...commonProps} type="number" />;

      case "date":
        return <Input {...commonProps} type="date" />;

      case "richText":
      case "textarea":
        return (
          <Textarea
            {...commonProps}
            placeholder={field.Placeholder || `Enter ${field.FieldLabel}`}
            className="min-h-[100px]" // Add minimum height for better UX
          />
        );

      case "boolean":
        return (
          <Checkbox
            id={field.FieldName}
            name={field.FieldName}
            checked={submitFormData[field.FieldName] || false}
            onCheckedChange={(checked) =>
              handleSubmitFormChange(field.FieldName, checked)
            }
          />
        );

      case "dropdown":
        return (
          <Select
            value={submitFormData[field.FieldName] || ""}
            onValueChange={(value) =>
              handleSubmitFormChange(field.FieldName, value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.Options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "image":
        return (
          <Input
            {...commonProps}
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              handleSubmitFormChange(field.FieldName, file);
            }}
          />
        );

      case "multiselect":
        return (
          <div
            className="space-y-2 border p-4 rounded-md"
            key={field.FieldName}
          >
            <div className="text-sm font-medium mb-2">{field.FieldLabel}</div>
            {field.Options.map((option: string) => (
              <div
                key={`${field.FieldName}-${option}`}
                className="flex items-center gap-2"
              >
                <Checkbox
                  id={`${field.FieldName}-${option}`}
                  checked={
                    Array.isArray(submitFormData[field.FieldName]) &&
                    submitFormData[field.FieldName].includes(option)
                  }
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(
                      submitFormData[field.FieldName]
                    )
                      ? submitFormData[field.FieldName]
                      : [];

                    const newValues = checked
                      ? [...currentValues, option]
                      : currentValues.filter(
                          (value: string) => value !== option
                        );

                    handleSubmitFormChange(field.FieldName, newValues);
                  }}
                />
                <label
                  htmlFor={`${field.FieldName}-${option}`}
                  className="text-sm cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return <Input {...commonProps} />;
    }
  };

  // Move URL updates to a separate effect
  useEffect(() => {
    const params = new URLSearchParams();

    // Add active filters to URL
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values?.length > 0) {
        params.set(key, values.join(","));
      }
    });

    // Add categories to URL
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }

    // Use requestAnimationFrame to ensure we're not updating during render
    requestAnimationFrame(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }, [activeFilters, selectedCategories, router]);

  return (
    <>
      <section className="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-[30vh] flex items-center overflow-hidden">
        {/* Hero background image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop"
            alt="Abstract space background with stars and nebula"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-80"
            priority
            sizes="100vw"
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/25 to-gray-800/50" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 text-center relative z-10 py-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Faceless video list
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Discover and compare top AI-powered tools for creating captivating faceless video content
          </p>
          <div className="max-w-3xl mx-auto">
            <div className="relative mb-8">
              <Input
                className="w-full pr-12 py-6 border-0 rounded-full bg-white/10 backdrop-blur-md text-white placeholder-gray-400 shadow-lg focus:ring-2 focus:ring-white/25 transition-all duration-300"
                placeholder={`Search among ${services.length} services ...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery ? (
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-300"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-5 w-5" />
                </button>
              ) : (
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              )}
            </div>
            <CategoryButtons
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
            />
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
                ) : categories?.length > 0 ? (
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

                          case "textarea":
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

                          case "multiselect":
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
              {visibleServices.map((service, index) => (
                <a
                  key={`service-${index}`}
                  href={`/${getFieldValue(service, 'Slug')}`}
                  className="group block bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg h-full flex flex-col overflow-hidden"
                >
                  {service.Image && service.Image.value && (
                    <div className="relative w-full h-48 overflow-hidden">
                      <Image
                        src={String(getFieldValue(service, 'Image'))}
                        alt={String(getFieldValue(service, 'Name'))}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        priority={false}
                      />
                    </div>
                  )}
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="font-medium text-lg mb-2 text-gray-900 dark:text-gray-100">
                      {getFieldValue(service, 'Name')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {truncateText(String(getFieldValue(service, 'Description')), 100)}
                    </p>
                    {getFieldValue(service, 'Tags') && Array.isArray(getFieldValue(service, 'Tags')) && (
                      <div className="mt-auto flex flex-wrap gap-2">
                        {(getFieldValue(service, 'Tags') as string[])
                          .slice(0, 3)
                          .map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        {getFieldValue(service, 'Tags').length > 3 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            +{getFieldValue(service, 'Tags').length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>

            {!showAllServices && filteredServices.length > visibleServices.length && (
              <div className="mt-12 text-center">
                <Button
                  onClick={() => setShowAllServices(true)}
                  variant="outline"
                  className="px-8 py-6 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  Show all services
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

      <section id="submit-form" className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Submit faceless video service
          </h2>

          <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md"
          >
            <div className="grid gap-6">
              {submitFields.map((field) => (
                <div key={field.FieldName}>
                  <Label htmlFor={field.FieldName}>
                    {field.FieldLabel}
                    {field.Required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>

          {submitError && (
            <p className="text-red-500 text-center mt-4">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="text-green-500 text-center mt-4">
              Your service has been submitted successfully!
            </p>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-center mb-16 text-gray-600 dark:text-gray-300">
            Got questions? We've got answers.
          </p>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300"
              >
                <button
                  className="w-full px-6 py-4 text-left text-gray-900 dark:text-white font-medium flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  {item.question}
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 py-4 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/25">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
