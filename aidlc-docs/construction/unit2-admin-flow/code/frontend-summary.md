# 프론트엔드 요약 - Unit 2 (Admin App)

## 페이지 구조

| 페이지 | 경로 | 설명 |
|--------|------|------|
| LoginPage | `/login` | 관리자 로그인 |
| DashboardPage | `/dashboard` | 실시간 주문 대시보드 |
| MenuManagementPage | `/menu` | 메뉴/카테고리 관리 |
| OrderHistoryPage | `/history` | 과거 주문 내역 조회 |

## 상태 관리 (Zustand)

### dashboardStore
- SSE 연결 관리 (연결/재연결/해제)
- 테이블 목록 및 실시간 업데이트
- 주문 상태 변경, 삭제, 이용 완료 액션

### menuStore
- 카테고리 CRUD
- 메뉴 CRUD + 순서 변경
- 선택된 카테고리 기반 메뉴 필터링

### historyStore
- 과거 주문 이력 조회
- 필터 관리 (테이블, 날짜 범위)

## 주요 컴포넌트

### 대시보드
- ConnectionStatus — SSE 연결 상태 표시 (연결됨/재연결 중/실패)
- TableGrid — 테이블 카드 그리드 (번호순 고정)
- TableCard — 개별 테이블 (주문 목록, 신규 강조, 이용 완료)
- OrderDetailModal — 주문 상세 + 상태 변경 + 삭제
- CompleteConfirmModal — 이용 완료 확인

### 메뉴 관리
- CategorySidebar — 카테고리 목록 + CRUD
- MenuList — 메뉴 목록 + 수정/삭제
- MenuFormModal — 메뉴 등록/수정 폼 (실시간 검증)

### 주문 이력
- HistoryFilter — 테이블/날짜 필터
- HistoryList — 이력 목록
- HistoryDetailModal — 이력 상세

## SSE 재연결 전략
- 3초 간격, 최대 10회 자동 재시도
- 10회 초과 시 "새로고침" 버튼 표시
- 재연결 성공 시 대시보드 데이터 전체 새로고침

## 테스트
- dashboardStore.test.ts — SSE 이벤트 핸들링 (4개 이벤트 타입)
- TableCard.test.tsx — 렌더링, 상태 표시, 사용자 인터랙션

## Automation Friendly
- 모든 인터랙티브 요소에 `data-testid` 속성 적용
- 네이밍 규칙: `{component}-{element-role}` (예: `table-card-1`, `login-submit-button`)
