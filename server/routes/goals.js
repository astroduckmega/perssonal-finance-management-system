import express from 'express';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// @route   GET /api/goals
// @desc    Get all savings goals with calculated progress
// @access  Private
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ deadline: 1 });

    let totalSaved = 0;
    let totalTarget = 0;

    const enrichedGoals = goals.map((g) => {
      totalSaved += g.currentAmount;
      totalTarget += g.targetAmount;
      const progress = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
      const isCompleted = g.currentAmount >= g.targetAmount;
      const daysRemaining = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));

      return {
        ...g.toObject(),
        progress,
        isCompleted,
        daysRemaining: Math.max(0, daysRemaining),
        isOverdue: daysRemaining < 0 && !isCompleted,
      };
    });

    res.json({
      success: true,
      summary: {
        totalGoals: goals.length,
        completedGoals: enrichedGoals.filter((g) => g.isCompleted).length,
        totalSaved,
        totalTarget,
        overallProgress: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
      },
      data: enrichedGoals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/goals
// @desc    Create a new goal
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline, category, color, icon } = req.body;

    if (!name || !targetAmount || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide goal name, target amount, and deadline',
      });
    }

    const goal = await Goal.create({
      user: req.user.id,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount ? Number(currentAmount) : 0,
      deadline: new Date(deadline),
      category: category || 'General Savings',
      color: color || '#7c3aed',
      icon: icon || 'Target',
      contributions: currentAmount > 0 ? [{ amount: Number(currentAmount), date: new Date(), notes: 'Initial balance' }] : [],
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/goals/:id/contribute
// @desc    Add funds to a savings goal
// @access  Private
router.post('/:id/contribute', async (req, res) => {
  try {
    const { amount, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid contribution amount' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const contribution = {
      amount: Number(amount),
      date: new Date(),
      notes: notes || 'Goal contribution',
    };

    goal.currentAmount += Number(amount);
    goal.contributions.unshift(contribution);

    await goal.save();

    const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
    const isJustCompleted = goal.currentAmount >= goal.targetAmount;

    res.json({
      success: true,
      data: goal,
      progress,
      isJustCompleted,
      message: isJustCompleted ? '🎉 Congratulations! You achieved this goal!' : 'Contribution added successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/goals/:id
// @desc    Update a goal
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline, category, color, icon } = req.body;

    let goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (name) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) goal.currentAmount = Number(currentAmount);
    if (deadline) goal.deadline = new Date(deadline);
    if (category) goal.category = category;
    if (color) goal.color = color;
    if (icon) goal.icon = icon;

    await goal.save();

    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    res.json({ success: true, message: 'Goal removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
