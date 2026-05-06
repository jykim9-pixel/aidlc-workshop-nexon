import React from 'react';
import { OrderHistory } from '@shared/types/history';

interface HistoryListProps {
  histories: OrderHistory[];
  isLoading: boolean;
  onSelect: (history: OrderHistory) => void;
}

export function HistoryList({ histories, isLoading, onSelect }: HistoryListProps) {
  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">로딩 중...</div>;
  }

  if (histories.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        조회된 이력이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="history-list">
      {histories.map((history) => (
        <button
          key={history.id}
          onClick={() => onSelect(history)}
          className="w-full rounded border bg-white p-4 text-left transition-colors hover:bg-gray-50"
          data-testid={`history-item-${history.id}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded bg-gray-100 px-2 py-1 text-sm font-medium">
                테이블 {history.tableNumber}
              </span>
              <span className="text-sm text-gray-500">
                {history.items.length}개 항목
              </span>
            </div>
            <span className="font-bold">{history.totalAmount.toLocaleString()}원</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>주문: {new Date(history.orderedAt).toLocaleString('ko-KR')}</span>
            <span>완료: {new Date(history.completedAt).toLocaleString('ko-KR')}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
