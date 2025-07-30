import { inngest } from "./client";
import { getDb, serializeDocument } from "@/lib/db";
import EmailTemplate from "@/emails/template";
import { sendEmail } from "@/actions/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Recurring Transaction Processing with Throttling
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10, // Process 10 transactions
      period: "1m", // per minute
      key: "event.data.userId", // Throttle per user
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    // Validate event data
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data:", event);
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const { Transaction, Account } = await getDb();

      const transaction = await Transaction.findOne({
        _id: event.data.transactionId,
        userId: event.data.userId,
      }).populate('account');

      if (!transaction || !isTransactionDue(transaction)) return;

      // Create new transaction and update account balance in a transaction
      const session = await Transaction.startSession();
      
      try {
        await session.withTransaction(async () => {
          // Create new transaction
          await Transaction.create([{
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          }], { session });

          // Update account balance
          const balanceChange =
            transaction.type === "EXPENSE"
              ? -transaction.amount
              : transaction.amount;

          await Account.updateOne(
            { _id: transaction.accountId },
            { $inc: { balance: balanceChange } },
            { session }
          );

          // Update last processed date and next recurring date
          await Transaction.updateOne(
            { _id: transaction._id },
            {
              lastProcessed: new Date(),
              nextRecurringDate: calculateNextRecurringDate(
                new Date(),
                transaction.recurringInterval
              ),
            },
            { session }
          );
        });
      } finally {
        await session.endSession();
      }
    });
  }
);

// Trigger recurring transactions with batching
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions", // Unique ID,
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" }, // Daily at midnight
  async ({ step }) => {
    const { Transaction } = await getDb();

    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await Transaction.find({
          isRecurring: true,
          status: "COMPLETED",
          $or: [
            { lastProcessed: null },
            {
              nextRecurringDate: {
                $lte: new Date(),
              },
            },
          ],
        });
      }
    );

    // Send event for each recurring transaction in batches
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => {
        // Safe conversion for transaction._id
        let transactionId;
        if (typeof transaction._id === "string") {
          transactionId = transaction._id;
        } else if (typeof transaction._id === "number") {
          transactionId = String(transaction._id);
        } else if (typeof transaction._id === "object" && transaction._id !== null) {
          if (transaction._id._bsontype === "ObjectID") {
            try {
              transactionId = transaction._id.toString();
            } catch {
              transactionId = JSON.stringify(transaction._id);
            }
          } else {
            try {
              transactionId = JSON.stringify(transaction._id);
            } catch {
              transactionId = "[Object]";
            }
          }
        } else {
          transactionId = String(transaction._id);
        }

        // Safe conversion for transaction.userId
        let userId;
        if (typeof transaction.userId === "string") {
          userId = transaction.userId;
        } else if (typeof transaction.userId === "number") {
          userId = String(transaction.userId);
        } else if (typeof transaction.userId === "object" && transaction.userId !== null) {
          if (transaction.userId._bsontype === "ObjectID") {
            try {
              userId = transaction.userId.toString();
            } catch {
              userId = JSON.stringify(transaction.userId);
            }
          } else {
            try {
              userId = JSON.stringify(transaction.userId);
            } catch {
              userId = "[Object]";
            }
          }
        } else {
          userId = String(transaction.userId);
        }

        return {
          name: "transaction.recurring.process",
          data: {
            transactionId,
            userId,
          },
        };
      });

      // Send events directly using inngest.send()
      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  }
);

