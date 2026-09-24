import express from 'express';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   GET /api/transactions
// @desc    Get all transactions with filtering & pagination
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      type,
      category,
      paymentMethod,
      search,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = { user: req.user.id };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // End of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    // Also calculate totals for filtered set
    const aggregateTotals = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let filteredIncome = 0;
    let filteredExpense = 0;
    aggregateTotals.forEach((item) => {
      if (item._id === 'income') filteredIncome = item.totalAmount;
      if (item._id === 'expense') filteredExpense = item.totalAmount;
    });

    res.json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      summary: {
        totalIncome: filteredIncome,
        totalExpense: filteredExpense,
        netBalance: filteredIncome - filteredExpense,
      },
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, amount, type, category, paymentMethod, date, notes, isRecurring } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, type, and category',
      });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      title,
      amount: Number(amount),
      type,
      category,
      paymentMethod: paymentMethod || 'UPI',
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
      isRecurring: Boolean(isRecurring),
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const { title, amount, type, category, paymentMethod, date, notes, isRecurring } = req.body;

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        title: title !== undefined ? title : transaction.title,
        amount: amount !== undefined ? Number(amount) : transaction.amount,
        type: type !== undefined ? type : transaction.type,
        category: category !== undefined ? category : transaction.category,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : transaction.paymentMethod,
        date: date ? new Date(date) : transaction.date,
        notes: notes !== undefined ? notes : transaction.notes,
        isRecurring: isRecurring !== undefined ? Boolean(isRecurring) : transaction.isRecurring,
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
