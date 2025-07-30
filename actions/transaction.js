"use server";

import { auth } from "@clerk/nextjs/server";
import { getDb, serializeDocument, serializeDocuments } from "@/lib/db";
import { getOrCreateUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create Transaction
export async function createTransaction(data) {
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

    const { Account, Transaction } = await getDb();

    const user = await getOrCreateUser(userId);

    const account = await Account.findOne({
      _id: data.accountId,
      userId: user._id,
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance + balanceChange;

    // Create transaction and update account balance
    const session = await Transaction.startSession();
    
    try {
      await session.withTransaction(async () => {
        const newTransaction = await Transaction.create([{
          ...data,
          userId: user._id,
          accountId: account._id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        }], { session });

        await Account.updateOne(
          { _id: account._id },
          { balance: newBalance },
          { session }
        );

        return newTransaction[0];
      });
    } finally {
      await session.endSession();
    }

    const transaction = await Transaction.findOne({
      userId: user._id,
      accountId: account._id,
    }).sort({ createdAt: -1 });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeDocument(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { Transaction } = await getDb();

  const user = await getOrCreateUser(userId);

  const transaction = await Transaction.findOne({
    _id: id,
    userId: user._id,
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeDocument(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { Account, Transaction } = await getDb();

    const user = await getOrCreateUser(userId);

    // Get original transaction to calculate balance change
    const originalTransaction = await Transaction.findOne({
      _id: id,
      userId: user._id,
    }).populate('account');

    if (!originalTransaction) throw new Error("Transaction not found");

    // Serialize the populated account
    const serializedOriginalTransaction = serializeDocument(originalTransaction);

    // Calculate balance changes
    const oldBalanceChange =
      serializedOriginalTransaction.type === "EXPENSE"
        ? -serializedOriginalTransaction.amount
        : serializedOriginalTransaction.amount;

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const session = await Transaction.startSession();
    
    try {
      await session.withTransaction(async () => {
        await Transaction.updateOne(
          {
            _id: id,
            userId: user._id,
          },
          {
            ...data,
            nextRecurringDate:
              data.isRecurring && data.recurringInterval
                ? calculateNextRecurringDate(data.date, data.recurringInterval)
                : null,
          },
          { session }
        );

        // Update account balance
        await Account.updateOne(
          { _id: data.accountId },
          {
            $inc: { balance: netBalanceChange },
          },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    const updatedTransaction = await Transaction.findOne({ _id: id });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeDocument(updatedTransaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { Transaction } = await getDb();

    const user = await getOrCreateUser(userId);

    const transactions = await Transaction.find({
      userId: user._id,
      ...query,
    }).populate('account').sort({ date: -1 });

    // Serialize the transactions with populated accounts
    const serializedTransactions = transactions.map(transaction => {
      const serialized = serializeDocument(transaction);
      if (serialized.account) {
        serialized.account = serializeDocument(transaction.account);
      }
      return serialized;
    });

    return { success: true, data: serializedTransactions };
  } catch (error) {
    throw new Error(error.message);
  }
}



// Scan Receipt
export async function scanReceipt(fileData) {
  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Validate file data
    if (!fileData || !fileData.type.startsWith('image/')) {
      throw new Error("Please select a valid image file");
    }

    // Use the base64 string from the client
    const base64String = fileData.base64;

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If it's not a receipt, return an empty object {}
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: fileData.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      
      // Validate the parsed data
      if (!data || Object.keys(data).length === 0) {
        throw new Error("No receipt data found in the image");
      }
      
      if (!data.amount || isNaN(data.amount)) {
        throw new Error("Could not extract amount from receipt");
      }

      return {
        amount: parseFloat(data.amount),
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description || "Receipt scan",
        category: data.category || "other-expense",
        merchantName: data.merchantName || "Unknown merchant",
      };
    } catch (parseError) {
      throw new Error("Invalid response format from AI. Please try again with a clearer image.");
    }
  } catch (error) {
    if (error.message.includes("API key")) {
      throw new Error("AI service not configured. Please contact support.");
    } else if (error.message.includes("quota")) {
      throw new Error("AI service quota exceeded. Please try again later.");
    } else if (error.message.includes("network")) {
      throw new Error("Network error. Please check your connection and try again.");
    } else {
      throw new Error(error.message || "Failed to scan receipt. Please try again.");
    }
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
