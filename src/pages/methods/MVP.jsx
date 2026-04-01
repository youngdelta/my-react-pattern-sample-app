import { useState, useEffect } from 'react';
import { PatternDiagram, ProsCons, WhenToUse, DemoLoading } from './shared';

// Presenter: 순수 함수로 데이터 가공
const RecipePresenter = {
  formatTime: (prep, cook) => `${prep + cook}분 (준비 ${prep}분 + 조리 ${cook}분)`,
  formatDifficulty: (level) => ({ Easy: '🟢 쉬움', Medium: '🟡 보통', Hard: '🔴 어려움' }[level] ?? level),
  formatCalories: (cal) => cal > 400 ? `🔥 ${cal}kcal (고칼로리)` : `🥗 ${cal}kcal (저칼로리)`,
  formatRating: (rating) => '⭐'.repeat(Math.round(rating)) + ` (${rating})`,
};

export default function MVPTab() {
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
        <span className="m-badge m-badge--green">일반 패턴</span>
        <span className="m-badge m-badge--gray">Model · View · Presenter</span>
      </div>
      <p className="m-desc">
        Presenter가 View와 Model 사이에서 <strong>모든 UI 로직</strong>을 담당합니다.
        View는 수동적 인터페이스(화면만 표시), Presenter가 데이터를 가공해 View에 전달합니다.
        MVC보다 View와 Model의 결합도가 낮습니다.
      </p>

      <PatternDiagram nodes={[
        { icon: '📦', label: 'Model', desc: '원시 데이터', color: 'green' },
        { icon: '🎯', label: 'Presenter', desc: '모든 UI 로직', color: 'active' },
        { icon: '🖼️', label: 'View', desc: '수동 렌더링', color: 'purple' },
      ]} />

      <div className="m-info-grid">
        <ProsCons
          pros={['View와 Model 완전 분리', 'Presenter 독립 테스트 가능', 'View 교체가 쉬움']}
          cons={['Presenter가 비대해지기 쉬움', 'View-Presenter 1:1 강한 연결', '보일러플레이트 코드 많음']}
        />
        <WhenToUse items={[
          'Android MVP 패턴',
          'UI 로직 테스트가 중요한 경우',
          'View를 쉽게 교체해야 하는 경우',
        ]} />
      </div>

      <div className="m-demo-box">
        <div className="m-demo-title">🟢 Presenter(RecipePresenter)가 데이터를 가공 → View는 표시만</div>
        {loading ? <DemoLoading /> : (
          <div className="m-recipe-grid">
            {recipes.map((r) => (
              <div key={r.id} className="m-recipe-card">
                <img src={r.image} alt={r.name} />
                <div className="m-recipe-info">
                  <p className="m-recipe-name">{r.name}</p>
                  <span className="m-recipe-tag">{RecipePresenter.formatDifficulty(r.difficulty)}</span>
                  <span className="m-recipe-tag">{RecipePresenter.formatTime(r.prepTimeMinutes, r.cookTimeMinutes)}</span>
                  <span className="m-recipe-tag">{RecipePresenter.formatCalories(r.caloriesPerServing)}</span>
                  <span className="m-recipe-tag">{RecipePresenter.formatRating(r.rating)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
