"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard, Moon, Sun, Phone, Menu, X, MessageCircle } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/context/ThemeContext";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { LoadingSpinner } from "./ui/loading-spinner";

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const phoneBtnRef = useRef(null);
  const modalRef = useRef(null);

  // Validate phone number
  const validatePhoneNumber = (number) => {
    // Remove all non-digits
    const cleanNumber = number.replace(/\D/g, '');
    
    // Check if it's exactly 10 digits
    if (cleanNumber.length !== 10) {
      return { isValid: false, error: "Phone number must be exactly 10 digits" };
    }
    
    // Check if it starts with valid Indian mobile prefixes
    const validPrefixes = ['6', '7', '8', '9'];
    if (!validPrefixes.includes(cleanNumber[0])) {
      return { isValid: false, error: "Please enter a valid Indian mobile number" };
    }
    
    return { isValid: true, cleanNumber };
  };

  // Fetch phone number on modal open
  const handleOpenPhoneModal = async () => {
    setShowPhoneModal(true);
    
    // Only fetch data if we haven't fetched it before
    if (!hasFetchedData) {
      setLoading(true);
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          // Remove +91 prefix for display if it exists
          const displayNumber = data.phoneNumber === '+0000000000' ? '' : data.phoneNumber;
          const cleanNumber = displayNumber.replace('+91', '');
          setPhoneNumber(cleanNumber || "");
          setHasFetchedData(true);
        }
      } catch {
        setPhoneNumber("");
        setHasFetchedData(true);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle input change with validation
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleanValue);
  };

  // Save phone number
  const handleSavePhone = async (e) => {
    e.preventDefault();
    
    // Validate the phone number
    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setSaving(true);
    try {
      // Add +91 prefix before sending to backend
      const fullPhoneNumber = `+91${validation.cleanNumber}`;
      
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: fullPhoneNumber }),
      });
      if (res.ok) {
        toast.success("Phone number updated! Check the instructions below.");
        setShowPhoneModal(false);
        setHasFetchedData(false); // Reset to fetch fresh data next time
      } else {
        toast.error("Failed to update phone number");
      }
    } catch {
      toast.error("Failed to update phone number");
    } finally {
      setSaving(false);
    }
  };

  // Position modal function
  const positionModal = () => {
    if (!showPhoneModal || !phoneBtnRef.current || !modalRef.current) return;

    const buttonRect = phoneBtnRef.current.getBoundingClientRect();
    const modal = modalRef.current;
    const modalRect = modal.getBoundingClientRect();
    
    // Calculate available space
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Default position (below the button)
    let top = buttonRect.bottom + 12;
    let left = buttonRect.left + (buttonRect.width / 2) - (modalRect.width / 2);
    
    // Check if modal would go below viewport
    if (top + modalRect.height > viewportHeight - 20) {
      // Position above the button
      top = buttonRect.top - modalRect.height - 12;
    }
    
    // Check if modal would go outside viewport horizontally
    if (left < 20) {
      left = 20;
    } else if (left + modalRect.width > viewportWidth - 20) {
      left = viewportWidth - modalRect.width - 20;
    }
    
    // Apply positioning
    modal.style.position = 'fixed';
    modal.style.top = `${top}px`;
    modal.style.left = `${left}px`;
    modal.style.zIndex = '9999';
  };

  // Handle scroll and resize events
  useEffect(() => {
    if (showPhoneModal) {
      const handleScroll = () => {
        positionModal();
      };

      const handleResize = () => {
        positionModal();
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
      
      // Position modal after a short delay to ensure it's rendered
      const timer = setTimeout(positionModal, 10);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        clearTimeout(timer);
      };
    }
  }, [showPhoneModal]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPhoneModal && 
          modalRef.current && 
          !modalRef.current.contains(event.target) &&
          phoneBtnRef.current && 
          !phoneBtnRef.current.contains(event.target)) {
        setShowPhoneModal(false);
        // Don't reset fetch state here - keep the cache
      }
    };

    if (showPhoneModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPhoneModal]);

  const logoVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.header 
      className="fixed top-0 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-50 transition-colors duration-300"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <motion.h1 
            className="text-4xl font-bold text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform duration-300 ease-in-out cursor-pointer"
            variants={logoVariants}
            whileHover="hover"
          >
            FinWise
          </motion.h1>
        </Link>

        {/* Navigation Links - Different for signed in/out users */}
        <div className="hidden md:flex items-center space-x-8">
          <SignedOut>
            <motion.a 
              href="#features" 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Features
            </motion.a>
            <motion.a
              href="#testimonials"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Testimonials
            </motion.a>
          </SignedOut>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile Menu Button */}
          <SignedIn>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="md:hidden"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 h-10 w-10 rounded-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {showMobileMenu ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          </SignedIn>

          {/* Dark Mode Toggle */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="p-2 h-10 w-10 rounded-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              )}
            </Button>
          </motion.div>

          {/* Mobile/Phone Icon for WhatsApp Number */}
          <SignedIn>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                ref={phoneBtnRef}
                variant="outline"
                size="sm"
                className="p-2 h-10 w-10 rounded-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={handleOpenPhoneModal}
                title="Add WhatsApp Number"
              >
                <Phone className="h-5 w-5 text-green-600" />
              </Button>
            </motion.div>
          </SignedIn>

          <SignedIn>
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button variant="outline" className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium px-4">
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/transaction/create">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4">
                    <PenBox size={18} />
                    <span>Add Transaction</span>
                  </Button>
                </motion.div>
              </Link>
            </div>
          </SignedIn>
          <SignedOut>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/sign-in">
                <Button variant="outline" className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Login
                </Button>
              </Link>
            </motion.div>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <SignedIn>
              <Link
                href="/dashboard"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <LayoutDashboard size={20} />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                href="/transaction/create"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <PenBox size={20} />
                <span className="font-medium">Add Transaction</span>
              </Link>
            </SignedIn>
          </div>
        </div>
      )}

      {/* Phone Number Modal (dropdown style) */}
      {showPhoneModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm" 
            onClick={() => {
              setShowPhoneModal(false);
              // Don't reset fetch state here - keep the cache
            }} 
          />
          {/* Dropdown Modal */}
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center animate-fadeIn max-w-sm w-full mx-4"
            style={{
              position: 'fixed',
              zIndex: 9999,
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            {/* Arrow */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="w-5 h-5 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45"></div>
            </div>
            <button
              onClick={() => {
                setShowPhoneModal(false);
                // Don't reset fetch state here - keep the cache
              }}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              style={{ zIndex: 2 }}
            >
              <span className="text-xl">×</span>
            </button>
            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  WhatsApp Number
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add your 10-digit Indian mobile number
                </p>
              </div>
            </div>
            <form onSubmit={handleSavePhone} className="space-y-4 w-full">
              <div className="relative">
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder={loading ? "Loading phone number..." : "e.g. 0123456789"}
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  required
                  autoFocus
                  disabled={loading || saving}
                  className="w-full"
                />
                {loading && (
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <LoadingSpinner variant="dots" size="xs" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter your 10-digit Indian mobile number. The +91 prefix will be added automatically.
              </p>
              {phoneNumber.length > 0 && phoneNumber.length < 10 && (
                <p className="text-xs text-orange-500">
                  Please enter all 10 digits
                </p>
              )}
              {phoneNumber.length === 10 && !validatePhoneNumber(phoneNumber).isValid && (
                <p className="text-xs text-red-500">
                  Please enter a valid Indian mobile number
                </p>
              )}
              <Button 
                type="submit" 
                disabled={loading || saving || phoneNumber.length !== 10 || !validatePhoneNumber(phoneNumber).isValid} 
                className="w-full"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" variant="spinner" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save & Register WhatsApp"
                )}
              </Button>
            </form>

            {/* WhatsApp Instructions Link */}
            <div className="mt-4 w-full">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    WhatsApp Setup Instructions
                  </span>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
                  After saving your number, follow these steps to enable WhatsApp:
                </p>
                <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                  <div>1. Send message to: <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">+1 415 523 8886</span></div>
                  <div>2. Message content: <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">join clearly-leather</span></div>
                </div>
                <Link 
                  href="/profile" 
                  className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline mt-2 inline-block font-medium"
                  onClick={() => setShowPhoneModal(false)}
                >
                  View detailed instructions →
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.header>
  );
};

export default Header;
