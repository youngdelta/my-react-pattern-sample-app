import { useState, useEffect, useCallback, useMemo, useReducer, createContext, useContext, Suspense, lazy, memo } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading, useFetch, useDebounce } from './shared';

/* ═══════════════════════════════════════════
   Modern React 종합 패턴
   - Custom Hooks로 로직 분리
   - Context로 전역 상태 관리
   - React.memo + useCallback으로 렌더 최적화
   - 선언적 데이터 흐름
   - 컴포넌트 합성(Composition)
═══════════════════════════════════════════ */

/* ── 1. 도메인 Custom Hook ── */
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

  const filteredAndSorted = useMemo(() => {
    let result = products;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (sortBy === 'price-asc') return [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, debouncedSearch, sortBy]);

  return { products: filteredAndSorted, loading, sortBy, setSortBy, search, setSearch, total: products.length };
}

/* ── 2. Context로 전역 상태 공유 ── */
const CartCtx = createContext(null);
const useCart = () => useContext(CartCtx);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find((i) => i.id === action.product.id);
      if (existing) {
        return { ...state, items: state.items.map((i) => i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i) };
      }
      return { ...state, items: [...state.items, { ...action.product, qty: 1 }] };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const totalQty = useMemo(() => state.items.reduce((s, i) => s + i.qty, 0), [state.items]);
  const totalPrice = useMemo(() => state.items.reduce((s, i) => s + i.price * i.qty, 0), [state.items]);
  const value = useMemo(() => ({
    items: state.items, totalQty, totalPrice, dispatch,
  }), [state.items, totalQty, totalPrice]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

/* ── 3. memo + useCallback으로 최적화된 Presentational ── */
const ProductItem = memo(function ProductItem({ product, onAdd }) {
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
});

/* ── 4. 합성(Composition) 컴포넌트 ── */
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

/* ── 5. 패턴 사용 현황 시각화 ── */
function PatternUsagePanel() {
  const patterns = [
    { name: 'Custom Hook', code: 'useProductStore()', desc: '검색 + 정렬 + 필터 로직 캡슐화', icon: '🪝' },
    { name: 'useDebounce', code: 'useDebounce(search, 300)', desc: '검색 입력 300ms 지연', icon: '⌨️' },
    { name: 'useMemo', code: 'useMemo(() => filter+sort)', desc: '필터+정렬 결과 캐싱', icon: '💾' },
    { name: 'Context + useReducer', code: 'CartCtx + cartReducer', desc: '장바구니 전역 상태', icon: '🌐' },
    { name: 'React.memo', code: 'memo(ProductItem)', desc: '카드 불필요 리렌더 방지', icon: '🧠' },
    { name: 'useCallback', code: 'useCallback(handleAdd)', desc: '함수 참조 안정화', icon: '📌' },
    { name: 'Composition', code: 'SearchToolbar + MiniCart', desc: '독립 컴포넌트 조합', icon: '🧩' },
  ];
  return (
    <div className="m-mr-usage-panel">
      <div className="m-mr-usage-title">📋 이 데모에 적용된 패턴들</div>
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

/* ── 메인 탭 ── */
export default function ModernReactTab() {
  const store = useProductStore();
  const { dispatch } = { dispatch: null };

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--react">⚛️ React 권장</span>
        <span className="m-badge m-badge--green">🏆 Modern Best Practice</span>
      </div>
      <p className="m-desc">
        현재 React 팀이 가장 권장하는 <strong>종합 개발 방식</strong>입니다.
        Custom Hook으로 로직을 분리하고, Context로 전역 상태를 공유하며,
        <code>React.memo</code> + <code>useCallback</code>으로 렌더를 최적화하고,
        작은 컴포넌트를 <strong>합성(Composition)</strong>하여 화면을 구성합니다.
        아래 데모는 이 모든 패턴을 하나의 미니 쇼핑 앱으로 조합한 예제입니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '🪝', label: 'Custom Hook', desc: '로직 캡슐화', color: 'react' },
        { icon: '🌐', label: 'Context', desc: '전역 상태', color: 'react' },
        { icon: '🧠', label: 'memo + cb', desc: '렌더 최적화', color: 'active' },
        { icon: '🧩', label: 'Composition', desc: '컴포넌트 합성', color: 'green' },
      ]} />

      <div className="m-info-grid">
        <ProsCons
          pros={[
            '관심사 분리가 깔끔 (로직 ↔ UI ↔ 상태)',
            '각 부분을 독립적으로 테스트 가능',
            '필요한 곳만 리렌더 → 성능 최적화',
            '새 기능 추가 시 기존 코드 수정 최소화',
          ]}
          cons={[
            '초기 설계에 시간 필요',
            '작은 프로젝트엔 과도할 수 있음',
            'Context가 많아지면 Provider Hell 가능성',
          ]}
        />
        <WhenToUse items={[
          '실무 프로덕션 React 프로젝트',
          '팀 단위 협업 개발',
          '장기 유지보수가 필요한 프로젝트',
          '규모가 커질 가능성이 있는 프로젝트',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🏆 7가지 패턴이 결합된 미니 쇼핑 앱 (검색 · 정렬 · 장바구니)</div>
        <CartProvider>
          <ModernReactDemo store={store} />
        </CartProvider>
      </div>
    </div>
  );
}

function ModernReactDemo({ store }) {
  const { dispatch } = useCart();
  const handleAdd = useCallback((product) => {
    dispatch({ type: 'ADD', product });
  }, [dispatch]);

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
