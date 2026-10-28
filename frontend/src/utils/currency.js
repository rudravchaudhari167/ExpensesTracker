/**
 * Currency Formatting Utilities
 */

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', label: 'USD ($)', locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', label: 'INR (₹)', locale: 'en-IN' },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£)', locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$)', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'AU$', label: 'AUD (AU$)', locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥', label: 'JPY (¥)', locale: 'ja-JP' },
};

export const DEFAULT_CURRENCY = 'USD';

export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY, options = {}) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const isZeroDecimal = currencyCode === 'JPY';
  const defaultFractions = isZeroDecimal ? 0 : 2;

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: options.fractionDigits ?? defaultFractions,
      maximumFractionDigits: options.fractionDigits ?? defaultFractions,
    }).format(num);
  } catch {
    return `${currency.symbol}${num.toFixed(defaultFractions)}`;
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
