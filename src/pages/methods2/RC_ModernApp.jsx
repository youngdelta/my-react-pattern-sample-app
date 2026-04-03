import { useState, useEffect, useReducer, createContext, useContext } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading, useDebounce } from '@/pages/methods/shared';

/*
 * ✅ React Compiler 종합 Modern App
 * ModernReact.jsx의 동일 기능을 memo/useMemo/useCallback 없이 구현
 * 컴파일러가 모든 최적화를 자동 처리
 */

/* ── 1. Custom Hook (useMemo/useCallback 없음) ── */
function useProductStore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=12')
      .then((r) => r.json())
      .then((d) => { setProducts(d.products); setLoading(false); });
  }, []);

  const debouncedSearch = useDebounce(search, 300);

  // ✅ useMemo 없이 직접 계산 → 컴파일러가 자동 캐싱
  let result = products;
  if (debouncedSearch) {
    const q = debouncedSearch.toLowerCase();
    result = result.filter((p) => p.title.toLowerCase().includes(q));
  }
  if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);

  return { products: result, loading, sortBy, setSortBy, search, setSearch, total: products.length };
}

/* ── 2. Context + useReducer (useMemo 없이 Provider value) ── */
const CartCtx = createContext(null);
const useCart = () => useContext(CartCtx);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find((i) => i.id === action.product.id);
      if (existing) return state.map((i) => i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.product, qty: 1 }];
    }
    case 'REMOVE':
      return state.filter((i) => i.id !== action.id);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  // ✅ useMemo 없이 파생값 계산 → 컴파일러가 items 변경 시에만 재계산
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.qty, 0);

  // ✅ useMemo 없이 context value → 컴파일러가 자동 메모이제이션
  const value = { items, totalQty, totalPrice, dispatch };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

/* ── 3. 일반 컴포넌트 (memo 없음) ── */
function ProductItem({ product, onAdd }) {
  return (
    <div className="m-mr-card">
      <img src={product.thumbnail} alt={product.title} />
      <div className="m-mr-card-body">
        <p className="m-mr-card-title">{product.title}</p>
        <div className="m-mr-card-meta">
          <span className="m-mr-price">${product.price}</span>
          <span className="m-mr-rating">⭐ {product.rating}</span>
        </div>
        <button className="m-mr-cart-btn" onClick={() => onAdd(product)}>🛒 담기</button>
      </div>
    </div>
  );
}

/* ── 4. 합성 컴포넌트 ── */
function SearchToolbar({ search, onSearch, sortBy, onSort, resultCount, total }) {
  return (
    <div className="m-mr-toolbar">
      <input className="m-mr-search" placeholder="🔍 검색 (debounce 300ms)..." value={search} onChange={(e) => onSearch(e.target.value)} />
      <div className="m-mr-sort-group">
        {[['default', '기본'], ['price-asc', '↑가격'], ['price-desc', '↓가격'], ['rating', '⭐평점']].map(([v, l]) => (
          <button key={v} className={`m-sort-btn ${sortBy === v ? 'active' : ''}`} onClick={() => onSort(v)}>{l}</button>
        ))}
      </div>
      <span className="m-mr-count">{resultCount}/{total}개</span>
    </div>
  );
}

