import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useCurrency } from '../../context/CurrencyContext';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { AlertCircle, Tag, Calendar } from 'lucide-react';
import api from '../../api/axios';

export default function BudgetModal({ isOpen, onClose, onSuccess, initialData = null, defaultMonth }) {
  const { currentSymbol } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentMonthStr = defaultMonth || new Date().toISOString().slice(0, 7);

  const [formData, setFormData] = useState({
    category: EXPENSE_CATEGORIES[0].name,
    amount: '',
    month: currentMonthStr,
    alertThreshold: 80,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || EXPENSE_CATEGORIES[0].name,
        amount: initialData.amount || '',
        month: initialData.month || currentMonthStr,
        alertThreshold: initialData.alertThreshold || 80,
      });
    } else {
      setFormData({
        category: EXPENSE_CATEGORIES[0].name,
        amount: '',
        month: currentMonthStr,
        alertThreshold: 80,
      });
    }
    setError('');
  }, [initialData, isOpen, currentMonthStr]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please provide a valid budget limit greater than 0.');
      return;
    }

    try {
      setLoading(true);
      if (initialData?._id) {
        await api.put(`/budgets/${initialData._id}`, formData);
      } else {
        await api.post('/budgets', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Budget' : 'Set Category Budget'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center">
            <Tag className="w-3.5 h-3.5 mr-1 text-[#E8450A]" /> Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#E8450A]"
            disabled={!!initialData}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Budget Limit</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-gray-400">
              {currentSymbol}
            </span>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 15000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-base font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E8450A] focus:ring-2 focus:ring-[#E8450A]/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-[#E8450A]" /> Budget Month (YYYY-MM)
          </label>
          <input
            type="month"
            required
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#E8450A]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-gray-700 flex items-center">
              <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-500" /> Alert Threshold
            </label>
            <span className="text-xs font-bold text-amber-600">{formData.alertThreshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={formData.alertThreshold}
            onChange={(e) => setFormData({ ...formData, alertThreshold: Number(e.target.value) })}
            className="w-full accent-[#E8450A] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            We will alert you when your spending exceeds {formData.alertThreshold}% of this budget.
          </p>
        </div>

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
            {loading ? 'Saving...' : initialData ? 'Update Budget' : 'Set Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
