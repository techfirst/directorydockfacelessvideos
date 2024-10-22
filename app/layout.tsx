import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Video Directory",
  description:
    "Discover and compare the best AI-powered video creation tools for your projects.",
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
              <div className="flex items-center space-x-2">
                <VideoIcon className="h-8 w-8 text-orange-300" />
                <h1 className="text-2xl font-bold">Faceless video list</h1>
              </div>
              <Button
                variant="outline"
                className="bg-orange-300 text-primary hover:bg-orange-400"
              >
                Submit
              </Button>
            </div>
          </header>
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  );
}
