import { useEffect } from 'react';
import { useOrderStore } from '../stores/orderStore';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency, formatTime } from '@table-order/shared';
import { OrderStatus } from '@table-order/shared';

const statusConfig: Record<string, { label: string; color: string }> = {
  [OrderStatus.PENDING]: { label: '대기중', color: 'bg-yellow-100 text-yellow-800' },
  [OrderStatus.PREPARING]: { label: '준비중', color: 'bg-blue-100 text-blue-800' },
  [OrderStatus.COMPLETED]: { label: '완료', color: 'bg-green-100 text-green-800' },
};

export default function OrderHistoryPage() {
  const { orders, isLoading, fetchOrders } = useOrderStore();
  const { sessionId } = useAuthStore();

  useEffect(() => {
    if (sessionId) {
      fetchOrders(sessionId);
    }
  }, [sessionId, fetchOrders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <span className="text-6xl mb-4">📋</span>
        <p className="text-lg">주문 내역이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4" data-testid="order-history">
      <h1 className="text-lg font-bold">주문 내역</h1>
      {orders.map((order) => {
        const status = statusConfig[order.status] || statusConfig[OrderStatus.PENDING];
        return (
          <div key={order.id} className="bg-white rounded-lg p-4 shadow-sm border" data-testid={`order-card-${order.id}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-500">#{order.orderNumber}</p>
                <p className="text-xs text-gray-400">{formatTime(order.createdAt)}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
            <div className="text-sm text-gray-700">
              {order.items?.map((item) => (
                <span key={item.id} className="mr-2">
                  {item.menuName} x{item.quantity}
                </span>
              ))}
            </div>
            <p className="text-right font-bold mt-2">{formatCurrency(order.totalAmount)}</p>
          </div>
        );
      })}
    </div>
  );
}
