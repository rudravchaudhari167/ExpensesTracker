import React from 'react';
import {
  Utensils,
  Coffee,
  ShoppingBag,
  Home,
  Film,
  Zap,
  Car,
  HeartPulse,
  Briefcase,
  Plane,
  TrendingUp,
  Wallet,
  CircleDollarSign,
  Tag,
  Gift,
  BookOpen,
  Smartphone,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Coffee',
  'Shopping',
  'Housing & Rent',
  'Entertainment',
  'Transportation',
  'Utilities',
  'Health & Fitness',
  'Travel',
  'Education',
  'Personal Care',
];

export const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Gift & Allowance',
  'Refunds',
  'Side Hustle',
  'Scholarship',
  'Other Income',
];

const CATEGORY_MAP = {
  // Food & Dining
  food: { icon: Utensils, bg: '#FDEAE3', color: '#B95337' },
  'food & dining': { icon: Utensils, bg: '#FDEAE3', color: '#B95337' },
  groceries: { icon: ShoppingBag, bg: '#FBF0D8', color: '#8C731A' },
  coffee: { icon: Coffee, bg: '#F9ECE4', color: '#B95337' },
  pizza: { icon: Utensils, bg: '#FDEAE3', color: '#B95337' },
  bhakar: { icon: Utensils, bg: '#FDEAE3', color: '#B95337' },
  lunch: { icon: Utensils, bg: '#FDEAE3', color: '#B95337' },
  dinner: { icon: Utensils, bg: '#FDEAE3', color: '#B95337' },

  // Shopping & Lifestyle
  shopping: { icon: ShoppingBag, bg: '#EAE3F7', color: '#5B4E7E' },
  clothing: { icon: Tag, bg: '#EAE3F7', color: '#5B4E7E' },
  electronics: { icon: Smartphone, bg: '#E2EEFA', color: '#2C5C8A' },
  entertainment: { icon: Film, bg: '#F8E7F0', color: '#8A3B65' },
  movies: { icon: Film, bg: '#F8E7F0', color: '#8A3B65' },

  // Home & Utilities
  housing: { icon: Home, bg: '#EBF4EC', color: '#3E6B3B' },
  'housing & rent': { icon: Home, bg: '#EBF4EC', color: '#3E6B3B' },
  rent: { icon: Home, bg: '#EBF4EC', color: '#3E6B3B' },
  utilities: { icon: Zap, bg: '#FBF6DB', color: '#846E13' },
  bills: { icon: Zap, bg: '#FBF6DB', color: '#846E13' },

  // Transport & Travel
  transportation: { icon: Car, bg: '#EAEFFE', color: '#3B579D' },
  transport: { icon: Car, bg: '#EAEFFE', color: '#3B579D' },
  travel: { icon: Plane, bg: '#E4F4F5', color: '#1B6A70' },
  flight: { icon: Plane, bg: '#E4F4F5', color: '#1B6A70' },

  // Health
  health: { icon: HeartPulse, bg: '#FCE7EB', color: '#A03247' },
  'health & fitness': { icon: HeartPulse, bg: '#FCE7EB', color: '#A03247' },
  medical: { icon: HeartPulse, bg: '#FCE7EB', color: '#A03247' },

  // Income categories
  salary: { icon: Briefcase, bg: '#DDE8D8', color: '#3E6B3B' },
  freelance: { icon: CircleDollarSign, bg: '#DCECE7', color: '#2B6A56' },
  investment: { icon: TrendingUp, bg: '#E4F2DC', color: '#3E6B3B' },
  investments: { icon: TrendingUp, bg: '#E4F2DC', color: '#3E6B3B' },
  gift: { icon: Gift, bg: '#F6E6A9', color: '#8C731A' },
  savings: { icon: PiggyBank, bg: '#EAE3F7', color: '#5B4E7E' },
  education: { icon: BookOpen, bg: '#EFEAE2', color: '#6A5645' },
};

export function getCategoryStyle(category, type = 'EXPENSE') {
  const key = (category || '').toLowerCase().trim();
  if (CATEGORY_MAP[key]) {
    return CATEGORY_MAP[key];
  }

  // Fallbacks by type
  if (type === 'INCOME') {
    return { icon: ArrowDownLeft, bg: '#DDE8D8', color: '#3E6B3B' };
  }
  return { icon: Tag, bg: '#F2ECE1', color: '#858276' };
}

export function CategoryIcon({ category, type = 'EXPENSE', size = 18, className = '' }) {
  const style = getCategoryStyle(category, type);
  const IconComponent = style.icon;

  return (
    <div
      className={`category-icon-wrapper ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size * 1.8,
        height: size * 1.8,
        borderRadius: '50%',
        flexShrink: 0,
      }}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
}
