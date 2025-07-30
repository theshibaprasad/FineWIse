"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Loader = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Show loader for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <motion.div
        className="fixed inset-0 bg-black flex items-center justify-center z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          <motion.h1
            className="text-white text-4xl md:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Manage Your Finances with{' '}
            <span className="text-blue-600">FinWise</span>
          </motion.h1>
          
          <motion.p
            className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            AI-powered financial management platform that helps you track, analyze, and optimize your spending
          </motion.p>
          
          <motion.div
            className="flex justify-center space-x-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 1.0,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 1.0,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
            />
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return children;
};

export default Loader;