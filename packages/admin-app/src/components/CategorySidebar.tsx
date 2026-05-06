import React, { useState } from 'react';
import { useMenuStore } from '../stores/menuStore';

export function CategorySidebar() {
  const categories = useMenuStore((state) => state.categories);
  const selectedCategoryId = useMenuStore((state) => state.selectedCategoryId);
  const selectCategory = useMenuStore((state) => state.selectCategory);
  const createCategory = useMenuStore((state) => state.createCategory);
  const updateCategory = useMenuStore((state) => state.updateCategory);
  const deleteCategory = useMenuStore((state) => state.deleteCategory);
  const error = useMenuStore((state) => state.error);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory({ name: newName.trim(), sortOrder: categories.length });
      setNewName('');
      setIsAdding(false);
    } catch {
      // error는 store에서 관리
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateCategory(id, { name: editName.trim() });
      setEditingId(null);
    } catch {
      // error는 store에서 관리
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('카테고리를 삭제하시겠습니까?')) return;
    try {
      await deleteCategory(id);
    } catch {
      // error는 store에서 관리
    }
  };

  return (
    <div className="w-64 border-r bg-white p-4" data-testid="category-sidebar">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-gray-900">카테고리</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
          data-testid="add-category-button"
        >
          + 추가
        </button>
      </div>

      {error && (
        <div className="mb-2 rounded bg-red-50 p-2 text-xs text-red-600">{error}</div>
      )}

      {/* 추가 폼 */}
      {isAdding && (
        <div className="mb-2 flex gap-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="카테고리명"
            className="flex-1 rounded border px-2 py-1 text-sm"
            autoFocus
            data-testid="new-category-input"
          />
          <button
            onClick={handleAdd}
            className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
            data-testid="save-category-button"
          >
            저장
          </button>
          <button
            onClick={() => { setIsAdding(false); setNewName(''); }}
            className="rounded px-2 py-1 text-xs text-gray-500"
          >
            취소
          </button>
        </div>
      )}

      {/* 카테고리 목록 */}
      <ul className="space-y-1">
        {categories.map((cat) => (
          <li key={cat.id}>
            {editingId === cat.id ? (
              <div className="flex gap-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                  className="flex-1 rounded border px-2 py-1 text-sm"
                  autoFocus
                />
                <button
                  onClick={() => handleUpdate(cat.id)}
                  className="text-xs text-blue-600"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs text-gray-500"
                >
                  취소
                </button>
              </div>
            ) : (
              <div
                className={`group flex cursor-pointer items-center justify-between rounded px-3 py-2 text-sm ${
                  selectedCategoryId === cat.id
                    ? 'bg-blue-50 font-medium text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => selectCategory(cat.id)}
                data-testid={`category-item-${cat.id}`}
              >
                <span>{cat.name}</span>
                <div className="hidden gap-1 group-hover:flex">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(cat.id);
                      setEditName(cat.name);
                    }}
                    className="text-xs text-gray-400 hover:text-blue-600"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(cat.id);
                    }}
                    className="text-xs text-gray-400 hover:text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
