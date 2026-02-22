import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Select, SelectItem, Chip } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BillData } from '../../types';
import { cn } from '../../lib/utils';
import { Edit3, Save, X, CheckCircle2 } from '../icons';

interface BillDataEditorProps {
  billData: BillData;
  onSave: (updatedData: BillData) => void;
}

export const BillDataEditor: React.FC<BillDataEditorProps> = ({ billData, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<BillData>(billData);

  // Sync editedData when billData prop changes
  useEffect(() => {
    setEditedData(billData);
  }, [billData]);

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

  // Helper function to format date for input type="date" in local time
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse date from input type="date" (local time)
  const parseDateFromInput = (value: string): Date => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getSeasonInfo = () => {
    const month = billData.billingPeriod.start.getMonth() + 1;
    const isSummer = month >= 6 && month <= 9;
    return {
      isSummer,
      label: isSummer ? '夏季 (6-9月)' : '非夏季 (10-5月)',
      emoji: isSummer ? '🌞' : '❄️',
    };
  };

  const seasonInfo = getSeasonInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn(
        "border-2 shadow-lg overflow-visible relative",
        isEditing
          ? "border-orange-400 dark:border-orange-600 shadow-orange-500/20"
          : "border-border hover:border-orange-300 dark:hover:border-orange-700"
      )}>
        {/* Glow effect when editing */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              exit={{ opacity: 0 }}
              className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl blur-xl pointer-events-none"
            />
          )}
        </AnimatePresence>

        <CardBody className="p-6 md:p-8 relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-border/60">
            <div>
              <div className="flex items-center gap-3">
                <motion.div
                  animate={isEditing ? { rotate: [0, -5, 5, -5, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "p-2.5 rounded-xl",
                    isEditing
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                      : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                  )}
                >
                  {isEditing ? <Edit3 size={20} /> : <CheckCircle2 size={20} />}
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {isEditing ? '編輯資訊' : '已識別的資訊'}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm",
                        seasonInfo.isSummer
                          ? "bg-gradient-to-r from-red-100 to-orange-100 text-red-700 dark:from-red-900/40 dark:to-orange-900/40 dark:text-red-300"
                          : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/40 dark:to-cyan-900/40 dark:text-blue-300"
                      )}
                    >
                      <span>{seasonInfo.emoji}</span>
                      {seasonInfo.label}
                    </motion.div>
                    {billData.source.isEstimated && (
                      <Chip size="sm" color="warning" variant="flat" className="font-semibold">
                        估算資料
                      </Chip>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <Button
                    onClick={() => setIsEditing(true)}
                    color="primary"
                    variant="flat"
                    size="md"
                    className="font-medium shadow-md hover:shadow-lg transition-all"
                    startContent={<Edit3 size={16} />}
                  >
                    編輯
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex gap-2"
                >
                  <Button
                    onClick={handleCancel}
                    color="default"
                    variant="bordered"
                    size="md"
                    className="font-medium"
                    startContent={<X size={16} />}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSave}
                    color="primary"
                    variant="solid"
                    size="md"
                    className={cn(
                      "font-semibold shadow-lg",
                      "bg-gradient-to-r from-orange-500 to-orange-600",
                      "hover:from-orange-600 hover:to-orange-700",
                      "shadow-orange-500/30"
                    )}
                    startContent={<Save size={16} />}
                  >
                    儲存變更
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        <div className="space-y-5">
          {/* 計費期間 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-default-600">計費期間</label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formatDateForInput(editedData.billingPeriod.start)}
                  onChange={(e) => {
                    const newStart = parseDateFromInput(e.target.value);
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
                />
              ) : (
                <p className="text-base font-medium text-foreground py-1">
                  {formatDisplayDate(billData.billingPeriod.start)} ~ {formatDisplayDate(billData.billingPeriod.end)}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-default-600">計費天數</label>
              {isEditing ? (
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={editedData.billingPeriod.days.toString()}
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
                />
              ) : (
                <p className="text-base font-medium text-foreground py-1">{billData.billingPeriod.days} 天</p>
              )}
            </div>
          </div>

          {/* 用電度數 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-default-600">總用電度數</label>
            {isEditing ? (
              <Input
                type="number"
                min="0"
                value={editedData.consumption.usage.toString()}
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
                endContent={<span className="text-default-400">度</span>}
                classNames={{
                  input: 'text-base',
                }}
              />
            ) : (
              <p className="text-lg font-semibold text-foreground py-1">{billData.consumption.usage} 度</p>
            )}
          </div>

          {/* 契約容量 - 影響最低用電計算 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-default-600">
              契約容量
              <span className="text-default-400 font-normal ml-1">(影響最低用電計算)</span>
            </label>
            {isEditing ? (
              <Select
                label="契約容量"
                selectedKeys={[String(editedData.contractCapacity || 10)]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setEditedData({
                    ...editedData,
                    contractCapacity: parseInt(value) || 10,
                  });
                }}
              >
                <SelectItem key="10" value="10">10 A</SelectItem>
                <SelectItem key="15" value="15">15 A</SelectItem>
                <SelectItem key="20" value="20">20 A</SelectItem>
                <SelectItem key="30" value="30">30 A</SelectItem>
                <SelectItem key="40" value="40">40 A</SelectItem>
                <SelectItem key="50" value="50">50 A</SelectItem>
                <SelectItem key="60" value="60">60 A</SelectItem>
                <SelectItem key="70" value="70">70 A</SelectItem>
              </Select>
            ) : (
              <p className="text-base font-medium text-foreground py-1">{billData.contractCapacity || 10} A</p>
            )}
          </div>

          {/* 電壓型別 - 影響最低用電計算 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-default-600">
              電壓型別
              <span className="text-default-400 font-normal ml-1">(影響最低用電計算)</span>
            </label>
            {isEditing ? (
              <Select
                label="電壓型別"
                selectedKeys={[editedData.voltageType || '110']}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setEditedData({
                    ...editedData,
                    voltageType: value as '110' | '220',
                  });
                }}
              >
                <SelectItem key="110" value="110">110V (一般家電)</SelectItem>
                <SelectItem key="220" value="220">220V (大型家電)</SelectItem>
              </Select>
            ) : (
              <p className="text-base font-medium text-foreground py-1">{billData.voltageType || 110}V</p>
            )}
          </div>

          {/* 相位型別 - 影響基本電費計算 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-default-600">
              相位型別
              <span className="text-default-400 font-normal ml-1">(影響基本電費計算)</span>
            </label>
            {isEditing ? (
              <Select
                label="相位型別"
                selectedKeys={[editedData.phaseType || 'single']}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setEditedData({
                    ...editedData,
                    phaseType: value as 'single' | 'three',
                  });
                }}
              >
                <SelectItem key="single" value="single">單相 (最常見)</SelectItem>
                <SelectItem key="three" value="three">三相 (大型家電/需申裝)</SelectItem>
              </Select>
            ) : (
              <p className="text-base font-medium text-foreground py-1">{billData.phaseType === 'three' ? '三相' : '單相'}</p>
            )}
          </div>

          {/* 時段用電 - 可編輯 */}
          {(billData.consumption.peakOnPeak !== undefined ||
            billData.consumption.offPeak !== undefined ||
            billData.consumption.semiPeak !== undefined) && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-default-600 block">時段用電分配</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-danger-50 rounded-xl border-2 border-danger-200">
                  <div className="text-danger text-xs font-semibold mb-2">尖峰</div>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      value={String(editedData.consumption.peakOnPeak || 0)}
                      onChange={(e) => {
                        setEditedData({
                          ...editedData,
                          consumption: {
                            ...editedData.consumption,
                            peakOnPeak: parseInt(e.target.value) || 0,
                          },
                        });
                      }}
                      size="sm"
                      classNames={{
                        input: 'text-center font-bold text-danger',
                      }}
                    />
                  ) : (
                    <div className="text-danger font-bold text-lg">{billData.consumption.peakOnPeak || 0} 度</div>
                  )}
                </div>
                <div className="text-center p-4 bg-warning-50 rounded-xl border-2 border-warning-200">
                  <div className="text-warning text-xs font-semibold mb-2">半尖峰</div>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      value={String(editedData.consumption.semiPeak || 0)}
                      onChange={(e) => {
                        setEditedData({
                          ...editedData,
                          consumption: {
                            ...editedData.consumption,
                            semiPeak: parseInt(e.target.value) || 0,
                          },
                        });
                      }}
                      size="sm"
                      classNames={{
                        input: 'text-center font-bold text-warning',
                      }}
                    />
                  ) : (
                    <div className="text-warning font-bold text-lg">{billData.consumption.semiPeak || 0} 度</div>
                  )}
                </div>
                <div className="text-center p-4 bg-success-50 rounded-xl border-2 border-success-200">
                  <div className="text-success text-xs font-semibold mb-2">離峰</div>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      value={String(editedData.consumption.offPeak || 0)}
                      onChange={(e) => {
                        setEditedData({
                          ...editedData,
                          consumption: {
                            ...editedData.consumption,
                            offPeak: parseInt(e.target.value) || 0,
                          },
                        });
                      }}
                      size="sm"
                      classNames={{
                        input: 'text-center font-bold text-success',
                      }}
                    />
                  ) : (
                    <div className="text-success font-bold text-lg">{billData.consumption.offPeak || 0} 度</div>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="flex items-start gap-2 p-3 bg-default-50 rounded-xl border border-default-200">
                  <span className="text-energy-blue">💡</span>
                  <p className="text-xs text-default-600">
                    提示：尖峰 + 半尖峰 + 離峰 應該接近總用電度數
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 識別信心度 */}
          {billData.ocrMetadata && !isEditing && (
            <div className="mt-4 p-4 bg-default-50 rounded-xl border border-default-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-default-700">
                  識別信心度
                </p>
                <p className="text-sm font-bold text-foreground">
                  {(billData.ocrMetadata.confidence * 100).toFixed(0)}%
                </p>
              </div>
              {billData.ocrMetadata.confidence < 0.8 && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-warning-50 rounded-lg">
                  <span className="text-warning">⚠️</span>
                  <p className="text-xs text-warning-700">
                    識別信心度較低，建議手動確認或編輯資料
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
    </motion.div>
  );
};
