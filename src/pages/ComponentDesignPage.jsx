import { useState, useEffect,  createContext, useContext, useMemo } from 'react';
import useCartStore from '../store/cartStore';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from './methods/shared';
import './ComponentDesignPage.css';

/* ═══════════════════════════════════════════
   Context — 상태 관리 책임 분리
   블로그 핵심: "컴포넌트가 많아지면 Context로 상태 관리 책임을 분리"
═══════════════════════════════════════════ */
const ProductContext = createContext(null);

function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=30')
      .then((r) => r.json())
      .then((d) => { setProducts(d.products); setLoading(false); });
  }, []);

  // 파생 상태: filteredProducts는 state가 아니라 계산값
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchText = p.title.toLowerCase().includes(filterText.toLowerCase());
      const matchStock = inStockOnly ? p.stock > 0 : true;
      return matchText && matchStock;
    });
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, filterText, inStockOnly, sortBy]);

  // 카테고리별 그룹핑 (파생 상태)
  const groupedProducts = useMemo(() => {
    const groups = {};
    filteredProducts.forEach((p) => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [filteredProducts]);

  const value = useMemo(() => ({
    products, loading, filterText, setFilterText,
    inStockOnly, setInStockOnly, sortBy, setSortBy,
    filteredProducts, groupedProducts,
  }), [products, loading, filterText, inStockOnly, sortBy, filteredProducts, groupedProducts]);

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

function useProductContext() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProductContext must be used within ProductProvider');
  return ctx;
}

/* ═══════════════════════════════════════════
   SRP 컴포넌트들 — 각각 단일 책임
═══════════════════════════════════════════ */

// 🔍 SearchBar — 사용자 입력만 담당
function SearchBar() {
  const { filterText, setFilterText, inStockOnly, setInStockOnly, sortBy, setSortBy } = useProductContext();

  return (
    <div className="cd-search-bar">
      <div className="cd-search-row">
        <input
          type="text"
          className="cd-search-input"
          placeholder="상품 검색..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <select className="cd-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="default">기본 정렬</option>
          <option value="price-asc">가격 낮은순</option>
          <option value="price-desc">가격 높은순</option>
          <option value="rating">평점순</option>
        </select>
      </div>
      <label className="cd-stock-filter">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
        />
        재고 있는 상품만 보기
      </label>
    </div>
  );
}

// 📂 ProductCategoryRow — 카테고리 헤더만 표시
function ProductCategoryRow({ category, count }) {
  return (
    <div className="cd-category-row">
      <span className="cd-category-name">{category}</span>
      <span className="cd-category-count">{count}개</span>
    </div>
  );
}

// 📦 ProductRow — 개별 상품 행 표시 + 장바구니 추가
function ProductRow({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const [added, setAdded] = useState(false);

  const inCart = cartItems.some((i) => i.id === product.id);
  const discounted = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className={`cd-product-row ${product.stock <= 0 ? 'out-of-stock' : ''}`}>
      <img src={product.thumbnail} alt={product.title} className="cd-product-thumb" />
      <div className="cd-product-info">
        <span className="cd-product-name">{product.title}</span>
        <span className="cd-product-rating">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))} {product.rating.toFixed(1)}</span>
      </div>
      <div className="cd-product-price-col">
        <span className="cd-product-price">${discounted}</span>
        {product.discountPercentage > 0 && (
          <span className="cd-product-original">${product.price.toFixed(2)}</span>
        )}
      </div>
      <span className={`cd-stock-badge ${product.stock > 0 ? 'in-stock' : 'no-stock'}`}>
        {product.stock > 0 ? `재고 ${product.stock}` : '품절'}
      </span>
      <button
        className={`cd-cart-btn ${added || inCart ? 'added' : ''}`}
        onClick={handleAdd}
        disabled={product.stock <= 0}
      >
        {added ? '✓' : inCart ? '🛒 담김' : '🛒 담기'}
      </button>
    </div>
  );
}

