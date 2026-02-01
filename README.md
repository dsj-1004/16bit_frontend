# 16bit_frontend

헬스케어 X IT 해커톤

React 19 기반의 **모바일 최적화 데모 페이지** 보일러플레이트입니다.

## 기술 스택

| 분류            | 기술                                    |
| --------------- | --------------------------------------- |
| **프레임워크**  | React 19 + TypeScript                   |
| **빌드**        | Vite 6                                  |
| **스타일링**    | TailwindCSS 4 + ShadcnUI                |
| **라우팅**      | TanStack Router                         |
| **데이터 페칭** | TanStack Query + Axios                  |
| **상태 관리**   | Zustand                                 |
| **폼**          | React Hook Form + Zod                   |
| **코드 품질**   | ESLint + Prettier + Husky + lint-staged |

## 시작하기

### 필수 조건

- Node.js 20.x 이상
- pnpm 9.x 이상

### 설치 및 실행

```bash
# pnpm 설치 (없는 경우)
npm install -g pnpm

# 의존성 설치
pnpm install

# 환경 변수 설정 (.env)
cp .env.example .env

# 개발 서버 실행
pnpm dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 접속

## 프로젝트 구조

```text
src/
├── components/           # 컴포넌트
├── ui/               # ShadcnUI 기본 컴포넌트
├── layout/           # 레이아웃 (Layout, Sidebar, Header)
├── config/               # 앱 설정
├── features/             # 기능별 모듈
├── hooks/                # 커스텀 훅
├── lib/                  # 유틸리티 (axios, utils 등)
├── routes/               # 페이지 (TanStack Router)
├── stores/               # Zustand 상태 (sidebar 등)
└── styles/               # 글로벌 스타일 (Grayscale)
```
