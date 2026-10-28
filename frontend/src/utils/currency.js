/**
 * Currency Formatting Utilities
 */

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', label: 'USD ($)', locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', label: 'INR (₹)', locale: 'en-IN' },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£)', locale: 'en-GB' },
};

export const DEFAULT_CURRENCY = 'USD';

export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY, options = {}) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: options.fractionDigits ?? 2,
      maximumFractionDigits: options.fractionDigits ?? 2,
    }).format(num);
  } catch {
    return `${currency.symbol}${num.toFixed(2)}`;
  }
}

export function formatAmountWithSign(amount, type, currencyCode = DEFAULT_CURRENCY) {
  const formatted = formatCurrency(Math.abs(amount), currencyCode);
  if (type === 'INCOME') {
    return `+${formatted}`;
  }
  if (type === 'EXPENSE') {
    return `-${formatted}`;
  }
  return formatted;
}
