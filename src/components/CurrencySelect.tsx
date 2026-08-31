import React from 'react';
import { Currency } from '../types';

interface CurrencySelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  currencies: Currency[];
  label?: string;
  minimal?: boolean;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({
  id,
  value,
  onChange,
  currencies,
  label,
  minimal = false,
}) => {
  const selectedCurrency = currencies.find((c) => c.code === value) || currencies[0];

  if (minimal) {
    return (
      <div className="relative inline-flex items-center">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label || "เลือกสกุลเงิน"}
          className="bg-white border border-gray-200 text-slate-800 font-bold text-sm rounded-lg px-3 py-2 pr-8 shadow-xs cursor-pointer hover:bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all appearance-none"
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.flag} {currency.code}
            </option>
          ))}
        </select>
        <div className="absolute right-2.5 pointer-events-none text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center gap-2 pointer-events-none z-10">
          <span className="text-lg" role="img" aria-label={selectedCurrency.name}>
            {selectedCurrency.flag}
          </span>
          <span className="font-bold text-slate-800 tracking-wide text-sm font-mono">
            {selectedCurrency.code}
          </span>
        </div>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-24 pr-10 py-3 bg-white hover:bg-gray-50/80 focus:bg-white text-slate-700 text-sm font-medium rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none cursor-pointer appearance-none shadow-2xs"
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.flag} {currency.code} - {currency.nameTh} ({currency.name})
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
