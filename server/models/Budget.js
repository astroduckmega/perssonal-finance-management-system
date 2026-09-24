import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify category for the budget'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify budget limit amount'],
      min: [1, 'Budget limit must be at least 1'],
    },
    month: {
      type: String, // format: "YYYY-MM"
      required: [true, 'Please provide budget month in YYYY-MM format'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
    alertThreshold: {
      type: Number,
      default: 80, // Alert when 80% spent
      min: 10,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only have one budget per category per month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
