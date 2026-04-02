import { useState, Suspense, lazy } from 'react';
import './MethodsPage2.css';

const RC_MVCTab          = lazy(() => import('./methods2/RC_MVC'));
const RC_MVVMTab         = lazy(() => import('./methods2/RC_MVVM'));
const RC_FluxTab         = lazy(() => import('./methods2/RC_Flux'));
const RC_BeforeAfterTab  = lazy(() => import('./methods2/RC_BeforeAfter'));
const RC_AutoMemoTab     = lazy(() => import('./methods2/RC_AutoMemo'));
const RC_ZeroTab         = lazy(() => import('./methods2/RC_ZeroBoilerplate'));
const RC_ModernTab       = lazy(() => import('./methods2/RC_ModernApp'));

const GENERAL_TABS = [
  { id: 'rc-mvc',  label: 'MVC',  icon: '🔷', component: RC_MVCTab },
  { id: 'rc-mvvm', label: 'MVVM', icon: '🔶', component: RC_MVVMTab },
  { id: 'rc-flux', label: 'Flux', icon: '⚡', component: RC_FluxTab },
];

const COMPILER_TABS = [
  { id: 'rc-before-after', label: 'Before/After', icon: '📊', component: RC_BeforeAfterTab },
  { id: 'rc-auto-memo',    label: '자동 Memo',     icon: '🧠', component: RC_AutoMemoTab },
  { id: 'rc-zero',         label: 'Zero 보일러',   icon: '🧹', component: RC_ZeroTab },
  { id: 'rc-modern',       label: 'Modern App',   icon: '🏆', component: RC_ModernTab },
];

function TabButton({ tab, active, variant, onClick }) {
  return (
    <button
      className={`m2-tab-btn ${variant ? `m2-tab-btn--${variant}` : ''} ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="m2-tab-icon">{tab.icon}</span>
      <span className="m2-tab-label">{tab.label}</span>
    </button>
  );
}

function LoadingFallback() {
  return <div className="m2-fallback">⏳ 컴포넌트 로딩 중...</div>;
}

export default function MethodsPage2() {
  const [activeTab, setActiveTab] = useState('rc-mvc');

  const allTabs = [...GENERAL_TABS, ...COMPILER_TABS];
  const { component: ActiveComponent } = allTabs.find((t) => t.id === activeTab) ?? {};

  return (
    <div className="methods2-page">
      <div className="m2-header">
        <h1>🔮 개발 방법들 Part 2 — React Compiler</h1>
        <p>
          <strong>React Compiler</strong>를 적용하여 <code>memo</code>, <code>useMemo</code>, <code>useCallback</code> 없이
          동일한 최적화를 달성하는 개발 패턴들입니다.
          빌드 시 컴파일러가 <strong>자동으로 메모이제이션을 삽입</strong>합니다.
        </p>
        <div className="m2-header-badges">
          <span className="m2-hb">✅ babel-plugin-react-compiler 적용</span>
          <span className="m2-hb">✅ vite.config.js 설정 완료</span>
          <span className="m2-hb">✅ React 19 호환</span>
        </div>
      </div>

      {/* 일반 아키텍처 (React Compiler) */}
      <div className="m2-group">
        <div className="m2-group-label">🔮 일반 아키텍처 패턴 (React Compiler 적용)</div>
        <div className="m2-tabs-nav">
          {GENERAL_TABS.map((tab) => (
            <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>
      </div>

      {/* React Compiler 패턴 */}
      <div className="m2-group">
        <div className="m2-group-label m2-group-label--compiler">⚛️ React 최신 Compiler 패턴</div>
        <div className="m2-tabs-nav m2-tabs-nav--compiler">
          {COMPILER_TABS.map((tab) => (
            <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} variant="compiler" onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="m2-tab-content">
        <Suspense fallback={<LoadingFallback />}>
          {ActiveComponent && <ActiveComponent />}
        </Suspense>
      </div>
    </div>
  );
}
