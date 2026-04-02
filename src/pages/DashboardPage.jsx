import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './DashboardPage.css';

/* ═══════════════════════════════════════════
   Benchmark Data — 실제 빌드 분석 기반
═══════════════════════════════════════════ */
const PAGE_META = {
  patterns: { label: '패턴',          path: '/patterns',  color: '#6366f1', icon: '🏗️' },
  methods:  { label: '개발 방법들',    path: '/methods',   color: '#10b981', icon: '🗂️' },
  methods2: { label: 'Part2 (Compiler)', path: '/methods2', color: '#8b5cf6', icon: '🔮' },
};

const CATEGORIES = {
  general:  { label: '일반 아키텍처', color: '#3b82f6' },
  react:    { label: 'React 패턴',   color: '#06b6d4' },
  compiler: { label: 'React Compiler', color: '#8b5cf6' },
};

// manualOpt: useCallback + useMemo 수동 최적화 호출 수 (컴파일러 패턴은 0)
const ALL_PATTERNS = [
  // ── /patterns (인라인, 메인 번들에 포함) ──
  { name: 'MVC',          page: 'patterns', cat: 'general',  icon: '🔷', lines: 80,  bundle: null, hooks: 6,  manualOpt: 0,  perf: 7, dx: 8, maintain: 7, learn: 3 },
  { name: 'MVVM',         page: 'patterns', cat: 'general',  icon: '🔶', lines: 85,  bundle: null, hooks: 7,  manualOpt: 0,  perf: 7, dx: 7, maintain: 7, learn: 4 },
  { name: 'MVP',          page: 'patterns', cat: 'general',  icon: '🟢', lines: 70,  bundle: null, hooks: 5,  manualOpt: 0,  perf: 7, dx: 9, maintain: 8, learn: 2 },
  { name: 'Observer',     page: 'patterns', cat: 'general',  icon: '👁', lines: 90,  bundle: null, hooks: 7,  manualOpt: 0,  perf: 6, dx: 6, maintain: 6, learn: 5 },
  { name: 'Repository',   page: 'patterns', cat: 'general',  icon: '🗄️', lines: 85,  bundle: null, hooks: 6,  manualOpt: 0,  perf: 7, dx: 7, maintain: 8, learn: 4 },
  { name: 'Flux',         page: 'patterns', cat: 'general',  icon: '⚡', lines: 95,  bundle: null, hooks: 6,  manualOpt: 0,  perf: 7, dx: 6, maintain: 7, learn: 5 },
  { name: 'Custom Hooks', page: 'patterns', cat: 'react',    icon: '🪝', lines: 75,  bundle: null, hooks: 5,  manualOpt: 0,  perf: 8, dx: 9, maintain: 9, learn: 3 },
  { name: 'Context',      page: 'patterns', cat: 'react',    icon: '🌐', lines: 90,  bundle: null, hooks: 5,  manualOpt: 0,  perf: 6, dx: 7, maintain: 7, learn: 5 },
  { name: 'Compound',     page: 'patterns', cat: 'react',    icon: '🧩', lines: 85,  bundle: null, hooks: 5,  manualOpt: 0,  perf: 7, dx: 7, maintain: 8, learn: 4 },
  { name: 'HOC',          page: 'patterns', cat: 'react',    icon: '🔧', lines: 80,  bundle: null, hooks: 6,  manualOpt: 0,  perf: 6, dx: 5, maintain: 6, learn: 5 },

  // ── /methods (개별 lazy-loaded 청크) ──
  { name: 'MVC',          page: 'methods', cat: 'general', icon: '🔷', lines: 75,  bundle: 4.13,  hooks: 7,  manualOpt: 0,  perf: 7, dx: 8, maintain: 7, learn: 3 },
  { name: 'MVVM',         page: 'methods', cat: 'general', icon: '🔶', lines: 73,  bundle: 4.05,  hooks: 9,  manualOpt: 0,  perf: 7, dx: 7, maintain: 7, learn: 4 },
  { name: 'MVP',          page: 'methods', cat: 'general', icon: '🟢', lines: 66,  bundle: 3.29,  hooks: 5,  manualOpt: 0,  perf: 8, dx: 9, maintain: 8, learn: 2 },
  { name: 'Observer',     page: 'methods', cat: 'general', icon: '👁', lines: 95,  bundle: 4.79,  hooks: 10, manualOpt: 0,  perf: 6, dx: 5, maintain: 6, learn: 6 },
  { name: 'Repository',   page: 'methods', cat: 'general', icon: '🗄️', lines: 102, bundle: 5.12,  hooks: 9,  manualOpt: 0,  perf: 7, dx: 7, maintain: 8, learn: 4 },
  { name: 'Flux',         page: 'methods', cat: 'general', icon: '⚡', lines: 96,  bundle: 6.08,  hooks: 10, manualOpt: 0,  perf: 7, dx: 5, maintain: 7, learn: 6 },
  { name: 'Container',    page: 'methods', cat: 'react',   icon: '💡', lines: 154, bundle: 7.16,  hooks: 7,  manualOpt: 0,  perf: 7, dx: 7, maintain: 8, learn: 3 },
  { name: 'Custom Hooks', page: 'methods', cat: 'react',   icon: '🪝', lines: 62,  bundle: 3.46,  hooks: 2,  manualOpt: 0,  perf: 9, dx: 10, maintain: 9, learn: 2 },
  { name: 'Context',      page: 'methods', cat: 'react',   icon: '🌐', lines: 97,  bundle: 5.45,  hooks: 13, manualOpt: 0,  perf: 6, dx: 6, maintain: 7, learn: 6 },
  { name: 'Compound',     page: 'methods', cat: 'react',   icon: '🧩', lines: 91,  bundle: 4.96,  hooks: 10, manualOpt: 0,  perf: 7, dx: 7, maintain: 8, learn: 4 },
  { name: 'HOC',          page: 'methods', cat: 'react',   icon: '🔧', lines: 92,  bundle: 4.91,  hooks: 8,  manualOpt: 0,  perf: 6, dx: 5, maintain: 6, learn: 5 },
  { name: '최적화',       page: 'methods', cat: 'react',   icon: '⚡', lines: 189, bundle: 5.77,  hooks: 26, manualOpt: 18, perf: 9, dx: 4, maintain: 5, learn: 8 },
  { name: 'Modern React', page: 'methods', cat: 'react',   icon: '🏆', lines: 231, bundle: 10.50, hooks: 24, manualOpt: 12, perf: 9, dx: 6, maintain: 7, learn: 7 },

  // ── /methods2 (React Compiler 적용 — 자동 최적화) ──
  { name: 'RC MVC',       page: 'methods2', cat: 'compiler', icon: '🔷', lines: 111, bundle: 6.39,  hooks: 8,  manualOpt: 0, perf: 9,  dx: 9, maintain: 8, learn: 3 },
  { name: 'RC MVVM',      page: 'methods2', cat: 'compiler', icon: '🔶', lines: 132, bundle: 8.48,  hooks: 9,  manualOpt: 0, perf: 9,  dx: 9, maintain: 8, learn: 3 },
  { name: 'RC Flux',      page: 'methods2', cat: 'compiler', icon: '⚡', lines: 163, bundle: 8.92,  hooks: 10, manualOpt: 0, perf: 9,  dx: 8, maintain: 8, learn: 4 },
  { name: 'Before/After', page: 'methods2', cat: 'compiler', icon: '📊', lines: 168, bundle: 8.04,  hooks: 10, manualOpt: 0, perf: 9,  dx: 8, maintain: 7, learn: 5 },
  { name: '자동 Memo',    page: 'methods2', cat: 'compiler', icon: '🧠', lines: 162, bundle: 5.43,  hooks: 7,  manualOpt: 0, perf: 10, dx: 9, maintain: 9, learn: 2 },
  { name: 'Zero 보일러',  page: 'methods2', cat: 'compiler', icon: '🧹', lines: 161, bundle: 6.63,  hooks: 8,  manualOpt: 0, perf: 9,  dx: 10, maintain: 9, learn: 2 },
  { name: 'RC Modern',    page: 'methods2', cat: 'compiler', icon: '🏆', lines: 263, bundle: 11.69, hooks: 10, manualOpt: 0, perf: 10, dx: 8, maintain: 8, learn: 5 },
];

