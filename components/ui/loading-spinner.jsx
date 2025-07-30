import React from "react";

export const LoadingSpinner = ({ size = "default", variant = "spinner", text, className = "" }) => {
  const sizeClasses = {
    xs: "h-2 w-2",
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  if (variant === "dots") {
    return (
      <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
        <div className="flex space-x-1">
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-smooth-pulse`} style={{ animationDelay: '0s' }}></div>
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-smooth-pulse`} style={{ animationDelay: '0.2s' }}></div>
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-smooth-pulse`} style={{ animationDelay: '0.4s' }}></div>
        </div>
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{text}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{text}</p>
      )}
    </div>
  );
};

export const LoadingOverlay = ({ isLoading, text = "Loading...", variant = "spinner", className = "" }) => {
  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col items-center space-y-4">
        {variant === "spinner" && <LoadingSpinner size="lg" text={text} />}
        {variant === "dots" && <LoadingSpinner size="sm" variant="dots" text={text} />}
      </div>
    </div>
  );
}; 