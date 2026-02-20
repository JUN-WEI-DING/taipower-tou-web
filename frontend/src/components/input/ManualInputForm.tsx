import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import type { BillData } from '../../types';
import { DataCompletenessLevel } from '../../types';

export const ManualInputForm: React.FC = () => {
  const [consumption, setConsumption] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setBillData = useAppStore((state) => state.setBillData);
  const setStage = useAppStore((state) => state.setStage);

  const handleSubmit = () => {
    const usage = parseInt(consumption);
    if (!usage || usage <= 0) {
      setErrorMessage('請輸入有效的用電度數');
      return;
    }
    setErrorMessage(null);

    setIsSubmitting(true);

    // 計算計費期間
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const days = endDate.getDate();

    const billData: BillData = {
      customerName: '手動輸入',
      accountNumber: '',
      billingPeriod: {
        start: startDate,
        end: endDate,
        days,
      },
      consumption: {
        previousReading: 0,
        currentReading: usage,
        usage,
        multiplier: 1,
      },
      source: {
        type: 'manual',
        completenessLevel: DataCompletenessLevel.TOTAL_ONLY,
        isEstimated: false,
      },
    };

    setBillData(billData);
    setStage('confirm');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⌨️</div>
          <h3 className="text-lg font-bold text-gray-900">
            手動輸入用電資訊
          </h3>
          <p className="text-sm text-gray-600">
            不想拍照？直接輸入您的用電度數也可以
          </p>
        </div>

        <div className="space-y-4">
          {/* 年份選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              年份
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 3 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>
                    {y} 年
                  </option>
                );
              })}
            </select>
          </div>

          {/* 月份選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              月份
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const m = i + 1;
                const isSummer = m >= 6 && m <= 9;
                return (
                  <option key={m} value={m}>
                    {m} 月{isSummer ? ' (夏季)' : ' (非夏季)'}
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-orange-600 mt-1">
              ⚠️ 夏季(6-9月)與非夏季(10-5月)電價不同，請選擇電費單上的月份
            </p>
          </div>

          {/* 用電度數輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用電度數
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={consumption}
              onChange={(e) => {
                setConsumption(e.target.value);
                setErrorMessage(null); // 清除錯誤訊息
              }}
              placeholder="例如：350"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              請輸入您電費單上的總用電度數
            </p>
          </div>

          {/* 錯誤訊息 */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">⚠️ {errorMessage}</p>
            </div>
          )}

          {/* 提交按鈕 */}
          <button
            onClick={handleSubmit}
            disabled={!consumption || isSubmitting}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '處理中...' : '開始比較'}
          </button>

          {/* 提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 提示：您的電費單上會有「本期度數」或「用電度數」欄位，那個數字就是我們需要的
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
