import { useState, useEffect, useRef, useCallback } from 'react';
import './PatternsPage.css';

/* ── 공통 유틸 ── */
function PatternDiagram({ nodes }) {
  return (
    <div className="diagram">
      {nodes.map((node, i) => (
        <div key={i} className="diagram-flow">
          <div className={`diagram-node diagram-node--${node.color}`}>
            <span className="diagram-icon">{node.icon}</span>
            <strong>{node.label}</strong>
            <small>{node.desc}</small>
          </div>
          {i < nodes.length - 1 && <span className="diagram-arrow">→</span>}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════
   1. MVC — Products
══════════════════════════════ */
function MVCTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [activeLayer, setActiveLayer] = useState(null);

  // Model: 데이터 페치
  useEffect(() => {
    setLoading(true);
    fetch('https://dummyjson.com/products?limit=6')
      .then((r) => r.json())
      .then((d) => { setProducts(d.products); setLoading(false); });
  }, []);

  // Controller: 정렬 제어
  const handleSort = (type) => {
    setActiveLayer('controller');
    setSortBy(type);
    setTimeout(() => { setActiveLayer('model'); setTimeout(() => { setActiveLayer('view'); setTimeout(() => setActiveLayer(null), 600); }, 500); }, 400);
  };

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="pattern-tab">
      <div className="pattern-info">
        <h2>MVC <span className="pattern-badge pattern-badge--blue">Model · View · Controller</span></h2>
        <p className="pattern-desc">화면 로직(Controller)과 데이터(Model), 렌더링(View)을 분리합니다. Controller가 사용자 입력을 받아 Model을 갱신하고, View는 Model을 보여줍니다.</p>
        <PatternDiagram nodes={[
          { icon: '👆', label: 'Controller', desc: '사용자 입력 처리', color: activeLayer === 'controller' ? 'active' : 'blue' },
          { icon: '📦', label: 'Model', desc: '데이터 & 비즈니스 로직', color: activeLayer === 'model' ? 'active' : 'green' },
          { icon: '🖼️', label: 'View', desc: '화면 렌더링', color: activeLayer === 'view' ? 'active' : 'purple' },
        ]} />
      </div>

      <div className="pattern-demo">
        <div className="demo-header">
          <span className="demo-label">🔴 Controller: 정렬 제어</span>
          <div className="btn-group">
            {[['default', '기본'], ['price-asc', '가격 낮은순'], ['price-desc', '가격 높은순'], ['rating', '평점순']].map(([val, label]) => (
              <button key={val} className={`sort-btn ${sortBy === val ? 'active' : ''}`} onClick={() => handleSort(val)}>{label}</button>
            ))}
          </div>
        </div>
        {loading ? <div className="demo-loading">⏳ 로딩 중...</div> : (
          <div className="mvc-grid">
            {sorted.map((p) => (
              <div key={p.id} className="mvc-card">
                <img src={p.thumbnail} alt={p.title} />
                <div className="mvc-card-info">
                  <p className="mvc-card-title">{p.title}</p>
                  <div className="mvc-card-meta">
                    <span className="price-tag">${(p.price * (1 - p.discountPercentage / 100)).toFixed(2)}</span>
                    <span className="rating-tag">⭐ {p.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   2. MVVM — Posts
══════════════════════════════ */
function MVVMTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  // ViewModel: 반응형 상태
  const [liked, setLiked] = useState(new Set());
  const [bookmarked, setBookmarked] = useState(new Set());

  useEffect(() => {
    fetch('https://dummyjson.com/posts?limit=6')
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts); setLoading(false); });
  }, []);

  const toggleLike = (id) => setLiked((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleBookmark = (id) => setBookmarked((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  // ViewModel computed
  const likedCount = liked.size;
  const bookmarkedCount = bookmarked.size;

  return (
    <div className="pattern-tab">
      <div className="pattern-info">
        <h2>MVVM <span className="pattern-badge pattern-badge--green">Model · View · ViewModel</span></h2>
        <p className="pattern-desc">ViewModel이 Model과 View 사이의 상태를 관리하며 양방향 바인딩을 제공합니다. View는 ViewModel의 상태를 반응적으로 렌더링합니다. React의 useState/useReducer가 ViewModel 역할을 합니다.</p>
        <PatternDiagram nodes={[
          { icon: '📦', label: 'Model', desc: 'Posts API', color: 'green' },
          { icon: '⚙️', label: 'ViewModel', desc: 'liked/bookmarked 상태', color: 'orange' },
          { icon: '🖼️', label: 'View', desc: '반응형 렌더링', color: 'purple' },
        ]} />
      </div>

      <div className="pattern-demo">
        <div className="demo-header">
          <span className="demo-label">🟢 ViewModel 상태: ❤️ {likedCount}개 좋아요 · 🔖 {bookmarkedCount}개 북마크</span>
        </div>
        {loading ? <div className="demo-loading">⏳ 로딩 중...</div> : (
          <div className="posts-list">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-tags">
                  {post.tags.slice(0, 3).map((t) => <span key={t} className="post-tag">#{t}</span>)}
                </div>
                <h4 className="post-title">{post.title}</h4>
                <p className="post-body">{post.body.slice(0, 100)}...</p>
                <div className="post-actions">
                  <button className={`action-btn ${liked.has(post.id) ? 'active-like' : ''}`} onClick={() => toggleLike(post.id)}>
                    {liked.has(post.id) ? '❤️' : '🤍'} {post.reactions.likes + (liked.has(post.id) ? 1 : 0)}
                  </button>
                  <button className={`action-btn ${bookmarked.has(post.id) ? 'active-bookmark' : ''}`} onClick={() => toggleBookmark(post.id)}>
                    {bookmarked.has(post.id) ? '🔖' : '📄'} 저장
                  </button>
                  <span className="post-views">👁 {post.views}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   3. MVP — Recipes
══════════════════════════════ */
// Presenter: 순수 포맷 함수들
const RecipePresenter = {
  formatTime: (prep, cook) => `${prep + cook}분 (준비 ${prep}분 + 조리 ${cook}분)`,
  difficultyColor: (d) => ({ Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' }[d] || '#888'),
  difficultyLabel: (d) => ({ Easy: '쉬움', Medium: '보통', Hard: '어려움' }[d] || d),
  formatCalories: (c) => `${c} kcal/인분`,
  formatServings: (s) => `${s}인분`,
};

function MVPTab() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('https://dummyjson.com/recipes?limit=6')
      .then((r) => r.json())
      .then((d) => { setRecipes(d.recipes); setLoading(false); });
  }, []);

  return (
    <div className="pattern-tab">
      <div className="pattern-info">
        <h2>MVP <span className="pattern-badge pattern-badge--orange">Model · View · Presenter</span></h2>
        <p className="pattern-desc">Presenter가 Model의 원시 데이터를 가공하여 View에 전달합니다. View는 완전히 수동적(Passive View)이며 오직 Presenter가 준 데이터만 렌더링합니다. 비즈니스 로직이 View에서 완전히 분리됩니다.</p>
        <PatternDiagram nodes={[
          { icon: '📦', label: 'Model', desc: 'Recipes API (원시 데이터)', color: 'green' },
          { icon: '🎯', label: 'Presenter', desc: '포맷팅 & 비즈니스 로직', color: 'orange' },
          { icon: '🖼️', label: 'View', desc: '수동적 렌더링만 담당', color: 'purple' },
        ]} />
      </div>

      <div className="pattern-demo">
        <div className="demo-header"><span className="demo-label">🟠 Presenter가 원시 데이터를 가공해서 View에 전달</span></div>
        {loading ? <div className="demo-loading">⏳ 로딩 중...</div> : (
          <div className="recipes-grid">
            {recipes.map((r) => (
              <div key={r.id} className={`recipe-card ${selected === r.id ? 'expanded' : ''}`} onClick={() => setSelected(selected === r.id ? null : r.id)}>
                <img src={r.image} alt={r.name} className="recipe-img" />
                <div className="recipe-info">
                  <div className="recipe-cuisine">{r.cuisine}</div>
                  <h4 className="recipe-name">{r.name}</h4>
                  {/* View는 Presenter가 가공한 값만 사용 */}
                  <div className="recipe-meta">
                    <span>⏱ {RecipePresenter.formatTime(r.prepTimeMinutes, r.cookTimeMinutes)}</span>
                    <span style={{ color: RecipePresenter.difficultyColor(r.difficulty) }}>
                      ● {RecipePresenter.difficultyLabel(r.difficulty)}
                    </span>
                  </div>
                  <div className="recipe-meta">
                    <span>🔥 {RecipePresenter.formatCalories(r.caloriesPerServing)}</span>
                    <span>👥 {RecipePresenter.formatServings(r.servings)}</span>
                  </div>
                  {selected === r.id && (
                    <ul className="recipe-ingredients">
                      {r.ingredients.slice(0, 5).map((ing, i) => <li key={i}>• {ing}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   4. Observer — Quotes
══════════════════════════════ */
function ObserverTab() {
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [panels, setPanels] = useState([true, true, true]); // 3 observers, subscribed?
  const intervalRef = useRef(null);

  const fetchQuote = useCallback(() => {
    fetch('https://dummyjson.com/quotes/random')
      .then((r) => r.json())
      .then((q) => {
        setQuote(q);
        setHistory((prev) => [q, ...prev].slice(0, 5));
      });
  }, []);

  useEffect(() => { fetchQuote(); }, [fetchQuote]);

  useEffect(() => {
    if (autoPlay) {
      intervalRef.current = setInterval(fetchQuote, 3000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoPlay, fetchQuote]);

  const togglePanel = (i) => setPanels((prev) => prev.map((v, idx) => idx === i ? !v : v));

  const COLORS = ['#6366f1', '#ec4899', '#10b981'];
  const ROLES = ['📊 분석 패널', '📝 기록 패널', '🎯 집중 패널'];

  return (
    <div className="pattern-tab">
      <div className="pattern-info">
        <h2>Observer <span className="pattern-badge pattern-badge--pink">Subject · Observer</span></h2>
        <p className="pattern-desc">Subject(주체)가 상태가 변경될 때 모든 구독(Observer)된 객체에게 자동으로 알림을 보냅니다. Observer들은 Subject를 직접 폴링하지 않고 수동적으로 업데이트를 받습니다. 구독/해제가 자유롭습니다.</p>
        <PatternDiagram nodes={[
          { icon: '📡', label: 'Subject', desc: 'Quotes API (상태 보유)', color: 'blue' },
          { icon: '🔔', label: 'notify()', desc: '변경 시 알림 발송', color: 'orange' },
          { icon: '👁', label: 'Observers', desc: '구독된 컴포넌트들', color: 'purple' },
        ]} />
      </div>

      <div className="pattern-demo">
        <div className="demo-header">
          <span className="demo-label">🔴 Subject (Quote API)</span>
          <div className="btn-group">
            <button className="sort-btn" onClick={fetchQuote}>🔄 새 명언</button>
            <button className={`sort-btn ${autoPlay ? 'active' : ''}`} onClick={() => setAutoPlay((v) => !v)}>
              {autoPlay ? '⏸ 자동정지' : '▶️ 자동재생 (3초)'}
            </button>
          </div>
        </div>

        <div className="observer-layout">
          {/* Subject */}
          <div className="subject-box">
            <div className="subject-label">📡 Subject</div>
            {quote && (
              <div className="subject-quote">
                <p>"{quote.quote}"</p>
                <span>— {quote.author}</span>
              </div>
            )}
            <div className="subject-history">
              {history.slice(1, 4).map((q, i) => (
                <div key={q.id + i} className="history-item-small">— {q.author}</div>
              ))}
            </div>
          </div>

          {/* Observers */}
          <div className="observers-box">
            {ROLES.map((role, i) => (
              <div key={i} className={`observer-panel ${!panels[i] ? 'unsubscribed' : ''}`} style={{ borderColor: COLORS[i] }}>
                <div className="observer-header" style={{ color: COLORS[i] }}>
                  {role}
                  <button className={`sub-btn ${panels[i] ? 'subscribed' : ''}`} onClick={() => togglePanel(i)}>
                    {panels[i] ? '🔔 구독 중' : '🔕 구독 해제'}
                  </button>
                </div>
                {panels[i] && quote ? (
                  <p className="observer-content">"{quote.quote.slice(0, 80)}..."</p>
                ) : (
                  <p className="observer-unsubscribed">구독 해제됨 — 업데이트 없음</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   5. Repository — Todos
══════════════════════════════ */
// Repository: 데이터 접근 추상화 계층
const TodoRepository = {
  async getAll(limit = 10) {
    const res = await fetch(`https://dummyjson.com/todos?limit=${limit}`);
    return res.json();
  },
  async toggle(id, completed) {
    const res = await fetch(`https://dummyjson.com/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    return res.json();
  },
  async add(todo) {
    const res = await fetch('https://dummyjson.com/todos/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todo, completed: false, userId: 1 }),
    });
    return res.json();
  },
  async remove(id) {
    const res = await fetch(`https://dummyjson.com/todos/${id}`, { method: 'DELETE' });
    return res.json();
  },
};

function RepositoryTab() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  const [opLog, setOpLog] = useState([]);

  const log = (msg) => setOpLog((p) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...p].slice(0, 6));

  useEffect(() => {
    log('Repository.getAll() 호출');
    TodoRepository.getAll(8).then((d) => { setTodos(d.todos); setLoading(false); log(`✅ ${d.todos.length}개 todo 로드 완료`); });
  }, []);

  const handleToggle = async (todo) => {
    log(`Repository.toggle(id=${todo.id}, completed=${!todo.completed}) 호출`);
    setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, completed: !t.completed } : t));
    await TodoRepository.toggle(todo.id, !todo.completed);
    log(`✅ id=${todo.id} 상태 업데이트 완료`);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    log(`Repository.add("${newTodo}") 호출`);
    const added = await TodoRepository.add(newTodo.trim());
    setTodos((prev) => [{ ...added, id: Date.now() }, ...prev]);
    setNewTodo('');
    log(`✅ 새 Todo 추가 완료 (시뮬레이션)`);
  };

  const handleRemove = async (id) => {
    log(`Repository.remove(id=${id}) 호출`);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await TodoRepository.remove(id);
    log(`✅ id=${id} 삭제 완료`);
  };

  return (
    <div className="pattern-tab">
      <div className="pattern-info">
        <h2>Repository <span className="pattern-badge pattern-badge--teal">Data Access Layer</span></h2>
        <p className="pattern-desc">Repository 패턴은 데이터 소스(API, DB)를 추상화하여 비즈니스 로직이 데이터 접근 방식에 의존하지 않도록 합니다. TodoRepository 인터페이스만 바꾸면 API → LocalStorage → IndexedDB로 교체 가능합니다.</p>
        <PatternDiagram nodes={[
          { icon: '🖼️', label: 'View', desc: 'UI 컴포넌트', color: 'purple' },
          { icon: '🗄️', label: 'Repository', desc: '데이터 접근 추상화', color: 'teal' },
          { icon: '🌐', label: 'Data Source', desc: 'Todos API / DB', color: 'green' },
        ]} />
      </div>

      <div className="pattern-demo">
        <div className="repo-layout">
          <div className="repo-todos">
            <form className="todo-form" onSubmit={handleAdd}>
              <input value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="새 Todo 추가..." />
              <button type="submit">+ 추가</button>
            </form>
            {loading ? <div className="demo-loading">⏳ 로딩 중...</div> : (
              <ul className="todo-list">
                {todos.map((t) => (
                  <li key={t.id} className={`todo-item ${t.completed ? 'done' : ''}`}>
                    <button className="todo-check" onClick={() => handleToggle(t)}>
                      {t.completed ? '✅' : '⬜'}
                    </button>
                    <span className="todo-text">{t.todo}</span>
                    <button className="todo-delete" onClick={() => handleRemove(t.id)}>🗑</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="repo-log">
            <div className="log-header">📋 Repository 호출 로그</div>
            {opLog.length === 0 ? <p className="log-empty">아직 작업 없음</p> : (
              opLog.map((l, i) => <div key={i} className="log-entry">{l}</div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   6. Flux — Products + Image
══════════════════════════════ */
// Action types
const ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  SET_FILTER: 'SET_FILTER',
  SET_VIEW: 'SET_VIEW',
};

function fluxReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_START: return { ...state, loading: true };
    case ACTIONS.FETCH_SUCCESS: return { ...state, loading: false, products: action.payload };
    case ACTIONS.SET_FILTER: return { ...state, filter: action.payload };
    case ACTIONS.SET_VIEW: return { ...state, view: action.payload };
    default: return state;
  }
}

function FluxTab() {
  const [state, dispatch] = useState(() => ({
    loading: true, products: [], filter: 'all', view: 'grid',
  }));
  const [dispatchLog, setDispatchLog] = useState([]);

  const loggedDispatch = useCallback((action) => {
    setDispatchLog((prev) => [`→ dispatch({ type: "${action.type}"${action.payload !== undefined ? `, payload: ${JSON.stringify(action.payload).slice(0, 30)}` : ''} })`, ...prev].slice(0, 6));
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
    <div className="pattern-tab">
      <div className="pattern-info">
        <h2>Flux <span className="pattern-badge pattern-badge--blue">단방향 데이터 흐름</span></h2>
        <p className="pattern-desc">모든 상태 변경은 Action → Dispatcher → Store → View 의 단방향으로만 흐릅니다. Redux/Zustand의 근간이 되는 패턴으로, 상태 변경을 예측 가능하게 만듭니다. React의 useReducer가 Flux Store 역할을 합니다.</p>
        <PatternDiagram nodes={[
          { icon: '⚡', label: 'Action', desc: '이벤트 객체', color: 'orange' },
          { icon: '📬', label: 'Dispatcher', desc: 'dispatch() 함수', color: 'blue' },
          { icon: '🗃️', label: 'Store', desc: 'useReducer state', color: 'teal' },
          { icon: '🖼️', label: 'View', desc: '상태 렌더링', color: 'purple' },
        ]} />
      </div>

      <div className="pattern-demo">
        <div className="flux-layout">
          <div className="flux-main">
            <div className="demo-header">
              <div className="btn-group">
                {categories.slice(0, 5).map((cat) => (
                  <button key={cat} className={`sort-btn ${state.filter === cat ? 'active' : ''}`}
                    onClick={() => loggedDispatch({ type: ACTIONS.SET_FILTER, payload: cat })}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="btn-group">
                <button className={`sort-btn ${state.view === 'grid' ? 'active' : ''}`} onClick={() => loggedDispatch({ type: ACTIONS.SET_VIEW, payload: 'grid' })}>▦ 그리드</button>
                <button className={`sort-btn ${state.view === 'list' ? 'active' : ''}`} onClick={() => loggedDispatch({ type: ACTIONS.SET_VIEW, payload: 'list' })}>☰ 리스트</button>
              </div>
            </div>

            {state.loading ? <div className="demo-loading">⏳ 로딩 중...</div> : (
              <div className={state.view === 'grid' ? 'flux-grid' : 'flux-list'}>
                {filtered.map((p) => (
                  <div key={p.id} className={state.view === 'grid' ? 'flux-card' : 'flux-list-item'}>
                    <img src={p.thumbnail} alt={p.title} />
                    <div>
                      <p className="flux-card-title">{p.title}</p>
                      <span className="flux-cat-tag">{p.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flux-store">
            <div className="log-header">⚡ Action 로그 (Dispatcher)</div>
            {dispatchLog.map((l, i) => <div key={i} className="log-entry">{l}</div>)}
            <div className="log-header" style={{ marginTop: '0.75rem' }}>🗃️ Store 현재 상태</div>
            <div className="log-entry">view: "{state.view}"</div>
            <div className="log-entry">filter: "{state.filter}"</div>
            <div className="log-entry">products: {state.products?.length ?? 0}개</div>
            <div className="log-entry">loading: {String(state.loading)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   Main PatternsPage
══════════════════════════════ */
const TABS = [
  { id: 'mvc',        label: 'MVC',        icon: '🔷', component: MVCTab },
  { id: 'mvvm',       label: 'MVVM',       icon: '🔶', component: MVVMTab },
  { id: 'mvp',        label: 'MVP',        icon: '🟢', component: MVPTab },
  { id: 'observer',   label: 'Observer',   icon: '👁',  component: ObserverTab },
  { id: 'repository', label: 'Repository', icon: '🗄️', component: RepositoryTab },
  { id: 'flux',       label: 'Flux',       icon: '⚡',  component: FluxTab },
];

function PatternsPage() {
  const [activeTab, setActiveTab] = useState('mvc');
  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component;

  return (
    <div className="patterns-page">
      <div className="patterns-header">
        <h1>🏗️ 개발 패턴</h1>
        <p>각 아키텍처 패턴을 실제 API 데이터로 체험해보세요.</p>
      </div>

      <div className="tabs-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

export default PatternsPage;
