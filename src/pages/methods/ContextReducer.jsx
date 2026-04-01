import { useState, useEffect, useReducer, createContext, useContext } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from './shared';

const TodoCtx = createContext(null);
const useTodoCtx = () => useContext(TodoCtx);

function todoReducer(state, action) {
  switch (action.type) {
    case 'LOAD':   return { todos: action.payload, loading: false };
    case 'TOGGLE': return { ...state, todos: state.todos.map((t) => t.id === action.id ? { ...t, completed: !t.completed } : t) };
    case 'ADD':    return { ...state, todos: [action.payload, ...state.todos] };
    case 'DELETE': return { ...state, todos: state.todos.filter((t) => t.id !== action.id) };
    default: return state;
  }
}

function Stats() {
  const { todos } = useTodoCtx();
  const done = todos.filter((t) => t.completed).length;
  return (
    <div className="m-ctx-stats">
      <span className="m-ctx-stat">전체 {todos.length}</span>
      <span className="m-ctx-stat done">✅ {done}</span>
      <span className="m-ctx-stat todo">⬜ {todos.length - done}</span>
    </div>
  );
}

function AddInput() {
  const { dispatch } = useTodoCtx();
  const [text, setText] = useState('');
  const add = () => {
    if (!text.trim()) return;
    dispatch({ type: 'ADD', payload: { id: Date.now(), todo: text, completed: false } });
    setText('');
  };
  return (
    <div className="m-input-row">
      <input className="m-input" value={text} placeholder="새 할일..." onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
      <button className="m-add-btn" onClick={add}>추가</button>
    </div>
  );
}

function TodoList() {
  const { todos, dispatch } = useTodoCtx();
  return (
    <div className="m-todo-list">
      {todos.slice(0, 7).map((t) => (
        <div key={t.id} className={`m-todo-item ${t.completed ? 'done' : ''}`}>
          <button className="m-check-btn" onClick={() => dispatch({ type: 'TOGGLE', id: t.id })}>{t.completed ? '✅' : '⬜'}</button>
          <span className="m-todo-text">{t.todo}</span>
          <button className="m-del-btn" onClick={() => dispatch({ type: 'DELETE', id: t.id })}>✕</button>
        </div>
      ))}
    </div>
  );
}

export default function ContextReducerTab() {
  const [state, dispatch] = useReducer(todoReducer, { todos: [], loading: true });

  useEffect(() => {
    fetch('https://dummyjson.com/todos?limit=7')
      .then((r) => r.json())
      .then((d) => dispatch({ type: 'LOAD', payload: d.todos }));
  }, []);

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--react">⚛️ React 권장</span>
        <span className="m-badge m-badge--gray">Context + useReducer</span>
      </div>
      <p className="m-desc">
        <code>Context</code>로 상태를 트리 전체에 공유하고, <code>useReducer</code>로 상태 변경 로직을 중앙 관리합니다.
        Props Drilling 없이 어디서나 상태를 읽고 dispatch할 수 있습니다. <strong>Redux의 경량 내장 대안</strong>입니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '🗃️', label: 'useReducer', desc: '상태 & 로직', color: 'react' },
        { icon: '🌐', label: 'Context.Provider', desc: '트리 전체 공유', color: 'active' },
        { icon: '🪝', label: 'useContext', desc: '어디서나 구독', color: 'react' },
        { icon: '📬', label: 'dispatch', desc: 'Action 발행', color: 'orange' },
      ]} />

      <div className="m-info-grid">
        <ProsCons
          pros={['Props Drilling 해결', 'useReducer로 예측 가능한 상태', '외부 라이브러리 불필요']}
          cons={['Context 남발 시 리렌더링 문제', '매우 복잡한 앱엔 Redux 권장', 'Context 분리 설계 필요']}
        />
        <WhenToUse items={[
          '중간 규모 앱의 전역 상태 (테마, 사용자)',
          'Props Drilling이 3단계 이상 깊어질 때',
          '외부 상태 라이브러리 없이 간단히 구현',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🌐 Context.Provider → Stats / AddInput / TodoList 모두 props 없이 구독</div>
        <div className="m-ctx-provider-badge">{'📦 <TodoCtx.Provider value={{ todos, dispatch }}>'}</div>
        <TodoCtx.Provider value={{ todos: state.todos, dispatch }}>
          {state.loading ? <DemoLoading /> : <><Stats /><AddInput /><TodoList /></>}
        </TodoCtx.Provider>
      </div>
    </div>
  );
}
