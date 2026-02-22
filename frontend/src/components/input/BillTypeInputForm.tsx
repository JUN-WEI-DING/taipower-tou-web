import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import type { BillData } from '../../types';
import { DataCompletenessLevel } from '../../types';
import type { BillType } from '../bill-type';

interface BillTypeInputFormProps {
  billType: BillType;
}

/**
 * 根據電費單型別顯示不同的輸入表單
 */
export const BillTypeInputForm: React.FC<BillTypeInputFormProps> = ({ billType }) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [contractCapacity, setContractCapacity] = useState('10');
  const [voltageType, setVoltageType] = useState<'110' | '220'>('110');
  const [phaseType, setPhaseType] = useState<'single' | 'three'>('single');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 非時間電價：只有總用電
  const [totalConsumption, setTotalConsumption] = useState('');

  // 二段式時間電價：尖峰 + 離峰
  const [peakConsumption, setPeakConsumption] = useState('');
  const [offPeakConsumption, setOffPeakConsumption] = useState('');

  // 三段式時間電價：尖峰 + 半尖峰 + 離峰
  const [semiPeakConsumption, setSemiPeakConsumption] = useState('');

  const setBillData = useAppStore((state) => state.setBillData);
  const setStage = useAppStore((state) => state.setStage);

  // 計算二段式總用電
  const twoTierTotal = (parseFloat(peakConsumption) || 0) + (parseFloat(offPeakConsumption) || 0);

  // 計算三段式總用電
  const threeTierTotal = (parseFloat(peakConsumption) || 0) +
                         (parseFloat(semiPeakConsumption) || 0) +
                         (parseFloat(offPeakConsumption) || 0);

  const handleSubmit = () => {
    setErrorMessage(null);

    // 根據電費單型別驗證
    if (billType === 'non_tou') {
      const usage = parseInt(totalConsumption);
      if (!usage || usage <= 0) {
        setErrorMessage('請輸入有效的用電度數');
        return;
      }
      createBillData({
        usage,
        peakOnPeak: undefined,
        semiPeak: undefined,
        offPeak: undefined,
      }, DataCompletenessLevel.TOTAL_ONLY);
    } else if (billType === 'tou_2_tier') {
      const peak = parseFloat(peakConsumption);
      const offPeak = parseFloat(offPeakConsumption);
      if (!peak || peak <= 0 || !offPeak || offPeak <= 0) {
        setErrorMessage('請輸入有效的尖峰和離峰用電度數');
        return;
      }
      createBillData({
        usage: peak + offPeak,
        peakOnPeak: peak,
        semiPeak: undefined,
        offPeak: offPeak,
      }, DataCompletenessLevel.TWO_TIER);
    } else if (billType === 'tou_3_tier') {
      const peak = parseFloat(peakConsumption);
      const semiPeak = parseFloat(semiPeakConsumption);
      const offPeak = parseFloat(offPeakConsumption);
      if (!peak || peak <= 0 || !semiPeak || semiPeak <= 0 || !offPeak || offPeak <= 0) {
        setErrorMessage('請輸入有效的尖峰、半尖峰和離峰用電度數');
        return;
      }
      createBillData({
        usage: peak + semiPeak + offPeak,
        peakOnPeak: peak,
        semiPeak: semiPeak,
        offPeak: offPeak,
      }, DataCompletenessLevel.THREE_TIER);
    } else {
      // auto_detect - 回到上傳階段
      setStage('upload');
      return;
    }

    setIsSubmitting(true);
  };

  const createBillData = (
    consumption: { usage: number; peakOnPeak?: number; semiPeak?: number; offPeak?: number },
    completenessLevel: DataCompletenessLevel
  ) => {
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
        currentReading: consumption.usage,
        usage: consumption.usage,
        multiplier: 1,
        peakOnPeak: consumption.peakOnPeak,
        semiPeak: consumption.semiPeak,
        offPeak: consumption.offPeak,
      },
      contractCapacity: parseInt(contractCapacity),
      voltageType: voltageType,
      phaseType: phaseType,
      source: {
        type: 'manual',
        completenessLevel: completenessLevel,
        isEstimated: false,
      },
    };

    setBillData(billData);
    setStage('confirm');
    setIsSubmitting(false);
  };

  const isSummer = month >= 6 && month <= 9;

  // 渲染非時間電價輸入
  if (billType === 'non_tou') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-200 dark:border-orange-800 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              非時間電價 - 基本資訊輸入
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              最常見的住家用電型別，只有總用電度數
            </p>
          </div>

          <NonTouInputForm
            month={month}
            year={year}
            contractCapacity={contractCapacity}
            voltageType={voltageType}
            phaseType={phaseType}
            totalConsumption={totalConsumption}
            isSummer={isSummer}
            onMonthChange={setMonth}
            onYearChange={setYear}
            onContractCapacityChange={setContractCapacity}
            onVoltageTypeChange={setVoltageType}
            onPhaseTypeChange={setPhaseType}
            onTotalConsumptionChange={setTotalConsumption}
          />

          {errorMessage && <ErrorMessage message={errorMessage} />}

          <SubmitButton
            onClick={handleSubmit}
            disabled={!totalConsumption || isSubmitting}
            isSubmitting={isSubmitting}
          />

          <Tips type="non_tou" />
        </div>
      </div>
    );
  }

  // 渲染二段式時間電價輸入
  if (billType === 'tou_2_tier') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-200 dark:border-orange-800 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-3xl">📈</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              二段式時間電價 - 用電資訊輸入
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              電費單上有「尖峰用電」和「離峰用電」
            </p>
          </div>

          <TwoTierInputForm
            month={month}
            year={year}
            contractCapacity={contractCapacity}
            voltageType={voltageType}
            phaseType={phaseType}
            peakConsumption={peakConsumption}
            offPeakConsumption={offPeakConsumption}
            twoTierTotal={twoTierTotal}
            isSummer={isSummer}
            onMonthChange={setMonth}
            onYearChange={setYear}
            onContractCapacityChange={setContractCapacity}
            onVoltageTypeChange={setVoltageType}
            onPhaseTypeChange={setPhaseType}
            onPeakConsumptionChange={setPeakConsumption}
            onOffPeakConsumptionChange={setOffPeakConsumption}
          />

          {errorMessage && <ErrorMessage message={errorMessage} />}

          <SubmitButton
            onClick={handleSubmit}
            disabled={!peakConsumption || !offPeakConsumption || isSubmitting}
            isSubmitting={isSubmitting}
          />

          <Tips type="tou_2_tier" />
        </div>
      </div>
    );
  }

  // 渲染三段式時間電價輸入
  if (billType === 'tou_3_tier') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-200 dark:border-orange-800 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              三段式時間電價 - 用電資訊輸入
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              電費單上有「尖峰」「半尖峰」「離峰」
            </p>
          </div>

          <ThreeTierInputForm
            month={month}
            year={year}
            contractCapacity={contractCapacity}
            voltageType={voltageType}
            phaseType={phaseType}
            peakConsumption={peakConsumption}
            semiPeakConsumption={semiPeakConsumption}
            offPeakConsumption={offPeakConsumption}
            threeTierTotal={threeTierTotal}
            isSummer={isSummer}
            onMonthChange={setMonth}
            onYearChange={setYear}
            onContractCapacityChange={setContractCapacity}
            onVoltageTypeChange={setVoltageType}
            onPhaseTypeChange={setPhaseType}
            onPeakConsumptionChange={setPeakConsumption}
            onSemiPeakConsumptionChange={setSemiPeakConsumption}
            onOffPeakConsumptionChange={setOffPeakConsumption}
          />

          {errorMessage && <ErrorMessage message={errorMessage} />}

          <SubmitButton
            onClick={handleSubmit}
            disabled={!peakConsumption || !semiPeakConsumption || !offPeakConsumption || isSubmitting}
            isSubmitting={isSubmitting}
          />

          <Tips type="tou_3_tier" />
        </div>
      </div>
    );
  }

  // auto_detect - 這個不應該發生，因為會直接跳到上傳
  return null;
};

