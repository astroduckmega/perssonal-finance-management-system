import express from 'express';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();
router.use(protect);

// @route   GET /api/dashboard/stats
// @desc    Comprehensive dashboard analytics and summaries
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    
    // Start of current month & previous month
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // 1. All-time income and expenses
    const allTimeTotals = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransactions = 0;

    allTimeTotals.forEach((t) => {
      if (t._id === 'income') totalIncome = t.total;
      if (t._id === 'expense') totalExpense = t.total;
      totalTransactions += t.count;
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

    // 2. Current Month Totals
    const currentMonthTotals = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfCurrentMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let thisMonthIncome = 0;
    let thisMonthExpense = 0;
    currentMonthTotals.forEach((t) => {
      if (t._id === 'income') thisMonthIncome = t.total;
      if (t._id === 'expense') thisMonthExpense = t.total;
    });

    // 3. Previous Month Totals (for % comparison)
    const prevMonthTotals = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let prevMonthIncome = 0;
    let prevMonthExpense = 0;
    prevMonthTotals.forEach((t) => {
      if (t._id === 'income') prevMonthIncome = t.total;
      if (t._id === 'expense') prevMonthExpense = t.total;
    });

    const incomeGrowth = prevMonthIncome > 0 ? Math.round(((thisMonthIncome - prevMonthIncome) / prevMonthIncome) * 100) : 0;
    const expenseGrowth = prevMonthExpense > 0 ? Math.round(((thisMonthExpense - prevMonthExpense) / prevMonthExpense) * 100) : 0;

    // 4. Monthly Trend for past 6 months
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTrendData = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Build standard 6-month array
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear();
      const mo = d.getMonth() + 1;
      const monthLabel = `${monthNames[mo - 1]} ${yr.toString().slice(-2)}`;

      const incMatch = monthlyTrendData.find((m) => m._id.year === yr && m._id.month === mo && m._id.type === 'income');
      const expMatch = monthlyTrendData.find((m) => m._id.year === yr && m._id.month === mo && m._id.type === 'expense');

      const inc = incMatch ? incMatch.total : 0;
      const exp = expMatch ? expMatch.total : 0;

      monthlyTrends.push({
        month: monthLabel,
        income: inc,
        expense: exp,
        net: inc - exp,
      });
    }

    // 5. Expense Breakdown by Category (Current month or all-time if month empty)
    const categoryStats = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // 6. Recent Transactions (last 6)
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(6)
      .lean();

    // 7. Active Budgets for current month
    const currentMonthStr = now.toISOString().slice(0, 7);
    const activeBudgets = await Budget.find({ user: userId, month: currentMonthStr });
    
    // Quick budget summary
    let totalBudgetLimit = 0;
    activeBudgets.forEach((b) => (totalBudgetLimit += b.amount));

    // 8. Goals preview
    const activeGoals = await Goal.find({ user: userId }).sort({ deadline: 1 }).limit(4);

    // 9. Financial Health Score (0-100)
    let healthScore = 50;
    if (savingsRate >= 30) healthScore += 25;
    else if (savingsRate >= 15) healthScore += 15;
    else if (savingsRate > 0) healthScore += 5;

    if (thisMonthExpense <= thisMonthIncome) healthScore += 15;
    if (activeGoals.length > 0) healthScore += 10;
    healthScore = Math.min(100, Math.max(10, healthScore));

    res.json({
      success: true,
      data: {
        summary: {
          netBalance,
          totalIncome,
          totalExpense,
          savingsRate,
          totalTransactions,
          thisMonthIncome,
          thisMonthExpense,
          thisMonthNet: thisMonthIncome - thisMonthExpense,
          prevMonthIncome,
          prevMonthExpense,
          incomeGrowth,
          expenseGrowth,
          financialHealthScore: healthScore,
        },
        monthlyTrends,
        categoryStats,
        recentTransactions,
        budgetsCount: activeBudgets.length,
        totalBudgetLimit,
        goals: activeGoals,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/dashboard/reports
// @desc    Advanced reports with date range filters
// @access  Private
router.get('/reports', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { startDate, endDate } = req.query;

    const dateFilter = { user: userId };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.date.$lte = end;
      }
    }

    // Category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { ...dateFilter, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Income breakdown
    const incomeBreakdown = await Transaction.aggregate([
      { $match: { ...dateFilter, type: 'income' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Payment method distribution
    const paymentMethodStats = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Daily breakdown for line chart
    const dailyStats = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            dateStr: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.dateStr': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        categoryBreakdown,
        incomeBreakdown,
        paymentMethodStats,
        dailyStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
