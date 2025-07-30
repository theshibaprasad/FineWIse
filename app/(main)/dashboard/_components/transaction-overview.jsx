"use client";

import { useState, useMemo, useCallback, memo, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/context/ThemeContext";

// Static colors that never change - Professional and minimal
const STATIC_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

// Animated pie chart component with loading animation
const AnimatedPieChart = memo(({ data }) => {
  const [showLabels, setShowLabels] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    // Show labels and legend at the same time for synchronized animation
    const timer = setTimeout(() => {
      setShowLabels(true);
      setShowLegend(true);
    }, 800); // Both labels and legend appear together

    return () => clearTimeout(timer);
  }, []);

  const labelFunction = useCallback(({ name, value }) => {
    if (!showLabels) return "";
    return `${name}: ₹${value.toFixed(2)}`;
  }, [showLabels]);

  const CustomPieTooltip = useCallback(({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {payload[0].name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            ₹{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={60}
          fill="#8884d8"
          dataKey="value"
          label={labelFunction}
          startAngle={90}
          endAngle={-270}
          animationDuration={1000}
          animationBegin={0}
          labelLine={showLabels}
          labelLineStyle={{ 
            stroke: '#374151', 
            strokeWidth: 1,
            opacity: 1,
            transition: 'opacity 0.6s ease'
          }}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={STATIC_COLORS[index % STATIC_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip />} />
        <Legend 
          wrapperStyle={{ 
            color: '#374151', 
            fontSize: '12px',
            opacity: showLegend ? 1 : 0,
            transition: 'opacity 0.6s ease'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
});

AnimatedPieChart.displayName = 'AnimatedPieChart';

export function DashboardOverview({ accounts, transactions }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );
  const { isDarkMode } = useTheme();

  // Memoize account transactions filtering
  const accountTransactions = useMemo(() => {
    return transactions.filter((t) => t.accountId === selectedAccountId);
  }, [transactions, selectedAccountId]);

  // Memoize recent transactions
  const recentTransactions = useMemo(() => {
    return accountTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [accountTransactions]);

  // Memoize current month expenses calculation
  const currentMonthExpenses = useMemo(() => {
    const currentDate = new Date();
    return accountTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        t.type === "EXPENSE" &&
        transactionDate.getMonth() === currentDate.getMonth() &&
        transactionDate.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [accountTransactions]);

  // Memoize expenses by category
  const expensesByCategory = useMemo(() => {
    return currentMonthExpenses.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {});
  }, [currentMonthExpenses]);

  // Memoize pie chart data
  const pieChartData = useMemo(() => {
    return Object.entries(expensesByCategory).map(
      ([category, amount]) => ({
        name: category,
        value: amount,
      })
    );
  }, [expensesByCategory]);

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
      {/* Recent Transactions */}
      <Card className="lg:col-span-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-colors duration-300 ease-in-out">
        <CardHeader>
          <CardTitle className="text-base font-normal text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
            Recent Transactions
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 transition-colors duration-300 ease-in-out">
                {accounts.map((account) => (
                  <SelectItem 
                    key={account.id} 
                    value={account.id}
                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out"
                  >
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-300 py-4 transition-colors duration-300 ease-in-out">
                No recent transactions
              </p>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-white transition-colors duration-300 ease-in-out truncate">
                      {transaction.description || "Untitled Transaction"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300 ease-in-out">
                      {format(new Date(transaction.date), "PP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <div
                      className={cn(
                        "flex items-center text-sm",
                        transaction.type === "EXPENSE"
                          ? "text-red-500"
                          : "text-green-500"
                      )}
                    >
                      {transaction.type === "EXPENSE" ? (
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                      )}
                      <span className="whitespace-nowrap">₹{transaction.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown Card */}
      <Card className="lg:col-span-3 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-colors duration-300 ease-in-out">
        <CardHeader>
          <CardTitle className="text-base font-normal text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-5">
          {pieChartData.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-300 py-4 transition-colors duration-300 ease-in-out">
              No expenses this month
            </p>
          ) : (
            <div className="h-[250px] sm:h-[300px] w-full">
              <AnimatedPieChart data={pieChartData} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
