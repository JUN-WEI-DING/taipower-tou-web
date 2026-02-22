import React from 'react';
import { PlanCard } from './PlanCard';
import { Card, CardBody } from '@nextui-org/react';
import type { PlanCalculationResult } from '../../types';

interface PlanListProps {
  results: PlanCalculationResult[];
}

export const PlanList: React.FC<PlanListProps> = ({ results }) => {
  // 空狀態處理
  if (results.length === 0) {
    return (
      <Card className="bg-default-50">
        <CardBody className="py-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">尚無計算結果</h3>
          <p className="text-default-500">請先上傳電費單並進行計算</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 排名卡片 */}
      {results.map((result, index) => (
        <PlanCard key={result.planId} result={result} rank={index + 1} />
      ))}
    </div>
  );
};
