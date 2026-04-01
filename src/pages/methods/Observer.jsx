import { useState, useEffect, useRef } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from './shared';

export default function ObserverTab() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState({ A: true, B: true, C: true });
  const [logs, setLogs] = useState([]);
  const timerRef = useRef(null);

  const fetchQuote = () => {
    const id = Math.floor(Math.random() * 100) + 1;
    fetch(`https://dummyjson.com/quotes/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setQuote(d);
        setLoading(false);
        setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Subject → 새 명언 #${d.id} 발행`, ...prev].slice(0, 6));
      });
  };

  useEffect(() => {
    fetchQuote();
    timerRef.current = setInterval(fetchQuote, 3000);
    return () => clearInterval(timerRef.current);
  }, []);

  const toggleSubscribe = (key) =>
    setSubscribed((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setLogs((l) => [`[${new Date().toLocaleTimeString()}] Observer ${key}: ${next[key] ? '구독' : '구독 해제'}`, ...l].slice(0, 6));
      return next;
    });

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--teal">일반 패턴</span>
        <span className="m-badge m-badge--gray">Subject · Observer</span>
      </div>
      <p className="m-desc">
        Subject(발행자)의 상태 변화를 여러 Observer(구독자)에게 자동으로 알립니다.
        Observer는 언제든 구독/해제할 수 있으며 Subject는 Observer를 알지 못합니다.
        React의 <code>useEffect</code> + EventEmitter, RxJS, WebSocket 등이 이 패턴을 사용합니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '📡', label: 'Subject', desc: '상태 변화 발행', color: 'teal' },
        { icon: '📢', label: 'notify()', desc: '구독자에게 알림', color: 'active' },
        { icon: '👁', label: 'Observer A/B/C', desc: '구독 & 반응', color: 'purple' },
      ]} />

      <div className="m-info-grid">
        <ProsCons
          pros={['느슨한 결합 (Subject ↔ Observer)', '동적 구독/해제 가능', '이벤트 기반 시스템에 적합']}
          cons={['Observer 순서 예측 어려움', '메모리 누수 위험 (해제 필수)', '디버깅이 어려울 수 있음']}
        />
        <WhenToUse items={[
          'DOM 이벤트, CustomEvent',
          'RxJS Observable, WebSocket',
          'Redux/Zustand 스토어 구독',
          '실시간 데이터 스트림 처리',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">📡 Subject: 3초마다 새 명언 발행 · Observer: 구독/해제 가능</div>
        <div className="m-observer-layout">
          <div className="m-subject-panel">
            <div className="m-subject-label">📡 Subject (3초 자동 갱신)</div>
            {loading ? <DemoLoading /> : quote && (
              <div className="m-quote-box">
                <p className="m-quote-text">"{quote.quote}"</p>
                <p className="m-quote-author">— {quote.author}</p>
              </div>
            )}
            <div className="m-event-log">
              <div className="m-log-header">이벤트 로그</div>
              {logs.map((l, i) => <div key={i} className="m-log-entry">{l}</div>)}
            </div>
          </div>
          <div className="m-observers-panel">
            {['A', 'B', 'C'].map((key) => (
              <div key={key} className={`m-observer-card ${subscribed[key] ? 'subscribed' : 'unsubscribed'}`}>
                <div className="m-observer-header">
                  <span>👁 Observer {key}</span>
                  <button className="m-sub-btn" onClick={() => toggleSubscribe(key)}>
                    {subscribed[key] ? '구독 해제' : '구독'}
                  </button>
                </div>
                <div className="m-observer-body">
                  {subscribed[key]
                    ? (quote ? <p className="m-observer-content">{quote.quote.slice(0, 60)}...</p> : <DemoLoading />)
                    : <p className="m-observer-muted">🔕 구독 해제됨</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
