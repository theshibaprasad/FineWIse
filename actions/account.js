"use server";

import { getDb, serializeDocument, serializeDocuments } from "@/lib/db";
import { getOrCreateUser } from "@/lib/checkUser";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getAccountWithTransactions(accountId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { Account, Transaction } = await getDb();

  const user = await getOrCreateUser(userId);

  const account = await Account.findOne({
    _id: accountId,
    userId: user._id,
  });

  if (!account) return null;

  const transactions = await Transaction.find({
    accountId: account._id,
  }).sort({ date: -1 });

  const transactionCount = await Transaction.countDocuments({
    accountId: account._id,
  });

  return {
    ...serializeDocument(account),
    transactions: serializeDocuments(transactions),
    _count: {
      transactions: transactionCount,
    },
  };
}

export async function bulkDeleteTransactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { Account, Transaction } = await getDb();

    const user = await getOrCreateUser(userId);

    // Get transactions to calculate balance changes
    const transactions = await Transaction.find({
      _id: { $in: transactionIds },
      userId: user._id,
    });

    // Group transactions by account to update balances
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;
      
      // Use the accountId directly since it's already an ObjectId from the database
      const accountIdStr = transaction.accountId.toString();
      acc[accountIdStr] = (acc[accountIdStr] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update account balances in a transaction
    const session = await Transaction.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Delete transactions
        await Transaction.deleteMany({
          _id: { $in: transactionIds },
          userId: user._id,
        }, { session });

        // Update account balances
        for (const [accountId, balanceChange] of Object.entries(
          accountBalanceChanges
        )) {
          await Account.updateOne(
            { _id: accountId },
            {
              $inc: { balance: balanceChange },
            },
            { session }
          );
        }
      });
    } finally {
      await session.endSession();
    }

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };
  } catch (error) {
    console.error("Bulk delete error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { Account } = await getDb();

    const user = await getOrCreateUser(userId);

    // First, unset any existing default account
    await Account.updateMany({
      userId: user._id,
      isDefault: true,
    }, {
      isDefault: false,
    });

    // Then set the new default account
    const account = await Account.findOneAndUpdate(
      {
        _id: accountId,
        userId: user._id,
      },
      { isDefault: true },
      { new: true }
    );

    revalidatePath("/dashboard");
    return { success: true, data: serializeDocument(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { Account, Transaction } = await getDb();

    const user = await getOrCreateUser(userId);

    // Get the account to check if it's the default account
    const account = await Account.findOne({
      _id: accountId,
      userId: user._id,
    });

    if (!account) throw new Error("Account not found");

    // Don't allow deletion of the default account if it's the only account
    const totalAccounts = await Account.countDocuments({ userId: user._id });
    if (account.isDefault && totalAccounts === 1) {
      throw new Error("Cannot delete the only default account. Create another account first.");
    }

    // Don't allow deletion if this is the only account (even if not default)
    if (totalAccounts === 1) {
      throw new Error("Cannot delete the only account. Create another account first.");
    }

    // Delete account and all its transactions in a transaction
    const session = await Account.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Delete all transactions for this account
        await Transaction.deleteMany({
          accountId: account._id,
          userId: user._id,
        }, { session });

        // Delete the account
        await Account.deleteOne({
          _id: account._id,
          userId: user._id,
        }, { session });

        // If this was the default account, make another account default
        if (account.isDefault) {
          const remainingAccount = await Account.findOne({
            userId: user._id,
          }, { session });
          
          if (remainingAccount) {
            await Account.updateOne(
              { _id: remainingAccount._id },
              { isDefault: true },
              { session }
            );
          }
        }
      });
    } finally {
      await session.endSession();
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete account error:", error);
    return { success: false, error: error.message };
  }
}
