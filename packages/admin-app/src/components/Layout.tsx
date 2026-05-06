import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 바 */}
      <nav className="border-b bg-white shadow-sm" data-testid="admin-nav">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-gray-900">테이블오더 관리</span>
            <div className="flex gap-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `rounded px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                data-testid="nav-dashboard"
              >
                대시보드
              </NavLink>
              <NavLink
                to="/menu"
                className={({ isActive }) =>
                  `rounded px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                data-testid="nav-menu"
              >
                메뉴 관리
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `rounded px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                data-testid="nav-history"
              >
                주문 이력
              </NavLink>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            data-testid="nav-logout"
          >
            로그아웃
          </button>
        </div>
      </nav>

      {/* 페이지 콘텐츠 */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