/* ── Cross-page comparison groups ── */
const CROSS_GROUPS = [
  { label: 'MVC',  icon: '🔷', patterns: ['patterns', 'methods', 'methods2'], matchNames: ['MVC', 'MVC', 'RC MVC'] },
  { label: 'MVVM', icon: '🔶', patterns: ['patterns', 'methods', 'methods2'], matchNames: ['MVVM', 'MVVM', 'RC MVVM'] },
  { label: 'Flux', icon: '⚡', patterns: ['patterns', 'methods', 'methods2'], matchNames: ['Flux', 'Flux', 'RC Flux'] },
];

/* ═══════════════════════════════
   Helpers
═══════════════════════════════ */
function calcOverall(p) {
  return +((p.perf * 0.3 + p.dx * 0.25 + p.maintain * 0.25 + (10 - p.learn) * 0.2).toFixed(1));
}

function getScoreColor(score) {
  if (score >= 9) return '#10b981';
  if (score >= 7) return '#3b82f6';
  if (score >= 5) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score) {
  if (score >= 9) return '우수';
  if (score >= 7) return '양호';
  if (score >= 5) return '보통';
  return '미흡';
}

/* ═══════════════════════════════
   Sub-Components
═══════════════════════════════ */
function ScoreBar({ value, max = 10, color }) {
  const pct = (value / max) * 100;
  return (
    <div className="db-score-bar">
      <div className="db-score-bar-fill" style={{ width: `${pct}%`, background: color || getScoreColor(value) }} />
      <span className="db-score-bar-label">{value}</span>
    </div>
  );
}

