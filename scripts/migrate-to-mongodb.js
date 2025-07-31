#!/usr/bin/env node

/**
 * Migration script to convert from Prisma/PostgreSQL to MongoDB
 * This script helps migrate existing data if you have any
 */

import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_URL = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required for migration');
  process.exit(1);
}

// MongoDB Models
import User from '../lib/models/User.js';
import Account from '../lib/models/Account.js';
import Transaction from '../lib/models/Transaction.js';
import Budget from '../lib/models/Budget.js';

// Prisma Client
const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('🔄 Starting migration from PostgreSQL to MongoDB...');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Connect to PostgreSQL
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Migrate Users
    console.log('📦 Migrating users...');
    const users = await prisma.user.findMany();
    for (const user of users) {
      await User.findOneAndUpdate(
        { clerkUserId: user.clerkUserId },
        {
          clerkUserId: user.clerkUserId,
          email: user.email,
          name: user.name,
          imageUrl: user.imageUrl,
        },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Migrated ${users.length} users`);

    // Migrate Accounts
    console.log('📦 Migrating accounts...');
    const accounts = await prisma.account.findMany();
    for (const account of accounts) {
      const user = await User.findOne({ clerkUserId: account.user.clerkUserId });
      if (user) {
        await Account.findOneAndUpdate(
          { _id: account.id },
          {
            name: account.name,
            type: account.type,
            balance: account.balance.toNumber(),
            isDefault: account.isDefault,
            userId: user._id,
          },
          { upsert: true, new: true }
        );
      }
    }
    console.log(`✅ Migrated ${accounts.length} accounts`);

    // Migrate Transactions
    console.log('📦 Migrating transactions...');
    const transactions = await prisma.transaction.findMany({
      include: {
        user: true,
        account: true,
      },
    });
    for (const transaction of transactions) {
      const user = await User.findOne({ clerkUserId: transaction.user.clerkUserId });
      const account = await Account.findOne({ _id: transaction.accountId });
      
      if (user && account) {
        await Transaction.findOneAndUpdate(
          { _id: transaction.id },
          {
            type: transaction.type,
            amount: transaction.amount.toNumber(),
            description: transaction.description,
            date: transaction.date,
            category: transaction.category,
            receiptUrl: transaction.receiptUrl,
            isRecurring: transaction.isRecurring,
            recurringInterval: transaction.recurringInterval,
            nextRecurringDate: transaction.nextRecurringDate,
            lastProcessed: transaction.lastProcessed,
            status: transaction.status,
            userId: user._id,
            accountId: account._id,
          },
          { upsert: true, new: true }
        );
      }
    }
    console.log(`✅ Migrated ${transactions.length} transactions`);

    // Migrate Budgets
    console.log('📦 Migrating budgets...');
    const budgets = await prisma.budget.findMany({
      include: {
        user: true,
      },
    });
    for (const budget of budgets) {
      const user = await User.findOne({ clerkUserId: budget.user.clerkUserId });
      if (user) {
        await Budget.findOneAndUpdate(
          { userId: user._id },
          {
            amount: budget.amount.toNumber(),
            lastAlertSent: budget.lastAlertSent,
            userId: user._id,
          },
          { upsert: true, new: true }
        );
      }
    }
    console.log(`✅ Migrated ${budgets.length} budgets`);

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData();
}

export default migrateData; 