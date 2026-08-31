import React from 'react';

interface QuickAmountsProps {
  onSelectAmount: (amount: number) => void;
  currencySymbol: string;
  currencyCode: string;
}

export const QuickAmounts: React.FC<QuickAmountsProps> = ({
  onSelectAmount,
  currencyCode,
}) => {
  const presets = [100, 500, 1000, 5000, 10000];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">
        ด่วน:
      </span>
      {presets.map((val) => (
        <button
          key={val}
          type="button"
          onClick={() => onSelectAmount(val)}
          className="px-2.5 py-1 text-xs font-mono font-medium text-slate-600 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-gray-200/80 rounded-lg transition-all active:scale-95 cursor-pointer shadow-2xs"
        >
          +{val.toLocaleString()} {currencyCode}
        </button>
      ))}
    </div>
  );
};
