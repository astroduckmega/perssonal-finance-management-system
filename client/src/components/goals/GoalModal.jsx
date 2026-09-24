import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useCurrency } from '../../context/CurrencyContext';
import { GOAL_CATEGORIES } from '../../utils/constants';
import { Calendar, Tag, Target, Palette } from 'lucide-react';
import api from '../../api/axios';

const PRESET_COLORS = [
  '#7c3aed', // Purple
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#ef4444', // Red
];

export default function GoalModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const { currentSymbol } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: GOAL_CATEGORIES[0],
    color: PRESET_COLORS[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        targetAmount: initialData.targetAmount || '',
        currentAmount: initialData.currentAmount || '0',
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
        category: initialData.category || GOAL_CATEGORIES[0],
        color: initialData.color || PRESET_COLORS[0],
      });
    } else {
      // Default deadline: 6 months from today
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 6);

      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: defaultDate.toISOString().split('T')[0],
        category: GOAL_CATEGORIES[0],
        color: PRESET_COLORS[0],
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide a goal name');
      return;
    }

    if (!formData.targetAmount || Number(formData.targetAmount) <= 0) {
      setError('Please provide a valid target amount greater than 0');
      return;
    }

    if (!formData.deadline) {
      setError('Please select a target deadline');
      return;
    }

    try {
      setLoading(true);
      if (initialData?._id) {
        await api.put(`/goals/${initialData._id}`, formData);
      } else {
        await api.post('/goals', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Savings Goal' : 'Create New Savings Goal'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center">
            <Target className="w-3.5 h-3.5 mr-1 text-brand-400" /> Goal Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Dream Vacation to Tokyo, Emergency Fund"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Target Amount</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                {currentSymbol}
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder="200000"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                className="w-full glass-input rounded-xl pl-8 pr-3 py-2.5 text-sm font-bold text-white placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Initial Saved Amount</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                {currentSymbol}
              </span>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                className="w-full glass-input rounded-xl pl-8 pr-3 py-2.5 text-sm font-bold text-white placeholder-slate-600"
              />
            </div>
          </div>
        </div>

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
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-brand-400" /> Target Deadline
            </label>
            <input
              type="date"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white"
            />
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center">
            <Palette className="w-3.5 h-3.5 mr-1 text-brand-400" /> Theme Color
          </label>
          <div className="flex items-center space-x-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFormData({ ...formData, color: c })}
                className={`w-7 h-7 rounded-full transition-transform ${
                  formData.color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110 opacity-75'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

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
            {loading ? 'Saving...' : initialData ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
