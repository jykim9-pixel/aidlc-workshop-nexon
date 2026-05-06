import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';

interface AuthState {
  token: string | null;
  tableId: string | null;
  storeId: string | null;
  sessionId: string | null;
  tableNumber: number | null;
  isAuthenticated: boolean;
  login: (storeId: string, tableNumber: number, password: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      tableId: null,
      storeId: null,
      sessionId: null,
      tableNumber: null,
      isAuthenticated: false,

      login: async (storeId: string, tableNumber: number, password: string) => {
        const res = await apiClient.post('/auth/table/login', { storeId, tableNumber, password });
        const { token, tableId, sessionId } = res.data.data;
        localStorage.setItem('token', token);
        set({ token, tableId, storeId, sessionId, tableNumber, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, tableId: null, storeId: null, sessionId: null, tableNumber: null, isAuthenticated: false });
      },

      verifyToken: async () => {
        const { token } = get();
        if (!token) return false;
        try {
          await apiClient.get('/auth/verify');
          return true;
        } catch {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'table-order-auth',
      partialize: (state) => ({
        token: state.token,
        tableId: state.tableId,
        storeId: state.storeId,
        sessionId: state.sessionId,
        tableNumber: state.tableNumber,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
