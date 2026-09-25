import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useCurrency } from '../../context/CurrencyContext';
import confetti from 'canvas-confetti';
import api from '../../api/axios';
import { Sparkles, DollarSign } from 'lucide-react';

export default function ContributeModal({ isOpen, onClose, onSuccess, goal }) {
  const { currentSymbol, formatCurrency } = useCurrency();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please provide a valid contribution amount.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/goals/${goal._id}/contribute`, {
        amount: numAmount,
        notes: notes || 'Goal contribution',
      });

      if (res.data.isJustCompleted || (goal.currentAmount + numAmount) >= goal.targetAmount) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }

      onSuccess();
      onClose();
      setAmount('');
      setNotes('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Contribute to "${goal.name}"`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">Remaining to reach goal:</span>
          <span className="font-extrabold text-emerald-600">{formatCurrency(remaining)}</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center">
            <DollarSign className="w-3.5 h-3.5 mr-1 text-[#E8450A]" /> Contribution Amount
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-gray-400">
              {currentSymbol}
            </span>
            <input
              type="number"
              step="any"
              required
              autoFocus
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-base font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E8450A] focus:ring-2 focus:ring-[#E8450A]/20"
            />
          </div>
        </div>

        {/* Quick Amount Suggestion Buttons */}
        <div className="flex items-center space-x-2">
          {[1000, 5000, 10000, remaining].filter(val => val > 0 && val <= remaining + 10000).map((val, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setAmount(val.toString())}
              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold transition-colors border border-gray-200"
            >
              +{formatCurrency(val)}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Notes (Optional)</label>
          <input
            type="text"
            placeholder="e.g. March bonus, Freelance side income"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E8450A]"
          />
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
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#E8450A] hover:bg-[#d03d08] shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Adding...' : 'Add Contribution'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
