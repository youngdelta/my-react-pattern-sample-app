import { useState, useEffect, useRef } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from '@/pages/methods/shared';

/*
 * ✅ React Compiler 자동 메모이제이션 증명
 * React.memo 없이도 컴파일러가 props 변경 감지로 리렌더 최적화
 */

// ✅ memo() 없는 일반 컴포넌트 — 컴파일러가 자동 최적화
function AutoMemoCard({ product, onToggle, isFavorite }) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  return (
    <div className={`m2-am-card ${isFavorite ? 'm2-am-card--fav' : ''}`}>
      <div className={`m2-am-badge ${renderCount.current <= 2 ? 'good' : 'warn'}`}>
        렌더 #{renderCount.current}
      </div>
      <img src={product.thumbnail} alt={product.title} />
      <div className="m2-am-card-body">
        <p className="m2-am-card-title">{product.title}</p>
        <div className="m2-am-card-meta">
          <span className="m2-am-price">${product.price}</span>
          <span className="m2-am-rating">⭐ {product.rating}</span>
        </div>
        <button
          className={`m2-am-fav-btn ${isFavorite ? 'active' : ''}`}
          onClick={() => onToggle(product.id)}
        >
          {isFavorite ? '❤️ 즐겨찾기' : '🤍 즐겨찾기'}
        </button>
      </div>
    </div>
  );
}

// ✅ 부모에서 사용하는 헤더 컴포넌트 (memo 없음)
function StatsHeader({ total, favoriteCount, parentRenderCount }) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  return (
    <div className="m2-am-stats">
      <div className="m2-am-stat-box">
        <span className="m2-am-stat-label">상품 수</span>
        <span className="m2-am-stat-value">{total}</span>
      </div>
      <div className="m2-am-stat-box">
        <span className="m2-am-stat-label">즐겨찾기</span>
        <span className="m2-am-stat-value m2-am-stat-fav">{favoriteCount}</span>
      </div>
      <div className="m2-am-stat-box">
        <span className="m2-am-stat-label">부모 렌더</span>
        <span className="m2-am-stat-value">{parentRenderCount}회</span>
      </div>
      <div className="m2-am-stat-box">
        <span className="m2-am-stat-label">Header 렌더</span>
        <span className={`m2-am-stat-value ${renderCount.current <= 2 ? 'm2-green' : 'm2-orange'}`}>
          {renderCount.current}회
        </span>
      </div>
    </div>
  );
}

export default function RC_AutoMemoTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [unrelatedState, setUnrelatedState] = useState(0);
  const parentRender = useRef(0);
  parentRender.current += 1;

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=8')
      .then((r) => r.json())
      .then((d) => { setProducts(d.products); setLoading(false); });
  }, []);

  // ✅ plain function — 컴파일러가 자동 안정화
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--react">⚛️ React Compiler</span>
        <span className="m-badge m-badge--green">🧠 자동 메모이제이션</span>
      </div>
      <p className="m-desc">
        <code>React.memo</code>와 <code>useCallback</code> <strong>없이</strong> 작성된 컴포넌트입니다.
        "관계없는 상태 변경" 버튼을 눌러도 자식 컴포넌트의 렌더 횟수가 증가하지 않으면
        React Compiler가 <strong>자동 메모이제이션을 적용</strong>한 것입니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '📝', label: '소스 코드', desc: 'memo/useCallback 없음', color: 'blue' },
        { icon: '🔮', label: 'React Compiler', desc: '빌드 시 분석 & 변환', color: 'react' },
        { icon: '⚡', label: '최적화 코드', desc: '자동 메모이제이션 삽입', color: 'green' },
        { icon: '✨', label: '런타임', desc: '불필요 리렌더 자동 스킵', color: 'active' },
      ]} />

      <div className="m2-compiler-note">
        <div className="m2-compiler-note-title">🔮 이 데모에서 컴파일러가 자동 적용하는 것</div>
        <div className="m2-compiler-note-grid">
          <div className="m2-cn-item">
            <code className="m2-cn-after">{'function AutoMemoCard({ product, onToggle })'}</code>
            <small>→ props 변경 시에만 리렌더 (React.memo 효과)</small>
          </div>
          <div className="m2-cn-item">
            <code className="m2-cn-after">{'const toggleFavorite = (id) => { ... }'}</code>
            <small>→ 참조 안정화 (useCallback 효과)</small>
          </div>
          <div className="m2-cn-item">
            <code className="m2-cn-after">{'function StatsHeader({ total, favoriteCount })'}</code>
            <small>→ props 변경 시에만 리렌더 (React.memo 효과)</small>
          </div>
        </div>
      </div>

      <div className="m-info-grid">
        <ProsCons
          pros={[
            '코드에 최적화 API가 전혀 없어도 최적화됨',
            '모든 컴포넌트가 기본적으로 메모이제이션됨',
            '개발자의 수동 메모이제이션보다 정확할 수 있음',
            'DevTools에서 Memo ✨ 배지로 확인 가능',
          ]}
          cons={[
            'ref.current를 렌더링 중 읽으면 컴파일러가 스킵할 수 있음',
            'Rules of React 위반 시 최적화가 적용되지 않음',
          ]}
        />
        <WhenToUse items={[
          '리스트 컴포넌트에서 자식 불필요 리렌더 방지',
          '부모 리렌더가 빈번한 화면',
          '콜백 함수를 자식에게 전달하는 패턴',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🧠 자동 메모이제이션 증명 — 관계없는 상태 변경 시 렌더 카운트 확인</div>

        <StatsHeader
          total={products.length}
          favoriteCount={favorites.length}
          parentRenderCount={parentRender.current}
        />

        <div className="m2-am-controls">
          <button className="m2-am-trigger" onClick={() => setUnrelatedState((c) => c + 1)}>
            🔄 관계없는 상태 변경 (count: {unrelatedState})
          </button>
          <p className="m2-am-hint">
            ☝️ 이 버튼은 상품/즐겨찾기와 무관한 상태를 변경합니다.
            카드의 렌더 횟수가 증가하지 않으면 자동 메모이제이션이 작동 중입니다.
          </p>
        </div>

        {loading ? <DemoLoading /> : (
          <div className="m2-am-grid">
            {products.map((p) => (
              <AutoMemoCard
                key={p.id}
                product={p}
                onToggle={toggleFavorite}
                isFavorite={favorites.includes(p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
