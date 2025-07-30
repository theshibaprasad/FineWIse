import DashboardPage from "./page";
import { Suspense } from "react";

export default function Layout() {
  return (
    <div className="px-5 bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <Suspense
        fallback={
          <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-950">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="dashboard-loader"></div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Loading dashboard...</p>
            </div>
          </div>
        }
      >
        <DashboardPage />
      </Suspense>
    </div>
  );
}
