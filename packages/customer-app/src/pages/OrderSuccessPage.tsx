import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ORDER_SUCCESS_REDIRECT_SECONDS } from '@table-order/shared';

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(ORDER_SUCCESS_REDIRECT_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-2xl font-bold mb-2">주문이 접수되었습니다</h1>
      <p className="text-gray-600 mb-4">주문 번호</p>
      <p className="text-xl font-mono font-bold text-blue-600 mb-8" data-testid="order-success-number">
        {orderNumber}
      </p>
      <p className="text-sm text-gray-500">
        {countdown}초 후 메뉴 화면으로 이동합니다
      </p>
      <button
        onClick={() => navigate('/', { replace: true })}
        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg min-h-touch"
        data-testid="order-success-go-menu"
      >
        메뉴로 돌아가기
      </button>
    </div>
  );
}
