import { useState, useEffect } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from './shared';

/* ═══════════════════════════════════════════
   Presentational 컴포넌트 — 오직 UI만 담당
   props를 받아서 렌더링만 합니다.
   데이터가 어디서 오는지 전혀 모릅니다.
═══════════════════════════════════════════ */

function UserCard({ user }) {
  return (
    <div className="m-cp-card">
      <img className="m-cp-avatar" src={user.image} alt={user.firstName} />
      <div className="m-cp-info">
        <p className="m-cp-name">{user.firstName} {user.lastName}</p>
        <p className="m-cp-email">📧 {user.email}</p>
        <p className="m-cp-detail">🏢 {user.company?.name ?? '없음'}</p>
        <span className="m-cp-age">{user.age}세 · {user.gender}</span>
      </div>
    </div>
  );
}

function UserList({ users }) {
  return (
    <div className="m-cp-grid">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

function SearchBar({ value, onChange, resultCount }) {
  return (
    <div className="m-cp-search-bar">
      <input
        className="m-cp-search"
        placeholder="🔍 사용자 검색..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="m-cp-count">{resultCount}명</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Container 컴포넌트 — 오직 데이터만 담당
   API 호출, 상태 관리, 필터링 등 로직을 처리하고
   결과를 Presentational 컴포넌트에 넘깁니다.
═══════════════════════════════════════════ */

function UserListContainer() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 데이터 페치 로직
  useEffect(() => {
    fetch('https://dummyjson.com/users?limit=8&select=id,firstName,lastName,email,age,gender,image,company')
      .then((r) => r.json())
      .then((d) => { setUsers(d.users); setLoading(false); });
  }, []);

  // 필터링 로직
  const filtered = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Container는 로직만 담당, UI는 Presentational에 위임
  if (loading) return <DemoLoading />;
  return (
    <>
      <SearchBar value={search} onChange={setSearch} resultCount={filtered.length} />
      <UserList users={filtered} />
    </>
  );
}

/* ═══════════════════════════════════════════
   메인 탭 컴포넌트
═══════════════════════════════════════════ */

export default function ContainerPresentationalTab() {
  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--react">⚛️ React 기본</span>
        <span className="m-badge m-badge--green">가장 쉬운 패턴</span>
        <span className="m-badge m-badge--gray">Container · Presentational</span>
      </div>
      <p className="m-desc">
        <strong>가장 단순하고 직관적인 React 패턴</strong>입니다.
        컴포넌트를 딱 두 종류로 나눕니다:<br />
        • <strong>Container</strong> = 데이터를 가져오고 처리하는 컴포넌트 (똑똑한 컴포넌트)<br />
        • <strong>Presentational</strong> = props를 받아 화면만 그리는 컴포넌트 (멍청한 컴포넌트)<br />
        React를 처음 배울 때 가장 먼저 익히는 패턴이며, 다른 모든 패턴의 기반이 됩니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '🧠', label: 'Container', desc: '데이터 & 로직', color: 'blue' },
        { icon: '➡️', label: 'props 전달', desc: 'data, callbacks', color: 'active' },
        { icon: '🎨', label: 'Presentational', desc: 'UI만 렌더링', color: 'green' },
      ]} />

      <div className="m-info-grid">
        <ProsCons
          pros={[
            '누구나 바로 이해할 수 있음',
            'Presentational 컴포넌트 재사용 쉬움',
            'UI 수정과 로직 수정을 독립적으로 진행',
            'Presentational은 Storybook 테스트 가능',
          ]}
          cons={[
            'Container가 커질 수 있음 (→ Custom Hook으로 해결)',
            '아주 간단한 컴포넌트까지 분리하면 과도함',
            '파일 수가 늘어남',
          ]}
        />
        <WhenToUse items={[
          'React를 처음 배울 때 (입문 패턴)',
          'UI 디자인과 데이터 로직 담당자가 다를 때',
          'Storybook으로 UI 컴포넌트를 문서화할 때',
          '같은 UI를 다른 데이터 소스로 재사용할 때',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">
          💡 Container(UserListContainer) → Presentational(SearchBar + UserList + UserCard) 분리 데모
        </div>
        <div className="m-cp-demo-layout">
          <div className="m-cp-structure">
            <div className="m-cp-tree">
              <div className="m-cp-tree-node container">
                <span>🧠 UserListContainer</span>
                <small>API 호출 · useState · 필터링</small>
              </div>
              <div className="m-cp-tree-line" />
              <div className="m-cp-tree-children">
                <div className="m-cp-tree-node presentational">
                  <span>🎨 SearchBar</span>
                  <small>props: value, onChange</small>
                </div>
                <div className="m-cp-tree-node presentational">
                  <span>🎨 UserList</span>
                  <small>props: users[]</small>
                  <div className="m-cp-tree-sub">
                    <div className="m-cp-tree-node presentational small">
                      <span>🎨 UserCard</span>
                      <small>props: user</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="m-cp-demo-content">
            <UserListContainer />
          </div>
        </div>
      </div>
    </div>
  );
}
