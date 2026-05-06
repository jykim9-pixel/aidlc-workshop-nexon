import { create } from 'zustand';
import { menuApi } from '../api/menuApi';

interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isAvailable: boolean;
}

interface CreateMenuItemInput {
  name: string;
  price: number;
  description?: string;
  categoryId: string;
  imageUrl?: string;
}

interface UpdateMenuItemInput {
  name?: string;
  price?: number;
  description?: string;
  categoryId?: string;
  imageUrl?: string;
}

interface MenuState {
  categories: Category[];
  menuItems: MenuItem[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  error: string | null;

  // 카테고리
  fetchCategories: () => Promise<void>;
  createCategory: (data: { name: string; sortOrder: number }) => Promise<void>;
  updateCategory: (id: string, data: { name?: string; sortOrder?: number }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // 메뉴
  fetchMenuItems: (categoryId?: string) => Promise<void>;
  createMenuItem: (data: CreateMenuItemInput) => Promise<void>;
  updateMenuItem: (id: string, data: UpdateMenuItemInput) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  reorderMenuItems: (items: { id: string; sortOrder: number }[]) => Promise<void>;

  // UI
  selectCategory: (categoryId: string | null) => void;
  clearError: () => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  menuItems: [],
  selectedCategoryId: null,
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await menuApi.getCategories();
      set({ categories, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createCategory: async (data) => {
    set({ error: null });
    try {
      await menuApi.createCategory(data);
      await get().fetchCategories();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    set({ error: null });
    try {
      await menuApi.updateCategory(id, data);
      await get().fetchCategories();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ error: null });
    try {
      await menuApi.deleteCategory(id);
      await get().fetchCategories();
      // 삭제된 카테고리가 선택 중이었으면 해제
      if (get().selectedCategoryId === id) {
        set({ selectedCategoryId: null, menuItems: [] });
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchMenuItems: async (categoryId) => {
    set({ isLoading: true, error: null });
    try {
      const menuItems = await menuApi.getMenuItems(categoryId);
      set({ menuItems, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createMenuItem: async (data) => {
    set({ error: null });
    try {
      await menuApi.createMenuItem(data);
      await get().fetchMenuItems(get().selectedCategoryId || undefined);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateMenuItem: async (id, data) => {
    set({ error: null });
    try {
      await menuApi.updateMenuItem(id, data);
      await get().fetchMenuItems(get().selectedCategoryId || undefined);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteMenuItem: async (id) => {
    set({ error: null });
    try {
      await menuApi.deleteMenuItem(id);
      await get().fetchMenuItems(get().selectedCategoryId || undefined);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  reorderMenuItems: async (items) => {
    set({ error: null });
    try {
      await menuApi.reorderMenuItems(items);
      await get().fetchMenuItems(get().selectedCategoryId || undefined);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  selectCategory: (categoryId) => {
    set({ selectedCategoryId: categoryId });
    if (categoryId) {
      get().fetchMenuItems(categoryId);
    } else {
      set({ menuItems: [] });
    }
  },

  clearError: () => set({ error: null }),
}));
