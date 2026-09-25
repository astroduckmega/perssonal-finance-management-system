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
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
              formData.type === 'expense'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
              formData.type === 'income'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Income</span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-extrabold text-gray-400">
              {currentSymbol}
            </span>
            <input
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-base font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E8450A] focus:ring-2 focus:ring-[#E8450A]/20"
            />
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Title / Description</label>
          <input
            type="text"
            required
            placeholder="e.g. Groceries, Salary, Dinner"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E8450A] focus:ring-2 focus:ring-[#E8450A]/20"
          />
        </div>

        {/* Category & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center">
              <Tag className="w-3.5 h-3.5 mr-1 text-[#E8450A]" /> Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#E8450A]"
            >
              {categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center">
              <CreditCard className="w-3.5 h-3.5 mr-1 text-[#E8450A]" /> Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#E8450A]"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-[#E8450A]" /> Date
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#E8450A]"
          />
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center">
            <FileText className="w-3.5 h-3.5 mr-1 text-[#E8450A]" /> Notes (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Add any extra notes or tags..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E8450A]"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#E8450A] hover:bg-[#d03d08] shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : initialData ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
