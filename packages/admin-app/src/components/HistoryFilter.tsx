import React from 'react';
import { useHistoryStore } from '../stores/historyStore';

interface HistoryFilterProps {
  tables: Array<{ id: string; tableNumber: number }>;
}

export function HistoryFilter({ tables }: HistoryFilterProps) {
  const filters = useHistoryStore((state) => state.filters);
  const setFilters = useHistoryStore((state) => state.setFilters);
  const clearFilters = useHistoryStore((state) => state.clearFilters);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3" data-testid="history-filter">
      {/* 테이블 필터 */}
      <select
        value={filters.tableId || ''}
        onChange={(e) => setFilters({ tableId: e.target.value || undefined })}
        className="rounded border border-gray-300 px-3 py-2 text-sm"
        data-testid="history-filter-table"
      >
        <option value="">전체 테이블</option>
        {tables.map((t) => (
          <option key={t.id} value={t.id}>
            테이블 {t.tableNumber}
          </option>
        ))}
      </select>

      {/* 시작 날짜 */}
      <input
        type="date"
        value={filters.dateFrom?.split('T')[0] || ''}
        onChange={(e) =>
          setFilters({ dateFrom: e.target.value ? `${e.target.value}T00:00:00Z` : undefined })
        }
        className="rounded border border-gray-300 px-3 py-2 text-sm"
        data-testid="history-filter-date-from"
      />

      <span className="text-gray-400">~</span>

      {/* 종료 날짜 */}
      <input
        type="date"
        value={filters.dateTo?.split('T')[0] || ''}
        onChange={(e) =>
          setFilters({ dateTo: e.target.value ? `${e.target.value}T23:59:59Z` : undefined })
        }
        className="rounded border border-gray-300 px-3 py-2 text-sm"
        data-testid="history-filter-date-to"
      />

      {/* 초기화 */}
      {(filters.tableId || filters.dateFrom || filters.dateTo) && (
        <button
          onClick={clearFilters}
          className="rounded px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          data-testid="history-filter-clear"
        >
          필터 초기화
        </button>
      )}
    </div>
  );
}
