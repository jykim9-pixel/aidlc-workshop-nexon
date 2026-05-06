import React from 'react';
import { TableSummary, TableStatus } from '@shared/types/table';

interface TableCardProps {
  table: TableSummary;
  onSelectOrder: (orderId: string) => void;
  onStatusChange: (orderId: string, status: string) => void;
  onComplete: (tableId: string) => void;
}

export function TableCard({ table, onSelectOrder, onStatusChange, onComplete }: TableCardProps) {
  const isOccupied = table.status === TableStatus.OCCUPIED;

  return (
    <div
      className={`rounded-lg border-2 p-4 shadow-sm transition-all ${
        table.hasNewOrder
          ? 'border-yellow-400 shadow-yellow-100'
          : isOccupied
            ? 'border-green-300'
            : 'border-gray-200'
      }`}
      data-testid={`table-card-${table.tableNumber}`}
    >
      {/* 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold">테이블 {table.tableNumber}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isOccupied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
          data-testid={`table-status-${table.tableNumber}`}
        >
          {isOccupied ? '사용중' : '비어있음'}
        </span>
      </div>

      {/* 주문 목록 */}
      {isOccupied && table.latestOrders.length > 0 && (
        <div className="mb-3 space-y-1">
          {table.latestOrders.map((order) => (
            <button
              key={order.orderId}
              onClick={() => onSelectOrder(order.orderId)}
              className={`w-full rounded px-2 py-1 text-left text-sm transition-colors ${
                order.isNew
                  ? 'animate-pulse bg-yellow-50 font-medium text-yellow-800 hover:bg-yellow-100'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              data-testid={`order-item-${order.orderId}`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  {order.isNew && <span className="text-yellow-500">●</span>}
                  {order.itemCount}개 항목
                </span>
                <span className="font-medium">
                  {order.totalAmount.toLocaleString()}원
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <StatusBadge status={order.status} />
                <span>{new Date(order.orderedAt).toLocaleTimeString('ko-KR')}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {!isOccupied && (
        <div className="mb-3 py-4 text-center text-sm text-gray-400">
          주문 없음
        </div>
      )}

      {/* 푸터 */}
      <div className="flex items-center justify-between border-t pt-3">
        <div className="text-sm">
          <span className="text-gray-500">총 </span>
          <span className="font-bold text-gray-900">
            {table.totalAmount.toLocaleString()}원
          </span>
        </div>
        {isOccupied && (
          <button
            onClick={() => onComplete(table.tableId)}
            className="rounded bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
            data-testid={`complete-table-${table.tableNumber}`}
          >
            이용 완료
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    PENDING: { label: '대기중', className: 'bg-yellow-100 text-yellow-700' },
    PREPARING: { label: '준비중', className: 'bg-blue-100 text-blue-700' },
    COMPLETED: { label: '완료', className: 'bg-green-100 text-green-700' },
  };

  const { label, className } = config[status] || { label: status, className: 'bg-gray-100' };

  return (
    <span className={`rounded px-1.5 py-0.5 text-xs ${className}`}>
      {label}
    </span>
  );
}
