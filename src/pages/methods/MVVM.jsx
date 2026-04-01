import { useState, useEffect } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from './shared';

export default function MVVMTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  // ViewModel 상태: liked, bookmarked
  const [liked, setLiked] = useState({});
  const [bookmarked, setBookmarked] = useState({});

  useEffect(() => {
    fetch('https://dummyjson.com/posts?limit=4')
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts); setLoading(false); });
  }, []);

  const toggleLike = (id) => setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleBookmark = (id) => setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));

  // Computed (ViewModel에서 파생)
  const likedCount = Object.values(liked).filter(Boolean).length;
  const bookmarkedCount = Object.values(bookmarked).filter(Boolean).length;

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--orange">일반 패턴</span>
        <span className="m-badge m-badge--gray">Model · View · ViewModel</span>
      </div>
      <p className="m-desc">
        ViewModel이 View와 Model 사이에서 상태를 변환·가공합니다.
        View는 ViewModel의 상태를 바인딩하여 표시하고, 사용자 액션은 ViewModel 메서드를 호출합니다.
        React의 컴포넌트 상태(useState + 파생값)가 ViewModel 역할을 합니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '📦', label: 'Model', desc: '원시 데이터', color: 'green' },
        { icon: '🔄', label: 'ViewModel', desc: '상태 변환 & 파생값', color: 'orange' },
        { icon: '🖼️', label: 'View', desc: 'ViewModel 바인딩', color: 'purple' },
      ]} />

      <div className="m-info-grid">
        <ProsCons
          pros={['View가 완전히 수동적', 'ViewModel 단위 테스트 용이', '데이터 바인딩으로 코드 간소화']}
          cons={['대규모 ViewModel 복잡도 증가', '간단한 앱엔 과도한 구조', '성능 최적화 어려울 수 있음']}
        />
        <WhenToUse items={[
          'WPF, SwiftUI 등 데이터 바인딩 플랫폼',
          'React에서 useState + 파생 계산이 많은 컴포넌트',
          'UI 상태가 서버 데이터와 독립적으로 관리될 때',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🔶 ViewModel: liked/bookmarked 상태 → Computed 파생값</div>
        <div className="m-vm-stats">
          <span className="m-vm-stat">❤️ 좋아요 {likedCount}개</span>
          <span className="m-vm-stat">🔖 북마크 {bookmarkedCount}개</span>
        </div>
        {loading ? <DemoLoading /> : (
          <div className="m-post-list">
            {posts.map((p) => (
              <div key={p.id} className="m-post-card">
                <p className="m-post-title">{p.title}</p>
                <p className="m-post-body">{p.body.slice(0, 80)}...</p>
                <div className="m-post-actions">
                  <button className={`m-action-btn ${liked[p.id] ? 'active-red' : ''}`} onClick={() => toggleLike(p.id)}>
                    {liked[p.id] ? '❤️' : '🤍'} {p.reactions?.likes + (liked[p.id] ? 1 : 0)}
                  </button>
                  <button className={`m-action-btn ${bookmarked[p.id] ? 'active-blue' : ''}`} onClick={() => toggleBookmark(p.id)}>
                    {bookmarked[p.id] ? '🔖' : '📄'} 북마크
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
