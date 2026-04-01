import { useState } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from './shared';
import { useFetch, useDebounce } from './shared';

function useProductSearch(query) {
  const debounced = useDebounce(query, 500);
  const url = debounced
    ? `https://dummyjson.com/products/search?q=${encodeURIComponent(debounced)}&limit=6`
    : 'https://dummyjson.com/products?limit=6';
  const { data, loading } = useFetch(url);
  return { products: data?.products ?? [], loading, searchTerm: debounced };
}

export default function CustomHooksTab() {
  const [query, setQuery] = useState('');
  const { products, loading, searchTerm } = useProductSearch(query);

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--react">⚛️ React 권장</span>
        <span className="m-badge m-badge--gray">로직 재사용</span>
      </div>
      <p className="m-desc">
        상태 로직을 컴포넌트 외부 함수(<code>use</code>로 시작)로 추출하여 재사용합니다.
        훅을 <strong>조합(Compose)</strong>하여 더 복잡한 훅을 만들 수 있으며,
        컴포넌트는 렌더링만 담당하는 순수한 형태가 됩니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '⌨️', label: 'useDebounce', desc: '입력 지연 처리', color: 'react' },
        { icon: '🌐', label: 'useFetch', desc: 'HTTP 캡슐화', color: 'react' },
        { icon: '🔍', label: 'useProductSearch', desc: '훅 조합', color: 'active' },
        { icon: '🖼️', label: 'Component', desc: '렌더링만', color: 'purple' },
      ]} />

      <div className="m-info-grid">
        <ProsCons
          pros={['로직 재사용성 극대화', '컴포넌트 간결화', 'HOC/Render Props 대체', '독립 테스트 가능']}
          cons={['훅 규칙 준수 필요', '과도한 훅 분리 시 추적 어려움', 'React에만 해당']}
        />
        <WhenToUse items={[
          '여러 컴포넌트에서 같은 로직 재사용',
          'API 호출, 로컬스토리지, 이벤트 리스너 추상화',
          '복잡한 상태 로직을 컴포넌트에서 분리',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🪝 useDebounce → useFetch → useProductSearch 훅 조합 데모</div>
        <input className="m-search-input" placeholder="🔍 상품 검색 (500ms debounce)..."
          value={query} onChange={(e) => setQuery(e.target.value)} />
        {searchTerm && <span className="m-debounce-badge">검색어: "{searchTerm}"</span>}
        {loading ? <DemoLoading /> : (
          <div className="m-product-grid">
            {products.map((p) => (
              <div key={p.id} className="m-product-card">
                <img src={p.thumbnail} alt={p.title} />
                <p className="m-product-name">{p.title}</p>
                <span className="m-product-price">${p.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
