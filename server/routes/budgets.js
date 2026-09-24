import express from 'express';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// Helper to get start and end dates of a YYYY-MM month
const getMonthRange = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

// @route   GET /api/budgets
// @desc    Get all budgets for a given month with calculated spent amount
// @access  Private
router.get('/', async (req, res) => {
  try {
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const month = req.query.month || currentMonthStr;

    const budgets = await Budget.find({ user: req.user.id, month }).sort({ createdAt: -1 });

    const { start, end } = getMonthRange(month);

    // Calculate actual spending per category for this month
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const spendingMap = {};
    categorySpending.forEach((item) => {
      spendingMap[item._id] = item.totalSpent;
    });

    let totalBudgeted = 0;
    let totalSpentInBudgets = 0;

    const enrichedBudgets = budgets.map((b) => {
      const spent = spendingMap[b.category] || 0;
      const remaining = Math.max(0, b.amount - spent);
      const percentage = b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
      const rawPercentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      const isExceeded = spent > b.amount;
      const isWarning = rawPercentage >= (b.alertThreshold || 80);

      totalBudgeted += b.amount;
      totalSpentInBudgets += spent;

      return {
        _id: b._id,
        category: b.category,
        amount: b.amount,
        month: b.month,
        alertThreshold: b.alertThreshold,
        spent,
        remaining: b.amount - spent,
        percentage,
        rawPercentage,
        isExceeded,
        isWarning,
        createdAt: b.createdAt,
      };
    });

    res.json({
      success: true,
      month,
      summary: {
        totalBudgeted,
        totalSpentInBudgets,
        remainingBudget: totalBudgeted - totalSpentInBudgets,
        overallPercentage: totalBudgeted > 0 ? Math.round((totalSpentInBudgets / totalBudgeted) * 100) : 0,
      },
      data: enrichedBudgets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/budgets
// @desc    Create or update budget for a category & month
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { category, amount, month, alertThreshold } = req.body;

    if (!category || !amount || !month) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, amount, and month (YYYY-MM)',
      });
    }

    const existing = await Budget.findOne({
      user: req.user.id,
      category,
      month,
    });

    if (existing) {
      existing.amount = Number(amount);
      if (alertThreshold) existing.alertThreshold = Number(alertThreshold);
      await existing.save();
      return res.json({ success: true, data: existing, message: 'Budget updated' });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category,
      amount: Number(amount),
      month,
      alertThreshold: alertThreshold ? Number(alertThreshold) : 80,
    });

    res.status(201).json({ success: true, data: budget, message: 'Budget created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { amount, alertThreshold, category } = req.body;

    const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (amount !== undefined) budget.amount = Number(amount);
    if (alertThreshold !== undefined) budget.alertThreshold = Number(alertThreshold);
    if (category) budget.category = category;

    await budget.save();
    res.json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    res.json({ success: true, message: 'Budget removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
