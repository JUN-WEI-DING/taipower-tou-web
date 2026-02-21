import React from 'react';
import { Zap, Clock, TrendingUp, HelpCircle } from 'lucide-react';

/**
 * 電費單型別
 */
export type BillType = 'non_tou' | 'tou_2_tier' | 'tou_3_tier' | 'auto_detect';

export interface BillTypeOption {
  id: BillType;
  title: string;
  description: string[];
  icon: React.ReactNode;
  badge?: string;
}

interface BillTypeSelectorProps {
  onSelect: (type: BillType) => void;
}

/**
 * 電費單型別選擇器
 *
 * 幫助使用者根據他們的電費單樣式選擇正確的輸入型別
 */
export const BillTypeSelector: React.FC<BillTypeSelectorProps> = ({ onSelect }) => {
  const options: BillTypeOption[] = [
    {
      id: 'non_tou',
      title: '非時間電價 (一般用電)',
      description: [
        '電費單上只有「總用電度數」',
        '沒有尖峰/離峰分段',
        '最常見的住家用電型別',
      ],
      icon: <Zap size={32} />,
      badge: '最常見',
    },
    {
      id: 'tou_2_tier',
      title: '時間電價 (二段式)',
      description: [
        '電費單上有「尖峰用電」和「離峰用電」',
        '可能是簡易型或標準型',
      ],
      icon: <TrendingUp size={32} />,
    },
    {
      id: 'tou_3_tier',
      title: '時間電價 (三段式)',
      description: [
        '電費單上有「尖峰」「半尖峰」「離峰」',
        '可能是簡易型或標準型',
      ],
      icon: <Clock size={32} />,
    },
    {
      id: 'auto_detect',
      title: '不確定 / 讓系統自動識別',
      description: [
        '上傳電費單圖片',
        '系統會自動識別電費單型別和內容',
      ],
      icon: <HelpCircle size={32} />,
      badge: '推薦',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          請選擇您的電費單型別
        </h2>
        <p className="text-gray-600">
          不同型別的電費單會顯示不同的用電資訊，選擇正確的型別可以獲得準確的比較結果
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left transition-all hover:border-blue-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-blue-600">
                {option.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {option.title}
                  </h3>
                  {option.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {option.badge}
                    </span>
                  )}
                </div>

                <ul className="space-y-1">
                  {option.description.map((line, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 提示：</strong>
          不確定您的電費單型別？可以檢視電費單上是否有「尖峰用電」「半尖峰用電」等分段資訊。
          如果有這些分段，就是時間電價；如果只有總用電度數，就是非時間電價。
        </p>
      </div>
    </div>
  );
};
