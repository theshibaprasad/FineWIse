import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  lastAlertSent: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
budgetSchema.index({ userId: 1 });

export default mongoose.models.Budget || mongoose.model('Budget', budgetSchema); 