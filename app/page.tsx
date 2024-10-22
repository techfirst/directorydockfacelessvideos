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

  const handleAccordionChange = (value: string[]) => {
    setOpenItems(value);
  };

  useEffect(() => {
    // This effect runs only on the client side
    setSearchParamsState(new URLSearchParams(window.location.search));
  }, []);

  useEffect(() => {
    // Parse URL params and set initial filters
    if (searchParamsState) {
      const urlFilters: Record<string, string[]> = {};
      searchParamsState.forEach((value, key) => {
        urlFilters[key] = value.split(",");
      });
      setActiveFilters(urlFilters);
    }
  }, [searchParamsState]);

  const debouncedFetchData = useCallback(
    debounce(async (filters: Record<string, string[]>) => {
      // Your existing fetchData logic here
      const key = process.env.NEXT_PUBLIC_DIRECTORY_DOCK_API_KEY;
      if (!key) {
        setError("API key not found. Please check your environment variables.");
        setIsLoading(false);
        return;
      }

      const client = new DirectoryDockClient(key);

      try {
        const [servicesResponse, filtersResponse] = await Promise.all([
          client.getEntries(1, 10),
          client.getFilters(),
        ]);

        setFilters(filtersResponse);

        // Apply filters to the fetched services
        const filteredServices = applyFiltersToServices(
          servicesResponse.entries,
          filters
        );
        setServices(filteredServices);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetchData(activeFilters);
  }, [activeFilters, debouncedFetchData]);

  const applyFiltersToServices = (
    services: any[],
    filters: Record<string, string[]>
  ) => {
    return services.filter((service) => {
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

  const faqItems = [
    {
      question: "What is AI Video Directory?",
      answer:
        "AI Video Directory is a comprehensive platform that showcases various AI-powered tools and services for creating faceless video content. It helps content creators discover and compare the best solutions for their projects, streamlining the process of finding the right tools for their specific needs.",
    },
    {
      question: "How can I use AI Video Directory?",
      answer:
        "You can use AI Video Directory to search for specific AI video tools, compare different services, and find the best solutions for your faceless video creation needs. Simply browse the listings or use the search function to find relevant tools. You can also filter results based on categories, pricing, and features to narrow down your options.",
    },
    {
      question: "Is the AI Video Directory free to use?",
      answer:
        "Yes, browsing and searching the AI Video Directory is completely free. We believe in providing open access to information about AI video tools. However, please note that the individual tools and services listed may have their own pricing structures, which you'll need to check directly with the service providers.",
    },
    {
      question: "How can I add my service to the AI Video Directory?",
      answer:
        "To add your service to the AI Video Directory, click on the 'Submit Service' button in the top right corner of the page. You'll be guided through a simple process to submit your service for review. Our team will verify the information and, if approved, add your service to the directory. We strive to maintain a high-quality list of services, so please ensure your submission is accurate and relevant.",
    },
    {
      question:
        "What is the responsibility of AI Video Directory for the services listed?",
      answer:
        "AI Video Directory acts as a curator and aggregator of AI video services. We strive to provide accurate and up-to-date information about the listed services. However, we are not responsible for the performance, quality, or customer service of the individual tools and services listed. We recommend users to verify details directly with the service providers before making any decisions or purchases. If you encounter any issues with listed services, please let us know so we can investigate and update our listings accordingly.",
    },
  ];

  const visibleServices = showAllServices
    ? filteredServices
    : filteredServices.slice(0, 32);

  const removeFilter = (key: string, value: string) => {
    setActiveFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (Array.isArray(newFilters[key])) {
        // For dropdown filters, remove only the specific value
        newFilters[key] = newFilters[key].filter((v) => v !== value);
        if (newFilters[key].length === 0) {
          // If no values left, remove the entire filter
          delete newFilters[key];
        }
      } else {
        // For non-dropdown filters, remove the entire filter
        delete newFilters[key];
      }

      // Update URL based on the new filters
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([filterKey, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          params.set(filterKey, values.join(","));
        } else if (
          !Array.isArray(values) &&
          values !== undefined &&
          values !== null
        ) {
          params.set(filterKey, String(values));
        }
      });

      router.replace(`?${params.toString()}`, { scroll: false });

      return newFilters;
    });
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
        {Object.keys(activeFilters).length > 0 && (
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
                  className="block bg-white p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl h-full flex flex-col"
                >
                  {service.Image && service.Image.value && (
                    <Image
                      src={service.Image.value}
                      alt={service.Name.value}
                      width={300}
                      height={200}
                      className="w-full h-40 object-cover mb-4 rounded"
                    />
                  )}
                  <h3 className="font-semibold text-lg mb-2">
                    {service.Name.value}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    {truncateText(service.Description.value, 100)}
                  </p>
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
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">AI Video Directory</h3>
              <p className="text-gray-400">
                Discover and compare the best AI-powered video creation tools
                for your projects.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    Submit Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  <a
                    href="mailto:info@aivideodirectory.com"
                    className="hover:text-gray-300 transition-colors"
                  >
                    info@aivideodirectory.com
                  </a>
                </li>
                <li className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  <span>123 AI Street, Tech City, TC 12345</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>&copy; 2024 AI Video Directory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
