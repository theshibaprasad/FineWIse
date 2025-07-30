"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ProfilePage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch current user profile
  useEffect(() => {
    async function fetchProfile() {
      setInitialLoading(true);
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          // Don't show the default placeholder number to user
          const displayNumber = data.phoneNumber === '+0000000000' ? '' : data.phoneNumber;
          // Remove +91 prefix for display if it exists
          const cleanNumber = displayNumber.replace('+91', '');
          setPhoneNumber(cleanNumber || "");
        }
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setInitialLoading(false);
      }
    }
    fetchProfile();
  }, []);

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

  // Handle phone number update
  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate the phone number
    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setLoading(true);
    try {
      // Add +91 prefix before sending to backend
      const fullPhoneNumber = `+91${validation.cleanNumber}`;
      
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: fullPhoneNumber }),
      });
      if (res.ok) {
        toast.success("Phone number updated! Please follow the WhatsApp registration steps below.");
      } else {
        toast.error("Failed to update phone number");
      }
    } catch (err) {
      toast.error("Failed to update phone number");
    } finally {
      setLoading(false);
    }
  }

  // Handle input change with validation
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleanValue);
  };

  return (
    <div className="max-w-lg mx-auto pt-10 pb-20 bg-white dark:bg-gray-950 min-h-screen transition-all duration-300 ease-in-out">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white transition-colors duration-300">Profile</h1>
      {initialLoading ? (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner variant="dots" text="Loading profile..." size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* WhatsApp Notifications Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  WhatsApp Notifications
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enable WhatsApp notifications to get financial updates
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white transition-colors duration-300">
                WhatsApp Phone Number
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="e.g. 0123456789"
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength={10}
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 ease-in-out"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                Enter your 10-digit Indian mobile number (e.g., 0123456789). The +91 prefix will be added automatically.
              </p>
              {phoneNumber.length > 0 && phoneNumber.length < 10 && (
                <p className="text-xs text-orange-500 mt-1">
                  Please enter all 10 digits
                </p>
              )}
              {phoneNumber.length === 10 && !validatePhoneNumber(phoneNumber).isValid && (
                <p className="text-xs text-red-500 mt-1">
                  Please enter a valid Indian mobile number
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={loading || phoneNumber.length !== 10 || !validatePhoneNumber(phoneNumber).isValid} 
              className="w-full bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" variant="spinner" color="white" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save & Register WhatsApp"
              )}
            </Button>
          </form>

          {/* WhatsApp Registration Instructions */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
              📱 WhatsApp Registration Steps
            </h3>
            <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium">To enable WhatsApp notifications, follow these steps:</p>
              
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                  <div>
                    <p className="font-medium">Open WhatsApp on your phone</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                  <div>
                    <p className="font-medium">Send a message to this number:</p>
                    <p className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-blue-600 dark:text-blue-400 mt-1">
                      +1 415 523 8886
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                  <div>
                    <p className="font-medium">Send this exact message:</p>
                    <p className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-blue-600 dark:text-blue-400 mt-1">
                      join clearly-leather
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                  <div>
                    <p className="font-medium">Wait for confirmation message</p>
                    <p className="text-xs opacity-75">You'll receive a confirmation that you're registered</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-200 text-xs">
                  <strong>Note:</strong> This is a development sandbox. In production, this step won't be needed.
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Commands Help */}
          <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold mb-4 text-green-900 dark:text-green-100">
              💬 Available WhatsApp Commands
            </h3>
            <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <p className="font-medium">Once registered, you can send these commands:</p>
              <div className="grid grid-cols-1 gap-2 mt-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">balance</span>
                  <span className="text-xs">Check your total balance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">expenses</span>
                  <span className="text-xs">View recent expenses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">accounts</span>
                  <span className="text-xs">List all accounts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">recent</span>
                  <span className="text-xs">Show recent transactions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">help</span>
                  <span className="text-xs">Show all commands</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-700">
                <p className="font-medium text-green-900 dark:text-green-100 mb-2">💳 Add Transactions:</p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">spend 2000 in food</span>
                    <span className="text-xs">Add expense</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">paid 500 for groceries</span>
                    <span className="text-xs">Add expense</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">earned 10000 salary</span>
                    <span className="text-xs">Add income</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">received 5000 payment</span>
                    <span className="text-xs">Add income</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 