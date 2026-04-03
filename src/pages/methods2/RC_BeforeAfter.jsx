import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from '@/pages/methods/shared';

/*
 * ✅ Before vs After 비교 탭
 * 수동 메모이제이션 코드와 React Compiler 코드를 나란히 비교
 */

/* ── Before: 수동 메모이제이션 (기존 방식) ── */
const ManualCard = memo(function ManualCard({ product, onAdd }) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  return (
    <div className="m2-ba-card">
      <div className="m2-ba-render-badge manual">렌더 #{renderCount.current}</div>
      <img src={product.thumbnail} alt={product.title} />
      <p className="m2-ba-card-title">{product.title}</p>
      <button className="m2-ba-add-btn" onClick={() => onAdd(product.id)}>담기</button>
    </div>
  );
});

/* ── After: React Compiler (자동 최적화) ── */
function CompilerCard({ product, onAdd }) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  return (
    <div className="m2-ba-card">
      <div className="m2-ba-render-badge compiler">렌더 #{renderCount.current}</div>
      <img src={product.thumbnail} alt={product.title} />
      <p className="m2-ba-card-title">{product.title}</p>
      <button className="m2-ba-add-btn" onClick={() => onAdd(product.id)}>담기</button>
    </div>
  );
}

export default function RC_BeforeAfterTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counter, setCounter] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=8')
      .then((r) => r.json())
      .then((d) => { setProducts(d.products); setLoading(false); });
  }, []);

  /* ── Before: 수동 최적화 ── */
  const handleAddManual = useCallback((id) => {
    console.log('Manual add:', id);
  }, []);

  const filteredManual = useMemo(
    () => products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  /* ── After: React Compiler (plain code) ── */
  const handleAddCompiler = (id) => {
    console.log('Compiler add:', id);
  };

  const filteredCompiler = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--react">⚛️ React Compiler</span>
        <span className="m-badge m-badge--green">📊 Before vs After</span>
      </div>
      <p className="m-desc">
        <strong>수동 메모이제이션</strong>(memo + useMemo + useCallback)과
        <strong> React Compiler</strong>(plain code)를 나란히 비교합니다.
        "부모 리렌더" 버튼을 눌러 렌더 횟수를 확인하세요.
        두 방식 모두 <strong>동일한 최적화 효과</strong>를 보여줍니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '🔧', label: 'Before', desc: 'memo + useMemo + useCallback', color: 'orange' },
        { icon: '🔮', label: 'Compiler', desc: '빌드 시 자동 변환', color: 'react' },
        { icon: '✨', label: 'Result', desc: '동일한 최적화 효과', color: 'green' },
      ]} />

      {/* 코드 비교 패널 */}
      <div className="m2-ba-code-compare">
        <div className="m2-ba-code-panel before">
          <div className="m2-ba-code-header">❌ Before (수동 메모이제이션)</div>
          <pre className="m2-ba-code">{`import { memo, useMemo, useCallback } from 'react';

// 컴포넌트: memo로 감싸야 함
const ProductCard = memo(({ product, onAdd }) => {
  return <div>...</div>;
});

// 함수: useCallback으로 감싸야 함
const handleAdd = useCallback((id) => {
  console.log('add:', id);
}, []);

// 계산: useMemo로 감싸야 함
const filtered = useMemo(
  () => products.filter(p => p.title.includes(q)),
  [products, q]
);`}</pre>
          <div className="m2-ba-code-stats">
            <span>📏 코드 라인: <strong>16줄</strong></span>
            <span>📦 import: <strong>3개</strong> (memo, useMemo, useCallback)</span>
            <span>🧠 인지 부담: <strong>높음</strong></span>
          </div>
        </div>

        <div className="m2-ba-code-panel after">
          <div className="m2-ba-code-header">✅ After (React Compiler)</div>
          <pre className="m2-ba-code">{`// 컴포넌트: 그냥 함수
function ProductCard({ product, onAdd }) {
  return <div>...</div>;
}

// 함수: 그냥 함수
const handleAdd = (id) => {
  console.log('add:', id);
};

// 계산: 그냥 계산
const filtered = products.filter(
  p => p.title.includes(q)
);`}</pre>
          <div className="m2-ba-code-stats">
            <span>📏 코드 라인: <strong>12줄</strong></span>
            <span>📦 import: <strong>0개</strong></span>
            <span>🧠 인지 부담: <strong>낮음</strong></span>
          </div>
        </div>
      </div>

      <div className="m-info-grid">
        <ProsCons
          pros={['코드 25%+ 감소', '의존성 배열 실수 제거', '새 팀원도 바로 이해', '컴파일러가 개발자보다 정확하게 최적화']}
          cons={['빌드 시간 약간 증가', 'DevTools에 Memo ✨ 표시 확인 필요', '팀 전원 Rules of React 준수 필요']}
        />
        <WhenToUse items={[
          '모든 새 React 프로젝트 (React 17+)',
          '기존 프로젝트에서 수동 메모이제이션이 복잡한 경우',
          '팀 간 최적화 수준 차이를 없애고 싶을 때',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">📊 실시간 렌더링 비교 — 부모 리렌더 시 자식 렌더 횟수</div>
        <div className="m2-ba-controls">
          <button className="m2-ba-trigger-btn" onClick={() => setCounter((c) => c + 1)}>
            🔄 부모 리렌더 (counter: {counter})
          </button>
          <input
            className="m2-ba-search"
            placeholder="🔍 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? <DemoLoading /> : (
          <div className="m2-ba-side-by-side">
            <div className="m2-ba-side">
              <div className="m2-ba-side-header before">❌ Before (memo + useCallback + useMemo)</div>
              <div className="m2-ba-card-grid">
                {filteredManual.slice(0, 4).map((p) => (
                  <ManualCard key={p.id} product={p} onAdd={handleAddManual} />
                ))}
              </div>
            </div>
            <div className="m2-ba-divider">VS</div>
            <div className="m2-ba-side">
              <div className="m2-ba-side-header after">✅ After (React Compiler)</div>
              <div className="m2-ba-card-grid">
                {filteredCompiler.slice(0, 4).map((p) => (
                  <CompilerCard key={p.id} product={p} onAdd={handleAddCompiler} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
