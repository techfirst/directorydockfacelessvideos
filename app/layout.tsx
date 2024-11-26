import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { VideoIcon, Sparkles } from "lucide-react";
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
      <head>
        <script
          defer
          data-domain="facelessvideolist.com"
          src="https://plausible.io/js/script.js"
        ></script>
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-background flex flex-col">
          <Link 
            href="https://directorydock.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-orange-300/90 to-orange-200/90 hover:from-orange-300/80 hover:to-orange-200/80 transition-colors"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-orange-300" />
                    </div>
                    <p className="font-semibold text-gray-900">New!</p>
                  </div>
                  <p className="text-gray-900 text-center sm:text-left">Build Any Directory in Minutes with DirectoryDock</p>
                </div>
                <button className="bg-gray-900 text-orange-300 px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors">
                  Get DirectoryDock
                </button>
              </div>
            </div>
          </Link>

          <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-b border-gray-700">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <VideoIcon className="h-8 w-8 text-orange-300" />
                <h1 className="text-xl font-bold text-gray-300">
                  Faceless video list
                </h1>
              </Link>
              <Link
                href="/#submit-form"
                className="bg-orange-300 text-gray-900 hover:bg-orange-400 transition duration-300 ease-in-out inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"
              >
                Submit
              </Link>
            </div>
          </header>
          <main className="flex-grow">{children}</main>
          <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 border-t border-gray-700">
            <div className="container mx-auto px-4">
              <div className="w-full max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-orange-300 mb-4">
                        Directory Network
                      </h3>
                      <div className="flex flex-col gap-3">
                        <Link
                          href="https://www.texttospeechlist.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-orange-300 transition-colors duration-200 flex items-center gap-2"
                        >
                          <span className="text-orange-300">→</span>
                          Text to Speech List
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between sm:items-end gap-6">
                    <Link
                      href="/"
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <VideoIcon className="h-6 w-6 text-orange-300" />
                      <span className="font-semibold text-gray-300">
                        Faceless Video List
                      </span>
                    </Link>
                    <div className="flex flex-col sm:items-end gap-2">
                      <Link
                        href="https://www.x.com/stellan79"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-orange-300 transition-colors duration-200"
                      >
                        Created by @stellan79
                      </Link>
                      <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} All rights reserved
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
