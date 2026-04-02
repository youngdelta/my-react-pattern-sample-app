import { useState, useCallback, useMemo, useTransition, useRef, memo } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading, useFetch } from './shared';

/* ═══════════════════════════════════════════
   React.memo — 렌더링 최적화 데모
═══════════════════════════════════════════ */

// ❌ memo 없이: 부모가 리렌더될 때마다 같이 리렌더
function ProductCardNormal({ product, onAdd }) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  return (
    <div className="m-opt-card">
      <div className="m-opt-render-badge bad">렌더 #{renderCount.current}</div>
      <img src={product.thumbnail} alt={product.title} />
      <p className="m-opt-card-title">{product.title}</p>
      <button className="m-opt-add-btn" onClick={() => onAdd(product.id)}>담기</button>
    </div>
  );
}

// ✅ memo 적용: props가 바뀔 때만 리렌더
const ProductCardMemo = memo(function ProductCardMemo({ product, onAdd }) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  return (
    <div className="m-opt-card">
      <div className="m-opt-render-badge good">렌더 #{renderCount.current}</div>
      <img src={product.thumbnail} alt={product.title} />
      <p className="m-opt-card-title">{product.title}</p>
      <button className="m-opt-add-btn" onClick={() => onAdd(product.id)}>담기</button>
    </div>
  );
});

/* ═══════════════════════════════════════════
   메인 컴포넌트
═══════════════════════════════════════════ */

