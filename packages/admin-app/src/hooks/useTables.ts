import { useEffect } from 'react';
import { useDashboardStore } from '../stores/dashboardStore';

/**
 * 테이블 데이터 관리 Hook
 */
export function useTables() {
  const tables = useDashboardStore((state) => state.tables);
  const fetchTables = useDashboardStore((state) => state.fetchTables);
  const completeTable = useDashboardStore((state) => state.completeTable);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return {
    tables,
    isLoading: tables.length === 0,
    completeTable,
    refreshTables: fetchTables,
  };
}
