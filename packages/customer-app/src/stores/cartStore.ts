import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CART_MAX_TYPES } from '@table-order/shared';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (menuItem: { id: string; name: string; price: number; imageUrl?: string }) => boolean;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getItemCount: () => number;
  getTotalTypes: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (menuItem) => {
        const { items } = get();
        const existing = items.find((i) => i.menuItemId === menuItem.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
          return true;
        }

        if (items.length >= CART_MAX_TYPES) {
          return false; // Max types reached
        }

        set({
          items: [...items, {
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            imageUrl: menuItem.imageUrl ?? undefined,
          }],
        });
        return true;
      },

      removeItem: (menuItemId) => {
        set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) });
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalAmount: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotalTypes: () => get().items.length,
    }),
    { name: 'table-order-cart' }
  )
);
