import { useState, useEffect } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from '../methods/shared';

/*
 * ✅ React Compiler 적용 MVC 패턴
 *
 * Before (수동 최적화):
 *   const sorted = useMemo(() => [...products].sort(...), [products, sortBy]);
 *
 * After (React Compiler):
 *   const sorted = [...products].sort(...);  ← 컴파일러가 자동 메모이제이션
 */

function ProductCard({ product }) {
  return (
    <div className="m-product-card">
      <img src={product.thumbnail} alt={product.title} />
      <p className="m-product-name">{product.title}</p>
      <span className="m-product-price">${product.price}</span>
      <span className="m2-rating">⭐ {product.rating}</span>
    </div>
  );
}

export default function RC_MVCTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [activeLayer, setActiveLayer] = useState(null);

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=8')
      .then((r) => r.json())
      .then((d) => { setProducts(d.products); setLoading(false); });
  }, []);

  // ✅ React Compiler: useMemo 없이 그냥 계산
  // 컴파일러가 sortBy, products가 변경될 때만 재계산하도록 자동 최적화
  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const handleSort = (type) => {
    setActiveLayer('controller');
    setSortBy(type);
    setTimeout(() => {
      setActiveLayer('model');
      setTimeout(() => { setActiveLayer('view'); setTimeout(() => setActiveLayer(null), 600); }, 500);
    }, 400);
  };

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--blue">일반 패턴</span>
        <span className="m-badge m2-badge--compiler">🔮 React Compiler</span>
      </div>
      <p className="m-desc">
        MVC 패턴을 <strong>React Compiler</strong>로 작성합니다.
        정렬 로직에 <code>useMemo</code>를 사용하지 않아도
        컴파일러가 <strong>자동으로 메모이제이션</strong>합니다.
        <code>ProductCard</code>에 <code>React.memo</code>를 감싸지 않아도
        컴파일러가 props 변경 시에만 리렌더하도록 최적화합니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '👆', label: 'Controller', desc: '사용자 입력 처리', color: activeLayer === 'controller' ? 'active' : 'blue' },
        { icon: '📦', label: 'Model', desc: '데이터 & 정렬 로직', color: activeLayer === 'model' ? 'active' : 'green' },
        { icon: '🖼️', label: 'View', desc: '자동 최적화 렌더링', color: activeLayer === 'view' ? 'active' : 'purple' },
      ]} />

      <div className="m2-compiler-note">
        <div className="m2-compiler-note-title">🔮 React Compiler가 하는 일</div>
        <div className="m2-compiler-note-grid">
          <div className="m2-cn-item">
            <code className="m2-cn-before">{'useMemo(() => sort(products), [products, sortBy])'}</code>
            <span className="m2-cn-arrow">→</span>
            <code className="m2-cn-after">{'[...products].sort(...)'}</code>
            <small>정렬 결과 자동 캐싱</small>
          </div>
          <div className="m2-cn-item">
            <code className="m2-cn-before">{'memo(ProductCard)'}</code>
            <span className="m2-cn-arrow">→</span>
            <code className="m2-cn-after">{'function ProductCard()'}</code>
            <small>컴포넌트 자동 메모이제이션</small>
          </div>
        </div>
      </div>

      <div className="m-info-grid">
        <ProsCons
          pros={['useMemo/useCallback 제거 → 깔끔한 코드', 'React.memo 불필요 → 단순한 컴포넌트', '의존성 배열 실수 가능성 제거', '컴파일러가 최적 메모이제이션 자동 적용']}
          cons={['빌드 도구 설정 필요 (Babel 플러그인)', 'Rules of React를 엄격히 준수해야 함', '컴파일러 미지원 패턴은 수동 최적화 필요']}
        />
        <WhenToUse items={[
          'React 19+ 프로젝트 (17/18도 지원)',
          '수동 메모이제이션 복잡도가 높은 프로젝트',
          '팀원 간 최적화 수준 차이를 줄이고 싶을 때',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🔮 Controller → Model → View (useMemo/memo 없이 자동 최적화)</div>
        <div className="m-btn-row">
          {[['default', '기본'], ['price-asc', '가격↑'], ['price-desc', '가격↓'], ['rating', '⭐평점']].map(([val, label]) => (
            <button key={val} className={`m-sort-btn ${sortBy === val ? 'active' : ''}`} onClick={() => handleSort(val)}>{label}</button>
          ))}
        </div>
        {loading ? <DemoLoading /> : (
          <div className="m-product-grid">
            {sorted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
