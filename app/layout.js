import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { LoadingProvider } from "@/lib/context/LoadingContext";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { Suspense } from "react";
import Loader from "@/components/loader";
import { ClerkThemeProvider } from "@/components/clerk-theme-provider";
import { Github, Linkedin, Mail, Heart, Sparkles } from "lucide-react";
import ScrollToTopButton from "@/components/scroll-to-top-button";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FinWise : AI Finance Platform",
  description: "Manage your finances with intelligence",
};

export default function RootLayout({ children }) {
  const currentYear = new Date().getFullYear();

  return (
    <ClerkThemeProvider>
      <html lang="en" className="transition-colors duration-300">
        <head>
          <link rel="icon" href="/logo-sm.png" sizes="any" />
        </head>
        <body className={`${inter.className} transition-colors duration-300 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased`}>
          <ThemeProvider>
            <LoadingProvider>
              <Loader>
                <Suspense fallback={<div className="fixed inset-0 bg-white dark:bg-gray-950 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>}>
                  <Header />
                  <main className="min-h-screen pt-20 bg-white dark:bg-gray-950 transition-colors duration-300">{children}</main>
                  <Toaster richColors theme="system" />

                  <footer className="bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border-t border-blue-100 dark:border-gray-800 transition-colors duration-300">
                    <div className="container mx-auto px-4 py-12">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Brand Section */}
                        <div className="text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start mb-4">
                            <Sparkles className="h-8 w-8 text-blue-600 mr-2" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              FinWise
                            </h3>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            AI-powered financial management platform that helps you track, analyze, and optimize your spending with intelligent insights.
                          </p>
                        </div>

                        {/* Quick Links */}
                        <div className="text-center">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Quick Links
                          </h4>
                          <div className="space-y-2">
                            <Link href="/dashboard" className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 text-sm">
                              Dashboard
                            </Link>
                            <Link href="/profile" className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 text-sm">
                              Profile
                            </Link>
                            <Link href="/sign-in" className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 text-sm">
                              Sign In
                            </Link>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="text-center md:text-right">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Connect
                          </h4>
                          <div className="flex justify-center md:justify-end space-x-4">
                            <Link 
                              href="https://github.com/theshibaprasad"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                            >
                              <Github className="h-5 w-5" />
                            </Link>
                            <Link 
                              href="https://www.linkedin.com/in/theshibaprasad/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                            >
                              <Linkedin className="h-5 w-5" />
                            </Link>
                            <Link 
                              href="mailto:theshibaprasad@gmail.com"
                              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                            >
                              <Mail className="h-5 w-5" />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div className="border-t border-blue-200 dark:border-gray-700 pt-8">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                          <div className="text-center md:text-left mb-4 md:mb-0">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              © {currentYear} FinWise. All rights reserved.
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Made with
                            </span>
                            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              by{" "}
                              <Link 
                                href="https://www.linkedin.com/in/theshibaprasad/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-300 font-medium"
                              >
                                Shiba Prasad
                              </Link>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </footer>
                  <ScrollToTopButton />
                </Suspense>
              </Loader>
            </LoadingProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkThemeProvider>
  );
}
