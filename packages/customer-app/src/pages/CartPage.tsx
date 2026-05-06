import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { formatCurrency } from '@table-order/shared';
import { useState } from 'react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalAmount } = useCartStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <span className="text-6xl mb-4">🛒</span>
        <p className="text-lg">장바구니가 비어있습니다</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg min-h-touch"
          data-testid="cart-go-menu"
        >
          메뉴 보러가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <h1 className="text-lg font-bold">장바구니</h1>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="text-red-500 text-sm min-h-touch px-3"
          data-testid="cart-clear-btn"
        >
          비우기
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="cart-list">
        {items.map((item) => (
          <div key={item.menuItemId} className="bg-white rounded-lg p-4 shadow-sm border" data-testid={`cart-item-${item.menuItemId}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
              </div>
              <button
                onClick={() => removeItem(item.menuItemId)}
                className="text-gray-400 min-w-touch min-h-touch flex items-center justify-center"
                data-testid={`cart-remove-${item.menuItemId}`}
                aria-label={`${item.name} 삭제`}
              >
                ✕
              </button>
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold"
                  data-testid={`cart-minus-${item.menuItemId}`}
                >
                  -
                </button>
                <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold"
                  data-testid={`cart-plus-${item.menuItemId}`}
                >
                  +
                </button>
              </div>
              <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white border-t p-4" data-testid="cart-summary">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600">총 {items.length}종류</span>
          <span className="text-xl font-bold">{formatCurrency(getTotalAmount())}</span>
        </div>
        <button
          onClick={() => navigate('/order/confirm')}
          className="w-full py-4 bg-blue-600 text-white rounded-lg text-lg font-medium min-h-touch"
          data-testid="cart-order-btn"
        >
          주문하기
        </button>
      </div>

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
            <p className="text-lg font-medium mb-4">장바구니를 비우시겠습니까?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 border rounded-lg min-h-touch"
                data-testid="cart-clear-cancel"
              >
                취소
              </button>
              <button
                onClick={() => { clearCart(); setShowClearConfirm(false); }}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg min-h-touch"
                data-testid="cart-clear-confirm"
              >
                비우기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