function PageBadge({ page }) {
  const meta = PAGE_META[page];
  return (
    <Link to={meta.path} className="db-page-badge" style={{ '--badge-color': meta.color }}>
      {meta.icon} {meta.label}
    </Link>
  );
}

function CatBadge({ cat }) {
  const c = CATEGORIES[cat];
  return <span className="db-cat-badge" style={{ '--cat-color': c.color }}>{c.label}</span>;
}

/* ═══════════════════════════════
   Main Dashboard
═══════════════════════════════ */
export default function DashboardPage() {
  const [sortBy, setSortBy] = useState('overall');
  const [filterPage, setFilterPage] = useState('all');
  const [filterCat, setFilterCat] = useState('all');

  const enriched = useMemo(() =>
    ALL_PATTERNS.map(p => ({ ...p, overall: calcOverall(p) })),
  []);

  const filtered = useMemo(() => {
    let list = enriched;
    if (filterPage !== 'all') list = list.filter(p => p.page === filterPage);
    if (filterCat  !== 'all') list = list.filter(p => p.cat === filterCat);
    return list;
  }, [enriched, filterPage, filterCat]);

  const sorted = useMemo(() => {
    const sorters = {
      overall: (a, b) => b.overall - a.overall,
      perf:    (a, b) => b.perf - a.perf,
      dx:      (a, b) => b.dx - a.dx,
      maintain:(a, b) => b.maintain - a.maintain,
      bundle:  (a, b) => (a.bundle ?? 999) - (b.bundle ?? 999),
      lines:   (a, b) => a.lines - b.lines,
      learn:   (a, b) => a.learn - b.learn,
    };
    return [...filtered].sort(sorters[sortBy] || sorters.overall);
  }, [filtered, sortBy]);

  // Stats
  const withBundle = enriched.filter(p => p.bundle != null);
  const avgBundle = withBundle.length
    ? (withBundle.reduce((s, p) => s + p.bundle, 0) / withBundle.length).toFixed(1)
    : 0;
  const bestPerf = enriched.reduce((a, b) => a.perf >= b.perf ? a : b);
  const bestDx   = enriched.reduce((a, b) => a.dx >= b.dx ? a : b);
  const bestOverall = enriched.reduce((a, b) => a.overall >= b.overall ? a : b);
  const maxBundle = Math.max(...withBundle.map(p => p.bundle));

  // Page averages
  const pageStats = Object.keys(PAGE_META).map(pageKey => {
    const items = enriched.filter(p => p.page === pageKey);
    const avg = (key) => items.length ? +(items.reduce((s, p) => s + p[key], 0) / items.length).toFixed(1) : 0;
    return { page: pageKey, count: items.length, perf: avg('perf'), dx: avg('dx'), maintain: avg('maintain'), learn: avg('learn'), overall: avg('overall') };
  });

  return (
    <div className="dashboard-page">
      {/* ── Header ── */}
      <header className="db-header">
        <h1>📊 개발 패턴 성능 대시보드</h1>
        <p>
          <strong>/patterns</strong>, <strong>/methods</strong>, <strong>/methods2</strong> 페이지의
          모든 개발 패턴을 벤치마크 형식으로 비교 분석합니다.
        </p>
        <div className="db-header-badges">
          {Object.entries(PAGE_META).map(([k, v]) => (
            <Link key={k} to={v.path} className="db-hb" style={{ '--hb-color': v.color }}>
              {v.icon} {v.label}
            </Link>
          ))}
        </div>
      </header>

      {/* ── KPI Cards ── */}
      <section className="db-kpi-row">
        <div className="db-kpi"><span className="db-kpi-icon">📦</span><span className="db-kpi-val">{enriched.length}</span><span className="db-kpi-label">총 패턴 수</span></div>
        <div className="db-kpi"><span className="db-kpi-icon">📐</span><span className="db-kpi-val">{avgBundle} KB</span><span className="db-kpi-label">평균 번들 크기</span></div>
        <div className="db-kpi"><span className="db-kpi-icon">🏆</span><span className="db-kpi-val">{bestOverall.overall}</span><span className="db-kpi-label">최고 종합 ({bestOverall.name})</span></div>
        <div className="db-kpi"><span className="db-kpi-icon">⚡</span><span className="db-kpi-val">{bestPerf.perf}/10</span><span className="db-kpi-label">최고 성능 ({bestPerf.name})</span></div>
        <div className="db-kpi"><span className="db-kpi-icon">💡</span><span className="db-kpi-val">{bestDx.dx}/10</span><span className="db-kpi-label">최고 DX ({bestDx.name})</span></div>
      </section>

      {/* ── Page Comparison ── */}
      <section className="db-section">
        <h2 className="db-section-title">📄 페이지별 평균 비교</h2>
        <div className="db-page-compare">
          {pageStats.map(ps => {
            const meta = PAGE_META[ps.page];
            return (
              <div key={ps.page} className="db-page-card" style={{ '--pc-color': meta.color }}>
                <div className="db-pc-header">
                  <span className="db-pc-icon">{meta.icon}</span>
                  <span className="db-pc-title">{meta.label}</span>
                  <span className="db-pc-count">{ps.count}개</span>
                </div>
                <div className="db-pc-metrics">
                  <div className="db-pc-metric"><span className="db-pc-ml">성능</span><ScoreBar value={ps.perf} /></div>
                  <div className="db-pc-metric"><span className="db-pc-ml">DX</span><ScoreBar value={ps.dx} /></div>
                  <div className="db-pc-metric"><span className="db-pc-ml">유지보수</span><ScoreBar value={ps.maintain} /></div>
                  <div className="db-pc-metric"><span className="db-pc-ml">종합</span><ScoreBar value={ps.overall} /></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Cross-Page Comparison ── */}
      <section className="db-section">
        <h2 className="db-section-title">🔀 크로스 페이지 비교 (동일 패턴)</h2>
        <p className="db-section-desc">동일한 아키텍처 패턴이 각 페이지에서 어떻게 구현되었는지 비교합니다.</p>
        <div className="db-cross-grid">
          {CROSS_GROUPS.map(g => (
            <div key={g.label} className="db-cross-card">
              <div className="db-cross-header">{g.icon} {g.label} 패턴 비교</div>
              <div className="db-cross-body">
                {g.patterns.map((pageKey, i) => {
                  const p = enriched.find(x => x.page === pageKey && x.name === g.matchNames[i]);
                  if (!p) return null;
                  const meta = PAGE_META[pageKey];
                  return (
                    <div key={pageKey} className="db-cross-row" style={{ '--cr-color': meta.color }}>
                      <div className="db-cross-page">{meta.icon} {meta.label}</div>
                      <div className="db-cross-stats">
                        <span>{p.lines} lines</span>
                        <span>{p.bundle ? `${p.bundle}KB` : '인라인'}</span>
                        <span>Hook {p.hooks}개</span>
                        <span>수동최적화 {p.manualOpt}개</span>
                      </div>
                      <div className="db-cross-scores">
                        <span className="db-mini-score" style={{ background: getScoreColor(p.perf) }}>성능 {p.perf}</span>
                        <span className="db-mini-score" style={{ background: getScoreColor(p.dx) }}>DX {p.dx}</span>
                        <span className="db-mini-score" style={{ background: getScoreColor(p.overall) }}>종합 {p.overall}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bundle Size Chart ── */}
      <section className="db-section">
        <h2 className="db-section-title">📦 번들 크기 랭킹</h2>
        <p className="db-section-desc">/methods, /methods2 패턴의 개별 청크 크기 비교 (인라인 패턴 제외)</p>
        <div className="db-bundle-chart">
          {[...withBundle].sort((a, b) => a.bundle - b.bundle).map((p, i) => {
            const pct = (p.bundle / maxBundle) * 100;
            const meta = PAGE_META[p.page];
            return (
              <div key={`${p.page}-${p.name}`} className="db-bar-row">
                <span className="db-bar-rank">#{i + 1}</span>
                <span className="db-bar-name">{p.icon} {p.name}</span>
                <span className="db-bar-page" style={{ color: meta.color }}>{meta.label}</span>
                <div className="db-bar-track">
                  <div className="db-bar-fill" style={{ width: `${pct}%`, background: meta.color }} />
                </div>
                <span className="db-bar-val">{p.bundle} KB</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Score Comparison by Metric ── */}
      <section className="db-section">
        <h2 className="db-section-title">🎯 카테고리별 점수 분석</h2>
        <div className="db-cat-grid">
          {Object.entries(CATEGORIES).map(([catKey, catMeta]) => {
            const items = enriched.filter(p => p.cat === catKey).sort((a, b) => b.overall - a.overall);
            const avgPerf = items.length ? +(items.reduce((s, p) => s + p.perf, 0) / items.length).toFixed(1) : 0;
            const avgDx = items.length ? +(items.reduce((s, p) => s + p.dx, 0) / items.length).toFixed(1) : 0;
            const avgMaintain = items.length ? +(items.reduce((s, p) => s + p.maintain, 0) / items.length).toFixed(1) : 0;
            const avgManual = items.length ? +(items.reduce((s, p) => s + p.manualOpt, 0) / items.length).toFixed(1) : 0;
            return (
              <div key={catKey} className="db-cat-card" style={{ '--cc-color': catMeta.color }}>
                <div className="db-cc-title">{catMeta.label}</div>
                <div className="db-cc-count">{items.length}개 패턴</div>
                <div className="db-cc-metrics">
                  <div className="db-cc-row"><span>성능</span><ScoreBar value={avgPerf} color={catMeta.color} /></div>
                  <div className="db-cc-row"><span>DX</span><ScoreBar value={avgDx} color={catMeta.color} /></div>
                  <div className="db-cc-row"><span>유지보수</span><ScoreBar value={avgMaintain} color={catMeta.color} /></div>
                </div>
                <div className="db-cc-manual">
                  수동 최적화 평균: <strong>{avgManual}개</strong>
                  {avgManual === 0 && <span className="db-cc-check">✅ 불필요</span>}
                </div>
                <div className="db-cc-top">
                  <span className="db-cc-top-label">Top 3</span>
                  {items.slice(0, 3).map((p, i) => (
                    <div key={p.name + p.page} className="db-cc-top-item">
                      <span className="db-cc-medal">{['🥇','🥈','🥉'][i]}</span>
                      <span>{p.icon} {p.name}</span>
                      <span className="db-cc-top-score">{p.overall}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Full Comparison Table ── */}
      <section className="db-section">
        <h2 className="db-section-title">📋 전체 비교 테이블</h2>
        <div className="db-filters">
          <div className="db-filter-group">
            <span className="db-filter-label">페이지</span>
            {['all', ...Object.keys(PAGE_META)].map(k => (
              <button key={k} className={`db-filter-btn ${filterPage === k ? 'active' : ''}`}
                      onClick={() => setFilterPage(k)}
                      style={k !== 'all' ? { '--fb-color': PAGE_META[k].color } : {}}>
                {k === 'all' ? '전체' : PAGE_META[k].label}
              </button>
            ))}
          </div>
          <div className="db-filter-group">
            <span className="db-filter-label">카테고리</span>
            {['all', ...Object.keys(CATEGORIES)].map(k => (
              <button key={k} className={`db-filter-btn ${filterCat === k ? 'active' : ''}`}
                      onClick={() => setFilterCat(k)}
                      style={k !== 'all' ? { '--fb-color': CATEGORIES[k].color } : {}}>
                {k === 'all' ? '전체' : CATEGORIES[k].label}
              </button>
            ))}
          </div>
        </div>
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>#</th>
                <th>패턴</th>
                <th>페이지</th>
                <th>카테고리</th>
                <th className={`db-th-sort ${sortBy==='lines'?'active':''}`} onClick={()=>setSortBy('lines')}>Lines</th>
                <th className={`db-th-sort ${sortBy==='bundle'?'active':''}`} onClick={()=>setSortBy('bundle')}>번들(KB)</th>
                <th className={`db-th-sort ${sortBy==='perf'?'active':''}`} onClick={()=>setSortBy('perf')}>성능</th>
                <th className={`db-th-sort ${sortBy==='dx'?'active':''}`} onClick={()=>setSortBy('dx')}>DX</th>
                <th className={`db-th-sort ${sortBy==='maintain'?'active':''}`} onClick={()=>setSortBy('maintain')}>유지보수</th>
                <th className={`db-th-sort ${sortBy==='learn'?'active':''}`} onClick={()=>setSortBy('learn')}>학습난이도</th>
                <th>수동최적화</th>
                <th className={`db-th-sort ${sortBy==='overall'?'active':''}`} onClick={()=>setSortBy('overall')}>종합</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr key={`${p.page}-${p.name}`}>
                  <td className="db-td-rank">{i + 1}</td>
                  <td className="db-td-name">{p.icon} {p.name}</td>
                  <td><PageBadge page={p.page} /></td>
                  <td><CatBadge cat={p.cat} /></td>
                  <td>{p.lines}</td>
                  <td>{p.bundle ? p.bundle : <span className="db-inline-tag">인라인</span>}</td>
                  <td><ScoreBar value={p.perf} /></td>
                  <td><ScoreBar value={p.dx} /></td>
                  <td><ScoreBar value={p.maintain} /></td>
                  <td><span className="db-learn-dot" style={{ background: getScoreColor(10 - p.learn) }}>{p.learn}</span></td>
                  <td>{p.manualOpt > 0 ? <span className="db-manual-warn">{p.manualOpt}개</span> : <span className="db-manual-ok">0</span>}</td>
                  <td><span className="db-overall-badge" style={{ background: getScoreColor(p.overall) }}>{p.overall}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Manual Optimization Comparison ── */}
      <section className="db-section">
        <h2 className="db-section-title">🔧 수동 최적화 분석 (useCallback + useMemo)</h2>
        <p className="db-section-desc">React Compiler는 수동 최적화 코드 없이도 동일한 성능을 달성합니다.</p>
        <div className="db-opt-compare">
          <div className="db-opt-card db-opt-manual">
            <div className="db-opt-title">❌ 수동 최적화 (기존 방식)</div>
            <div className="db-opt-example">
              <code>useMemo(() =&gt; expensiveCalc(data), [data])</code>
              <code>useCallback((id) =&gt; handler(id), [deps])</code>
            </div>
            {enriched.filter(p => p.manualOpt > 0).map(p => (
              <div key={`${p.page}-${p.name}`} className="db-opt-item">
                <span>{p.icon} {p.name}</span>
                <span className="db-opt-count">{p.manualOpt}개 호출</span>
                <div className="db-opt-bar">
                  <div className="db-opt-bar-fill manual" style={{ width: `${(p.manualOpt / 18) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="db-opt-card db-opt-compiler">
            <div className="db-opt-title">✅ React Compiler (자동 최적화)</div>
            <div className="db-opt-example">
              <code>const result = expensiveCalc(data);</code>
              <code>const handler = (id) =&gt; doSomething(id);</code>
            </div>
            <div className="db-opt-benefit">
              <span className="db-opt-check">🎯</span>
              <span>컴파일러가 자동으로 메모이제이션 적용</span>
            </div>
            <div className="db-opt-benefit">
              <span className="db-opt-check">🧹</span>
              <span>보일러플레이트 코드 <strong>0개</strong></span>
            </div>
            <div className="db-opt-benefit">
              <span className="db-opt-check">⚡</span>
              <span>동일하거나 더 나은 런타임 성능</span>
            </div>
            <div className="db-opt-benefit">
              <span className="db-opt-check">🛡️</span>
              <span>의존성 배열 실수 방지</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Insights ── */}
      <section className="db-section db-insights-section">
        <h2 className="db-section-title">💡 핵심 인사이트 & 권장사항</h2>
        <div className="db-insights-grid">
          <div className="db-insight-card db-insight-green">
            <div className="db-insight-icon">🏆</div>
            <div className="db-insight-title">최고 종합 점수</div>
            <div className="db-insight-body">
              <strong>{bestOverall.name}</strong> ({PAGE_META[bestOverall.page].label})이(가)
              종합 <strong>{bestOverall.overall}점</strong>으로 1위입니다.
              성능 {bestOverall.perf}/10, DX {bestOverall.dx}/10으로 균형 잡힌 결과를 보입니다.
            </div>
          </div>
          <div className="db-insight-card db-insight-blue">
            <div className="db-insight-icon">🔮</div>
            <div className="db-insight-title">React Compiler 효과</div>
            <div className="db-insight-body">
              Compiler 패턴은 <strong>수동 최적화 0개</strong>로 평균 성능 {pageStats.find(p=>p.page==='methods2')?.perf}/10을 달성합니다.
              기존 수동 최적화(useMemo/useCallback) 대비 DX가 크게 향상됩니다.
            </div>
          </div>
          <div className="db-insight-card db-insight-cyan">
            <div className="db-insight-icon">🪝</div>
            <div className="db-insight-title">초보자 권장</div>
            <div className="db-insight-body">
              <strong>Custom Hooks</strong>와 <strong>MVP</strong> 패턴은 학습 난이도가 가장 낮으면서도 
              높은 DX와 유지보수성을 제공합니다. 입문자에게 가장 적합합니다.
            </div>
          </div>
          <div className="db-insight-card db-insight-orange">
            <div className="db-insight-icon">⚠️</div>
            <div className="db-insight-title">수동 최적화 주의</div>
            <div className="db-insight-body">
              <strong>최적화 패턴</strong>은 18개의 useMemo/useCallback으로 성능은 높지만,
              DX {enriched.find(p=>p.name==='최적화')?.dx}/10으로 유지보수가 어렵습니다. Compiler 사용을 권장합니다.
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="db-footer">
        <p>📌 점수 기준: 성능(30%) + DX(25%) + 유지보수성(25%) + 학습용이성(20%) = 종합점수</p>
        <p>📦 번들 크기: Vite 프로덕션 빌드 기준 (gzip 전) &nbsp;|&nbsp; 🏗️ 인라인 패턴은 메인 번들(324KB)에 포함</p>
      </footer>
    </div>
  );
}