// 📊 ProductTable — 카테고리별 상품 목록 렌더링
function ProductTable() {
  const { groupedProducts, filteredProducts } = useProductContext();
  const categories = Object.keys(groupedProducts);

  if (filteredProducts.length === 0) {
    return <div className="cd-empty">검색 결과가 없습니다.</div>;
  }

  return (
    <div className="cd-product-table">
      <div className="cd-table-header">
        <span>상품</span>
        <span>가격</span>
        <span>재고</span>
        <span>장바구니</span>
      </div>
      {categories.map((category) => (
        <div key={category}>
          <ProductCategoryRow category={category} count={groupedProducts[category].length} />
          {groupedProducts[category].map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>
      ))}
    </div>
  );
}

// 🛒 CartSummary — 현재 장바구니 상태 표시
function CartSummary() {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => {
    return sum + i.price * (1 - (i.discountPercentage || 0) / 100) * i.quantity;
  }, 0);

  return (
    <div className="cd-cart-summary">
      <div className="cd-cart-summary-title">🛒 장바구니 요약</div>
      {items.length === 0 ? (
        <p className="cd-cart-empty-text">장바구니가 비어 있습니다</p>
      ) : (
        <>
          <div className="cd-cart-stat">
            <span>상품 종류</span><strong>{items.length}개</strong>
          </div>
          <div className="cd-cart-stat">
            <span>총 수량</span><strong>{totalItems}개</strong>
          </div>
          <div className="cd-cart-stat total">
            <span>합계</span><strong>${totalPrice.toFixed(2)}</strong>
          </div>
        </>
      )}
    </div>
  );
}

