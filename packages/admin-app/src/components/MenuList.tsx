import React from 'react';
import { useMenuStore } from '../stores/menuStore';

interface MenuListProps {
  onEdit: (menuItem: any) => void;
  onAdd: () => void;
}

export function MenuList({ onEdit, onAdd }: MenuListProps) {
  const menuItems = useMenuStore((state) => state.menuItems);
  const selectedCategoryId = useMenuStore((state) => state.selectedCategoryId);
  const deleteMenuItem = useMenuStore((state) => state.deleteMenuItem);
  const isLoading = useMenuStore((state) => state.isLoading);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 메뉴를 삭제하시겠습니까?`)) return;
    await deleteMenuItem(id);
  };

  if (!selectedCategoryId) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        카테고리를 선택해 주세요
      </div>
    );
  }

  return (
    <div className="flex-1 p-4" data-testid="menu-list">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">메뉴 목록</h2>
        <button
          onClick={onAdd}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          data-testid="add-menu-button"
        >
          + 메뉴 추가
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">로딩 중...</div>
      ) : menuItems.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          이 카테고리에 메뉴가 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded border bg-white p-3"
              data-testid={`menu-item-${item.id}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{index + 1}</span>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500">{item.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{item.price.toLocaleString()}원</span>
                <button
                  onClick={() => onEdit(item)}
                  className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
                  data-testid={`edit-menu-${item.id}`}
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                  data-testid={`delete-menu-${item.id}`}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
