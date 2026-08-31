import React from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface RateInfoProps {
  rateText: string;
  inverseRateText?: string;
  lastUpdated: string;
  isLoading: boolean;
  onRefresh: () => void;
  isCustomRate?: boolean;
}

export const RateInfo: React.FC<RateInfoProps> = ({
  rateText,
  inverseRateText,
  lastUpdated,
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="bg-indigo-950 rounded-2xl p-5 sm:p-6 text-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md border border-indigo-900/50">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
            Live Exchange Rate (อัตราแลกเปลี่ยน)
          </p>
          <button
            id="refresh-rate-btn"
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-indigo-300 hover:text-white p-1 rounded-md hover:bg-indigo-900/60 transition-colors cursor-pointer disabled:opacity-50"
            title="รีเฟรชดึงข้อมูลล่าสุด"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-300' : ''}`} />
          </button>
        </div>
        <p id="rate" className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
          {rateText}
        </p>
        {inverseRateText && (
          <p className="text-xs text-indigo-300/80 font-mono mt-0.5">
            {inverseRateText}
          </p>
        )}
      </div>

      <div className="hidden sm:block h-12 w-px bg-indigo-800/80"></div>

      <div className="text-left sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-indigo-900/80">
        <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">
          Status & Update
        </p>
        <p className="text-sm font-medium flex items-center sm:justify-end text-emerald-300">
          <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
          System Online
        </p>
        <p id="last-updated" className="text-[11px] font-mono text-indigo-300/80 mt-1">
          อัปเดต: {lastUpdated}
        </p>
      </div>
    </div>
  );
};
