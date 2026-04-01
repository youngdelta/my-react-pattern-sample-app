import { useState, Suspense, lazy } from 'react';
import './MethodsPage.css';

// 각 패턴을 별도 컴포넌트 파일에서 lazy import
const MVCTab          = lazy(() => import('./methods/MVC'));
const MVVMTab         = lazy(() => import('./methods/MVVM'));
const MVPTab          = lazy(() => import('./methods/MVP'));
const ObserverTab     = lazy(() => import('./methods/Observer'));
const RepositoryTab   = lazy(() => import('./methods/Repository'));
const FluxTab         = lazy(() => import('./methods/Flux'));
const CustomHooksTab  = lazy(() => import('./methods/CustomHooks'));
const ContextTab      = lazy(() => import('./methods/ContextReducer'));
const CompoundTab     = lazy(() => import('./methods/Compound'));
const HOCTab          = lazy(() => import('./methods/HOC'));
const ContainerTab    = lazy(() => import('./methods/ContainerPresentational'));

const GENERAL_TABS = [
  { id: 'mvc',        label: 'MVC',        icon: '🔷', component: MVCTab },
  { id: 'mvvm',       label: 'MVVM',       icon: '🔶', component: MVVMTab },
  { id: 'mvp',        label: 'MVP',        icon: '🟢', component: MVPTab },
  { id: 'observer',   label: 'Observer',   icon: '👁',  component: ObserverTab },
  { id: 'repository', label: 'Repository', icon: '🗄️', component: RepositoryTab },
  { id: 'flux',       label: 'Flux',       icon: '⚡',  component: FluxTab },
];

const REACT_TABS = [
  { id: 'container',    label: 'Container',     icon: '💡', component: ContainerTab },
  { id: 'custom-hooks', label: 'Custom Hooks',  icon: '🪝', component: CustomHooksTab },
  { id: 'context',      label: 'Context',       icon: '🌐', component: ContextTab },
  { id: 'compound',     label: 'Compound',      icon: '🧩', component: CompoundTab },
  { id: 'hoc',          label: 'HOC',           icon: '🔧', component: HOCTab },
];

function TabButton({ tab, active, react, onClick }) {
  return (
    <button
      className={`mt-tab-btn ${react ? 'mt-tab-btn--react' : ''} ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="mt-tab-icon">{tab.icon}</span>
      <span className="mt-tab-label">{tab.label}</span>
    </button>
  );
}

function LoadingFallback() {
  return <div className="mt-fallback">⏳ 컴포넌트 로딩 중...</div>;
}

export default function MethodsPage() {
  const [activeTab, setActiveTab] = useState('mvc');

  const allTabs = [...GENERAL_TABS, ...REACT_TABS];
  const { component: ActiveComponent } = allTabs.find((t) => t.id === activeTab) ?? {};

  return (
    <div className="methods-page">
      <div className="mt-header">
        <h1>🗂️ 개발 방법들</h1>
        <p>
          각 개발 패턴을 <strong>별도 컴포넌트 파일</strong>로 분리하여 관리합니다.
          탭을 클릭하면 해당 패턴의 설명, 장단점, 적용 시점, 실제 데모를 확인할 수 있습니다.
        </p>
      </div>

      {/* 일반 아키텍처 패턴 */}
      <div className="mt-group">
        <div className="mt-group-label">일반 아키텍처 패턴</div>
        <div className="mt-tabs-nav">
          {GENERAL_TABS.map((tab) => (
            <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>
      </div>

      {/* React 권장 패턴 */}
      <div className="mt-group">
        <div className="mt-group-label mt-group-label--react">⚛️ React 권장 패턴</div>
        <div className="mt-tabs-nav mt-tabs-nav--react">
          {REACT_TABS.map((tab) => (
            <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} react onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 — Suspense + lazy 로딩 */}
      <div className="mt-tab-content">
        <Suspense fallback={<LoadingFallback />}>
          {ActiveComponent && <ActiveComponent />}
        </Suspense>
      </div>
    </div>
  );
}
