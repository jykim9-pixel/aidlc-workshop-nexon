import React, { useEffect, useState } from 'react';
import { CategorySidebar } from '../components/CategorySidebar';
import { MenuList } from '../components/MenuList';
import { MenuFormModal } from '../components/MenuFormModal';
import { useMenuStore } from '../stores/menuStore';

export function MenuManagementPage() {
  const fetchCategories = useMenuStore((state) => state.fetchCategories);
  const categories = useMenuStore((state) => state.categories);
  const createMenuItem = useMenuStore((state) => state.createMenuItem);
  const updateMenuItem = useMenuStore((state) => state.updateMenuItem);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    menuItem: any | null;
  }>({ isOpen: false, mode: 'create', menuItem: null });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = () => {
    setModalState({ isOpen: true, mode: 'create', menuItem: null });
  };

  const handleEdit = (menuItem: any) => {
    setModalState({ isOpen: true, mode: 'edit', menuItem });
  };

  const handleSubmit = async (data: any) => {
    if (modalState.mode === 'create') {
      await createMenuItem(data);
    } else if (modalState.menuItem) {
      await updateMenuItem(modalState.menuItem.id, data);
    }
  };

  return (
    <div className="flex min-h-screen" data-testid="menu-management-page">
      <CategorySidebar />
      <MenuList onEdit={handleEdit} onAdd={handleAdd} />

      <MenuFormModal
        mode={modalState.mode}
        menuItem={modalState.menuItem}
        categories={categories}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
