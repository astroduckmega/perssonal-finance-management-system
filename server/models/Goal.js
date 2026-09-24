import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: String,
  },
  { _id: true }
);

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a goal name'],
      trim: true,
      maxLength: [100, 'Goal name cannot exceed 100 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please provide target amount'],
      min: [1, 'Target amount must be at least 1'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a target completion deadline'],
    },
    category: {
      type: String,
      default: 'General Savings',
      enum: [
        'General Savings',
        'Emergency Fund',
        'Vacation',
        'Home / Real Estate',
        'Car / Vehicle',
        'Gadgets & Tech',
        'Investment',
        'Education',
        'Retirement',
        'Wedding / Family',
      ],
    },
    color: {
      type: String,
      default: '#7c3aed',
    },
    icon: {
      type: String,
      default: 'Target',
    },
    contributions: [contributionSchema],
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ user: 1, deadline: 1 });

export default mongoose.model('Goal', goalSchema);
