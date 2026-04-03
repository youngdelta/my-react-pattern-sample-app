import { useState, useEffect, useReducer } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from '@/pages/methods/shared';

/*
 * ✅ React Compiler 적용 Flux 패턴
 *
 * Before: const loggedDispatch = useCallback((action) => { ... }, []);
 * After:  const loggedDispatch = (action) => { ... };
 *         ← 컴파일러가 함수 참조를 자동 안정화
 */

const ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  SET_CATEGORY: 'SET_CATEGORY',
  SET_SORT: 'SET_SORT',
  TOGGLE_FAVORITE: 'TOGGLE_FAVORITE',
};

function storeReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      return { ...state, loading: true };
    case ACTIONS.FETCH_SUCCESS:
      return { ...state, loading: false, products: action.payload };
    case ACTIONS.SET_CATEGORY:
      return { ...state, category: action.payload };
    case ACTIONS.SET_SORT:
      return { ...state, sort: action.payload };
    case ACTIONS.TOGGLE_FAVORITE: {
      const favs = state.favorites.includes(action.payload)
        ? state.favorites.filter((id) => id !== action.payload)
        : [...state.favorites, action.payload];
      return { ...state, favorites: favs };
    }
    default:
      return state;
  }
}

const initialState = {
  loading: true,
  products: [],
  category: 'all',
  sort: 'default',
  favorites: [],
};

export default function RC_FluxTab() {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  const [actionLog, setActionLog] = useState([]);

  // ✅ React Compiler: useCallback 없이 plain function
  // 컴파일러가 dispatch, setActionLog 참조가 안정적임을 감지하여 자동 최적화
  const loggedDispatch = (action) => {
    const entry = `→ ${action.type}${action.payload !== undefined ? ` : "${String(action.payload).slice(0, 15)}"` : ''}`;
    setActionLog((prev) => [entry, ...prev].slice(0, 8));
    dispatch(action);
  };

  useEffect(() => {
    loggedDispatch({ type: ACTIONS.FETCH_START });
    fetch('https://dummyjson.com/products?limit=8')
      .then((r) => r.json())
      .then((d) => loggedDispatch({ type: ACTIONS.FETCH_SUCCESS, payload: d.products }));
  }, []);

  // ✅ 파생 상태 — useMemo 없이 직접 계산
  const categories = ['all', ...new Set(state.products.map((p) => p.category))];

  const filtered = state.products
    .filter((p) => state.category === 'all' || p.category === state.category)
    .sort((a, b) => {
      if (state.sort === 'price-asc') return a.price - b.price;
      if (state.sort === 'price-desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--blue">일반 패턴</span>
        <span className="m-badge m2-badge--compiler">🔮 React Compiler</span>
      </div>
      <p className="m-desc">
        Flux의 <strong>Action → Dispatcher → Store → View</strong> 단방향 흐름을
        React Compiler 스타일로 작성합니다. <code>useCallback</code>으로 감싸지 않아도
        컴파일러가 <code>loggedDispatch</code> 참조를 자동 안정화합니다.
        <code>useReducer</code>와의 조합도 깔끔합니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '⚡', label: 'Action', desc: '이벤트 객체', color: 'orange' },
        { icon: '📬', label: 'Dispatcher', desc: '자동 안정화 함수', color: 'blue' },
        { icon: '🗃️', label: 'Store', desc: 'useReducer state', color: 'teal' },
        { icon: '🖼️', label: 'View', desc: '자동 최적화 렌더', color: 'purple' },
      ]} />

      <div className="m2-compiler-note">
        <div className="m2-compiler-note-title">🔮 React Compiler가 하는 일</div>
        <div className="m2-compiler-note-grid">
          <div className="m2-cn-item">
            <code className="m2-cn-before">{'useCallback((action) => { dispatch(action) }, [])'}</code>
            <span className="m2-cn-arrow">→</span>
            <code className="m2-cn-after">{'(action) => { dispatch(action) }'}</code>
            <small>dispatch 래퍼 자동 안정화</small>
          </div>
          <div className="m2-cn-item">
            <code className="m2-cn-before">{'useMemo(() => products.filter(...).sort(...), [deps])'}</code>
            <span className="m2-cn-arrow">→</span>
            <code className="m2-cn-after">{'products.filter(...).sort(...)'}</code>
            <small>필터+정렬 자동 캐싱</small>
          </div>
        </div>
      </div>

      <div className="m-info-grid">
        <ProsCons
          pros={['useCallback 제거 → 단순한 dispatch 래퍼', '파생 상태 계산 코드 간소화', 'useReducer와의 자연스러운 조합', 'Action 로그 등 부가 로직도 깔끔']}
          cons={['복잡한 비동기 액션은 미들웨어 패턴 필요', '초기 설계에 시간 투자 필요']}
        />
        <WhenToUse items={[
          '복잡한 상태 관리 (다수 Action type)',
          'useReducer + dispatch 패턴 사용 시',
          '상태 변경 추적/로깅이 필요한 경우',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">⚡ Action → Store → View (useCallback 없이 자동 안정화)</div>
        <div className="m-flux-layout">
          <div className="m-flux-main">
            <div className="m-btn-row">
              {categories.slice(0, 4).map((cat) => (
                <button key={cat} className={`m-sort-btn ${state.category === cat ? 'active' : ''}`}
                  onClick={() => loggedDispatch({ type: ACTIONS.SET_CATEGORY, payload: cat })}>{cat}</button>
              ))}
              <span className="m2-sep">|</span>
              {[['default', '기본'], ['price-asc', '가격↑'], ['price-desc', '가격↓']].map(([v, l]) => (
                <button key={v} className={`m-sort-btn ${state.sort === v ? 'active' : ''}`}
                  onClick={() => loggedDispatch({ type: ACTIONS.SET_SORT, payload: v })}>{l}</button>
              ))}
            </div>
            {state.loading ? <DemoLoading /> : (
              <div className="m-product-grid">
                {filtered.map((p) => (
                  <div key={p.id} className="m-product-card" style={{ position: 'relative' }}>
                    <img src={p.thumbnail} alt={p.title} />
                    <p className="m-product-name">{p.title}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.4rem 0.3rem' }}>
                      <span className="m-product-price">${p.price}</span>
                      <button
                        className={`m2-fav-btn ${state.favorites.includes(p.id) ? 'active' : ''}`}
                        onClick={() => loggedDispatch({ type: ACTIONS.TOGGLE_FAVORITE, payload: p.id })}
                      >
                        {state.favorites.includes(p.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="m-flux-log">
            <div className="m-log-header">⚡ Action 로그</div>
            {actionLog.map((l, i) => <div key={i} className="m-log-entry">{l}</div>)}
            <div className="m-log-header" style={{ marginTop: '0.5rem' }}>🗃️ Store 상태</div>
            <div className="m-log-entry">category: "{state.category}"</div>
            <div className="m-log-entry">sort: "{state.sort}"</div>
            <div className="m-log-entry">favorites: [{state.favorites.join(', ')}]</div>
            <div className="m-log-entry">products: {filtered.length}/{state.products.length}개</div>
          </div>
        </div>
      </div>
    </div>
  );
}
