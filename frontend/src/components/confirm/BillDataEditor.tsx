import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import type { BillData } from '../../types';

interface BillDataEditorProps {
  billData: BillData;
  onSave: (updatedData: BillData) => void;
}

export const BillDataEditor: React.FC<BillDataEditorProps> = ({ billData, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<BillData>(billData);

  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(billData);
    setIsEditing(false);
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">
          已識別的資訊
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
          >
            編輯
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              儲存
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* 計費期間 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">計費期間</label>
            {isEditing ? (
              <input
                type="date"
                value={editedData.billingPeriod.start.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newStart = new Date(e.target.value);
                  const days = editedData.billingPeriod.days;
                  const newEnd = new Date(newStart);
                  newEnd.setDate(newEnd.getDate() + days - 1);
                  setEditedData({
                    ...editedData,
                    billingPeriod: {
                      start: newStart,
                      end: newEnd,
                      days,
                    },
                  });
                }}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-lg font-medium">
                {formatDisplayDate(billData.billingPeriod.start)} ~ {formatDisplayDate(billData.billingPeriod.end)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600">計費天數</label>
            {isEditing ? (
              <input
                type="number"
                min="1"
                max="31"
                value={editedData.billingPeriod.days}
                onChange={(e) => {
                  const days = parseInt(e.target.value) || 30;
                  const start = editedData.billingPeriod.start;
                  const end = new Date(start);
                  end.setDate(end.getDate() + days - 1);
                  setEditedData({
                    ...editedData,
                    billingPeriod: { ...editedData.billingPeriod, days, end },
                  });
                }}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-lg font-medium">{billData.billingPeriod.days} 天</p>
            )}
          </div>
        </div>

        {/* 用電度數 */}
        <div>
          <label className="text-sm text-gray-600">總用電度數</label>
          {isEditing ? (
            <input
              type="number"
              min="0"
              value={editedData.consumption.usage}
              onChange={(e) => {
                const usage = parseInt(e.target.value) || 0;
                setEditedData({
                  ...editedData,
                  consumption: {
                    ...editedData.consumption,
                    usage,
                    currentReading: usage,
                  },
                });
              }}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <p className="text-lg font-medium">{billData.consumption.usage} 度</p>
          )}
        </div>

        {/* 時段用電 - 可編輯 */}
        {(billData.consumption.peakOnPeak !== undefined ||
          billData.consumption.offPeak !== undefined ||
          billData.consumption.semiPeak !== undefined) && (
          <div>
            <label className="text-sm text-gray-600 block mb-2">時段用電分配</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-red-600 text-xs mb-1">尖峰</div>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    value={editedData.consumption.peakOnPeak || 0}
                    onChange={(e) => {
                      setEditedData({
                        ...editedData,
                        consumption: {
                          ...editedData.consumption,
                          peakOnPeak: parseInt(e.target.value) || 0,
                        },
                      });
                    }}
                    className="w-full px-2 py-1 border border-red-200 rounded focus:ring-2 focus:ring-red-500"
                  />
                ) : (
                  <div className="text-red-600 font-bold">
                    {billData.consumption.peakOnPeak || 0} 度
                  </div>
                )}
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <div className="text-yellow-600 text-xs mb-1">半尖峰</div>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    value={editedData.consumption.semiPeak || 0}
                    onChange={(e) => {
                      setEditedData({
                        ...editedData,
                        consumption: {
                          ...editedData.consumption,
                          semiPeak: parseInt(e.target.value) || 0,
                        },
                      });
                    }}
                    className="w-full px-2 py-1 border border-yellow-200 rounded focus:ring-2 focus:ring-yellow-500"
                  />
                ) : (
                  <div className="text-yellow-600 font-bold">
                    {billData.consumption.semiPeak || 0} 度
                  </div>
                )}
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-green-600 text-xs mb-1">離峰</div>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    value={editedData.consumption.offPeak || 0}
                    onChange={(e) => {
                      setEditedData({
                        ...editedData,
                        consumption: {
                          ...editedData.consumption,
                          offPeak: parseInt(e.target.value) || 0,
                        },
                      });
                    }}
                    className="w-full px-2 py-1 border border-green-200 rounded focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <div className="text-green-600 font-bold">
                    {billData.consumption.offPeak || 0} 度
                  </div>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="mt-2 text-xs text-gray-500">
                提示：尖峰 + 半尖峰 + 離峰 應該接近總用電度數
              </div>
            )}
          </div>
        )}

        {/* 識別信心度 */}
        {billData.ocrMetadata && !isEditing && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-600">
              識別信心度：{(billData.ocrMetadata.confidence * 100).toFixed(0)}%
            </p>
            {billData.ocrMetadata.confidence < 0.8 && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ 識別信心度較低，建議手動確認或編輯資料
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
