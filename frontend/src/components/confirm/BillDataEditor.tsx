import React, { useState } from 'react';
import { Card, CardBody, Button, Input, Select, SelectItem, Chip } from '@nextui-org/react';
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

  const getSeasonInfo = () => {
    const month = billData.billingPeriod.start.getMonth() + 1;
    const isSummer = month >= 6 && month <= 9;
    return {
      isSummer,
      label: isSummer ? '夏季 (6-9月)' : '非夏季 (10-5月)',
    };
  };

  const seasonInfo = getSeasonInfo();

  return (
    <Card className="shadow-sm">
      <CardBody className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-foreground">
              已識別的資訊
            </h3>
            <Chip size="sm" color={seasonInfo.isSummer ? 'danger' : 'primary'} variant="flat" className="mt-1">
              {seasonInfo.label}
            </Chip>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              color="primary"
              variant="flat"
              size="sm"
            >
              編輯
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                color="default"
                variant="flat"
                size="sm"
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                color="primary"
                variant="solid"
                size="sm"
              >
                儲存
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* 計費期間 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-default-500">計費期間</label>
              {isEditing ? (
                <Input
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
                />
              ) : (
                <p className="text-lg font-medium text-foreground">
                  {formatDisplayDate(billData.billingPeriod.start)} ~ {formatDisplayDate(billData.billingPeriod.end)}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-default-500">計費天數</label>
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
                <p className="text-lg font-medium text-foreground">{billData.billingPeriod.days} 天</p>
              )}
            </div>
          </div>

          {/* 用電度數 */}
          <div>
            <label className="text-sm text-default-500">總用電度數</label>
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
              />
            ) : (
              <p className="text-lg font-medium text-foreground">{billData.consumption.usage} 度</p>
            )}
          </div>

          {/* 契約容量 - 影響最低用電計算 */}
          <div>
            <label className="text-sm text-default-500">契約容量 (安培數)</label>
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
              <p className="text-lg font-medium text-foreground">{billData.contractCapacity || 10} A</p>
            )}
            {!isEditing && (
              <p className="text-xs text-default-400 mt-1">
                💡 影響最低用電度數計算
              </p>
            )}
          </div>

          {/* 電壓型別 - 影響最低用電計算 */}
          <div>
            <label className="text-sm text-default-500">電壓型別</label>
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
              <p className="text-lg font-medium text-foreground">{billData.voltageType || 110}V</p>
            )}
            {!isEditing && (
              <p className="text-xs text-default-400 mt-1">
                💡 影響最低用電度數計算
              </p>
            )}
          </div>

          {/* 相位型別 - 影響基本電費計算 */}
          <div>
            <label className="text-sm text-default-500">相位型別</label>
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
              <p className="text-lg font-medium text-foreground">{billData.phaseType === 'three' ? '三相' : '單相'}</p>
            )}
            {!isEditing && (
              <p className="text-xs text-default-400 mt-1">
                💡 影響基本電費計算
              </p>
            )}
          </div>

          {/* 時段用電 - 可編輯 */}
          {(billData.consumption.peakOnPeak !== undefined ||
            billData.consumption.offPeak !== undefined ||
            billData.consumption.semiPeak !== undefined) && (
            <div>
              <label className="text-sm text-default-500 block mb-2">時段用電分配</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-danger-50 rounded-lg border border-danger-200">
                  <div className="text-danger text-xs mb-1">尖峰</div>
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
                    />
                  ) : (
                    <div className="text-danger font-bold">
                      {billData.consumption.peakOnPeak || 0} 度
                    </div>
                  )}
                </div>
                <div className="text-center p-3 bg-warning-50 rounded-lg border border-warning-200">
                  <div className="text-warning text-xs mb-1">半尖峰</div>
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
                    />
                  ) : (
                    <div className="text-warning font-bold">
                      {billData.consumption.semiPeak || 0} 度
                    </div>
                  )}
                </div>
                <div className="text-center p-3 bg-success-50 rounded-lg border border-success-200">
                  <div className="text-success text-xs mb-1">離峰</div>
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
                    />
                  ) : (
                    <div className="text-success font-bold">
                      {billData.consumption.offPeak || 0} 度
                    </div>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="mt-2 text-xs text-default-400">
                  提示：尖峰 + 半尖峰 + 離峰 應該接近總用電度數
                </div>
              )}
            </div>
          )}

          {/* 識別信心度 */}
          {billData.ocrMetadata && !isEditing && (
            <div className="mt-4 p-3 bg-default-100 rounded-lg">
              <p className="text-xs text-default-600">
                識別信心度：{(billData.ocrMetadata.confidence * 100).toFixed(0)}%
              </p>
              {billData.ocrMetadata.confidence < 0.8 && (
                <p className="text-xs text-warning mt-1">
                  ⚠️ 識別信心度較低，建議手動確認或編輯資料
                </p>
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