// 子元件：非時間電價輸入表單
interface NonTouInputFormProps {
  month: number;
  year: number;
  contractCapacity: string;
  voltageType: '110' | '220';
  phaseType: 'single' | 'three';
  totalConsumption: string;
  isSummer: boolean;
  onMonthChange: (value: number) => void;
  onYearChange: (value: number) => void;
  onContractCapacityChange: (value: string) => void;
  onVoltageTypeChange: (value: '110' | '220') => void;
  onPhaseTypeChange: (value: 'single' | 'three') => void;
  onTotalConsumptionChange: (value: string) => void;
}

const NonTouInputForm: React.FC<NonTouInputFormProps> = ({
  month, year, contractCapacity, voltageType, phaseType, totalConsumption, isSummer,
  onMonthChange, onYearChange, onContractCapacityChange, onVoltageTypeChange, onPhaseTypeChange, onTotalConsumptionChange,
}) => (
  <div className="space-y-4">
    <DateSection month={month} year={year} isSummer={isSummer} onMonthChange={onMonthChange} onYearChange={onYearChange} />
    <ContractSection
      contractCapacity={contractCapacity}
      voltageType={voltageType}
      phaseType={phaseType}
      onContractCapacityChange={onContractCapacityChange}
      onVoltageTypeChange={onVoltageTypeChange}
      onPhaseTypeChange={onPhaseTypeChange}
    />
    <div>
      <label htmlFor="total-consumption" className="block text-sm font-medium text-gray-700 mb-1">
        總用電度數
      </label>
      <input
        id="total-consumption"
        type="number"
        min="1"
        max="10000"
        value={totalConsumption}
        onChange={(e) => onTotalConsumptionChange(e.target.value)}
        placeholder="例如：350"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
      />
      <p className="text-xs text-gray-500 mt-1">
        請輸入您電費單上的「總用電度數」或「本期度數」
      </p>
    </div>
  </div>
);

