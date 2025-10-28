// Currency formatting utilities for multi-currency support

export const currencySymbols: { [key: string]: string } = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  CAD: 'CA$',
  AUD: 'A$',
  NZD: 'NZ$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  MXN: 'MX$',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RON: 'lei',
  BGN: 'лв',
  HRK: 'kn',
  RUB: '₽',
  TRY: '₺',
  ZAR: 'R',
  AED: 'د.إ',
  SAR: '﷼',
  ILS: '₪',
  SGD: 'S$',
  HKD: 'HK$',
  TWD: 'NT$',
  KRW: '₩',
  THB: '฿',
  MYR: 'RM',
  IDR: 'Rp',
  PHP: '₱',
  VND: '₫'
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  options: { 
    decimals?: number,
    showCode?: boolean 
  } = {}
): string {
  const { decimals = 2, showCode = false } = options
  
  const symbol = currencySymbols[currency] || currency
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  
  if (showCode && currencySymbols[currency]) {
    return `${symbol}${formattedAmount} ${currency}`
  }
  
  return `${symbol}${formattedAmount}`
}

export function formatCompactCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  const symbol = currencySymbols[currency] || currency
  
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`
  }
  return `${symbol}${amount.toFixed(0)}`
}

// Get currency symbol only
export function getCurrencySymbol(currency: string = 'USD'): string {
  return currencySymbols[currency] || currency
}

// Format for inputs (no symbol, just number)
export function formatCurrencyInput(amount: number, decimals: number = 2): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

