import { useState, useEffect, useCallback } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from './shared';

// Repository 인터페이스 (Data Access Layer)
const TodoRepository = {
  getAll: () => fetch('https://dummyjson.com/todos?limit=6').then((r) => r.json()).then((d) => d.todos),
  toggle: async (todo) => ({ ...todo, completed: !todo.completed }),
  add: async (text) => ({ id: Date.now(), todo: text, completed: false, userId: 1 }),
  remove: async (id) => id,
};

export default function RepositoryTab() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  const addLog = useCallback((msg) =>
    setLog((prev) => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev].slice(0, 6)), []);

  useEffect(() => {
    addLog('📥 Repository.getAll() 호출');
    TodoRepository.getAll().then((data) => {
      setTodos(data);
      setLoading(false);
      addLog(`✅ ${data.length}개 로드 완료`);
    });
  }, [addLog]);

  const handleToggle = async (todo) => {
    addLog(`🔄 Repository.toggle(id: ${todo.id}) 호출`);
    const updated = await TodoRepository.toggle(todo);
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    addLog(`✅ id:${todo.id} → completed: ${updated.completed}`);
  };

  const handleAdd = async () => {
    if (!newTodo.trim()) return;
    addLog(`➕ Repository.add("${newTodo.slice(0, 15)}...") 호출`);
    const item = await TodoRepository.add(newTodo);
    setTodos((prev) => [item, ...prev]);
    setNewTodo('');
    addLog(`✅ 새 할일 추가됨 (id: ${item.id})`);
  };

  const handleRemove = async (id) => {
    addLog(`🗑️ Repository.remove(id: ${id}) 호출`);
    await TodoRepository.remove(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    addLog(`✅ id:${id} 삭제됨`);
  };

  return (
    <div className="method-tab">
      <div className="m-meta-row">
        <span className="m-badge m-badge--gray">일반 패턴</span>
        <span className="m-badge m-badge--gray">Data Access Layer</span>
      </div>
      <p className="m-desc">
        데이터 소스(API, DB, LocalStorage)에 대한 접근을 <strong>Repository 인터페이스</strong>로 추상화합니다.
        비즈니스 로직은 Repository 메서드를 호출하며 실제 데이터 소스를 알지 못합니다.
        데이터 소스를 변경해도 비즈니스 로직은 수정이 필요 없습니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '💼', label: 'Business', desc: '비즈니스 로직', color: 'blue' },
        { icon: '📋', label: 'Repository', desc: '인터페이스 추상화', color: 'active' },
        { icon: '🗄️', label: 'Data Source', desc: 'API / DB / Cache', color: 'green' },
      ]} />

      <div className="m-info-grid">
        <ProsCons
          pros={['데이터 소스 교체 용이', '비즈니스 로직 테스트 가능', '중앙화된 데이터 접근']}
          cons={['작은 앱엔 과도한 추상화', '추가 레이어로 인한 복잡도', '초기 설계 비용 높음']}
        />
        <WhenToUse items={[
          'API 교체 또는 Mock 테스트 필요 시',
          'LocalStorage ↔ API 전환',
          'Clean Architecture 구현 시',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🗄️ TodoRepository: 비즈니스 로직은 Repository만 호출</div>
        <div className="m-repo-layout">
          <div className="m-repo-main">
            <div className="m-input-row">
              <input className="m-input" value={newTodo} placeholder="새 할일..."
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              <button className="m-add-btn" onClick={handleAdd}>추가</button>
            </div>
            {loading ? <DemoLoading /> : (
              <div className="m-todo-list">
                {todos.slice(0, 6).map((t) => (
                  <div key={t.id} className={`m-todo-item ${t.completed ? 'done' : ''}`}>
                    <button className="m-check-btn" onClick={() => handleToggle(t)}>{t.completed ? '✅' : '⬜'}</button>
                    <span className="m-todo-text">{t.todo}</span>
                    <button className="m-del-btn" onClick={() => handleRemove(t.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="m-repo-log">
            <div className="m-log-header">📋 Repository 호출 로그</div>
            {log.map((l, i) => <div key={i} className="m-log-entry">{l}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
