import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['INCOME', 'EXPENSE'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: String,
  date: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  receiptUrl: String,
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringInterval: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
  },
  nextRecurringDate: Date,
  lastProcessed: Date,
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'COMPLETED',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
transactionSchema.index({ userId: 1 });
transactionSchema.index({ accountId: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema); 