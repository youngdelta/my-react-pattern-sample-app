import { useState, useEffect, useRef } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from './shared';

function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) return (
      <div className="m-hoc-skeleton">
        <div className="m-skeleton-img" />
        <div className="m-skeleton-line" />
        <div className="m-skeleton-line short" />
      </div>
    );
    return <WrappedComponent {...props} />;
  };
}

function withLogger(WrappedComponent) {
  return function WithLoggerComponent(props) {
    const count = useRef(0);
    count.current += 1;
    return (
      <div className="m-hoc-logger-wrap">
        <div className="m-hoc-logger-badge">render #{count.current}</div>
        <WrappedComponent {...props} />
      </div>
    );
  };
}

function ProductCard({ product }) {
  return (
    <div className="m-product-card">
      <img src={product.thumbnail} alt={product.title} />
      <p className="m-product-name">{product.title}</p>
      <span className="m-product-price">${product.price}</span>
    </div>
  );
}

const ProductCardWithLoading = withLoading(ProductCard);
const ProductCardWithLogger  = withLogger(ProductCard);

export default function HOCTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('loading');

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=4')
      .then((r) => r.json())
      .then((d) => { setProducts(d.products); setLoading(false); });
  }, []);

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--orange">React 패턴</span>
        <span className="m-badge m-badge--gray">고차 컴포넌트</span>
      </div>
      <p className="m-desc">
        컴포넌트를 인자로 받아 <strong>기능이 강화된 새 컴포넌트를 반환</strong>하는 함수입니다.
        로딩 처리(<code>withLoading</code>), 렌더 추적(<code>withLogger</code>), 인증(<code>withAuth</code>) 등
        횡단 관심사를 원본 컴포넌트 수정 없이 분리합니다. Custom Hooks 등장 이전의 핵심 패턴입니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '📦', label: 'Component', desc: '원본 컴포넌트', color: 'blue' },
        { icon: '🔧', label: 'withXxx()', desc: 'HOC 래핑', color: 'orange' },
        { icon: '✨', label: 'Enhanced', desc: '기능 추가', color: 'active' },
        { icon: '🖼️', label: 'Render', desc: '조건부 렌더링', color: 'purple' },
      ]} />

      <div className="m-info-grid">
        <ProsCons
          pros={['원본 컴포넌트 수정 없이 기능 추가', '횡단 관심사 분리 (로딩, 인증, 로깅)', '다중 HOC 조합 가능']}
          cons={['props 충돌 위험', 'Wrapper Hell', 'Custom Hooks로 대부분 대체 가능']}
        />
        <WhenToUse items={[
          '클래스 컴포넌트 기반 레거시 코드',
          'Redux connect(), React Router withRouter()',
          'Custom Hooks 사용 불가 시 (클래스 컴포넌트)',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🔧 HOC 전환: withLoading (스켈레톤) ↔ withLogger (렌더 카운트)</div>
        <div className="m-hoc-toggle-bar">
          <button className={`m-hoc-btn ${mode === 'loading' ? 'active' : ''}`} onClick={() => setMode('loading')}>🔄 withLoading</button>
          <button className={`m-hoc-btn ${mode === 'logger' ? 'active' : ''}`} onClick={() => setMode('logger')}>🔍 withLogger</button>
        </div>
        <div className="m-product-grid">
          {mode === 'logger'
            ? products.map((p) => <ProductCardWithLogger key={p.id} product={p} />)
            : loading
              ? [1, 2, 3, 4].map((i) => <ProductCardWithLoading key={i} isLoading={true} product={null} />)
              : products.map((p) => <ProductCardWithLoading key={p.id} isLoading={false} product={p} />)
          }
        </div>
      </div>
    </div>
  );
}
