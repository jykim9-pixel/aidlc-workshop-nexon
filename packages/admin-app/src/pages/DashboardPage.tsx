import React, { useState } from 'react';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { TableGrid } from '../components/TableGrid';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { CompleteConfirmModal } from '../components/CompleteConfirmModal';
import { useDashboardStore } from '../stores/dashboardStore';
import { useSSE } from '../hooks/useSSE';

export function DashboardPage() {
  useSSE(); // SSE 연결 관리

  const tables = useDashboardStore((state) => state.tables);
  const selectedOrderId = useDashboardStore((state) => state.selectedOrderId);
  const selectOrder = useDashboardStore((state) => state.selectOrder);
  const updateOrderStatus = useDashboardStore((state) => state.updateOrderStatus);
  const deleteOrder = useDashboardStore((state) => state.deleteOrder);
  const completeTable = useDashboardStore((state) => state.completeTable);

  const [completeTarget, setCompleteTarget] = useState<{
    tableId: string;
    tableNumber: number;
    totalAmount: number;
    orderCount: number;
  } | null>(null);

  const handleComplete = (tableId: string) => {
    const table = tables.find((t) => t.tableId === tableId);
    if (table) {
      setCompleteTarget({
        tableId,
        tableNumber: table.tableNumber,
        totalAmount: table.totalAmount,
        orderCount: table.orderCount,
      });
    }
  };

  const confirmComplete = async () => {
    if (completeTarget) {
      await completeTable(completeTarget.tableId);
      setCompleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="dashboard-page">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">주문 대시보드</h1>
        <ConnectionStatus />
      </div>

      {/* 테이블 그리드 */}
      <TableGrid
        tables={tables}
        onSelectOrder={selectOrder}
        onStatusChange={updateOrderStatus}
        onComplete={handleComplete}
      />

      {/* 주문 상세 모달 */}
      <OrderDetailModal
        orderId={selectedOrderId}
        isOpen={!!selectedOrderId}
        onClose={() => selectOrder(null)}
        onStatusChange={updateOrderStatus}
        onDelete={deleteOrder}
      />

      {/* 이용 완료 확인 모달 */}
      {completeTarget && (
        <CompleteConfirmModal
          tableNumber={completeTarget.tableNumber}
          summary={{
            totalAmount: completeTarget.totalAmount,
            orderCount: completeTarget.orderCount,
          }}
          isOpen={true}
          onConfirm={confirmComplete}
          onCancel={() => setCompleteTarget(null)}
        />
      )}
    </div>
  );
}
