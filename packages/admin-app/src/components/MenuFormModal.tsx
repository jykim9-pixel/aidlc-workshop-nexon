import React, { useState, useEffect } from 'react';

interface MenuFormModalProps {
  mode: 'create' | 'edit';
  menuItem: any | null;
  categories: Array<{ id: string; name: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface FormData {
  name: string;
  price: string;
  description: string;
  categoryId: string;
  imageUrl: string;
}

interface FormErrors {
  name?: string;
  price?: string;
  categoryId?: string;
}

export function MenuFormModal({
  mode,
  menuItem,
  categories,
  isOpen,
  onClose,
  onSubmit,
}: MenuFormModalProps) {
  const [form, setForm] = useState<FormData>({
    name: '',
    price: '',
    description: '',
    categoryId: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (mode === 'edit' && menuItem) {
      setForm({
        name: menuItem.name,
        price: String(menuItem.price),
        description: menuItem.description || '',
        categoryId: menuItem.categoryId,
        imageUrl: menuItem.imageUrl || '',
      });
    } else {
      setForm({ name: '', price: '', description: '', categoryId: '', imageUrl: '' });
    }
    setErrors({});
  }, [mode, menuItem, isOpen]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim() || form.name.length > 50) {
      newErrors.name = '메뉴명은 1~50자여야 합니다.';
    }

    const price = parseInt(form.price, 10);
    if (isNaN(price) || price < 0) {
      newErrors.price = '가격은 0 이상 정수여야 합니다.';
    }

    if (!form.categoryId) {
      newErrors.categoryId = '카테고리를 선택해 주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: form.name.trim(),
      price: parseInt(form.price, 10),
      description: form.description.trim() || undefined,
      categoryId: form.categoryId,
      imageUrl: form.imageUrl.trim() || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      data-testid="menu-form-modal"
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">
          {mode === 'create' ? '메뉴 등록' : '메뉴 수정'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 메뉴명 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              메뉴명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full rounded border px-3 py-2 text-sm ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="메뉴명을 입력하세요"
              data-testid="menu-form-name"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* 가격 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              가격 (원) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={`w-full rounded border px-3 py-2 text-sm ${
                errors.price ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
              data-testid="menu-form-price"
            />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
          </div>

          {/* 설명 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="메뉴 설명 (선택)"
              rows={2}
              maxLength={200}
              data-testid="menu-form-description"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className={`w-full rounded border px-3 py-2 text-sm ${
                errors.categoryId ? 'border-red-300' : 'border-gray-300'
              }`}
              data-testid="menu-form-category"
            >
              <option value="">카테고리 선택</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
            )}
          </div>

          {/* 이미지 URL */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              이미지 URL
            </label>
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="https://..."
              data-testid="menu-form-image-url"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
              data-testid="menu-form-submit"
            >
              {mode === 'create' ? '등록' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
