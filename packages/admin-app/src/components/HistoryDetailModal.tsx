import React from 'react';
import { OrderHistory } from '@shared/types/history';

interface HistoryDetailModalProps {
  history: OrderHistory | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryDetailModal({ history, isOpen, onClose }: HistoryDetailModalProps) {
  if (!isOpen || !history) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      data-testid="history-detail-modal"
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">주문 이력 상세</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            data-testid="history-detail-close"
          >
            ✕
          </button>
        </div>

        {/* 정보 */}
        <div className="mb-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">테이블</span>
            <span className="font-medium">테이블 {history.tableNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">주문 시각</span>
            <span>{new Date(history.orderedAt).toLocaleString('ko-KR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">완료 시각</span>
            <span>{new Date(history.completedAt).toLocaleString('ko-KR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">최종 상태</span>
            <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
              {history.status}
            </span>
          </div>
        </div>

        {/* 항목 */}
        <div className="mb-4 divide-y rounded border">
          {history.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <span className="font-medium">{item.menuItemName}</span>
                <span className="ml-2 text-sm text-gray-500">x{item.quantity}</span>
              </div>
              <span className="text-sm">{item.subtotal.toLocaleString()}원</span>
            </div>
          ))}
        </div>

        {/* 총액 */}
        <div className="flex items-center justify-between border-t pt-3">
          <span className="font-medium">총 금액</span>
          <span className="text-lg font-bold">{history.totalAmount.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
}
