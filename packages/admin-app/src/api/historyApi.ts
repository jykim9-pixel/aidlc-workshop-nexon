import { apiRequest } from './client';
import { OrderHistory, HistoryFilters } from '@shared/types/history';

export const historyApi = {
  async getOrderHistory(filters: HistoryFilters = {}): Promise<OrderHistory[]> {
    const params = new URLSearchParams();
    if (filters.tableId) params.set('tableId', filters.tableId);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<OrderHistory[]>(`/orders/history${query}`);
  },
};
