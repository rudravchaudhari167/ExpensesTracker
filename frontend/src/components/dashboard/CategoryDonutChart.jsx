import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { computeCategorySpending } from '../../utils/analytics';
import { formatCurrency } from '../../utils/currency';
import { PieChart as PieIcon } from 'lucide-react';
import './CategoryDonutChart.css';

function DonutTooltip({ active, payload, currency }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-chart-tooltip card-surface">
        <div className="tooltip-header" style={{ color: data.color }}>
          {data.name}
        </div>
        <div className="tooltip-row">
          <span className="tooltip-label">Amount:</span>
          <span className="tooltip-val tabular-nums">{formatCurrency(data.value, currency)}</span>
        </div>
        <div className="tooltip-row">
          <span className="tooltip-label">Share:</span>
          <span className="tooltip-val tabular-nums">{data.percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
}

export function CategoryDonutChart({ transactions = [], currency = 'USD' }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const categories = useMemo(() => {
    return computeCategorySpending(transactions);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return categories.reduce((sum, item) => sum + item.value, 0);
  }, [categories]);

  const hasData = categories.length > 0;

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const activeCategory = activeIndex !== null ? categories[activeIndex] : null;

  return (
    <div className="category-donut-card card-surface animate-fade-in">
      <div className="donut-card-header">
        <div>
          <h3 className="donut-title font-serif">Expenses by Category</h3>
          <p className="donut-subtitle">Distribution of all outgoing funds</p>
        </div>
        <span className="donut-badge">
          {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
        </span>
      </div>

      <div className="donut-body">
        {hasData ? (
          <div className="donut-layout">
            <div className="donut-graphic-wrapper">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Tooltip content={<DonutTooltip currency={currency} />} />
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={84}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                  >
                    {categories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#FFFFFF"
                        strokeWidth={activeIndex === index ? 3 : 1}
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Info in Donut */}
              <div className="donut-center-info">
                <span className="donut-center-label">
                  {activeCategory ? activeCategory.name : 'Total Outflow'}
                </span>
                <span className="donut-center-amount tabular-nums font-serif">
                  {formatCurrency(activeCategory ? activeCategory.value : totalExpense, currency, { fractionDigits: 0 })}
                </span>
                {activeCategory && (
                  <span className="donut-center-share tabular-nums">
                    {activeCategory.percentage}% of total
                  </span>
                )}
              </div>
            </div>

            {/* Category Legend List */}
            <div className="donut-legend-list">
              {categories.slice(0, 5).map((cat, idx) => (
                <div
                  key={cat.name}
                  className={`donut-legend-row ${activeIndex === idx ? 'highlighted' : ''}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="legend-row-left">
                    <span className="legend-color-dot" style={{ backgroundColor: cat.color }} />
                    <span className="legend-cat-name" title={cat.name}>{cat.name}</span>
                  </div>
                  <div className="legend-row-right">
                    <span className="legend-cat-amount tabular-nums">
                      {formatCurrency(cat.value, currency)}
                    </span>
                    <span className="legend-cat-pct tabular-nums">{cat.percentage}%</span>
                  </div>
                </div>
              ))}
              {categories.length > 5 && (
                <div className="legend-more-note">
                  +{categories.length - 5} more categories in Analytics
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="chart-empty-state">
            <div className="empty-icon-wrap">
              <PieIcon size={28} />
            </div>
            <div className="empty-title">No categories yet</div>
            <p className="empty-desc">
              Expenses will automatically be mapped here to display your spending distribution.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryDonutChart;
