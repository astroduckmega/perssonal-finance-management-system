import React from 'react';
import {
  Home,
  ShoppingCart,
  Utensils,
  Zap,
  Car,
  ShoppingBag,
  Film,
  HeartPulse,
  Plane,
  GraduationCap,
  Sparkles,
  CircleDot,
  Briefcase,
  Laptop,
  TrendingUp,
  Building2,
  Gift,
  Wallet,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/constants';

const ICON_MAP = {
  Home,
  ShoppingCart,
  Utensils,
  Zap,
  Car,
  ShoppingBag,
  Film,
  HeartPulse,
  Plane,
  GraduationCap,
  Sparkles,
  CircleDot,
  Briefcase,
  Laptop,
  TrendingUp,
  Building2,
  Gift,
  Wallet,
  Target,
  ShieldCheck,
};

export default function CategoryIcon({ category, type = 'expense', size = 'md' }) {
  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  const catObj = allCategories.find((c) => c.name === category) || {
    icon: type === 'income' ? 'Wallet' : 'CircleDot',
    color: type === 'income' ? '#10b981' : '#8b5cf6',
  };

  const IconComp = ICON_MAP[catObj.icon] || (type === 'income' ? Wallet : CircleDot);

  const sizeClasses = {
    sm: 'w-7 h-7 p-1.5 text-xs',
    md: 'w-10 h-10 p-2.5 text-sm',
    lg: 'w-12 h-12 p-3 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={`rounded-xl flex items-center justify-center font-bold ${sizeClasses[size] || sizeClasses.md}`}
      style={{
        backgroundColor: `${catObj.color}20`,
        color: catObj.color,
        border: `1px solid ${catObj.color}40`,
      }}
    >
      <IconComp className={iconSizes[size] || iconSizes.md} />
    </div>
  );
}
