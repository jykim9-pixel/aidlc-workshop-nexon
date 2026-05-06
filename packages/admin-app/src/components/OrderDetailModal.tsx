import React, { useEffect, useState } from 'react';
import { tableApi } from '../api/tableApi';

interface OrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, status: string) => void;
  onDelete: (orderId: string) => void;
}

interface OrderDetail {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    id: string;
    menuItem: { name: string };
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

const NEXT_STATUS: Record<string, string | null> = {
  PENDING: 'PREPARING',
  PREPARING: 'COMPLETED',
  COMPLETED: null,
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: '대기중',
  PREPARING: '준비중',
  COMPLETED: '완료',
};

export function OrderDetailModal({
  orderId,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
}: OrderDetailModalProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      setIsLoading(true);
      tableApi
        .getOrderDetail(orderId)
        .then((data) => setOrder(data as OrderDetail))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const nextStatus = order ? NEXT_STATUS[order.status] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      data-testid="order-detail-modal"
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">로딩 중...</div>
        ) : order ? (
          <>
            {/* 헤더 */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">주문 상세</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                data-testid="order-detail-close"
              >
                ✕
              </button>
            </div>

            {/* 상태 및 시간 */}
            <div className="mb-4 flex items-center justify-between text-sm">
              <span
                className={`rounded-full px-3 py-1 font-medium ${
                  order.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-700'
                    : order.status === 'PREPARING'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                }`}
              >
                {STATUS_LABELS[order.status]}
              </span>
              <span className="text-gray-500">
                {new Date(order.createdAt).toLocaleString('ko-KR')}
              </span>
            </div>

            {/* 항목 목록 */}
            <div className="mb-4 divide-y rounded border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2">
                  <div>
                    <span className="font-medium">{item.menuItem.name}</span>
                    <span className="ml-2 text-sm text-gray-500">x{item.quantity}</span>
                  </div>
                  <span className="text-sm">{item.subtotal.toLocaleString()}원</span>
                </div>
              ))}
            </div>

            {/* 총액 */}
            <div className="mb-4 flex items-center justify-between border-t pt-3">
              <span className="font-medium">총 금액</span>
              <span className="text-lg font-bold">
                {order.totalAmount.toLocaleString()}원
              </span>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              {nextStatus && (
                <button
                  onClick={() => {
                    onStatusChange(order.id, nextStatus);
                    onClose();
                  }}
                  className="flex-1 rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  data-testid="order-status-change-button"
                >
                  {STATUS_LABELS[nextStatus]}으로 변경
                </button>
              )}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  data-testid="order-delete-button"
                >
                  삭제
                </button>
              ) : (
                <button
                  onClick={() => {
                    onDelete(order.id);
                    onClose();
                  }}
                  className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  data-testid="order-delete-confirm-button"
                >
                  삭제 확인
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-gray-500">주문을 찾을 수 없습니다</div>
        )}
      </div>
    </div>
  );
}
