import { create } from 'zustand';
import { OrderHistory, HistoryFilters } from '@shared/types/history';
import { historyApi } from '../api/historyApi';

interface HistoryState {
  histories: OrderHistory[];
  filters: HistoryFilters;
  isLoading: boolean;
  error: string | null;

  fetchHistory: (filters?: HistoryFilters) => Promise<void>;
  setFilters: (filters: Partial<HistoryFilters>) => void;
  clearFilters: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  histories: [],
  filters: {},
  isLoading: false,
  error: null,

  fetchHistory: async (filters) => {
    const activeFilters = filters || get().filters;
    set({ isLoading: true, error: null });
    try {
      const histories = await historyApi.getOrderHistory(activeFilters);
      set({ histories, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  setFilters: (filters) => {
    const newFilters = { ...get().filters, ...filters };
    set({ filters: newFilters });
    get().fetchHistory(newFilters);
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchHistory({});
  },
}));
