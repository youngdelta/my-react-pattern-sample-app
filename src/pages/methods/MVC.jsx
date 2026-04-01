import { useState, useEffect } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from './shared';

export default function MVCTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [activeLayer, setActiveLayer] = useState(null);

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=6')
      .then((r) => r.json())
      .then((d) => { setProducts(d.products); setLoading(false); });
  }, []);

  const handleSort = (type) => {
    setActiveLayer('controller');
    setSortBy(type);
    setTimeout(() => {
      setActiveLayer('model');
      setTimeout(() => { setActiveLayer('view'); setTimeout(() => setActiveLayer(null), 600); }, 500);
    }, 400);
  };

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--blue">일반 패턴</span>
        <span className="m-badge m-badge--gray">Model · View · Controller</span>
      </div>
      <p className="m-desc">
        화면 로직(Controller)과 데이터(Model), 렌더링(View)을 분리합니다.
        Controller가 사용자 입력을 받아 Model을 갱신하고, View는 Model 상태를 반영합니다.
        서버 사이드 프레임워크(Spring, Rails, Django)의 표준 패턴입니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '👆', label: 'Controller', desc: '사용자 입력 처리', color: activeLayer === 'controller' ? 'active' : 'blue' },
        { icon: '📦', label: 'Model', desc: '데이터 & 비즈니스 로직', color: activeLayer === 'model' ? 'active' : 'green' },
        { icon: '🖼️', label: 'View', desc: '화면 렌더링', color: activeLayer === 'view' ? 'active' : 'purple' },
      ]} />

      <div className="m-info-grid">
        <ProsCons
          pros={['관심사 분리가 명확', '서버 사이드에서 검증됨', '팀원 간 역할 분담 용이']}
          cons={['View와 Model이 직접 연결될 수 있음', 'Controller가 비대해지기 쉬움', '테스트 복잡도 증가 가능']}
        />
        <WhenToUse items={[
          '서버 렌더링 웹 애플리케이션',
          '전통적 CRUD 기반 서비스',
          'Spring / Rails / Django 프레임워크 사용 시',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🔴 Controller: 정렬 버튼 클릭 시 Model → View 흐름 시각화</div>
        <div className="m-btn-row">
          {[['default', '기본'], ['price-asc', '가격 낮은순'], ['price-desc', '가격 높은순'], ['rating', '평점순']].map(([val, label]) => (
            <button key={val} className={`m-sort-btn ${sortBy === val ? 'active' : ''}`} onClick={() => handleSort(val)}>{label}</button>
          ))}
        </div>
        {loading ? <DemoLoading /> : (
          <div className="m-product-grid">
            {sorted.map((p) => (
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
