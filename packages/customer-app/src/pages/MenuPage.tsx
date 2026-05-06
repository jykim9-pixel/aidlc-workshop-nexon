import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useCartStore } from '../stores/cartStore';
import type { Category, MenuItem } from '@table-order/shared';
import { formatCurrency } from '@table-order/shared';

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    apiClient.get('/categories').then((res) => {
      setCategories(res.data.data);
    });
  }, []);

  useEffect(() => {
    const params = selectedCategory ? { categoryId: selectedCategory } : {};
    apiClient.get('/menus', { params }).then((res) => {
      setMenuItems(res.data.data);
    });
  }, [selectedCategory]);

  const handleAddToCart = (item: MenuItem) => {
    const success = addItem({ id: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl ?? undefined });
    if (success) {
      setToast(`${item.name} 추가됨`);
      setTimeout(() => setToast(''), 2000);
    } else {
      setToast('장바구니가 가득 찼습니다 (최대 20종류)');
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category Navigation */}
      <div className="sticky top-0 bg-white border-b z-10 overflow-x-auto" data-testid="category-nav">
        <div className="flex px-2 py-2 gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap min-h-touch text-sm font-medium ${
              !selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
            data-testid="category-all"
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap min-h-touch text-sm font-medium ${
                selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              data-testid={`category-${cat.name}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-4 content-start" data-testid="menu-grid">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden" data-testid={`menu-card-${item.id}`}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover" />
            ) : (
              <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-4xl">🍽️</div>
            )}
            <div className="p-3">
              <h3 className="font-medium text-sm truncate">{item.name}</h3>
              <p className="text-blue-600 font-bold mt-1">{formatCurrency(item.price)}</p>
              <button
                onClick={() => handleAddToCart(item)}
                className="w-full mt-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium min-h-touch"
                data-testid={`add-to-cart-${item.id}`}
              >
                담기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
