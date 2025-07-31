"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
  faqData,
} from "@/data/landing";
import HeroSection from "@/components/hero";
import Link from "next/link";
import { motion } from "framer-motion";

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <motion.section 
        className="py-20 bg-blue-50 dark:bg-gray-900 transition-colors duration-300"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out"
                variants={itemVariants}
              >
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="py-20 bg-white dark:bg-gray-950 transition-colors duration-300"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white transition-colors duration-300"
            variants={itemVariants}
          >
            Powerful Features
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
              >
                <Card className="h-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-blue-600 dark:text-blue-400">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white transition-colors duration-300"
            variants={itemVariants}
          >
            How It Works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksData.map((step, index) => (
              <motion.div
                key={index}
                className="text-center bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out"
                variants={itemVariants}
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-white">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        id="testimonials" 
        className="py-20 bg-white dark:bg-gray-950 transition-colors duration-300"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white transition-colors duration-300"
            variants={itemVariants}
          >
            What Our Users Say
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
              >
                <Card className="h-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {testimonial.role}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      "{testimonial.quote}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        id="faq" 
        className="py-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white transition-colors duration-300"
            variants={itemVariants}
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="max-w-5xl mx-auto">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="mb-3"
              >
                <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
                  <CardContent className="p-4">
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300 group-open:text-blue-600 dark:group-open:text-blue-400">
                          {faq.question}
                        </h3>
                        <div className="flex-shrink-0 ml-4">
                          <svg
                            className="w-5 h-5 text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </summary>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </details>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-blue-600 dark:bg-blue-700 transition-colors duration-300"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-4xl font-bold mb-4 text-white transition-colors duration-300"
            variants={itemVariants}
          >
            Ready to Take Control?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 text-blue-100 transition-colors duration-300"
            variants={itemVariants}
          >
            Join thousands of users who are already managing their finances smarter.
          </motion.p>
          <motion.div 
            className="flex justify-center"
            variants={itemVariants}
          >
            <Link href="/dashboard">
              <Button size="lg" className="px-8 bg-white dark:bg-gray-900 text-blue-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                Get Started Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default LandingPage;
