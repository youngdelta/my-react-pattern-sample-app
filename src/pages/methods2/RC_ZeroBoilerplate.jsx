import { useState, useEffect } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from '@/pages/methods/shared';

/*
 * ✅ React Compiler: 제로 보일러플레이트 패턴
 * 가장 간결하고 읽기 쉬운 React 코드
 */

/* ── 예제 1: 검색 가능한 리스트 ── */
function useSearch(items, key = 'title') {
  const [query, setQuery] = useState('');
  // ✅ 그냥 계산 — 컴파일러가 items/query 변경 시에만 재실행
  const filtered = query
    ? items.filter((item) => item[key].toLowerCase().includes(query.toLowerCase()))
    : items;
  return { query, setQuery, filtered, count: filtered.length, total: items.length };
}

function SearchableList({ items, renderItem, placeholder = '🔍 검색...' }) {
  const { query, setQuery, filtered, count, total } = useSearch(items);
  return (
    <div className="m2-zb-section">
      <div className="m2-zb-search-bar">
        <input className="m2-zb-input" placeholder={placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
        <span className="m2-zb-count">{count}/{total}</span>
      </div>
      <div className="m2-zb-list">{filtered.map(renderItem)}</div>
    </div>
  );
}

/* ── 예제 2: 토글 그룹 ── */
function useToggleSet(initialIds = []) {
  const [selected, setSelected] = useState(new Set(initialIds));
  // ✅ plain function — 컴파일러가 자동 안정화
  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  return { selected, toggle, count: selected.size };
}

/* ── 예제 3: 정렬 ── */
function useSorter(items, defaultKey = 'default') {
  const [sortKey, setSortKey] = useState(defaultKey);
  // ✅ 그냥 정렬 — 컴파일러가 items/sortKey 변경 시에만 재실행
  const sorted = sortKey === 'default' ? items : [...items].sort((a, b) => {
    if (sortKey === 'price-asc') return a.price - b.price;
    if (sortKey === 'price-desc') return b.price - a.price;
    if (sortKey === 'rating') return b.rating - a.rating;
    return 0;
  });
  return { sortKey, setSortKey, sorted };
}

export default function RC_ZeroBoilerplateTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=12')
      .then((r) => r.json())
      .then((d) => { setProducts(d.products); setLoading(false); });
  }, []);

  const search = useSearch(products);
  const sorter = useSorter(search.filtered);
  const favorites = useToggleSet();

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--react">⚛️ React Compiler</span>
        <span className="m-badge m-badge--orange">🧹 제로 보일러플레이트</span>
      </div>
      <p className="m-desc">
        React Compiler의 철학: <strong>"의미만 작성하면 최적화는 컴파일러가"</strong>.
        <code>useMemo</code>, <code>useCallback</code>, <code>React.memo</code> 없이
        <strong> 비즈니스 로직만 담은 Custom Hook</strong>을 조합합니다.
        가장 간결하면서도 자동 최적화가 적용되는 코드입니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '🪝', label: 'useSearch', desc: '검색 필터링', color: 'react' },
        { icon: '🔄', label: 'useSorter', desc: '정렬 로직', color: 'blue' },
        { icon: '💫', label: 'useToggleSet', desc: '선택 관리', color: 'orange' },
        { icon: '🔮', label: 'Compiler', desc: '자동 최적화', color: 'active' },
      ]} />

      <div className="m2-compiler-note">
        <div className="m2-compiler-note-title">💡 제로 보일러플레이트 원칙</div>
        <div className="m2-compiler-note-grid">
          <div className="m2-cn-item">
            <code className="m2-cn-after">{'useSearch(items) → { filtered, count }'}</code>
            <small>검색+필터를 Hook 하나로 캡슐화, useMemo 불필요</small>
          </div>
          <div className="m2-cn-item">
            <code className="m2-cn-after">{'useSorter(items) → { sorted, setSortKey }'}</code>
            <small>정렬 로직을 Hook으로 분리, useMemo 불필요</small>
          </div>
          <div className="m2-cn-item">
            <code className="m2-cn-after">{'useToggleSet() → { selected, toggle }'}</code>
            <small>선택 상태를 Set으로 관리, useCallback 불필요</small>
          </div>
        </div>
      </div>

      <div className="m-info-grid">
        <ProsCons
          pros={[
            '최소한의 코드로 최대 기능',
            'Hook 조합으로 복잡한 로직도 간결하게 표현',
            '의존성 배열 실수 완전 제거',
            '읽는 순서대로 로직이 이해됨',
          ]}
          cons={[
            'Hook 설계에 대한 이해 필요',
            '컴파일러 미지원 패턴은 수동 처리 필요',
          ]}
        />
        <WhenToUse items={[
          '새 프로젝트의 기본 개발 방식으로',
          'Hook 조합 패턴을 활용하고 싶을 때',
          '팀원 모두가 이해하기 쉬운 코드를 원할 때',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🧹 useSearch + useSorter + useToggleSet 조합 데모</div>

        {loading ? <DemoLoading /> : (
          <>
            <div className="m2-zb-toolbar">
              <input
                className="m2-zb-input"
                placeholder="🔍 검색..."
                value={search.query}
                onChange={(e) => search.setQuery(e.target.value)}
              />
              <div className="m2-zb-sort-group">
                {[['default', '기본'], ['price-asc', '가격↑'], ['price-desc', '가격↓'], ['rating', '⭐']].map(([v, l]) => (
                  <button key={v} className={`m-sort-btn ${sorter.sortKey === v ? 'active' : ''}`} onClick={() => sorter.setSortKey(v)}>{l}</button>
                ))}
              </div>
              <span className="m2-zb-count">{search.count}/{search.total}</span>
              <span className="m2-zb-fav-count">❤️ {favorites.count}</span>
            </div>

            <div className="m2-zb-grid">
              {sorter.sorted.slice(0, 8).map((p) => (
                <div key={p.id} className={`m2-zb-card ${favorites.selected.has(p.id) ? 'm2-zb-card--fav' : ''}`}>
                  <img src={p.thumbnail} alt={p.title} />
                  <div className="m2-zb-card-body">
                    <p className="m2-zb-card-title">{p.title}</p>
                    <div className="m2-zb-card-meta">
                      <span className="m2-zb-price">${p.price}</span>
                      <span className="m2-zb-rating">⭐ {p.rating}</span>
                    </div>
                    <button
                      className={`m2-zb-fav-btn ${favorites.selected.has(p.id) ? 'active' : ''}`}
                      onClick={() => favorites.toggle(p.id)}
                    >
                      {favorites.selected.has(p.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
