import { useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const itemCount = useCartStore((s) => s.getItemCount());

  const tabs = [
    { path: '/', label: '메뉴', icon: '🍽️' },
    { path: '/cart', label: '장바구니', icon: '🛒', badge: itemCount },
    { path: '/orders', label: '주문내역', icon: '📋' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex" data-testid="bottom-nav">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex-1 flex flex-col items-center py-3 min-h-touch relative ${
              isActive ? 'text-blue-600' : 'text-gray-500'
            }`}
            data-testid={`nav-${tab.label}`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs mt-1">{tab.label}</span>
            {tab.badge ? (
              <span className="absolute top-1 right-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
