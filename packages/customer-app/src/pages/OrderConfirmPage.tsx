import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useOrderStore } from '../stores/orderStore';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '@table-order/shared';

export default function OrderConfirmPage() {
  const { items, getTotalAmount, clearCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { tableId, sessionId, tableNumber } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (!tableId) return;
    setIsLoading(true);
    setError('');

    try {
      const orderItems = items.map((i) => ({
        menuItemId: i.menuItemId,
        quantity: i.quantity,
      }));

      const order = await createOrder(tableId, sessionId, orderItems);
      clearCart();
      navigate(`/order/success/${order.orderNumber}`, { replace: true });
    } catch {
      setError('주문에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart', { replace: true });
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white border-b">
        <h1 className="text-lg font-bold">주문 확인</h1>
        <p className="text-sm text-gray-500 mt-1">테이블 {tableNumber}번</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4" data-testid="order-confirm-list">
        {items.map((item) => (
          <div key={item.menuItemId} className="flex justify-between py-3 border-b">
            <div>
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-500 ml-2">x{item.quantity}</span>
            </div>
            <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border-t p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">총 주문 금액</span>
          <span className="text-xl font-bold text-blue-600">{formatCurrency(getTotalAmount())}</span>
        </div>
        {error && <p className="text-red-500 text-sm mb-3" role="alert">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/cart')}
            className="flex-1 py-4 border rounded-lg text-lg min-h-touch"
            data-testid="order-confirm-back"
          >
            돌아가기
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 py-4 bg-blue-600 text-white rounded-lg text-lg font-medium min-h-touch disabled:opacity-50"
            data-testid="order-confirm-submit"
          >
            {isLoading ? '주문 중...' : '주문 확정'}
          </button>
        </div>
      </div>
    </div>
  );
}
