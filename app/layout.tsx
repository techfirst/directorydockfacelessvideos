import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { VideoIcon } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Faceless video directory | Best Faceless Video AI Creation Tools",
  description:
    "Explore our comprehensive directory of AI-powered faceless video creation tools. Compare features, pricing, and user reviews to find the perfect solution for your content creation needs. Streamline your workflow and create stunning videos effortlessly with cutting-edge AI technology.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background flex flex-col">
          <header className="bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <VideoIcon className="h-8 w-8 text-orange-300" />
                <h1 className="text-2xl font-bold">Faceless video list</h1>
              </Link>
              <Link
                href="/#submit-form"
                className="bg-orange-300 text-primary hover:bg-orange-400 transition duration-300 ease-in-out inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"
              >
                Submit
              </Link>
            </div>
          </header>
          <main className="flex-grow">{children}</main>
          <footer className="bg-gray-800 text-white py-4">
            <div className="container mx-auto px-4 text-center">
              <Link
                href="https://www.x.com/stellan79"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
              >
                Made by → @stellan79
              </Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
