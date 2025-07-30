import React from "react";

const MainLayout = ({ children }) => {
  return (
    <div className="container mx-auto px-4 py-6 min-h-screen bg-white dark:bg-gray-950 transition-all duration-300 ease-in-out">{children}</div>
  );
};

export default MainLayout;
