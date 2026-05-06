import { apiRequest } from './client';

export const menuApi = {
  async getCategories() {
    return apiRequest<any[]>('/categories');
  },

  async createCategory(data: { name: string; sortOrder: number }) {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: string, data: { name?: string; sortOrder?: number }) {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string) {
    return apiRequest(`/categories/${id}`, { method: 'DELETE' });
  },

  async getMenuItems(categoryId?: string) {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return apiRequest<any[]>(`/menus${query}`);
  },

  async createMenuItem(data: {
    name: string;
    price: number;
    description?: string;
    categoryId: string;
    imageUrl?: string;
  }) {
    return apiRequest('/menus', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMenuItem(
    id: string,
    data: {
      name?: string;
      price?: number;
      description?: string;
      categoryId?: string;
      imageUrl?: string;
    },
  ) {
    return apiRequest(`/menus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteMenuItem(id: string) {
    return apiRequest(`/menus/${id}`, { method: 'DELETE' });
  },

  async reorderMenuItems(items: { id: string; sortOrder: number }[]) {
    return apiRequest('/menus/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    });
  },
};
