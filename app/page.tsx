/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  VideoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DirectoryDockClient } from "directorydockclient";
import Image from "next/image";

export default function Component() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      const key = process.env.NEXT_PUBLIC_DIRECTORY_DOCK_API_KEY;
      if (!key) {
        setError("API key not found. Please check your environment variables.");
        setIsLoading(false);
        return;
      }

      const client = new DirectoryDockClient(key);

      try {
        const response = await client.getEntries(1, 10);
        console.log("API Response:", response);

        setServices(response.entries);
      } catch (err) {
        setError("Failed to load services. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchServices();
  }, []);

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

  return (
    <>
      <section className="bg-[url('https://images.unsplash.com/photo-1519744699897-3544da770a84?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Discover Faceless AI Video Services
          </h2>
          <p className="text-xl mb-8">
            Find the perfect tools for creating engaging faceless content
          </p>
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden flex">
            <Input
              className="flex-grow border-none"
              placeholder="Search for AI video services..."
            />
            <Button size="lg" className="rounded-none">
              <Search className="mr-2 h-5 w-5" />
              SEARCH
            </Button>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Top AI Video Services</h2>
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter Results
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Options</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Categories</h3>
                  <div className="space-y-2">
                    {[
                      "Video Creation",
                      "Audio",
                      "Animation",
                      "Editing",
                      "SEO",
                    ].map((category) => (
                      <div key={category} className="flex items-center">
                        <Checkbox id={`category-${category}`} />
                        <Label
                          htmlFor={`category-${category}`}
                          className="ml-2"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Price Range</h3>
                  <div className="space-y-2">
                    {["Free", "$1 - $50", "$51 - $100", "$101+"].map(
                      (price) => (
                        <div key={price} className="flex items-center">
                          <Checkbox id={`price-${price}`} />
                          <Label htmlFor={`price-${price}`} className="ml-2">
                            {price}
                          </Label>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <p>Loading services...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <a
                key={service.Id}
                href={`/${service.Slug.value}`}
                className="block bg-white p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl"
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
                <p className="text-sm text-muted-foreground mb-4">
                  {service.Description.value}
                </p>
              </a>
            ))}
          </div>
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
              <Button type="submit">Submit Service</Button>
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