// 2. Monthly Report Generation
async function generateFinancialInsights(stats, month) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: ₹${stats.totalIncome}
    - Total Expenses: ₹${stats.totalExpenses}
    - Net Income: ₹${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: ₹${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" }, // First day of each month
  async ({ step }) => {
    const { User, Account } = await getDb();

    const users = await step.run("fetch-users", async () => {
      return await User.find({}).populate('accounts');
    });

    for (const user of users) {
      await step.run(`generate-report-${user._id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user._id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        // Generate AI insights
        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: {
              stats,
              month: monthName,
              insights,
            },
          }),
        });
      });
    }

    return { processed: users.length };
  }
);

// 3. Budget Alerts with Event Batching
export const checkBudgetAlerts = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" }, // Every 6 hours
  async ({ step }) => {
    const { Budget, User, Account } = await getDb();

    const budgets = await step.run("fetch-budgets", async () => {
      return await Budget.find({}).populate({
        path: 'user',
        populate: {
          path: 'accounts',
          match: { isDefault: true }
        }
      });
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue; // Skip if no default account

      await step.run(`check-budget-${budget._id}`, async () => {
        const startDate = new Date();
        startDate.setDate(1); // Start of current month

        const { Transaction } = await getDb();

        // Calculate total expenses for the default account only
        const expensesResult = await Transaction.aggregate([
          {
            $match: {
              userId: budget.userId,
              accountId: defaultAccount._id, // Only consider default account
              type: "EXPENSE",
              date: {
                $gte: startDate,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
            },
          },
        ]);

        const totalExpenses = expensesResult.length > 0 ? expensesResult[0].totalAmount : 0;
        const budgetAmount = budget.amount;
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        // Check if we should send an alert
        if (
          percentageUsed >= 80 && // Default threshold of 80%
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: parseInt(budgetAmount).toFixed(1),
                totalExpenses: parseInt(totalExpenses).toFixed(1),
                accountName: defaultAccount.name,
              },
            }),
          });

          // Update last alert sent
          await Budget.updateOne(
            { _id: budget._id },
            { lastAlertSent: new Date() }
          );
        }
      });
    }
  }
);

// 4. Weekly Insights (Optional Enhancement)
export const generateWeeklyInsights = inngest.createFunction(
  {
    id: "generate-weekly-insights",
    name: "Generate Weekly Insights",
  },
  { cron: "0 9 * * 1" }, // Every Monday at 9 AM
  async ({ step }) => {
    const { User } = await getDb();

    const users = await step.run("fetch-users", async () => {
      return await User.find({});
    });

    for (const user of users) {
      await step.run(`generate-weekly-${user._id}`, async () => {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const stats = await getWeeklyStats(user._id, lastWeek);
        const weekName = `Week of ${lastWeek.toLocaleDateString()}`;

        // Generate AI insights for weekly data
        const insights = await generateWeeklyFinancialInsights(stats, weekName);

        await sendEmail({
          to: user.email,
          subject: `Your Weekly Financial Summary`,
          react: EmailTemplate({
            userName: user.name,
            type: "weekly-insights",
            data: {
              stats,
              week: weekName,
              insights,
            },
          }),
        });
      });
    }

    return { processed: users.length };
  }
);

// Weekly insights generation
async function generateWeeklyFinancialInsights(stats, week) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Analyze this weekly financial data and provide 2-3 quick insights.
    Focus on spending trends and quick wins.
    Keep it brief and actionable.

    Weekly Financial Data for ${week}:
    - Total Income: ₹${stats.totalIncome}
    - Total Expenses: ₹${stats.totalExpenses}
    - Net Income: ₹${stats.totalIncome - stats.totalExpenses}
    - Top Expense Categories: ${Object.entries(stats.byCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, amount]) => `${category}: ₹${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating weekly insights:", error);
    return [
      "Track your daily spending to stay on top of your budget.",
      "Consider setting aside 20% of your income for savings this week.",
    ];
  }
}

// Weekly stats calculation
async function getWeeklyStats(userId, weekStart) {
  const { Transaction } = await getDb();

  const endDate = new Date(weekStart);
  endDate.setDate(endDate.getDate() + 7);

  const transactions = await Transaction.find({
    userId,
    date: {
      $gte: weekStart,
      $lt: endDate,
    },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount;
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

// Utility functions
function isTransactionDue(transaction) {
  // If no lastProcessed date, transaction is due
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  // Compare with nextDue date
  return nextDue <= today;
}

function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

async function getMonthlyStats(userId, month) {
  const { Transaction } = await getDb();

  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await Transaction.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount;
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}
