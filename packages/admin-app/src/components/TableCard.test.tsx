import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TableCard } from './TableCard';
import { TableStatus } from '@shared/types/table';

describe('TableCard', () => {
  const mockTable = {
    tableId: 't1',
    tableNumber: 3,
    status: TableStatus.OCCUPIED,
    sessionId: 's1',
    totalAmount: 25000,
    orderCount: 2,
    latestOrders: [
      {
        orderId: 'o1',
        status: 'PENDING',
        totalAmount: 15000,
        itemCount: 2,
        orderedAt: '2026-05-06T12:00:00Z',
        isNew: true,
      },
      {
        orderId: 'o2',
        status: 'PREPARING',
        totalAmount: 10000,
        itemCount: 1,
        orderedAt: '2026-05-06T11:50:00Z',
        isNew: false,
      },
    ],
    hasNewOrder: true,
  };

  const mockHandlers = {
    onSelectOrder: jest.fn(),
    onStatusChange: jest.fn(),
    onComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('테이블 번호를 표시해야 한다', () => {
    render(<TableCard table={mockTable} {...mockHandlers} />);
    expect(screen.getByText('테이블 3')).toBeInTheDocument();
  });

  it('사용중 상태를 표시해야 한다', () => {
    render(<TableCard table={mockTable} {...mockHandlers} />);
    expect(screen.getByTestId('table-status-3')).toHaveTextContent('사용중');
  });

  it('IDLE 테이블은 비어있음을 표시해야 한다', () => {
    const idleTable = { ...mockTable, status: TableStatus.IDLE, latestOrders: [], hasNewOrder: false };
    render(<TableCard table={idleTable} {...mockHandlers} />);
    expect(screen.getByTestId('table-status-3')).toHaveTextContent('비어있음');
  });

  it('총 금액을 표시해야 한다', () => {
    render(<TableCard table={mockTable} {...mockHandlers} />);
    expect(screen.getByText('25,000원')).toBeInTheDocument();
  });

  it('주문 클릭 시 onSelectOrder를 호출해야 한다', () => {
    render(<TableCard table={mockTable} {...mockHandlers} />);
    fireEvent.click(screen.getByTestId('order-item-o1'));
    expect(mockHandlers.onSelectOrder).toHaveBeenCalledWith('o1');
  });

  it('이용 완료 버튼 클릭 시 onComplete를 호출해야 한다', () => {
    render(<TableCard table={mockTable} {...mockHandlers} />);
    fireEvent.click(screen.getByTestId('complete-table-3'));
    expect(mockHandlers.onComplete).toHaveBeenCalledWith('t1');
  });

  it('IDLE 테이블에는 이용 완료 버튼이 없어야 한다', () => {
    const idleTable = { ...mockTable, status: TableStatus.IDLE, latestOrders: [], hasNewOrder: false };
    render(<TableCard table={idleTable} {...mockHandlers} />);
    expect(screen.queryByTestId('complete-table-3')).not.toBeInTheDocument();
  });
});
