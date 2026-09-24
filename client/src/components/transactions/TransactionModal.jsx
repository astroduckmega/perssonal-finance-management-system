import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useCurrency } from '../../context/CurrencyContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../../utils/constants';
import { ArrowDownRight, ArrowUpRight, Calendar, CreditCard, Tag, FileText } from 'lucide-react';
import api from '../../api/axios';

export default function TransactionModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const { currentSymbol } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: EXPENSE_CATEGORIES[0].name,
    paymentMethod: 'UPI',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    isRecurring: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        type: initialData.type || 'expense',
        category: initialData.category || (initialData.type === 'income' ? INCOME_CATEGORIES[0].name : EXPENSE_CATEGORIES[0].name),
        paymentMethod: initialData.paymentMethod || 'UPI',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: initialData.notes || '',
        isRecurring: !!initialData.isRecurring,
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: EXPENSE_CATEGORIES[0].name,
        paymentMethod: 'UPI',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        isRecurring: false,
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: newType === 'income' ? INCOME_CATEGORIES[0].name : EXPENSE_CATEGORIES[0].name,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please enter a title for the transaction.');
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      setLoading(true);
      if (initialData?._id) {
        await api.put(`/transactions/${initialData._id}`, formData);
      } else {
        await api.post('/transactions', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'New Transaction'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              formData.type === 'expense'
                ? 'bg-rose-500 text-white shadow-glow-rose'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              formData.type === 'income'
                ? 'bg-emerald-500 text-white shadow-glow-emerald'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Income</span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">
              {currentSymbol}
            </span>
            <input
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full glass-input rounded-xl pl-9 pr-4 py-3 text-lg font-extrabold text-white placeholder-slate-600 focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Title / Description</label>
          <input
            type="text"
            required
            placeholder="e.g. Organic Groceries, Salary, Dinner"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600"
          />
        </div>

        {/* Category & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center">
              <Tag className="w-3.5 h-3.5 mr-1 text-brand-400" /> Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white bg-slate-900"
            >
              {categories.map((c) => (
                <option key={c.name} value={c.name} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center">
              <CreditCard className="w-3.5 h-3.5 mr-1 text-brand-400" /> Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white bg-slate-900"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-brand-400" /> Date
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
          />
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center">
            <FileText className="w-3.5 h-3.5 mr-1 text-brand-400" /> Notes (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Add any extra notes or tags..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full glass-input rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-glow transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : initialData ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
