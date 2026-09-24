import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CurrencyContext = createContext();

const CURRENCIES = {
  INR: { symbol: '₹', label: 'Indian Rupee (₹)', locale: 'en-IN' },
  USD: { symbol: '$', label: 'US Dollar ($)', locale: 'en-US' },
  EUR: { symbol: '€', label: 'Euro (€)', locale: 'de-DE' },
  GBP: { symbol: '£', label: 'British Pound (£)', locale: 'en-GB' },
  CAD: { symbol: 'CA$', label: 'Canadian Dollar (CA$)', locale: 'en-CA' },
  AUD: { symbol: 'AU$', label: 'Australian Dollar (AU$)', locale: 'en-AU' },
  JPY: { symbol: '¥', label: 'Japanese Yen (¥)', locale: 'ja-JP' },
};

export const CurrencyProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [currency, setCurrencyState] = useState(
    localStorage.getItem('selected_currency') || (user?.currency || 'INR')
  );

  useEffect(() => {
    if (user?.currency && user.currency !== currency) {
      setCurrencyState(user.currency);
      localStorage.setItem('selected_currency', user.currency);
    }
  }, [user?.currency]);

  const setCurrency = async (newCurr) => {
    if (!CURRENCIES[newCurr]) return;
    setCurrencyState(newCurr);
    localStorage.setItem('selected_currency', newCurr);
    if (user) {
      try {
        await updateProfile({ currency: newCurr });
      } catch (err) {
        console.error('Failed to sync currency preference:', err);
      }
    }
  };

  const formatCurrency = (amount, options = {}) => {
    const num = Number(amount) || 0;
    const currConfig = CURRENCIES[currency] || CURRENCIES.INR;

    const showSign = options.showSign || false;
    const sign = showSign && num > 0 ? '+' : '';

    try {
      const formatted = new Intl.NumberFormat(currConfig.locale, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: options.decimals !== undefined ? options.decimals : 2,
        minimumFractionDigits: options.decimals !== undefined ? options.decimals : 0,
      }).format(num);

      return `${sign}${formatted}`;
    } catch (e) {
      return `${sign}${currConfig.symbol}${num.toLocaleString()}`;
    }
  };

  const currentSymbol = CURRENCIES[currency]?.symbol || '₹';

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatCurrency,
        currentSymbol,
        CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