export default function OptimizationTab() {
  const { data, loading } = useFetch('https://dummyjson.com/products?limit=20');
  const products = data?.products ?? [];

  // 부모 리렌더 트리거용 카운터
  const [counter, setCounter] = useState(0);
  // 검색어
  const [search, setSearch] = useState('');
  // 최적화 on/off
  const [optimized, setOptimized] = useState(false);
  // useTransition 데모
  const [isPending, startTransition] = useTransition();
  const [heavySearch, setHeavySearch] = useState('');

  // ❌ 최적화 없음: 매 렌더마다 새 함수 생성 → memo가 무력화
  const handleAddNormal = (id) => {
    console.log('Added:', id);
  };

  // ✅ useCallback: 안정적 참조 → memo가 정상 동작
  const handleAddOptimized = useCallback((id) => {
    console.log('Added:', id);
  }, []);

  // ❌ 최적화 없음: 매 렌더마다 필터링 재계산
  const filteredNormal = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ useMemo: search나 products가 바뀔 때만 재계산
  const filteredMemo = useMemo(
    () => products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const filtered = optimized ? filteredMemo : filteredNormal;
  const handleAdd = optimized ? handleAddOptimized : handleAddNormal;
  const Card = optimized ? ProductCardMemo : ProductCardNormal;

  // useTransition 핸들러
  const handleHeavySearch = (value) => {
    setSearch(value); // 즉시 반영 (입력 UI)
    startTransition(() => {
      setHeavySearch(value); // 저우선순위 (리스트 필터)
    });
  };

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--react">⚛️ React 권장</span>
        <span className="m-badge m-badge--orange">⚡ 성능 최적화</span>
      </div>
      <p className="m-desc">
        React에서 <strong>가장 선호되는 성능 최적화</strong> 기법 4가지를 실시간으로 비교합니다.<br />
        • <code>React.memo</code> — 같은 props면 리렌더 건너뜀<br />
        • <code>useCallback</code> — 함수 참조 안정화 (memo와 세트)<br />
        • <code>useMemo</code> — 비용 큰 계산 결과 캐싱<br />
        • <code>useTransition</code> — 긴급하지 않은 업데이트를 저우선순위로
      </p>

      <PatternDiagram nodes={[
        { icon: '🧠', label: 'React.memo', desc: 'props 비교 스킵', color: 'react' },
        { icon: '📌', label: 'useCallback', desc: '함수 참조 고정', color: 'react' },
        { icon: '💾', label: 'useMemo', desc: '계산 결과 캐싱', color: 'active' },
        { icon: '⏳', label: 'useTransition', desc: '저우선순위 업데이트', color: 'purple' },
      ]} />

      <div className="m-info-grid">
        <ProsCons
          pros={[
            'React.memo: 불필요한 리렌더 차단으로 FPS 향상',
            'useCallback: 자식에게 안정적 함수 전달',
            'useMemo: 비용 큰 필터/정렬 결과 캐싱',
            'useTransition: 타이핑 반응성 유지하며 무거운 업데이트 처리',
          ]}
          cons={[
            '과도한 memo는 오히려 비교 비용 발생',
            'useCallback 의존성 관리 필요',
            'useMemo도 메모리를 소비함 (트레이드오프)',
            'useTransition: 사용자에게 지연으로 보일 수 있음',
          ]}
        />
        <WhenToUse items={[
          '리스트가 많아 자식 리렌더 비용이 클 때',
          '부모가 자주 리렌더되지만 자식 props는 안 변할 때',
          '검색/필터/정렬 계산이 무거울 때',
          '타이핑 중 입력 반응성이 떨어질 때 (useTransition)',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">
          ⚡ 최적화 ON/OFF 전환 후 카운터를 클릭해서 렌더 횟수를 비교해보세요
        </div>

        <div className="m-opt-controls">
          <div className="m-opt-toggle-group">
            <button
              className={`m-opt-toggle ${!optimized ? 'active bad' : ''}`}
              onClick={() => setOptimized(false)}
            >
              ❌ 최적화 OFF
            </button>
            <button
              className={`m-opt-toggle ${optimized ? 'active good' : ''}`}
              onClick={() => setOptimized(true)}
            >
              ✅ 최적화 ON
            </button>
          </div>

          <div className="m-opt-status">
            {optimized ? (
              <span className="m-opt-status-tag good">
                React.memo + useCallback + useMemo + useTransition
              </span>
            ) : (
              <span className="m-opt-status-tag bad">
                일반 컴포넌트 + 일반 함수 + 매번 재계산
              </span>
            )}
          </div>
        </div>

        <div className="m-opt-toolbar">
          <button className="m-opt-counter-btn" onClick={() => setCounter((c) => c + 1)}>
            🔄 부모 리렌더 (counter: {counter})
          </button>
          <input
            className="m-opt-search"
            placeholder="🔍 상품 검색..."
            value={search}
            onChange={(e) => optimized ? handleHeavySearch(e.target.value) : setSearch(e.target.value)}
          />
          {isPending && optimized && <span className="m-opt-pending">⏳ 전환 중...</span>}
          <span className="m-opt-result-count">{filtered.length}개</span>
        </div>

        {loading ? <DemoLoading /> : (
          <div className="m-opt-comparison">
            <div className="m-opt-info-bar">
              <div className="m-opt-info-item">
                <span className="m-opt-label">React.memo</span>
                <span className={`m-opt-value ${optimized ? 'good' : 'bad'}`}>{optimized ? 'ON — props 비교 후 스킵' : 'OFF — 매번 리렌더'}</span>
              </div>
              <div className="m-opt-info-item">
                <span className="m-opt-label">useCallback</span>
                <span className={`m-opt-value ${optimized ? 'good' : 'bad'}`}>{optimized ? 'ON — 함수 참조 고정' : 'OFF — 매번 새 함수'}</span>
              </div>
              <div className="m-opt-info-item">
                <span className="m-opt-label">useMemo</span>
                <span className={`m-opt-value ${optimized ? 'good' : 'bad'}`}>{optimized ? 'ON — 변경 시에만 필터' : 'OFF — 매번 재계산'}</span>
              </div>
              <div className="m-opt-info-item">
                <span className="m-opt-label">useTransition</span>
                <span className={`m-opt-value ${optimized ? 'good' : 'bad'}`}>{optimized ? 'ON — 입력 즉시, 리스트 지연' : 'OFF — 동기 처리'}</span>
              </div>
            </div>

            <div className="m-opt-card-grid">
              {filtered.slice(0, 8).map((p) => (
                <Card key={p.id} product={p} onAdd={handleAdd} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