// 🏗️ FilterableProductTable — 컨테이너 (공통 소유 컴포넌트)
function FilterableProductTable() {
  const { loading, filteredProducts } = useProductContext();

  return (
    <div className="cd-filterable-table">
      <div className="cd-table-top">
        <SearchBar />
        <CartSummary />
      </div>
      {loading ? <DemoLoading /> : (
        <>
          <div className="cd-result-info">
            총 <strong>{filteredProducts.length}</strong>개 상품
          </div>
          <ProductTable />
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   페이지 메인
═══════════════════════════════════════════ */
export default function ComponentDesignPage() {
  const [activeSection, setActiveSection] = useState('principle');

  const sections = [
    { id: 'principle', label: '📐 설계 원칙', icon: '📐' },
    { id: 'state', label: '🧠 State 설계', icon: '🧠' },
    { id: 'demo', label: '🚀 라이브 데모', icon: '🚀' },
  ];

  return (
    <div className="cd-page">
      <div className="cd-page-header">
        <h1>📐 React 컴포넌트 설계</h1>
        <p>단일 책임 원칙(SRP) 기반의 컴포넌트 설계와 React 최적화 패턴</p>
      </div>

      <div className="cd-tab-bar">
        {sections.map((s) => (
          <button
            key={s.id}
            className={`cd-tab-btn ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="cd-content">
        {activeSection === 'principle' && <PrincipleSection />}
        {activeSection === 'state' && <StateDesignSection />}
        {activeSection === 'demo' && (
          <ProductProvider>
            <DemoSection />
          </ProductProvider>
        )}
      </div>
    </div>
  );
}

/* ── 섹션 1: 설계 원칙 ── */
function PrincipleSection() {
  return (
    <div className="cd-section">
      <h2>🎯 단일 책임 원칙 (Single Responsibility Principle)</h2>
      <p className="cd-desc">
        각 컴포넌트는 <strong>한 가지 역할</strong>만 수행해야 합니다.
        "하나의 모듈이 하나의 동작을 해야 한다"가 아니라,
        <strong> "한 모듈은 한 사용자(관심사)를 위해 동작해야 한다"</strong>는 것이 핵심입니다.
      </p>

      <h3>📊 컴포넌트 계층 구조</h3>
      <PatternDiagram nodes={[
        { icon: '🏗️', label: 'FilterableProductTable', desc: '컨테이너 (공통 소유자)', color: 'blue' },
        { icon: '🔍', label: 'SearchBar', desc: '사용자 입력 담당', color: 'green' },
        { icon: '📊', label: 'ProductTable', desc: '목록 렌더링 담당', color: 'active' },
        { icon: '🛒', label: 'CartSummary', desc: '장바구니 상태 표시', color: 'react' },
      ]} />

      <div className="cd-hierarchy">
        <h3>🌳 전체 컴포넌트 트리</h3>
        <div className="cd-tree">
          <div className="cd-tree-node root">
            <span>ProductProvider</span>
            <small>Context로 상태 관리 책임 분리</small>
          </div>
          <div className="cd-tree-children">
            <div className="cd-tree-node container">
              <span>FilterableProductTable</span>
              <small>공통 소유 컴포넌트 (Common Owner)</small>
            </div>
            <div className="cd-tree-children">
              <div className="cd-tree-row">
                <div className="cd-tree-node leaf">
                  <span>🔍 SearchBar</span>
                  <small>검색어 / 필터 입력</small>
                </div>
                <div className="cd-tree-node leaf">
                  <span>🛒 CartSummary</span>
                  <small>장바구니 요약</small>
                </div>
              </div>
              <div className="cd-tree-node mid">
                <span>📊 ProductTable</span>
                <small>카테고리별 상품 표시</small>
              </div>
              <div className="cd-tree-children">
                <div className="cd-tree-row">
                  <div className="cd-tree-node leaf">
                    <span>📂 ProductCategoryRow</span>
                    <small>카테고리 헤더</small>
                  </div>
                  <div className="cd-tree-node leaf">
                    <span>📦 ProductRow</span>
                    <small>개별 상품 행</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cd-compare">
        <h3>🔄 Before vs After</h3>
        <div className="cd-compare-grid">
          <div className="cd-compare-box bad">
            <div className="cd-compare-title">❌ SRP 미적용 (단일 컴포넌트)</div>
            <pre className="cd-code">{`function ProductPage() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('');
  const [inStock, setInStock] = useState(false);
  const [cart, setCart] = useState([]);
  // 검색, 필터링, 정렬, 장바구니...
  // 모든 로직이 한 컴포넌트에 집중!
  return (
    <div>
      <input ... />      {/* 검색 */}
      <checkbox ... />   {/* 필터 */}
      {products.map(...)} {/* 목록 */}
      <CartArea ... />   {/* 장바구니 */}
    </div>
  );
}`}</pre>
            <p>한 컴포넌트에 모든 책임이 집중되어 유지보수 어려움</p>
          </div>
          <div className="cd-compare-box good">
            <div className="cd-compare-title">✅ SRP 적용 (책임 분리)</div>
            <pre className="cd-code">{`<ProductProvider>        {/* 상태 관리 */}
  <FilterableProductTable> {/* 컨테이너 */}
    <SearchBar />          {/* 입력 담당 */}
    <CartSummary />        {/* 장바구니 표시 */}
    <ProductTable>         {/* 목록 렌더링 */}
      <ProductCategoryRow /> {/* 카테고리 */}
      <ProductRow />         {/* 상품 행 */}
    </ProductTable>
  </FilterableProductTable>
</ProductProvider>`}</pre>
            <p>각 컴포넌트가 한 가지 역할만 수행하여 독립적으로 관리 가능</p>
          </div>
        </div>
      </div>

      <div className="m-info-grid">
        <ProsCons
          pros={[
            '컴포넌트별 독립적 테스트 가능',
            '재사용성 향상 — ProductRow를 다른 페이지에서도 사용',
            '유지보수 용이 — 검색 로직 변경 시 SearchBar만 수정',
            'Context로 props drilling 없이 상태 공유',
          ]}
          cons={[
            '초기 설계 시간이 더 소요됨',
            '컴포넌트 수가 많아져 파일 관리 필요',
            '과도한 분리는 오히려 복잡도 증가',
          ]}
        />
        <WhenToUse items={[
          '컴포넌트가 300줄 이상일 때 분리 고려',
          '동일한 UI 패턴이 2곳 이상에서 사용될 때',
          '여러 자식 컴포넌트가 같은 상태를 공유할 때',
          'props가 3단계 이상 전달될 때 (Context 도입)',
        ]} />
      </div>
    </div>
  );
}

/* ── 섹션 2: State 설계 ── */
function StateDesignSection() {
  return (
    <div className="cd-section">
      <h2>🧠 State 설계 — 최소한의 상태 찾기</h2>
      <p className="cd-desc">
        State 설계의 핵심은 <strong>중복 배제(DRY)</strong>입니다.
        최소한의 state를 찾고, 나머지는 <strong>계산(파생)</strong>되도록 합니다.
      </p>

      <h3>📋 State 판별 체크리스트</h3>
      <div className="cd-checklist">
        <div className="cd-check-item">
          <span className="cd-check-q">1. props를 통해 전달되는가?</span>
          <span className="cd-check-a no">→ Yes면 state ❌</span>
        </div>
        <div className="cd-check-item">
          <span className="cd-check-q">2. 시간이 지나도 변하지 않는가?</span>
          <span className="cd-check-a no">→ Yes면 state ❌</span>
        </div>
        <div className="cd-check-item">
          <span className="cd-check-q">3. state나 props로 계산 가능한가?</span>
          <span className="cd-check-a no">→ Yes면 state ❌</span>
        </div>
        <div className="cd-check-item highlight">
          <span className="cd-check-q">위 3가지 모두 No?</span>
          <span className="cd-check-a yes">→ ✅ State로 관리!</span>
        </div>
      </div>

      <h3>🛍️ 이 데모에 적용하기</h3>
      <div className="cd-state-table">
        <div className="cd-state-header">
          <span>데이터</span>
          <span>props?</span>
          <span>불변?</span>
          <span>계산가능?</span>
          <span>결론</span>
        </div>
        <div className="cd-state-row">
          <span>상품 원본 목록</span>
          <span className="no">—</span>
          <span className="no">—</span>
          <span className="no">—</span>
          <span className="cd-state-result state">✅ State (API 로드)</span>
        </div>
        <div className="cd-state-row">
          <span>검색어 (filterText)</span>
          <span className="no">No</span>
          <span className="no">No</span>
          <span className="no">No</span>
          <span className="cd-state-result state">✅ State</span>
        </div>
        <div className="cd-state-row">
          <span>재고필터 (inStockOnly)</span>
          <span className="no">No</span>
          <span className="no">No</span>
          <span className="no">No</span>
          <span className="cd-state-result state">✅ State</span>
        </div>
        <div className="cd-state-row">
          <span>정렬 기준 (sortBy)</span>
          <span className="no">No</span>
          <span className="no">No</span>
          <span className="no">No</span>
          <span className="cd-state-result state">✅ State</span>
        </div>
        <div className="cd-state-row derived">
          <span>필터링된 상품 목록</span>
          <span className="no">—</span>
          <span className="no">—</span>
          <span className="yes">Yes</span>
          <span className="cd-state-result derived">❌ 파생 (useMemo)</span>
        </div>
        <div className="cd-state-row derived">
          <span>카테고리별 그룹핑</span>
          <span className="no">—</span>
          <span className="no">—</span>
          <span className="yes">Yes</span>
          <span className="cd-state-result derived">❌ 파생 (useMemo)</span>
        </div>
        <div className="cd-state-row derived">
          <span>장바구니 총 금액</span>
          <span className="no">—</span>
          <span className="no">—</span>
          <span className="yes">Yes</span>
          <span className="cd-state-result derived">❌ 파생 (계산)</span>
        </div>
      </div>

      <h3>🏠 State 소유자 결정</h3>
      <PatternDiagram nodes={[
        { icon: '🔍', label: 'SearchBar', desc: 'filterText 사용', color: 'green' },
        { icon: '📊', label: 'ProductTable', desc: 'filterText로 필터링', color: 'active' },
        { icon: '🔼', label: '공통 소유자 탐색', desc: '두 컴포넌트의 부모 찾기', color: 'blue' },
        { icon: '🏗️', label: 'ProductProvider', desc: 'Context로 상태 소유', color: 'react' },
      ]} />

      <div className="cd-owner-explain">
        <p>
          <strong>SearchBar</strong>는 filterText를 <em>변경</em>하고,
          <strong> ProductTable</strong>은 filterText를 <em>읽습니다</em>.
          두 컴포넌트 모두 같은 상태에 의존하므로,
          공통 소유 컴포넌트인 <strong>FilterableProductTable</strong> 또는
          <strong> ProductProvider(Context)</strong>에서 상태를 관리합니다.
        </p>
      </div>

      <div className="cd-code-block">
        <h4>💡 핵심 코드 — Context로 상태 분리</h4>
        <pre className="cd-code">{`// ProductProvider — 상태 관리 책임
function ProductProvider({ children }) {
  const [filterText, setFilterText] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  // ❌ filteredProducts는 state가 아닌 파생값
  const filteredProducts = useMemo(() =>
    products.filter(p =>
      p.title.includes(filterText) &&
      (inStockOnly ? p.stock > 0 : true)
    ), [products, filterText, inStockOnly]);

  return (
    <ProductContext.Provider value={{
      filterText, setFilterText,
      inStockOnly, setInStockOnly,
      filteredProducts,
    }}>
      {children}
    </ProductContext.Provider>
  );
}`}</pre>
      </div>
    </div>
  );
}

/* ── 섹션 3: 라이브 데모 ── */
function DemoSection() {
  return (
    <div className="cd-section">
      <h2>🚀 라이브 데모 — Filterable Product Table</h2>
      <p className="cd-desc">
        위에서 설명한 설계 원칙이 모두 적용된 실제 동작하는 데모입니다.
        검색, 필터링, 정렬, 장바구니 추가를 테스트해보세요.
        각 컴포넌트는 단일 책임 원칙을 따르며, Context API로 상태를 공유합니다.
      </p>

      <div className="cd-demo-badges">
        <span className="cd-badge srp">📐 SRP</span>
        <span className="cd-badge context">🌐 Context API</span>
        <span className="cd-badge memo">⚡ useMemo</span>
        <span className="cd-badge zustand">🐻 Zustand (Cart)</span>
      </div>

      <div className="cd-demo-box">
        <FilterableProductTable />
      </div>

      <div className="cd-demo-note">
        <h4>🔮 이 데모에서 적용된 최적화</h4>
        <div className="cd-opt-grid">
          <div className="cd-opt-item">
            <code>useMemo</code>
            <small>filteredProducts / groupedProducts를 파생 상태로 계산하여 불필요한 재계산 방지</small>
          </div>
          <div className="cd-opt-item">
            <code>Context</code>
            <small>Props drilling 없이 SearchBar → ProductTable 간 상태 공유</small>
          </div>
          <div className="cd-opt-item">
            <code>Zustand Selector</code>
            <small>useCartStore((s) =&gt; s.items)로 필요한 상태만 구독하여 리렌더 최소화</small>
          </div>
          <div className="cd-opt-item">
            <code>단일 책임</code>
            <small>ProductRow만 장바구니 로직 소유 — 다른 컴포넌트에 영향 없음</small>
          </div>
        </div>
      </div>
    </div>
  );
}
