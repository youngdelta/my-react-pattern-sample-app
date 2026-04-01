import { useState, useEffect, useCallback } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from './shared';

const ACTIONS = { FETCH_START: 'FETCH_START', FETCH_SUCCESS: 'FETCH_SUCCESS', SET_FILTER: 'SET_FILTER', SET_VIEW: 'SET_VIEW' };

function fluxReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_START:   return { ...state, loading: true };
    case ACTIONS.FETCH_SUCCESS: return { ...state, loading: false, products: action.payload };
    case ACTIONS.SET_FILTER:    return { ...state, filter: action.payload };
    case ACTIONS.SET_VIEW:      return { ...state, view: action.payload };
    default: return state;
  }
}

export default function FluxTab() {
  const [state, dispatch] = useState(() => ({ loading: true, products: [], filter: 'all', view: 'grid' }));
  const [actionLog, setActionLog] = useState([]);

  const loggedDispatch = useCallback((action) => {
    setActionLog((prev) => [
      `→ { type: "${action.type}"${action.payload !== undefined ? `, payload: "${String(action.payload).slice(0, 20)}"` : ''} }`,
      ...prev,
    ].slice(0, 6));
    dispatch((prev) => fluxReducer(prev, action));
  }, []);

  useEffect(() => {
    loggedDispatch({ type: ACTIONS.FETCH_START });
    fetch('https://dummyjson.com/products?limit=8')
      .then((r) => r.json())
      .then((d) => loggedDispatch({ type: ACTIONS.FETCH_SUCCESS, payload: d.products }));
  }, [loggedDispatch]);

  const categories = ['all', ...new Set((state.products || []).map((p) => p.category))];
  const filtered = state.filter === 'all' ? state.products : state.products.filter((p) => p.category === state.filter);

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--blue">일반 패턴</span>
        <span className="m-badge m-badge--gray">단방향 데이터 흐름</span>
      </div>
      <p className="m-desc">
        모든 상태 변경은 <strong>Action → Dispatcher → Store → View</strong> 단방향으로만 흐릅니다.
        상태를 예측 가능하게 만들며 Redux와 Zustand의 근간이 됩니다.
        React의 <code>useReducer</code>가 Flux Store 역할을 합니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '⚡', label: 'Action', desc: '이벤트 객체', color: 'orange' },
        { icon: '📬', label: 'Dispatcher', desc: 'dispatch() 함수', color: 'blue' },
        { icon: '🗃️', label: 'Store', desc: 'useReducer state', color: 'teal' },
        { icon: '🖼️', label: 'View', desc: '상태 렌더링', color: 'purple' },
      ]} />

      <div className="m-info-grid">
        <ProsCons
          pros={['예측 가능한 상태 변화', '상태 변화 추적 용이', 'Time-travel 디버깅 가능']}
          cons={['보일러플레이트 코드 많음', '간단한 상태엔 과도함', '초기 학습 곡선']}
        />
        <WhenToUse items={[
          '복잡한 전역 상태 관리 (Redux)',
          '상태 변경 이력 추적이 필요할 때',
          'useReducer로 복잡한 로컬 상태 관리',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">⚡ Action → Dispatcher → Store → View 흐름 시각화</div>
        <div className="m-flux-layout">
          <div className="m-flux-main">
            <div className="m-btn-row">
              {categories.slice(0, 4).map((cat) => (
                <button key={cat} className={`m-sort-btn ${state.filter === cat ? 'active' : ''}`}
                  onClick={() => loggedDispatch({ type: ACTIONS.SET_FILTER, payload: cat })}>{cat}</button>
              ))}
              <button className={`m-sort-btn ${state.view === 'grid' ? 'active' : ''}`}
                onClick={() => loggedDispatch({ type: ACTIONS.SET_VIEW, payload: 'grid' })}>▦</button>
              <button className={`m-sort-btn ${state.view === 'list' ? 'active' : ''}`}
                onClick={() => loggedDispatch({ type: ACTIONS.SET_VIEW, payload: 'list' })}>☰</button>
            </div>
            {state.loading ? <DemoLoading /> : (
              <div className={state.view === 'grid' ? 'm-flux-grid' : 'm-flux-list'}>
                {filtered.map((p) => (
                  <div key={p.id} className={state.view === 'grid' ? 'm-product-card' : 'm-flux-list-item'}>
                    <img src={p.thumbnail} alt={p.title} />
                    <div><p className="m-product-name">{p.title}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="m-flux-log">
            <div className="m-log-header">⚡ Action 로그</div>
            {actionLog.map((l, i) => <div key={i} className="m-log-entry">{l}</div>)}
            <div className="m-log-header" style={{ marginTop: '0.5rem' }}>🗃️ Store 상태</div>
            <div className="m-log-entry">view: "{state.view}"</div>
            <div className="m-log-entry">filter: "{state.filter}"</div>
            <div className="m-log-entry">products: {state.products?.length}개</div>
          </div>
        </div>
      </div>
    </div>
  );
}
