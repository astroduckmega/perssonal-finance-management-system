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
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Remaining to reach goal:</span>
          <span className="font-extrabold text-emerald-400">{formatCurrency(remaining)}</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center">
            <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Contribution Amount
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-black text-slate-400">
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
              className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-base font-bold text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500"
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
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors border border-slate-700/60"
            >
              +{formatCurrency(val)}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Notes (Optional)</label>
          <input
            type="text"
            placeholder="e.g. March bonus, Freelance side income"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full glass-input rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600"
          />
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
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-glow-emerald transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Adding...' : 'Add Contribution'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
