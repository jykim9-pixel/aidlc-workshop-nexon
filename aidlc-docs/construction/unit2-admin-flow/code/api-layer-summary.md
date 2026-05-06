# API 레이어 요약 - Unit 2

## 구현된 엔드포인트

### SSE Controller (`/api/events`)
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/events/orders` | SSE 주문 이벤트 스트림 (JWT 인증 필수) |

### Table Controller (`/api/tables`)
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/tables` | 테이블 목록 조회 |
| POST | `/api/tables` | 테이블 생성 |
| PUT | `/api/tables/:id` | 테이블 수정 |
| DELETE | `/api/tables/:id` | 테이블 삭제 |
| POST | `/api/tables/:id/complete` | 이용 완료 처리 |
| GET | `/api/tables/:id/summary` | 테이블 요약 조회 |
| GET | `/api/tables/history` | 과거 주문 내역 조회 |

### Category Controller (`/api/categories`)
| Method | Path | 설명 |
|--------|------|------|
| PUT | `/api/categories/:id` | 카테고리 수정 |
| DELETE | `/api/categories/:id` | 카테고리 삭제 (하위 메뉴 체크) |

## 입력 검증
- tableNumber: 양의 정수
- password: 4자리 이상
- category name: 1~30자
- 비즈니스 규칙 위반 시 적절한 에러 코드 반환

## 에러 처리
- AppError 클래스로 비즈니스 에러 통일
- 에러 미들웨어에서 statusCode와 code 기반 응답 생성
