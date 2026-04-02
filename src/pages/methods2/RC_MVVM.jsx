import { useState, useEffect } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from '../methods/shared';

/*
 * ✅ React Compiler 적용 MVVM 패턴
 *
 * Before: const likedCount = useMemo(() => Object.values(liked).filter(Boolean).length, [liked]);
 * After:  const likedCount = Object.values(liked).filter(Boolean).length;
 *         ← 컴파일러가 liked가 변할 때만 재계산하도록 자동 처리
 */

function PostCard({ post, isLiked, isBookmarked, onLike, onBookmark }) {
  return (
    <div className="m-post-card">
      <p className="m-post-title">{post.title}</p>
      <p className="m-post-body">{post.body.slice(0, 100)}...</p>
      <div className="m2-vm-tags">
        {post.tags?.map((t) => <span key={t} className="m2-vm-tag">#{t}</span>)}
      </div>
      <div className="m-post-actions">
        <button className={`m-action-btn ${isLiked ? 'active-red' : ''}`} onClick={() => onLike(post.id)}>
          {isLiked ? '❤️' : '🤍'} {post.reactions?.likes + (isLiked ? 1 : 0)}
        </button>
        <button className={`m-action-btn ${isBookmarked ? 'active-blue' : ''}`} onClick={() => onBookmark(post.id)}>
          {isBookmarked ? '🔖' : '📄'} 북마크
        </button>
        <span className="m2-vm-views">👀 {post.views}</span>
      </div>
    </div>
  );
}

export default function RC_MVVMTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('https://dummyjson.com/posts?limit=6')
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts); setLoading(false); });
  }, []);

  // ✅ React Compiler: ViewModel의 파생값을 useMemo 없이 직접 계산
  const toggleLike = (id) => setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleBookmark = (id) => setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));

  // 파생 상태 — 컴파일러가 자동 메모이제이션
  const likedCount = Object.values(liked).filter(Boolean).length;
  const bookmarkedCount = Object.values(bookmarked).filter(Boolean).length;
  const likedIds = Object.entries(liked).filter(([, v]) => v).map(([k]) => Number(k));
  const bookmarkedIds = Object.entries(bookmarked).filter(([, v]) => v).map(([k]) => Number(k));

  // 필터링된 게시글 — 컴파일러가 filter, posts, likedIds, bookmarkedIds 변경 시에만 재계산
  const filteredPosts = posts.filter((p) => {
    if (filter === 'liked') return likedIds.includes(p.id);
    if (filter === 'bookmarked') return bookmarkedIds.includes(p.id);
    return true;
  });

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--orange">일반 패턴</span>
        <span className="m-badge m2-badge--compiler">🔮 React Compiler</span>
      </div>
      <p className="m-desc">
        MVVM의 <strong>ViewModel 파생값</strong>을 <code>useMemo</code> 없이 직접 계산합니다.
        React Compiler가 <code>liked</code>, <code>bookmarked</code> 상태가 변할 때만
        파생값을 재계산하도록 <strong>자동 최적화</strong>합니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '📦', label: 'Model', desc: 'API 데이터', color: 'green' },
        { icon: '🔄', label: 'ViewModel', desc: '파생값 자동 캐싱', color: 'orange' },
        { icon: '🖼️', label: 'View', desc: '자동 최적화 바인딩', color: 'purple' },
      ]} />

      <div className="m2-compiler-note">
        <div className="m2-compiler-note-title">🔮 React Compiler가 하는 일</div>
        <div className="m2-compiler-note-grid">
          <div className="m2-cn-item">
            <code className="m2-cn-before">{'useMemo(() => values.filter(Boolean).length, [liked])'}</code>
            <span className="m2-cn-arrow">→</span>
            <code className="m2-cn-after">{'Object.values(liked).filter(Boolean).length'}</code>
            <small>파생값 자동 캐싱</small>
          </div>
          <div className="m2-cn-item">
            <code className="m2-cn-before">{'useCallback((id) => toggle(id), [])'}</code>
            <span className="m2-cn-arrow">→</span>
            <code className="m2-cn-after">{'(id) => toggle(id)'}</code>
            <small>콜백 참조 자동 안정화</small>
          </div>
        </div>
      </div>

      <div className="m-info-grid">
        <ProsCons
          pros={['ViewModel 계산 코드가 간결', '의존성 배열 관리 불필요', '파생 상태를 자연스럽게 표현', '콜백 안정화를 컴파일러에 위임']}
          cons={['컴파일러 미지원 사이드 이펙트는 수동 처리', 'ViewModel이 큰 경우 분리 설계 필요']}
        />
        <WhenToUse items={[
          'useState + 파생 계산이 많은 컴포넌트',
          '좋아요, 북마크 등 UI 상태 관리',
          'Model 데이터를 View용으로 변환할 때',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🔶 ViewModel: 파생값 자동 캐싱 (useMemo 없음)</div>
        <div className="m2-vm-stats-bar">
          <span className="m2-vm-stat-item">❤️ 좋아요 <strong>{likedCount}</strong>개</span>
          <span className="m2-vm-stat-item">🔖 북마크 <strong>{bookmarkedCount}</strong>개</span>
          <span className="m2-vm-stat-item">📝 표시 <strong>{filteredPosts.length}</strong>/{posts.length}개</span>
        </div>
        <div className="m-btn-row">
          {[['all', '📋 전체'], ['liked', '❤️ 좋아요'], ['bookmarked', '🔖 북마크']].map(([v, l]) => (
            <button key={v} className={`m-sort-btn ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
        {loading ? <DemoLoading /> : (
          <div className="m-post-list">
            {filteredPosts.length === 0 ? (
              <p className="m2-empty">아직 {filter === 'liked' ? '좋아요' : '북마크'}한 글이 없습니다</p>
            ) : (
              filteredPosts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  isLiked={!!liked[p.id]}
                  isBookmarked={!!bookmarked[p.id]}
                  onLike={toggleLike}
                  onBookmark={toggleBookmark}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