// 子元件：二段式輸入表單
interface TwoTierInputFormProps {
  month: number;
  year: number;
  contractCapacity: string;
  voltageType: '110' | '220';
  phaseType: 'single' | 'three';
  peakConsumption: string;
  offPeakConsumption: string;
  twoTierTotal: number;
  isSummer: boolean;
  onMonthChange: (value: number) => void;
  onYearChange: (value: number) => void;
  onContractCapacityChange: (value: string) => void;
  onVoltageTypeChange: (value: '110' | '220') => void;
  onPhaseTypeChange: (value: 'single' | 'three') => void;
  onPeakConsumptionChange: (value: string) => void;
  onOffPeakConsumptionChange: (value: string) => void;
}

const TwoTierInputForm: React.FC<TwoTierInputFormProps> = ({
  month, year, contractCapacity, voltageType, phaseType,
  peakConsumption, offPeakConsumption, twoTierTotal, isSummer,
  onMonthChange, onYearChange, onContractCapacityChange, onVoltageTypeChange, onPhaseTypeChange,
  onPeakConsumptionChange, onOffPeakConsumptionChange,
}) => (
  <div className="space-y-4">
    <DateSection month={month} year={year} isSummer={isSummer} onMonthChange={onMonthChange} onYearChange={onYearChange} />
    <ContractSection
      contractCapacity={contractCapacity}
      voltageType={voltageType}
      phaseType={phaseType}
      onContractCapacityChange={onContractCapacityChange}
      onVoltageTypeChange={onVoltageTypeChange}
      onPhaseTypeChange={onPhaseTypeChange}
    />
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="peak-consumption" className="block text-sm font-medium text-gray-700 mb-1">
          尖峰用電
        </label>
        <input
          id="peak-consumption"
          type="number"
          min="0"
          max="10000"
          value={peakConsumption}
          onChange={(e) => onPeakConsumptionChange(e.target.value)}
          placeholder="例如：120"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
        />
      </div>
      <div>
        <label htmlFor="off-peak-consumption" className="block text-sm font-medium text-gray-700 mb-1">
          離峰用電
        </label>
        <input
          id="off-peak-consumption"
          type="number"
          min="0"
          max="10000"
          value={offPeakConsumption}
          onChange={(e) => onOffPeakConsumptionChange(e.target.value)}
          placeholder="例如：230"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
        />
      </div>
    </div>
    {twoTierTotal > 0 && (
      <div className="bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4 text-center">
        <p className="text-sm text-orange-900 dark:text-orange-100 font-semibold">
          合計：<span className="font-bold text-lg">{twoTierTotal.toFixed(1)}</span> 度
        </p>
      </div>
    )}
  </div>
);

// 子元件：三段式輸入表單
interface ThreeTierInputFormProps {
  month: number;
  year: number;
  contractCapacity: string;
  voltageType: '110' | '220';
  phaseType: 'single' | 'three';
  peakConsumption: string;
  semiPeakConsumption: string;
  offPeakConsumption: string;
  threeTierTotal: number;
  isSummer: boolean;
  onMonthChange: (value: number) => void;
  onYearChange: (value: number) => void;
  onContractCapacityChange: (value: string) => void;
  onVoltageTypeChange: (value: '110' | '220') => void;
  onPhaseTypeChange: (value: 'single' | 'three') => void;
  onPeakConsumptionChange: (value: string) => void;
  onSemiPeakConsumptionChange: (value: string) => void;
  onOffPeakConsumptionChange: (value: string) => void;
}

