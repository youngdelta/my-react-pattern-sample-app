# ProductsPage 개발 패턴 분석

> 대상 파일: `src/pages/ProductsPage.jsx`  
> 작성일: 2026-04-03

---

## 적용된 개발 패턴

### 1. Container 패턴 (Smart Component)

`ProductsPage`는 **Container 컴포넌트**로서 데이터 fetch, 상태 관리, 필터 로직을 모두 담당하고, UI 렌더링은 antd 컴포넌트에 위임합니다.

```
┌─────────────────────────────────────────┐
│         ProductsPage (Container)        │
│                                         │
│  ┌─ 데이터 fetch (useEffect)           │
│  ├─ 필터 상태 관리 (useState)           │
│  ├─ 파생 데이터 계산 (useMemo)          │
│  └─ 이벤트 핸들러 (handleSearch/Reset)  │
│                                         │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │  antd Card  │  │   antd Table     │  │
│  │  (조회조건)  │  │   (조회결과)     │  │
│  │  Select     │  │   columns 정의   │  │
│  │  Input      │  │   pagination     │  │
│  │  Button     │  │   sorter         │  │
│  └─────────────┘  └──────────────────┘  │
└─────────────────────────────────────────┘
```

**특징:**
- 하나의 컴포넌트가 데이터 로직과 화면 구성을 모두 포함
- 별도의 Presentational 컴포넌트 분리 없이 antd가 UI 역할 대체
- 비즈니스 로직(필터링)이 컴포넌트 내부에 위치

---

### 2. 선언적 UI 패턴 (Declarative Configuration)

antd `Table`의 `columns` 배열로 테이블 구조를 **선언적으로 정의**합니다.

```jsx
const columns = [
  { title: 'ID', dataIndex: 'id', sorter: (a, b) => a.id - b.id },
  { title: '이미지', dataIndex: 'thumbnail', render: (src) => <Image ... /> },
  { title: '카테고리', dataIndex: 'category', render: (cat) => <Tag>{cat}</Tag> },
  // ...
];

<Table columns={columns} dataSource={filteredProducts} />
```

**특징:**
- 테이블 구조를 데이터(설정 객체)로 표현
- `render` 함수로 셀별 커스텀 렌더링
- `sorter` 함수로 정렬 로직 선언
- 명령형 DOM 조작 없이 설정만으로 복잡한 테이블 구현

---

### 3. 파생 상태 패턴 (Derived State with useMemo)

원본 데이터(`allProducts`)로부터 **브랜드 목록**과 **필터링된 결과**를 `useMemo`로 파생합니다.

```
allProducts (원본)
    │
    ├── useMemo → brands (브랜드 목록 추출)
    │
    └── useMemo → filteredProducts (조회 조건 적용)
         │
         appliedFilter (조회 버튼 클릭 시 적용)
```

```jsx
const brands = useMemo(() => {
  return [...new Set(allProducts.map((p) => p.brand).filter(Boolean))].sort();
}, [allProducts]);

const filteredProducts = useMemo(() => {
  return allProducts.filter((p) => { /* 조건 필터링 */ });
}, [allProducts, appliedFilter]);
```

**특징:**
- 원본 데이터를 변경하지 않고 파생 데이터만 재계산
- `useMemo`로 불필요한 재계산 방지 (의존성 변경 시에만 실행)
- 단일 데이터 소스(Single Source of Truth) 유지

---

### 4. 지연 적용 필터 패턴 (Deferred Filter Application)

입력 상태와 적용 상태를 **분리**하여, 조회 버튼 클릭 시에만 필터를 적용합니다.

```
┌─ 입력 중 상태 ──────────────┐     ┌─ 적용된 상태 ─────────────┐
│  selCategory                │     │  appliedFilter.category   │
│  inputTitle                 │ ──▶ │  appliedFilter.title      │
│  selBrand                   │조회  │  appliedFilter.brand      │
│  inputSku                   │버튼  │  appliedFilter.sku        │
└─────────────────────────────┘     └─────────────────────────────┘
                                          │
                                          ▼
                                    filteredProducts (useMemo)
```

```jsx
// 입력 중 상태 (UI에 즉시 반영)
const [selCategory, setSelCategory] = useState(undefined);

// 적용된 상태 (조회 버튼 클릭 시 갱신)
const [appliedFilter, setAppliedFilter] = useState({});

const handleSearch = () => {
  setAppliedFilter({ category: selCategory, title: inputTitle, ... });
};
```

**특징:**
- 사용자가 입력할 때마다 테이블이 갱신되지 않음 → 성능 및 UX 향상
- 초기화 버튼으로 입력 상태와 적용 상태를 동시에 리셋 가능
- 업무용 관리 화면에서 일반적으로 사용되는 패턴

---

### 5. 테마 프로바이더 패턴 (Theme Provider)

antd의 `ConfigProvider`로 **다크모드 테마를 컴포넌트 트리에 주입**합니다.

```jsx
<ConfigProvider
  theme={{
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
  }}
>
  {/* antd 컴포넌트들이 자동으로 테마 적용 */}
</ConfigProvider>
```

**특징:**
- Zustand 스토어(`lottoStore`)에서 다크모드 상태를 구독
- CSS 변수 방식(기존 앱)과 antd 테마 알고리즘을 함께 사용
- 하위 antd 컴포넌트가 별도 설정 없이 자동으로 테마 전환

---

### 6. 클라이언트 사이드 필터링 패턴

서버에 필터 요청을 보내지 않고, **전체 데이터를 한 번에 fetch한 후 클라이언트에서 필터링**합니다.

```jsx
// 초기 로딩: 전체 상품 + 카테고리 목록 동시 fetch
useEffect(() => {
  Promise.all([
    fetch('https://dummyjson.com/products?limit=0'),   // 전체 상품
    fetch('https://dummyjson.com/products/categories'), // 카테고리 목록
  ]).then(([productsData, categoriesData]) => { ... });
}, []);
```

**특징:**
- `Promise.all`로 병렬 요청 → 초기 로딩 시간 최소화
- 이후 필터링은 네트워크 요청 없이 즉시 수행
- 데이터 규모가 작은 경우(194건) 적합한 전략

---

## 패턴 요약

| 패턴 | 적용 위치 | 목적 |
|------|----------|------|
| Container 패턴 | `ProductsPage` 전체 | 데이터 로직 + UI를 하나의 컴포넌트에 구성 |
| 선언적 UI | `columns` 배열 | 테이블 구조를 설정 객체로 정의 |
| 파생 상태 | `useMemo` (brands, filteredProducts) | 원본 데이터에서 필요한 값을 파생 |
| 지연 적용 필터 | 입력 상태 vs `appliedFilter` | 조회 버튼 클릭 시에만 필터 적용 |
| 테마 프로바이더 | `ConfigProvider` | 다크모드 자동 연동 |
| 클라이언트 필터링 | `useEffect` + `Promise.all` | 전체 데이터 fetch 후 클라이언트에서 필터 |
