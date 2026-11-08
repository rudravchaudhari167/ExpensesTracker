/**
 * Currency Formatting Utilities
 */

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', label: '$ USD • US Dollar', locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', label: '₹ INR • Indian Rupee', locale: 'en-IN' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', label: '€ EUR • Euro', locale: 'en-IE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', label: '£ GBP • British Pound', locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', label: 'CA$ CAD • Canadian Dollar', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', label: 'AU$ AUD • Australian Dollar', locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', label: '¥ JPY • Japanese Yen', locale: 'ja-JP' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', label: 'AED AED • UAE Dirham', locale: 'en-AE' },
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

export function getCurrencySymbol(currencyCode = DEFAULT_CURRENCY) {
  return CURRENCIES[currencyCode]?.symbol || '$';
}
