/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  Coins,
  ArrowRight,
  TrendingUp,
  BookmarkPlus,
  Check,
  Zap,
} from 'lucide-react';
import { CURRENCIES, FALLBACK_RATES } from './data/currencies';
import { CurrencySelect } from './components/CurrencySelect';
import { HistoryList } from './components/HistoryList';
import { RateInfo } from './components/RateInfo';
import { QuickAmounts } from './components/QuickAmounts';
import { ConversionHistoryItem, ExchangeRateResponse } from './types';

const HISTORY_STORAGE_KEY = 'currency_converter_history_v1';

export default function App() {
  // State for Currencies
  const [currencyOne, setCurrencyOne] = useState<string>('THB');
  const [currencyTwo, setCurrencyTwo] = useState<string>('USD');

  // State for Amounts (Two-way conversion)
  const [amountOne, setAmountOne] = useState<string>('1000');
  const [amountTwo, setAmountTwo] = useState<string>('');

  // Which input was actively edited last ('one' | 'two' | null)
  const [lastEdited, setLastEdited] = useState<'one' | 'two'>('one');

  // Exchange Rates State (relative to USD)
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);
  const [rateText, setRateText] = useState<string>('');
  const [inverseRateText, setInverseRateText] = useState<string>('');

  // History State (Recent 10 items)
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);

  // Formatting Thai timestamp helper
  const formatTimestamp = (date: Date = new Date()): string => {
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + ' น.';
  };

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 10));
        }
      } else {
        // Initial sample history for demonstration if empty
        const initialSample: ConversionHistoryItem[] = [
          {
            id: 'sample-1',
            timestamp: Date.now() - 120000,
            formattedTime: formatTimestamp(new Date(Date.now() - 120000)),
            fromAmount: 1000,
            fromCurrency: 'THB',
            toAmount: 28.17,
            toCurrency: 'USD',
            rate: 0.02817,
          },
          {
            id: 'sample-2',
            timestamp: Date.now() - 360000,
            formattedTime: formatTimestamp(new Date(Date.now() - 360000)),
            fromAmount: 50,
            fromCurrency: 'USD',
            toAmount: 1775.0,
            toCurrency: 'THB',
            rate: 35.5,
          },
          {
            id: 'sample-3',
            timestamp: Date.now() - 720000,
            formattedTime: formatTimestamp(new Date(Date.now() - 720000)),
            fromAmount: 10000,
            fromCurrency: 'JPY',
            toAmount: 2315.5,
            toCurrency: 'THB',
            rate: 0.23155,
          },
        ];
        setHistory(initialSample);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(initialSample));
      }
    } catch {
      // Fallback ignore storage error
    }
  }, []);

  // Fetch live exchange rates from open exchange API
  const fetchRates = useCallback(async () => {
    setIsLoadingRates(true);
    try {
      // Free open-access API for exchange rates
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (response.ok) {
        const data: ExchangeRateResponse = await response.json();
        if (data && data.rates) {
          setRates(data.rates);
          const timeStr = data.time_last_update_utc
            ? formatTimestamp(new Date(data.time_last_update_utc))
            : formatTimestamp(new Date());
          setLastUpdatedTime(timeStr);
          return;
        }
      }
      throw new Error('API response invalid');
    } catch {
      // Fallback to local fallback rates and current timestamp
      setRates(FALLBACK_RATES);
      setLastUpdatedTime(formatTimestamp(new Date()));
    } finally {
      setIsLoadingRates(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Calculate Exchange Rate between currencyOne and currencyTwo
  // Rate: 1 currencyOne = X currencyTwo
  const getExchangeRate = useCallback(
    (c1: string, c2: string): number => {
      const rate1 = rates[c1] || FALLBACK_RATES[c1] || 1;
      const rate2 = rates[c2] || FALLBACK_RATES[c2] || 1;
      // Since rates are relative to USD: 1 USD = rate1 c1 => 1 c1 = (1/rate1) USD => (rate2/rate1) c2
      return rate2 / rate1;
    },
    [rates]
  );

  // Update Rate Display text & inverse rate
  useEffect(() => {
    const directRate = getExchangeRate(currencyOne, currencyTwo);
    const invRate = getExchangeRate(currencyTwo, currencyOne);

    const c1Info = CURRENCIES.find((c) => c.code === currencyOne);
    const c2Info = CURRENCIES.find((c) => c.code === currencyTwo);

    setRateText(
      `1 ${currencyOne} = ${directRate.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })} ${currencyTwo}`
    );

    setInverseRateText(
      `1 ${currencyTwo} = ${invRate.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })} ${currencyOne}`
    );
  }, [currencyOne, currencyTwo, getExchangeRate]);

  // Two-Way Conversion Logic (โจทย์ที่ 1)
  // When amountOne changes, calculate amountTwo
  const calculateFromOne = useCallback(
    (val: string) => {
      if (val === '' || isNaN(Number(val))) {
        setAmountTwo('');
        return;
      }
      const num1 = parseFloat(val);
      if (num1 < 0) {
        setAmountTwo('0');
        return;
      }
      const rate = getExchangeRate(currencyOne, currencyTwo);
      const converted = num1 * rate;
      // Round to maximum 4 decimal places, avoiding trailing zeroes for clean reading
      const formatted = Number(converted.toFixed(4)).toString();
      setAmountTwo(formatted);
    },
    [currencyOne, currencyTwo, getExchangeRate]
  );

  // When amountTwo changes, calculate amountOne (Bi-directional / ย้อนกลับ)
  const calculateFromTwo = useCallback(
    (val: string) => {
      if (val === '' || isNaN(Number(val))) {
        setAmountOne('');
        return;
      }
      const num2 = parseFloat(val);
      if (num2 < 0) {
        setAmountOne('0');
        return;
      }
      const rate = getExchangeRate(currencyOne, currencyTwo);
      if (rate === 0) return;
      const converted = num2 / rate;
      const formatted = Number(converted.toFixed(4)).toString();
      setAmountOne(formatted);
    },
    [currencyOne, currencyTwo, getExchangeRate]
  );

  // Recalculate when currencies change or rates update
  useEffect(() => {
    if (lastEdited === 'one') {
      calculateFromOne(amountOne);
    } else {
      calculateFromTwo(amountTwo);
    }
  }, [currencyOne, currencyTwo, rates, lastEdited, calculateFromOne, calculateFromTwo]);

  // Handler for amount-one change
  const handleAmountOneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmountOne(val);
    setLastEdited('one');
    calculateFromOne(val);
  };

  // Handler for amount-two change (โจทย์ที่ 1: คำนวณย้อนกลับมายังช่องต้นทาง)
  const handleAmountTwoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmountTwo(val);
    setLastEdited('two');
    calculateFromTwo(val);
  };

  // Swap currencies
  const handleSwapCurrencies = () => {
    const tempCurrency = currencyOne;
    setCurrencyOne(currencyTwo);
    setCurrencyTwo(tempCurrency);

    // Swap amount values smoothly
    setAmountOne(amountTwo);
    setAmountTwo(amountOne);
    setLastEdited('one');
  };

  // โจทย์ที่ 3: เพิ่มปุ่มล้างข้อมูล
  // คืนค่า Input ทั้งสองช่องเป็นค่าว่าง และเปลี่ยนข้อความอัตราแลกเปลี่ยนกลับเป็นสถานะเริ่มต้น
  const handleClearData = () => {
    setAmountOne('');
    setAmountTwo('');
    setLastEdited('one');
    // Reset currencies to default THB -> USD if desired, or keep current with clean inputs
    const directRate = getExchangeRate(currencyOne, currencyTwo);
    setRateText(
      `1 ${currencyOne} = ${directRate.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })} ${currencyTwo}`
    );
  };

  // Save current conversion to history (โจทย์ที่ 2)
  const saveToHistory = useCallback(() => {
    const num1 = parseFloat(amountOne);
    const num2 = parseFloat(amountTwo);
    if (!amountOne || !amountTwo || isNaN(num1) || isNaN(num2) || num1 <= 0) {
      return;
    }

    const rate = getExchangeRate(currencyOne, currencyTwo);
    const newItem: ConversionHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      formattedTime: formatTimestamp(new Date()),
      fromAmount: num1,
      fromCurrency: currencyOne,
      toAmount: num2,
      toCurrency: currencyTwo,
      rate: rate,
    };

    setHistory((prev) => {
      // Check if duplicate of most recent
      if (
        prev.length > 0 &&
        prev[0].fromAmount === newItem.fromAmount &&
        prev[0].fromCurrency === newItem.fromCurrency &&
        prev[0].toCurrency === newItem.toCurrency
      ) {
        return prev;
      }
      const updated = [newItem, ...prev].slice(0, 10);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2200);
  }, [amountOne, amountTwo, currencyOne, currencyTwo, getExchangeRate]);

  // Debounced auto-save to history when user stops typing a valid amount
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    const num1 = parseFloat(amountOne);
    const num2 = parseFloat(amountTwo);

    if (amountOne && amountTwo && !isNaN(num1) && !isNaN(num2) && num1 > 0) {
      autoSaveTimerRef.current = setTimeout(() => {
        const rate = getExchangeRate(currencyOne, currencyTwo);
        const newItem: ConversionHistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: Date.now(),
          formattedTime: formatTimestamp(new Date()),
          fromAmount: num1,
          fromCurrency: currencyOne,
          toAmount: num2,
          toCurrency: currencyTwo,
          rate: rate,
        };

        setHistory((prev) => {
          if (
            prev.length > 0 &&
            prev[0].fromAmount === newItem.fromAmount &&
            prev[0].fromCurrency === newItem.fromCurrency &&
            prev[0].toCurrency === newItem.toCurrency
          ) {
            return prev;
          }
          const updated = [newItem, ...prev].slice(0, 10);
          try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }, 1500);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [amountOne, amountTwo, currencyOne, currencyTwo, getExchangeRate]);

  // โจทย์ที่ 2: ล้างประวัติ (Clear History)
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {}
  };

  // Restore history item to inputs
  const handleSelectHistoryItem = (item: ConversionHistoryItem) => {
    setCurrencyOne(item.fromCurrency);
    setCurrencyTwo(item.toCurrency);
    setAmountOne(item.fromAmount.toString());
    setAmountTwo(item.toAmount.toString());
    setLastEdited('one');
  };

  // Handle Quick Amount Preset
  const handleQuickAmount = (val: number) => {
    setAmountOne(val.toString());
    setLastEdited('one');
    calculateFromOne(val.toString());
  };

  const currOneObj = CURRENCIES.find((c) => c.code === currencyOne) || CURRENCIES[0];
  const currTwoObj = CURRENCIES.find((c) => c.code === currencyTwo) || CURRENCIES[1];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900">
      {/* Header matching Clean Minimalism theme */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 sm:px-10 py-6 sm:py-8 bg-white border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-indigo-600">FX-Global</h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200/80">
              เครื่องมือแปลงสกุลเงิน
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Professional Currency Exchange & Conversion Tool
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">
            Last Market Sync (อัปเดตล่าสุด)
          </p>
          <p
            id="last-sync-badge"
            className="text-xs sm:text-sm font-mono bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700 border border-slate-200/60 inline-flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {lastUpdatedTime || 'กำลังโหลดข้อมูล...'}
          </p>
        </div>
      </header>

      {/* Main Content Grid Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-start">
        {/* Left Column: Converter Utility (7 cols) */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center text-slate-800">
              <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></span>
              Converter Utility (คำนวณอัตราแลกเปลี่ยน)
            </h2>

            <div className="space-y-6">
              {/* Amount One (Source) */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="amount-one"
                    className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                  >
                    Amount One (จำนวนเงินต้นทาง)
                  </label>
                  <span className="text-xs text-indigo-600 font-medium">
                    {currOneObj.nameTh} ({currOneObj.symbol})
                  </span>
                </div>
                <div className="flex items-center border-2 border-gray-100 focus-within:border-indigo-500 rounded-xl px-4 py-3 bg-gray-50 transition-colors shadow-2xs">
                  <input
                    id="amount-one"
                    type="number"
                    step="any"
                    min="0"
                    value={amountOne}
                    onChange={handleAmountOneChange}
                    placeholder="0.00"
                    className="bg-transparent text-2xl font-semibold w-full focus:outline-none text-slate-900 font-mono"
                  />
                  <CurrencySelect
                    id="currency-one"
                    value={currencyOne}
                    onChange={(val) => setCurrencyOne(val)}
                    currencies={CURRENCIES}
                    minimal
                  />
                </div>
              </div>

              {/* Swap Button (สลับสกุลเงิน) */}
              <div className="flex justify-center -my-2">
                <button
                  id="swap-btn"
                  type="button"
                  onClick={handleSwapCurrencies}
                  className="bg-indigo-50 hover:bg-indigo-100 p-2.5 rounded-full border border-indigo-100 text-indigo-600 transition-all active:scale-95 cursor-pointer shadow-2xs hover:rotate-180 duration-300"
                  title="สลับสกุลเงินต้นทาง-ปลายทาง"
                >
                  <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                </button>
              </div>

              {/* Amount Two (Destination) - โจทย์ที่ 1: คำนวณสองทิศทาง */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="amount-two"
                    className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                  >
                    Amount Two (จำนวนเงินปลายทาง - สองทิศทาง)
                  </label>
                  <span className="text-xs text-indigo-600 font-medium">
                    {currTwoObj.nameTh} ({currTwoObj.symbol})
                  </span>
                </div>
                <div className="flex items-center border-2 border-gray-100 focus-within:border-indigo-500 rounded-xl px-4 py-3 bg-gray-50 transition-colors shadow-2xs">
                  <input
                    id="amount-two"
                    type="number"
                    step="any"
                    min="0"
                    value={amountTwo}
                    onChange={handleAmountTwoChange}
                    placeholder="0.00"
                    className="bg-transparent text-2xl font-semibold w-full focus:outline-none text-slate-900 font-mono"
                  />
                  <CurrencySelect
                    id="currency-two"
                    value={currencyTwo}
                    onChange={(val) => setCurrencyTwo(val)}
                    currencies={CURRENCIES}
                    minimal
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="pt-1">
                <QuickAmounts
                  onSelectAmount={handleQuickAmount}
                  currencySymbol={currOneObj.symbol}
                  currencyCode={currencyOne}
                />
              </div>
            </div>

            {/* Action Buttons Row (โจทย์ที่ 3: ปุ่มล้างข้อมูล + Update Rates) */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap sm:flex-nowrap gap-3 items-center">
              <button
                id="update-rates-btn"
                type="button"
                onClick={fetchRates}
                disabled={isLoadingRates}
                className="flex-1 py-3.5 px-5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className={`w-4 h-4 ${isLoadingRates ? 'animate-spin' : ''}`} />
                <span>Update Rates (อัปเดตเรท)</span>
              </button>

              <button
                id="clear-btn"
                type="button"
                onClick={handleClearData}
                className="px-6 py-3.5 bg-white border border-gray-200 text-slate-600 font-bold rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-colors cursor-pointer flex items-center gap-1.5"
                title="คืนค่า Input ทั้งสองช่องเป็นค่าว่าง"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Clear Data (ล้างข้อมูล)</span>
              </button>

              <button
                type="button"
                onClick={saveToHistory}
                disabled={!amountOne || !amountTwo || parseFloat(amountOne) <= 0}
                className="px-4 py-3.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 active:scale-[0.98] transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
                title="บันทึกรายการนี้ลงในประวัติ"
              >
                <BookmarkPlus className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">บันทึก</span>
              </button>
            </div>

            {showSaveToast && (
              <div className="mt-3 p-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-1.5 justify-center">
                <Check className="w-3.5 h-3.5" />
                <span>บันทึกประวัติการแปลงเงินสำเร็จแล้ว</span>
              </div>
            )}
          </div>

          {/* Live Rate Card (โจทย์ที่ 4) */}
          <RateInfo
            rateText={rateText}
            inverseRateText={inverseRateText}
            lastUpdated={lastUpdatedTime || 'กำลังโหลดข้อมูล...'}
            isLoading={isLoadingRates}
            onRefresh={fetchRates}
          />
        </section>

        {/* Right Column: Recent Activity History (5 cols) - โจทย์ที่ 2 */}
        <section className="lg:col-span-5 h-full flex flex-col">
          <HistoryList
            history={history}
            onClearHistory={handleClearHistory}
            onSelectHistoryItem={handleSelectHistoryItem}
          />
        </section>
      </main>
    </div>
  );
}
