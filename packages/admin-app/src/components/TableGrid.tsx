import React from 'react';
import { TableCard } from './TableCard';
import { TableSummary } from '@shared/types/table';

interface TableGridProps {
  tables: TableSummary[];
  onSelectOrder: (orderId: string) => void;
  onStatusChange: (orderId: string, status: string) => void;
  onComplete: (tableId: string) => void;
}

export function TableGrid({ tables, onSelectOrder, onStatusChange, onComplete }: TableGridProps) {
  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <p className="text-lg">등록된 테이블이 없습니다</p>
        <p className="text-sm">테이블 관리에서 테이블을 추가해 주세요</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      data-testid="table-grid"
    >
      {tables.map((table) => (
        <TableCard
          key={table.tableId}
          table={table}
          onSelectOrder={onSelectOrder}
          onStatusChange={onStatusChange}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}