const ThreeTierInputForm: React.FC<ThreeTierInputFormProps> = ({
  month, year, contractCapacity, voltageType, phaseType,
  peakConsumption, semiPeakConsumption, offPeakConsumption, threeTierTotal, isSummer,
  onMonthChange, onYearChange, onContractCapacityChange, onVoltageTypeChange, onPhaseTypeChange,
  onPeakConsumptionChange, onSemiPeakConsumptionChange, onOffPeakConsumptionChange,
}) => (
  <div className="space-y-4">
    <DateSection month={month} year={year} isSummer={isSummer} onMonthChange={onMonthChange} onYearChange={onYearChange} />
    <ContractSection
      contractCapacity={contractCapacity}
      voltageType={voltageType}
      phaseType={phaseType}
      onContractCapacityChange={onContractCapacityChange}
      onVoltageTypeChange={onVoltageTypeChange}
      onPhaseTypeChange={onPhaseTypeChange}
    />
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          尖峰用電
        </label>
        <input
          type="number"
          min="0"
          max="10000"
          value={peakConsumption}
          onChange={(e) => onPeakConsumptionChange(e.target.value)}
          placeholder="例如：70"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          半尖峰用電
        </label>
        <input
          type="number"
          min="0"
          max="10000"
          value={semiPeakConsumption}
          onChange={(e) => onSemiPeakConsumptionChange(e.target.value)}
          placeholder="例如：80"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          離峰用電
        </label>
        <input
          type="number"
          min="0"
          max="10000"
          value={offPeakConsumption}
          onChange={(e) => onOffPeakConsumptionChange(e.target.value)}
          placeholder="例如：200"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
        />
      </div>
    </div>
    {threeTierTotal > 0 && (
      <div className="bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4 text-center">
        <p className="text-sm text-orange-900 dark:text-orange-100 font-semibold">
          合計：<span className="font-bold text-lg">{threeTierTotal.toFixed(1)}</span> 度
        </p>
      </div>
    )}
  </div>
);

// 共享元件：日期選擇
interface DateSectionProps {
  month: number;
  year: number;
  isSummer: boolean;
  onMonthChange: (value: number) => void;
  onYearChange: (value: number) => void;
}

const DateSection: React.FC<DateSectionProps> = ({ month, year, isSummer, onMonthChange, onYearChange }) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
        <select
          value={year}
          onChange={(e) => onYearChange(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
        >
          {Array.from({ length: 3 }, (_, i) => {
            const y = new Date().getFullYear() - i;
            return <option key={y} value={y}>{y} 年</option>;
          })}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">月份</label>
        <select
          value={month}
          onChange={(e) => onMonthChange(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
        >
          {Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            return <option key={m} value={m}>{m} 月</option>;
          })}
        </select>
      </div>
    </div>
    {isSummer && (
      <p className="text-xs text-orange-600">⚠️ 夏季(6-9月)電價較高</p>
    )}
  </>
);

// 共享元件：契約容量選擇
interface ContractSectionProps {
  contractCapacity: string;
  voltageType: '110' | '220';
  phaseType: 'single' | 'three';
  onContractCapacityChange: (value: string) => void;
  onVoltageTypeChange: (value: '110' | '220') => void;
  onPhaseTypeChange: (value: 'single' | 'three') => void;
}

const ContractSection: React.FC<ContractSectionProps> = ({
  contractCapacity, voltageType, phaseType,
  onContractCapacityChange, onVoltageTypeChange, onPhaseTypeChange,
}) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">契約容量</label>
      <select
        value={contractCapacity}
        onChange={(e) => onContractCapacityChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
      >
        <option value="10">10 A (最常見)</option>
        <option value="15">15 A</option>
        <option value="20">20 A</option>
        <option value="30">30 A</option>
        <option value="40">40 A</option>
        <option value="50">50 A</option>
        <option value="60">60 A</option>
        <option value="70">70 A</option>
      </select>
      <p className="text-xs text-gray-500 mt-1">💡 電費單上會有「契約容量」，例如「10A」</p>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">相位</label>
        <select
          value={phaseType}
          onChange={(e) => onPhaseTypeChange(e.target.value as 'single' | 'three')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
        >
          <option value="single">單相</option>
          <option value="three">三相</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">電壓</label>
        <select
          value={voltageType}
          onChange={(e) => onVoltageTypeChange(e.target.value as '110' | '220')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
        >
          <option value="110">110V</option>
          <option value="220">220V</option>
        </select>
      </div>
    </div>
  </>
);

// 共享元件：錯誤訊息
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
    <p className="text-sm text-destructive">⚠️ {message}</p>
  </div>
);

// 共享元件：提交按鈕
interface SubmitButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSubmitting: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, disabled, isSubmitting }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 active:scale-[0.98]"
  >
    {isSubmitting ? '處理中...' : '確認並開始比較'}
  </button>
);

// 共享元件：提示
interface TipsProps {
  type: 'non_tou' | 'tou_2_tier' | 'tou_3_tier';
}

const Tips: React.FC<TipsProps> = ({ type }) => {
  const tips = {
    non_tou: '💡 非時間電價最常見，電費單上只會顯示總用電度數，沒有時段分段。',
    tou_2_tier: '💡 二段式時間電價會將用電分為尖峰和離峰兩個時段計費。',
    tou_3_tier: '💡 三段式時間電價會將用電分為尖峰、半尖峰、離峰三個時段計費。',
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mt-4">
      <p className="text-sm text-orange-800 dark:text-orange-200 flex items-start gap-2">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {tips[type]}
      </p>
    </div>
  );
};
