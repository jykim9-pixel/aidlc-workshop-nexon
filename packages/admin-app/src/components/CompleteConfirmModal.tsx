import React from 'react';

interface CompleteConfirmModalProps {
  tableNumber: number;
  summary: { totalAmount: number; orderCount: number };
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CompleteConfirmModal({
  tableNumber,
  summary,
  isOpen,
  onConfirm,
  onCancel,
}: CompleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
      data-testid="complete-confirm-modal"
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 경고 아이콘 */}
        <div className="mb-4 text-center">
          <span className="text-4xl">⚠️</span>
        </div>

        {/* 메시지 */}
        <h3 className="mb-2 text-center text-lg font-bold">
          테이블 {tableNumber}번 이용 완료
        </h3>
        <p className="mb-4 text-center text-sm text-gray-600">
          이용을 완료하시겠습니까?
        </p>

        {/* 요약 정보 */}
        <div className="mb-4 rounded bg-gray-50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">총 주문 건수</span>
            <span className="font-medium">{summary.orderCount}건</span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-gray-600">총 금액</span>
            <span className="font-bold">{summary.totalAmount.toLocaleString()}원</span>
          </div>
        </div>

        {/* 안내 */}
        <p className="mb-4 text-center text-xs text-gray-500">
          완료 후 주문 내역은 과거 이력으로 이동됩니다.
        </p>

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            data-testid="complete-cancel-button"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700"
            data-testid="complete-confirm-button"
          >
            이용 완료
          </button>
        </div>
      </div>
    </div>
  );
}
