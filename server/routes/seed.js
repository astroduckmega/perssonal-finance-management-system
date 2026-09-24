import express from 'express';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// @route   POST /api/seed/demo
// @desc    Seed realistic demo transactions, budgets, and goals for current user
// @access  Private
router.post('/demo', async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7);

    // Optional: clear existing data if requested
    if (req.body.clearExisting) {
      await Promise.all([
        Transaction.deleteMany({ user: userId }),
        Budget.deleteMany({ user: userId }),
        Goal.deleteMany({ user: userId }),
      ]);
    }

    // Sample Transactions (spanning past 3 months + this month)
    const transactions = [];

    // Helper to generate dates
    const daysAgo = (days) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    };

    // Salary & Income
    transactions.push(
      { user: userId, title: 'Monthly Salary (Software Engineer)', amount: 85000, type: 'income', category: 'Salary', paymentMethod: 'Bank Transfer', date: daysAgo(2) },
      { user: userId, title: 'Freelance UI/UX Consulting', amount: 22000, type: 'income', category: 'Freelance', paymentMethod: 'UPI', date: daysAgo(12) },
      { user: userId, title: 'Mutual Fund Dividend & Returns', amount: 4500, type: 'income', category: 'Investment', paymentMethod: 'Bank Transfer', date: daysAgo(18) },
      { user: userId, title: 'Monthly Salary (Last Month)', amount: 85000, type: 'income', category: 'Salary', paymentMethod: 'Bank Transfer', date: daysAgo(32) },
      { user: userId, title: 'Side Project Contract', amount: 15000, type: 'income', category: 'Freelance', paymentMethod: 'Bank Transfer', date: daysAgo(45) },
      { user: userId, title: 'Monthly Salary (2 Months Ago)', amount: 85000, type: 'income', category: 'Salary', paymentMethod: 'Bank Transfer', date: daysAgo(63) },
      { user: userId, title: 'Crypto / Stock Profit Cashout', amount: 9200, type: 'income', category: 'Investment', paymentMethod: 'Bank Transfer', date: daysAgo(75) },
      { user: userId, title: 'Monthly Salary (3 Months Ago)', amount: 85000, type: 'income', category: 'Salary', paymentMethod: 'Bank Transfer', date: daysAgo(93) }
    );

    // Expenses (Current month + recent)
    transactions.push(
      { user: userId, title: 'Apartment Rent & Maintenance', amount: 24000, type: 'expense', category: 'Housing & Rent', paymentMethod: 'Bank Transfer', date: daysAgo(3) },
      { user: userId, title: 'Organic Supermarket & Groceries', amount: 6450, type: 'expense', category: 'Groceries', paymentMethod: 'UPI', date: daysAgo(4) },
      { user: userId, title: 'High-Speed Fiber Internet & Mobile', amount: 1899, type: 'expense', category: 'Utilities & Bills', paymentMethod: 'Credit Card', date: daysAgo(5) },
      { user: userId, title: 'Fine Dining Weekend with Friends', amount: 3850, type: 'expense', category: 'Food & Dining', paymentMethod: 'Credit Card', date: daysAgo(6) },
      { user: userId, title: 'Fuel & Uber City Commute', amount: 2200, type: 'expense', category: 'Transportation', paymentMethod: 'UPI', date: daysAgo(7) },
      { user: userId, title: 'Netflix 4K + Spotify Duo + Cloud', amount: 1299, type: 'expense', category: 'Entertainment', paymentMethod: 'Debit Card', date: daysAgo(9) },
      { user: userId, title: 'Gym & Crossfit Quarterly Pass', amount: 4500, type: 'expense', category: 'Health & Fitness', paymentMethod: 'UPI', date: daysAgo(11) },
      { user: userId, title: 'Mechanical Keyboard & Desk Mat', amount: 5999, type: 'expense', category: 'Shopping', paymentMethod: 'Credit Card', date: daysAgo(14) },
      { user: userId, title: 'Weekend Coffee & Artisan Bakery', amount: 840, type: 'expense', category: 'Food & Dining', paymentMethod: 'UPI', date: daysAgo(1) },
      { user: userId, title: 'Electricity & Gas Utility Bill', amount: 2750, type: 'expense', category: 'Utilities & Bills', paymentMethod: 'Bank Transfer', date: daysAgo(16) },
      // Previous month expenses
      { user: userId, title: 'Apartment Rent & Maintenance', amount: 24000, type: 'expense', category: 'Housing & Rent', paymentMethod: 'Bank Transfer', date: daysAgo(33) },
      { user: userId, title: 'Monthly Supermarket Haul', amount: 9200, type: 'expense', category: 'Groceries', paymentMethod: 'Credit Card', date: daysAgo(36) },
      { user: userId, title: 'Flight Tickets for Family Trip', amount: 14500, type: 'expense', category: 'Travel', paymentMethod: 'Credit Card', date: daysAgo(40) },
      { user: userId, title: 'Tech Gadget & USB Hub', amount: 3200, type: 'expense', category: 'Shopping', paymentMethod: 'Credit Card', date: daysAgo(48) },
      { user: userId, title: 'Doctor Checkup & Vitamins', amount: 2100, type: 'expense', category: 'Health & Fitness', paymentMethod: 'Debit Card', date: daysAgo(52) },
      // 2 Months ago
      { user: userId, title: 'Apartment Rent', amount: 24000, type: 'expense', category: 'Housing & Rent', paymentMethod: 'Bank Transfer', date: daysAgo(64) },
      { user: userId, title: 'Groceries & Household Supplies', amount: 8400, type: 'expense', category: 'Groceries', paymentMethod: 'UPI', date: daysAgo(68) },
      { user: userId, title: 'Concert Passes', amount: 4000, type: 'expense', category: 'Entertainment', paymentMethod: 'Credit Card', date: daysAgo(72) }
    );

    // Seed Budgets for current month
    const budgets = [
      { user: userId, category: 'Housing & Rent', amount: 26000, month: currentMonthStr, alertThreshold: 85 },
      { user: userId, category: 'Groceries', amount: 10000, month: currentMonthStr, alertThreshold: 80 },
      { user: userId, category: 'Food & Dining', amount: 8000, month: currentMonthStr, alertThreshold: 75 },
      { user: userId, category: 'Utilities & Bills', amount: 6000, month: currentMonthStr, alertThreshold: 80 },
      { user: userId, category: 'Transportation', amount: 5000, month: currentMonthStr, alertThreshold: 80 },
      { user: userId, category: 'Shopping', amount: 10000, month: currentMonthStr, alertThreshold: 85 },
      { user: userId, category: 'Entertainment', amount: 4000, month: currentMonthStr, alertThreshold: 90 },
      { user: userId, category: 'Health & Fitness', amount: 6000, month: currentMonthStr, alertThreshold: 80 },
    ];

    // Seed Savings Goals
    const goals = [
      {
        user: userId,
        name: 'Emergency Fund (6 Months Expenses)',
        targetAmount: 250000,
        currentAmount: 165000,
        deadline: new Date(now.getFullYear(), now.getMonth() + 8, 15),
        category: 'Emergency Fund',
        color: '#10b981',
        icon: 'ShieldCheck',
        contributions: [
          { amount: 100000, date: daysAgo(60), notes: 'Initial fund transfer' },
          { amount: 35000, date: daysAgo(30), notes: 'Monthly bonus contribution' },
          { amount: 30000, date: daysAgo(5), notes: 'Regular monthly save' },
        ],
      },
      {
        user: userId,
        name: 'MacBook Pro M3 Max Upgrade',
        targetAmount: 180000,
        currentAmount: 135000,
        deadline: new Date(now.getFullYear(), now.getMonth() + 2, 28),
        category: 'Gadgets & Tech',
        color: '#6366f1',
        icon: 'Laptop',
        contributions: [
          { amount: 80000, date: daysAgo(40), notes: 'Freelance payment allocation' },
          { amount: 55000, date: daysAgo(10), notes: 'Tech savings bucket' },
        ],
      },
      {
        user: userId,
        name: 'Japan Autumn Blossom Trip',
        targetAmount: 200000,
        currentAmount: 85000,
        deadline: new Date(now.getFullYear(), now.getMonth() + 6, 20),
        category: 'Vacation',
        color: '#f43f5e',
        icon: 'Plane',
        contributions: [
          { amount: 50000, date: daysAgo(50), notes: 'Trip fund kick-off' },
          { amount: 35000, date: daysAgo(15), notes: 'Monthly save' },
        ],
      },
      {
        user: userId,
        name: 'Index Fund Investment Milestone',
        targetAmount: 500000,
        currentAmount: 320000,
        deadline: new Date(now.getFullYear() + 1, now.getMonth(), 1),
        category: 'Investment',
        color: '#8b5cf6',
        icon: 'TrendingUp',
        contributions: [
          { amount: 200000, date: daysAgo(90), notes: 'Lump sum investment' },
          { amount: 60000, date: daysAgo(45), notes: 'SIP contribution' },
          { amount: 60000, date: daysAgo(8), notes: 'SIP contribution' },
        ],
      },
    ];

    await Transaction.insertMany(transactions);
    
    // Insert budgets, ignoring duplicates if any
    for (const b of budgets) {
      await Budget.findOneAndUpdate(
        { user: userId, category: b.category, month: b.month },
        b,
        { upsert: true, new: true }
      );
    }

    await Goal.insertMany(goals);

    res.json({
      success: true,
      message: 'Demo dataset with transactions, budgets, and goals seeded successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
