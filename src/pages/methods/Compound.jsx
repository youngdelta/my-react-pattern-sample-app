import { useState, useEffect, createContext, useContext } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from './shared';

const AccordionCtx = createContext(null);

function Accordion({ children, defaultOpen = null }) {
  const [openId, setOpenId] = useState(defaultOpen);
  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));
  return (
    <AccordionCtx.Provider value={{ openId, toggle }}>
      <div className="m-accordion">{children}</div>
    </AccordionCtx.Provider>
  );
}

function AccordionItem({ id, children }) {
  const { openId } = useContext(AccordionCtx);
  return <div className={`m-acc-item ${openId === id ? 'open' : ''}`}>{children}</div>;
}

function AccordionHeader({ id, children }) {
  const { openId, toggle } = useContext(AccordionCtx);
  return (
    <button className={`m-acc-header ${openId === id ? 'open' : ''}`} onClick={() => toggle(id)}>
      <span>{children}</span>
      <span className="m-acc-arrow">{openId === id ? '▲' : '▼'}</span>
    </button>
  );
}

function AccordionBody({ id, children }) {
  const { openId } = useContext(AccordionCtx);
  return openId === id ? <div className="m-acc-body">{children}</div> : null;
}

Accordion.Item   = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Body   = AccordionBody;

export default function CompoundTab() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://dummyjson.com/recipes?limit=4')
      .then((r) => r.json())
      .then((d) => { setRecipes(d.recipes); setLoading(false); });
  }, []);

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--react">⚛️ React 권장</span>
        <span className="m-badge m-badge--gray">컴포넌트 합성</span>
      </div>
      <p className="m-desc">
        부모 컴포넌트가 Context로 내부 상태를 공유하고, 자식 컴포넌트들이 암묵적으로 그 상태에 접근합니다.
        <code>Accordion.Item</code>, <code>Accordion.Header</code>처럼 <strong>점 표기법</strong>으로
        표현적인 API를 제공합니다. Headless UI, Radix UI가 이 패턴을 사용합니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '🗃️', label: 'Accordion', desc: '상태 소유 + Provider', color: 'react' },
        { icon: '📦', label: '.Item', desc: '논리 그룹', color: 'blue' },
        { icon: '🔤', label: '.Header', desc: 'toggle 트리거', color: 'green' },
        { icon: '📄', label: '.Body', desc: '조건부 콘텐츠', color: 'purple' },
      ]} />

      <div className="m-info-grid">
        <ProsCons
          pros={['유연하고 표현적인 API', '내부 구현 캡슐화', '자유로운 컴포넌트 구성', 'props 드릴링 없음']}
          cons={['초기 구현 복잡', 'Context 남용 시 성능 영향', '사용법 문서화 필요']}
        />
        <WhenToUse items={[
          'Dropdown, Modal, Tabs, Accordion 등 복합 UI',
          '내부 상태를 외부에 노출하지 않을 때',
          'Radix UI / Headless UI 스타일 라이브러리 설계',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🧩 Accordion.Item / .Header / .Body — 점 표기법 컴포넌트 API</div>
        {loading ? <DemoLoading /> : (
          <Accordion defaultOpen={`r-${recipes[0]?.id}`}>
            {recipes.map((r) => (
              <Accordion.Item key={r.id} id={`r-${r.id}`}>
                <Accordion.Header id={`r-${r.id}`}>
                  🍽️ {r.name} &nbsp;<span className="m-acc-meta">{r.cuisine} · ⏱{r.prepTimeMinutes + r.cookTimeMinutes}분 · ⭐{r.rating}</span>
                </Accordion.Header>
                <Accordion.Body id={`r-${r.id}`}>
                  <div className="m-acc-recipe">
                    <div><strong>🥗 재료</strong><ul>{r.ingredients?.slice(0, 4).map((ing, i) => <li key={i}>{ing}</li>)}</ul></div>
                    <div><strong>👨‍🍳 조리법</strong><ol>{r.instructions?.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}</ol></div>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
