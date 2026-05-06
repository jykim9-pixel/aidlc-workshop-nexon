import { apiRequest } from './client';
import { TableSummary, CompleteTableResponse } from '@shared/types/table';

export const tableApi = {
  async getTables() {
    return apiRequest<any[]>('/tables');
  },

  async getTablesWithSummary(): Promise<TableSummary[]> {
    const tables = await apiRequest<any[]>('/tables');
    // 각 테이블의 요약 정보를 병렬로 조회
    const summaries = await Promise.all(
      tables.map((table) => apiRequest<TableSummary>(`/tables/${table.id}/summary`)),
    );
    return summaries;
  },

  async createTable(data: { tableNumber: number; password: string }) {
    return apiRequest('/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTable(id: string, data: { tableNumber?: number; password?: string }) {
    return apiRequest(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTable(id: string) {
    return apiRequest(`/tables/${id}`, { method: 'DELETE' });
  },

  async completeTable(id: string): Promise<CompleteTableResponse> {
    return apiRequest(`/tables/${id}/complete`, { method: 'POST' });
  },

  async getTableSummary(id: string): Promise<TableSummary> {
    return apiRequest(`/tables/${id}/summary`);
  },

  async updateOrderStatus(orderId: string, status: string) {
    return apiRequest(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteOrder(orderId: string) {
    return apiRequest(`/orders/${orderId}`, { method: 'DELETE' });
  },

  async getOrderDetail(orderId: string) {
    return apiRequest(`/orders/${orderId}`);
  },
};