function MiniCart() {
  const { items, totalQty, totalPrice, dispatch } = useCart();
  return (
    <div className="m-mr-mini-cart">
      <div className="m-mr-mini-header">
        🛒 미니 장바구니 <span className="m-mr-mini-badge">{totalQty}</span>
      </div>
      {items.length === 0 ? (
        <p className="m-mr-mini-empty">비어 있습니다</p>
      ) : (
        <>
          <div className="m-mr-mini-list">
            {items.map((item) => (
              <div key={item.id} className="m-mr-mini-item">
                <span className="m-mr-mini-name">{item.title} ×{item.qty}</span>
                <span className="m-mr-mini-price">${(item.price * item.qty).toFixed(0)}</span>
                <button className="m-mr-mini-del" onClick={() => dispatch({ type: 'REMOVE', id: item.id })}>✕</button>
              </div>
            ))}
          </div>
          <div className="m-mr-mini-footer">
            <span className="m-mr-mini-total">합계: ${totalPrice.toFixed(0)}</span>
            <button className="m-mr-mini-clear" onClick={() => dispatch({ type: 'CLEAR' })}>비우기</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── 5. 코드 비교 패널 ── */
function CodeComparePanel() {
  return (
    <div className="m2-rc-code-compare">
      <div className="m2-rc-code-col">
        <div className="m2-rc-code-label before">❌ Before (수동)</div>
        <pre className="m2-rc-code">{`const ProductItem = memo(({ product, onAdd }) => {
  ...
});

const handleAdd = useCallback((product) => {
  dispatch({ type: 'ADD', product });
}, [dispatch]);

const filtered = useMemo(() =>
  products.filter(p => p.title.includes(q)),
  [products, q]
);

const value = useMemo(() => ({
  items, totalQty, totalPrice, dispatch
}), [items, totalQty, totalPrice]);`}</pre>
      </div>
      <div className="m2-rc-code-col">
        <div className="m2-rc-code-label after">✅ After (Compiler)</div>
        <pre className="m2-rc-code">{`function ProductItem({ product, onAdd }) {
  ...
}

const handleAdd = (product) => {
  dispatch({ type: 'ADD', product });
};

const filtered = products.filter(
  p => p.title.includes(q)
);

const value = {
  items, totalQty, totalPrice, dispatch
};`}</pre>
      </div>
    </div>
  );
}

/* ── 6. 패턴 사용 현황 ── */
function PatternUsagePanel() {
  const patterns = [
    { name: 'Custom Hook', code: 'useProductStore()', desc: '검색+정렬+필터 캡슐화 (useMemo 없음)', icon: '🪝' },
    { name: 'useDebounce', code: 'useDebounce(search, 300)', desc: '검색 300ms 지연', icon: '⌨️' },
    { name: '자동 메모이제이션', code: 'products.filter(...).sort(...)', desc: 'useMemo 대신 컴파일러가 캐싱', icon: '🔮' },
    { name: 'Context + Reducer', code: 'CartCtx + cartReducer', desc: '장바구니 전역 상태 (useMemo value 없음)', icon: '🌐' },
    { name: '자동 memo', code: 'function ProductItem()', desc: 'React.memo 없이 자동 최적화', icon: '🧠' },
    { name: '자동 callback', code: '(product) => dispatch(...)', desc: 'useCallback 없이 참조 안정화', icon: '📌' },
    { name: 'Composition', code: 'SearchToolbar + MiniCart', desc: '독립 컴포넌트 조합', icon: '🧩' },
  ];
  return (
    <div className="m-mr-usage-panel">
      <div className="m-mr-usage-title">🔮 React Compiler가 자동 처리하는 패턴들</div>
      {patterns.map((p, i) => (
        <div key={i} className="m-mr-usage-item">
          <span className="m-mr-usage-icon">{p.icon}</span>
          <div>
            <span className="m-mr-usage-name">{p.name}</span>
            <code className="m-mr-usage-code">{p.code}</code>
            <small className="m-mr-usage-desc">{p.desc}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 메인 데모 ── */
function ModernDemo({ store }) {
  const { dispatch } = useCart();

  // ✅ useCallback 없이 plain function → 컴파일러가 자동 안정화
  const handleAdd = (product) => {
    dispatch({ type: 'ADD', product });
  };

  return (
    <div className="m-mr-demo-layout">
      <div className="m-mr-main">
        <SearchToolbar
          search={store.search} onSearch={store.setSearch}
          sortBy={store.sortBy} onSort={store.setSortBy}
          resultCount={store.products.length} total={store.total}
        />
        {store.loading ? <DemoLoading /> : (
          <div className="m-mr-grid">
            {store.products.slice(0, 8).map((p) => (
              <ProductItem key={p.id} product={p} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </div>
      <div className="m-mr-sidebar">
        <MiniCart />
        <PatternUsagePanel />
      </div>
    </div>
  );
}

/* ── 메인 탭 ── */
export default function RC_ModernAppTab() {
  const store = useProductStore();

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--react">⚛️ React Compiler</span>
        <span className="m-badge m-badge--green">🏆 종합 Modern App</span>
      </div>
      <p className="m-desc">
        기존 <strong>Modern React 탭</strong>과 동일한 미니 쇼핑 앱을
        <strong> React Compiler 스타일</strong>로 다시 작성했습니다.
        <code>memo</code>, <code>useMemo</code>, <code>useCallback</code>이
        <strong> 전혀 없지만</strong> 동일한 성능 최적화가 자동 적용됩니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '🪝', label: 'Custom Hook', desc: '로직 캡슐화', color: 'react' },
        { icon: '🌐', label: 'Context', desc: '전역 상태', color: 'react' },
        { icon: '🔮', label: 'Compiler', desc: '자동 최적화', color: 'active' },
        { icon: '🧩', label: 'Composition', desc: '컴포넌트 합성', color: 'green' },
      ]} />

      <CodeComparePanel />

      <div className="m-info-grid">
        <ProsCons
          pros={[
            'memo/useMemo/useCallback 전부 제거 → 극도로 깔끔한 코드',
            '동일한 성능 최적화가 자동 적용',
            '새 팀원이 바로 이해할 수 있는 코드',
            '의존성 배열 관련 버그 완전 제거',
          ]}
          cons={[
            '빌드 도구 설정 필요',
            'Rules of React 위반 시 컴파일러가 해당 컴포넌트 스킵',
            'DevTools로 최적화 적용 여부 확인 필요',
          ]}
        />
        <WhenToUse items={[
          '모든 새 React 프로젝트',
          '기존 프로젝트 리팩토링 시',
          '팀 전체의 코드 품질 일관성 확보',
          '대규모 컴포넌트 트리 최적화',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🏆 memo/useMemo/useCallback 없는 미니 쇼핑 앱 (검색 · 정렬 · 장바구니)</div>
        <CartProvider>
          <ModernDemo store={store} />
        </CartProvider>
      </div>
    </div>
  );
}
