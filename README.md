# my-react-pattern-sample-app

React와 Vite 기반의 프론트엔드 아키텍처 패턴 데모 애플리케이션입니다.  
[DummyJSON API](https://dummyjson.com)를 활용하여 인증, 상품, 장바구니 기능을 구현하고,  
MVC · MVVM · MVP · Observer · Repository · Flux 등 6가지 개발 패턴을 인터랙티브하게 시연합니다.

---

## 🚀 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 + Vite |
| 라우팅 | React Router v6 |
| 상태 관리 | Zustand (persist 미들웨어) |
| API | DummyJSON REST API |
| 스타일 | CSS Modules (다크모드 지원) |

---

## 📁 프로젝트 구조

```
src/
├── store/
│   ├── authStore.js        # 인증 상태 (JWT 토큰, 사용자 정보)
│   ├── cartStore.js        # 장바구니 상태
│   └── lottoStore.js       # 로또 번호 생성기 상태
├── pages/
│   ├── LoginPage.jsx       # 로그인 폼
│   ├── ProfilePage.jsx     # 로그인 사용자 프로필
│   ├── ProductsPage.jsx    # 상품 목록 (검색, 페이지네이션, 모달)
│   ├── CartPage.jsx        # 장바구니
│   └── PatternsPage.jsx    # 아키텍처 패턴 데모 (6탭)
├── components/
│   ├── NavBar.jsx          # 상단 네비게이션 바
│   ├── ProductModal.jsx    # 상품 상세 모달
│   ├── PrivateRoute.jsx    # 인증 보호 라우트
│   ├── Clock.jsx           # 실시간 시계
│   └── LottoGenerator.jsx  # 로또 번호 생성기
└── App.jsx                 # 라우팅 설정
```

---

## 📌 주요 기능

### 🔐 인증 (Auth)
- DummyJSON `/auth/login` API를 이용한 JWT 로그인
- Zustand persist로 토큰 및 사용자 정보 localStorage 유지
- 로그인 후 `/profile` 페이지에서 사용자 상세 정보 표시
- NavBar에 로그인/로그아웃 버튼 및 프로필 아바타 표시

> 테스트 계정: `emilys` / `emilyspass`

### 🛍️ 상품 (Products)
- 상품 목록 그리드 (반응형: 5 → 4 → 3 → 2 컬럼)
- 검색 및 페이지네이션
- 상품 이미지 클릭 시 상세 모달 (이미지 갤러리, 리뷰 포함)
- 장바구니 담기 버튼

### 🛒 장바구니 (Cart)
- 수량 조절 및 상품 삭제
- 상품 이미지 클릭 → 상세 모달
- 상품명 클릭 → 상품 페이지로 이동
- DummyJSON `/carts/add` API로 주문 처리
- NavBar 장바구니 아이콘에 담긴 수량 뱃지 표시

### 🏗️ 아키텍처 패턴 (Patterns)

| 탭 | 패턴 | 사용 API | 시연 내용 |
|----|------|----------|-----------|
| 🔷 MVC | Model · View · Controller | Products | 정렬 버튼 → Controller → Model → View 흐름 애니메이션 |
| 🔶 MVVM | Model · View · ViewModel | Posts | 좋아요/북마크 클릭 → ViewModel 상태 → View 반응형 업데이트 |
| 🟢 MVP | Model · View · Presenter | Recipes | `RecipePresenter` 가 데이터를 가공하여 View에 전달 |
| 👁 Observer | Subject · Observer | Quotes | 3초 자동 갱신, 패널별 구독/해제로 알림 제어 |
| 🗄️ Repository | Data Access Layer | Todos | CRUD 작업 시 Repository 인터페이스 호출 로그 실시간 표시 |
| ⚡ Flux | Action · Dispatcher · Store · View | Products | 카테고리 필터/뷰 전환 시 Action 로그 + Store 상태 실시간 표시 |

---

## ⚙️ 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 🔗 참고 API

- [DummyJSON Auth](https://dummyjson.com/docs/auth)
- [DummyJSON Products](https://dummyjson.com/docs/products)
- [DummyJSON Carts](https://dummyjson.com/docs/carts)
- [DummyJSON Posts](https://dummyjson.com/docs/posts)
- [DummyJSON Recipes](https://dummyjson.com/docs/recipes)
- [DummyJSON Todos](https://dummyjson.com/docs/todos)
- [DummyJSON Quotes](https://dummyjson.com/docs/quotes)
