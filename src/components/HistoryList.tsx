import React from 'react';
import { History, Trash2, ArrowRight, RotateCcw, Clock } from 'lucide-react';
import { ConversionHistoryItem } from '../types';

interface HistoryListProps {
  history: ConversionHistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: ConversionHistoryItem) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onClearHistory,
  onSelectHistoryItem,
}) => {
  return (
    <div
      id="history-container"
      className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden transition-all"
    >
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="font-bold text-slate-700 uppercase text-xs tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
          ประวัติการแปลงเงินย้อนหลัง ({history.length > 0 ? history.length : '0'}/10)
        </h2>

        {history.length > 0 && (
          <button
            id="clear-history-btn"
            onClick={onClearHistory}
            className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline transition-colors cursor-pointer"
            title="ล้างประวัติการแปลงเงินทั้งหมด"
          >
            ล้างประวัติ (Clear)
          </button>
        )}
      </div>

      {/* List items */}
      <div id="history-list" className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2 px-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
              <Clock className="w-5 h-5 stroke-[1.5]" />
            </div>
            <p className="text-sm font-semibold text-slate-600">ยังไม่มีประวัติการแปลงเงิน</p>
            <p className="text-xs text-slate-400 max-w-xs">
              เมื่อทำการกรอกตัวเลขและแปลงสกุลเงิน ระบบจะบันทึกประวัติ 10 รายการล่าสุดให้อัตโนมัติ
            </p>
          </div>
        ) : (
          history.slice(0, 10).map((item, index) => (
            <div
              key={item.id}
              onClick={() => onSelectHistoryItem(item)}
              className="px-5 sm:px-6 py-4 flex justify-between items-center hover:bg-gray-50/80 transition-colors cursor-pointer group"
              title="คลิกเพื่อนำค่านี้กลับมาคำนวณใหม่"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-mono font-bold flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 font-mono">
                    <span>
                      {item.fromAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 4,
                      })}{' '}
                      <span className="text-xs font-bold text-slate-500">{item.fromCurrency}</span>
                    </span>
                    <span className="text-indigo-500 font-sans">&rarr;</span>
                    <span className="text-indigo-600 font-bold">
                      {item.toAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}{' '}
                      <span className="text-xs font-bold text-indigo-500">{item.toCurrency}</span>
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>{item.formattedTime}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">
                      1 {item.fromCurrency} = {item.rate.toFixed(4)} {item.toCurrency}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                  Success
                </span>
                <span className="opacity-0 group-hover:opacity-100 text-slate-400 group-hover:text-indigo-600 transition-opacity">
                  <RotateCcw className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer info */}
      <div className="p-3.5 bg-slate-50 border-t border-gray-100 text-center">
        <p className="text-[11px] text-slate-400 italic">
          เก็บบันทึกประวัติการแปลงเงินย้อนหลัง 10 รายการล่าสุดในเครื่อง
        </p>
      </div>
    </div>
  );
};
