"use server";

import { getDb, serializeDocument } from "@/lib/db";
import { getOrCreateUser } from "@/lib/checkUser";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { Budget, Transaction } = await getDb();

    const user = await getOrCreateUser(userId);

    const budget = await Budget.findOne({
      userId: user._id,
    });

    // Get current month's expenses
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const expensesResult = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          type: "EXPENSE",
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
          accountId: accountId,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const currentExpenses = expensesResult.length > 0 ? expensesResult[0].totalAmount : 0;

    return {
      budget: budget ? serializeDocument(budget) : null,
      currentExpenses: currentExpenses,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { Budget } = await getDb();

    const user = await getOrCreateUser(userId);

    // Update or create budget
    const budget = await Budget.findOneAndUpdate(
      {
        userId: user._id,
      },
      {
        amount,
      },
      {
        upsert: true,
        new: true,
      }
    );

    revalidatePath("/dashboard");
    return {
      success: true,
      data: serializeDocument(budget),
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { success: false, error: error.message };
  }
}
