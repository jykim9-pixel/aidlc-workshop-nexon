import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { Order } from '@table-order/shared';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: (sessionId: string) => Promise<void>;
  createOrder: (tableId: string, sessionId: string | null, items: { menuItemId: string; quantity: number }[]) => Promise<Order>;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchOrders: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get('/orders', { params: { sessionId } });
      set({ orders: res.data.data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      set({ error: message, isLoading: false });
    }
  },

  createOrder: async (tableId, sessionId, items) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/orders', {
        tableId,
        sessionId: sessionId || undefined,
        items,
      });
      set({ isLoading: false });
      return res.data.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create order';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
