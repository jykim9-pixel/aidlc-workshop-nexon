import React, { useEffect, useState } from 'react';
import { HistoryFilter } from '../components/HistoryFilter';
import { HistoryList } from '../components/HistoryList';
import { HistoryDetailModal } from '../components/HistoryDetailModal';
import { useHistoryStore } from '../stores/historyStore';
import { useDashboardStore } from '../stores/dashboardStore';
import { OrderHistory } from '@shared/types/history';

export function OrderHistoryPage() {
  const histories = useHistoryStore((state) => state.histories);
  const isLoading = useHistoryStore((state) => state.isLoading);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);
  const tables = useDashboardStore((state) => state.tables);

  const [selectedHistory, setSelectedHistory] = useState<OrderHistory | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="order-history-page">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">과거 주문 내역</h1>

      <HistoryFilter
        tables={tables.map((t) => ({ id: t.tableId, tableNumber: t.tableNumber }))}
      />

      <HistoryList
        histories={histories}
        isLoading={isLoading}
        onSelect={setSelectedHistory}
      />

      <HistoryDetailModal
        history={selectedHistory}
        isOpen={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
      />
    </div>
  );
}
