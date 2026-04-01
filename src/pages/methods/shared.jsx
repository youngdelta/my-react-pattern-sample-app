import { useState, useEffect } from 'react';

/* ── 공통 훅 ── */
export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(null);
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [url]);
  return { data, loading, error };
}

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ── 공통 컴포넌트 ── */
export function PatternDiagram({ nodes }) {
  return (
    <div className="m-diagram">
      {nodes.map((node, i) => (
        <div key={i} className="m-diagram-flow">
          <div className={`m-diagram-node m-diagram-node--${node.color}`}>
            <span className="m-diagram-icon">{node.icon}</span>
            <strong>{node.label}</strong>
            <small>{node.desc}</small>
          </div>
          {i < nodes.length - 1 && <span className="m-diagram-arrow">→</span>}
        </div>
      ))}
    </div>
  );
}

export function ProsCons({ pros, cons }) {
  return (
    <div className="m-pros-cons">
      <div className="m-pros">
        <div className="m-pc-title">✅ 장점</div>
        <ul>{pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
      </div>
      <div className="m-cons">
        <div className="m-pc-title">⚠️ 단점</div>
        <ul>{cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </div>
    </div>
  );
}

export function WhenToUse({ items }) {
  return (
    <div className="m-when">
      <div className="m-when-title">🎯 이럴 때 사용</div>
      <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
    </div>
  );
}

export function DemoLoading() {
  return <div className="m-demo-loading">⏳ 로딩 중...</div>;
}
