"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const HeroSection = () => {
  const imageRef = useRef(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const texts = [
    "Manage Your Money with Intelligent Precision",
    "Smarter Financial Control with AI Power",
    "Intelligent Tools to Grow Your Wealth",
    "AI That Understands Your Finances",
    "Financial Freedom, Powered by Intelligence",
    "Let AI Simplify Your Financial World",
    "Make Every Rupee Count with Intelligent Insights",
    "AI-Driven Decisions for Financial Success",
    "Experience the Future of Intelligent Money Management",
    "AI at the Core of Your Financial Strategy"
  ];

  // Reset typewriter on component mount
  useEffect(() => {
    setCurrentTextIndex(0);
    setCurrentText("");
    setIsDeleting(false);
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const typeSpeed = isDeleting ? 50 : 100;
    const deleteSpeed = 30;
    const pauseTime = 2000;

    const typeWriter = () => {
      const currentFullText = texts[currentTextIndex];
      
      if (isDeleting) {
        setCurrentText(prev => prev.slice(0, -1));
        if (currentText === "") {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      } else {
        if (currentText === currentFullText) {
          setTimeout(() => setIsDeleting(true), pauseTime);
          return;
        }
        setCurrentText(currentFullText.slice(0, currentText.length + 1));
      }
    };

    const timer = setTimeout(typeWriter, isDeleting ? deleteSpeed : typeSpeed);
    return () => clearTimeout(timer);
  }, [currentText, currentTextIndex, isDeleting, texts, isVisible]);

  useEffect(() => {
    const handleScroll = () => {
      const imageElement = imageRef.current;
      if (imageElement) {
        const rect = imageElement.getBoundingClientRect();
        const scrolled = window.scrollY;
        const rate = scrolled * -0.5;
        imageElement.style.transform = `translateY(${rate}px)`;

        if (rect.top < window.innerHeight && rect.bottom > 0) {
          imageElement.classList.add("scrolled");
        } else {
          imageElement.classList.remove("scrolled");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 0.5,
      },
    },
  };

  return (
    <section className="pt-10 pb-20 px-4 relative min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300" style={{ position: 'relative', top: 0 }}>
      <motion.div 
        className="container mx-auto text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        layout={false}
        key="hero-container"
      >
        {/* Typewriter Effect */}
        <motion.div 
          className="mb-2 relative z-10"
          variants={itemVariants}
          onAnimationComplete={() => setIsVisible(true)}
          layout={false}
        >
          <div className="text-base md:text-lg lg:text-xl text-blue-600 dark:text-blue-400 font-medium min-h-[2rem] md:min-h-[2.5rem] lg:min-h-[3rem] flex items-center justify-center">
            <span className="inline-block">
              {currentText}
              <span className="animate-pulse">|</span>
            </span>
          </div>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title text-gray-900 dark:text-white transition-colors duration-300"
          variants={itemVariants}
          layout={false}
        >
          Manage Your Finances <br /> with Intelligence
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto transition-colors duration-300"
          variants={itemVariants}
          layout={false}
        >
          An AI-powered financial management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </motion.p>
        <motion.div 
          className="flex justify-center space-x-4 mb-4"
          variants={itemVariants}
          layout={false}
        >
          <Link href="/dashboard">
            <Button size="lg" className="px-8 bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700">
              Get Started
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            onClick={() => window.open('https://youtu.be/g6WXO6aLZEg?si=Cuw__F4i6A52F3ZI', '_blank')}
          >
            Watch Demo
          </Button>
        </motion.div>
        <motion.div 
          className="hero-image-wrapper mt-5 md:mt-0"
          variants={imageVariants}
          layout={false}
        >
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner.jpeg"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 mx-auto"
              priority
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1280px"
              quality={75}
              loading="eager"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
