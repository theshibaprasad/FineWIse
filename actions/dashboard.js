"use server";

import aj from "@/lib/arcjet";
import { getDb, serializeDocument, serializeDocuments } from "@/lib/db";
import { getOrCreateUser } from "@/lib/checkUser";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getUserAccounts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { Account, Transaction } = await getDb();

  const user = await getOrCreateUser(userId);

  try {
    const accounts = await Account.find({
      userId: user._id,
    }).sort({ createdAt: -1 });

    // Get transaction counts for each account
    const accountsWithCounts = await Promise.all(
      accounts.map(async (account) => {
        const transactionCount = await Transaction.countDocuments({
          accountId: account._id,
        });
        
        const serialized = serializeDocument(account);
        return {
          ...serialized,
          _count: {
            transactions: transactionCount,
          },
        };
      })
    );

    return accountsWithCounts;
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    const { Account } = await getDb();

    const user = await getOrCreateUser(userId);

    // Convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // Check if this is the user's first account
    const existingAccounts = await Account.find({
      userId: user._id,
    });

    // If it's the first account, make it default regardless of user input
    // If not, use the user's preference
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await Account.updateMany({
        userId: user._id,
        isDefault: true,
      }, {
        isDefault: false,
      });
    }

    // Create new account
    const account = await Account.create({
      ...data,
      balance: balanceFloat,
      userId: user._id,
      isDefault: shouldBeDefault, // Override the isDefault based on our logic
    });

    // Serialize the account before returning
    const serializedAccount = serializeDocument(account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { Transaction } = await getDb();

  const user = await getOrCreateUser(userId);

  // Get all user transactions
  const transactions = await Transaction.find({
    userId: user._id,
  }).sort({ date: -1 });

  // serializeDocument should handle all ObjectId fields
  return serializeDocuments(transactions);
}
