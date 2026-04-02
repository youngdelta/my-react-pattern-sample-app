# React Compiler 이해 보고서

> 작성일: 2026-04-02  
> 대상: React 개발자  
> 참고: [React 공식 문서](https://react.dev/learn/react-compiler)

---

## 1. React Compiler란?

React Compiler는 React 팀이 개발한 **빌드 타임(build-time) 최적화 도구**입니다. 개발자가 작성한 React 코드를 빌드 시점에 분석하여 **자동으로 메모이제이션(memoization)을 적용**합니다.

핵심 아이디어는 단순합니다:

> **수동으로 `useMemo`, `useCallback`, `React.memo`를 작성하지 않아도, 컴파일러가 자동으로 최적의 메모이제이션을 적용한다.**

React Compiler는 Meta(Facebook, Instagram, Threads, Quest Store)에서 **100,000개 이상의 React 컴포넌트**에 프로덕션 배포되어 검증되었습니다.

---

## 2. 왜 필요한가?

### 2.1 기존 문제점: 수동 메모이제이션의 한계

React는 컴포넌트의 상태가 변경되면 **해당 컴포넌트와 모든 자식 컴포넌트를 다시 렌더링**합니다. 이를 방지하기 위해 개발자들은 수동으로 메모이제이션을 적용해야 했습니다:

```jsx
// ❌ Before: 수동 메모이제이션 (복잡하고 실수하기 쉬움)
import { useMemo, useCallback, memo } from 'react';

const ExpensiveComponent = memo(function ExpensiveComponent({ data, onClick }) {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);

  const handleClick = useCallback((item) => {
    onClick(item.id);
  }, [onClick]);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} onClick={() => handleClick(item)} />
      ))}
    </div>
  );
});
```

**수동 메모이제이션의 문제점:**

| 문제 | 설명 |
|------|------|
| **인지 부담** | 어디에 `useMemo`/`useCallback`을 적용할지 매번 판단 필요 |
| **실수 가능성** | 의존성 배열 누락, 잘못된 메모이제이션 패턴 등 |
| **불완전한 적용** | Meta 조사 결과 PR의 **8%만** 수동 메모이제이션 사용 |
| **생산성 저하** | 메모이제이션 포함 PR은 작성에 **31~46% 더 오래** 걸림 |
| **미묘한 버그** | `() => handleClick(item)` 같은 인라인 함수가 메모이제이션을 무효화 |

### 2.2 React Compiler의 해결 방식

```jsx
// ✅ After: React Compiler 사용 (깔끔하고 자동 최적화)
function ExpensiveComponent({ data, onClick }) {
  const processedData = expensiveProcessing(data);

  const handleClick = (item) => {
    onClick(item.id);
  };

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} onClick={() => handleClick(item)} />
      ))}
    </div>
  );
}
```

컴파일러가 빌드 시 자동으로 최적 메모이제이션을 적용하므로, 개발자는 **비즈니스 로직에만 집중**할 수 있습니다.

---

## 3. 동작 원리

### 3.1 빌드 타임 분석

React Compiler는 **Babel 플러그인**으로 동작합니다. 빌드 시점에 소스 코드를 분석하여:

1. 컴포넌트와 Hook의 **데이터 흐름을 추적**
2. **변경 가능성이 있는 값**을 식별
3. 최적의 **메모이제이션 코드를 자동 삽입**

### 3.2 컴파일된 코드 예시

```jsx
// 원본 코드
export default function MyApp() {
  return <div>Hello World</div>;
}

// 컴파일된 코드
import { c as _c } from "react/compiler-runtime";

export default function MyApp() {
  const $ = _c(1);  // 메모이제이션 캐시 생성
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = <div>Hello World</div>;
    $[0] = t0;  // 캐시에 저장
  } else {
    t0 = $[0];  // 캐시에서 재사용
  }
  return t0;
}
```

### 3.3 두 가지 핵심 최적화

| 최적화 유형 | 설명 |
|------------|------|
| **캐스케이드 리렌더링 방지** | 부모 상태 변경 시 불필요한 자식 컴포넌트 리렌더링 자동 스킵 |
| **비용이 큰 계산 메모이제이션** | 컴포넌트/Hook 내부의 무거운 연산 결과를 자동 캐싱 |

---

## 4. 설치 및 설정

### 4.1 설치

```bash
npm install -D babel-plugin-react-compiler@latest
```

### 4.2 Vite 프로젝트 설정 (본 프로젝트 해당)

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});
```

### 4.3 다른 빌드 도구

| 빌드 도구 | 설정 방식 |
|-----------|----------|
| **Babel** | `babel.config.js`의 plugins 배열에 추가 (가장 먼저 실행되어야 함) |
| **Vite** | `@vitejs/plugin-react`의 babel.plugins에 추가 |
| **Next.js** | v15.3.1+ 에서 swc 기반 지원 |
| **Webpack** | 커뮤니티 로더 사용 |
| **Expo** | Expo 공식 가이드 참조 |
| **Rspack / Rsbuild** | 각 공식 문서 참조 |

### 4.4 React 버전 호환성

```js
// React 17/18 프로젝트의 경우
npm install react-compiler-runtime@latest

// babel 설정
{
  target: '18'  // 또는 '17'
}
```

| React 버전 | 지원 여부 | 추가 필요 패키지 |
|-----------|----------|----------------|
| React 19 | ✅ 기본 지원 | 없음 |
| React 18 | ✅ 지원 | `react-compiler-runtime` |
| React 17 | ✅ 지원 | `react-compiler-runtime` |

---

## 5. 점진적 도입 전략

React Compiler는 **한 번에 전체 프로젝트에 적용하지 않아도** 됩니다. 3가지 점진적 도입 방식을 제공합니다:

### 5.1 디렉토리 기반 도입 (Babel Overrides)

```js
// babel.config.js
module.exports = {
  plugins: [],
  overrides: [
    {
      test: './src/modern/**/*.{js,jsx,ts,tsx}',
      plugins: ['babel-plugin-react-compiler']
    }
  ]
};
```

특정 디렉토리부터 시작하여 점진적으로 범위를 확장합니다.

### 5.2 Opt-in 모드 (`"use memo"` 디렉티브)

```js
// 설정
{ compilationMode: 'annotation' }
```

```jsx
// 컴파일을 원하는 컴포넌트에만 적용
function TodoList({ todos }) {
  "use memo";  // ← 이 컴포넌트만 컴파일됨
  
  const sortedTodos = todos.slice().sort();
  return (
    <ul>
      {sortedTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
```

### 5.3 런타임 Feature Flag (Gating)

```js
// 설정
{
  gating: {
    source: 'ReactCompilerFeatureFlags',
    importSpecifierName: 'isCompilerEnabled',
  }
}
```

A/B 테스트를 통해 컴파일러의 효과를 측정할 수 있습니다.

### 5.4 Opt-out (`"use no memo"` 디렉티브)

문제가 있는 특정 컴포넌트를 컴파일 대상에서 제외:

```jsx
function ProblematicComponent() {
  "use no memo";  // ← 이 컴포넌트는 컴파일 건너뜀
  // ...
}
```

---

## 6. ESLint 통합

React Compiler의 ESLint 플러그인은 **컴파일러 설치 없이도 독립적으로 사용** 가능합니다.

```bash
npm install -D eslint-plugin-react-hooks@latest
```

ESLint 플러그인이 하는 일:

- [Rules of React](https://react.dev/reference/rules) 위반 사항 식별
- 최적화할 수 없는 컴포넌트 표시
- 수정 방법에 대한 도움말 제공

> 💡 **React 팀 권장**: 컴파일러 도입 여부와 관계없이 **ESLint 플러그인은 지금 바로 사용**하세요.

---

## 7. 설정 확인 방법

### 7.1 React DevTools로 확인

컴파일러가 적용된 컴포넌트는 React DevTools에서 **"Memo ✨"** 배지가 표시됩니다:

```
✨ MyComponent    ← 컴파일러에 의해 최적화됨
   ChildComponent
   ✨ AnotherComponent  ← 이것도 최적화됨
```

### 7.2 빌드 출력물 확인

컴파일된 코드에서 `react/compiler-runtime` 임포트와 `_c()` 호출이 보이면 정상 동작 중입니다.

---

## 8. 기존 useMemo/useCallback/React.memo와의 관계

| 상황 | 권장 사항 |
|------|----------|
| **새 코드 작성 시** | 컴파일러에 의존하고, 필요시에만 `useMemo`/`useCallback` 사용 |
| **기존 코드** | 기존 메모이제이션을 유지하거나 신중하게 테스트 후 제거 |
| **Effect 의존성 제어** | `useMemo`/`useCallback`을 이스케이프 해치로 계속 사용 가능 |

> ⚠️ 기존 메모이제이션을 제거하면 컴파일 결과가 달라질 수 있으므로, 제거 전 반드시 테스트하세요.

---

## 9. 본 프로젝트와의 관련성

현재 프로젝트(`my-react-pattern-sample-app`)에서 **Optimization 탭**에 구현한 패턴들과 React Compiler의 관계:

### 9.1 수동 최적화 → 자동 최적화 전환

| 패턴 | 수동 (현재 프로젝트) | React Compiler 적용 시 |
|------|---------------------|----------------------|
| `React.memo` | `memo(ProductCard)` | 자동 적용 → 제거 가능 |
| `useMemo` | `useMemo(() => filter(products), [deps])` | 자동 적용 → 제거 가능 |
| `useCallback` | `useCallback((id) => addToCart(id), [])` | 자동 적용 → 제거 가능 |
| `useTransition` | `startTransition(() => setState(...))` | 별도 최적화 목적 → 유지 필요 |

### 9.2 적용 방법

본 프로젝트는 Vite를 사용하므로, 아래와 같이 간단하게 적용 가능합니다:

```bash
npm install -D babel-plugin-react-compiler@latest
```

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});
```

---

## 10. Before vs After 비교 요약

### Before (수동 메모이제이션)

```jsx
import { useMemo, useCallback, memo } from 'react';

const ProductCard = memo(({ product, onAdd }) => {
  const discount = useMemo(
    () => Math.round(product.price * product.discountPercentage / 100),
    [product.price, product.discountPercentage]
  );

  const handleAdd = useCallback(() => {
    onAdd(product.id);
  }, [onAdd, product.id]);

  return (
    <div>
      <h3>{product.title}</h3>
      <p>할인: ${discount}</p>
      <button onClick={handleAdd}>장바구니 담기</button>
    </div>
  );
});
```

### After (React Compiler)

```jsx
function ProductCard({ product, onAdd }) {
  const discount = Math.round(product.price * product.discountPercentage / 100);

  const handleAdd = () => {
    onAdd(product.id);
  };

  return (
    <div>
      <h3>{product.title}</h3>
      <p>할인: ${discount}</p>
      <button onClick={handleAdd}>장바구니 담기</button>
    </div>
  );
}
```

**코드가 더 간결하고, 읽기 쉽고, 유지보수가 편하며, 성능은 동일하거나 더 좋습니다.**

---

## 11. Rules of React (컴파일러가 요구하는 규칙)

React Compiler가 올바르게 동작하려면 [Rules of React](https://react.dev/reference/rules)를 준수해야 합니다:

| 규칙 | 설명 |
|------|------|
| **순수 렌더링** | 렌더링 중 Side Effect 없어야 함 |
| **Props/State 불변성** | Props와 State를 직접 수정하지 않아야 함 |
| **Hook 규칙 준수** | Hook은 컴포넌트/Hook 최상위에서만 호출 |
| **값의 안정성** | `useRef`의 `.current`를 렌더링 중 읽지 않아야 함 |

> 이 규칙들은 React Compiler 이전에도 React의 기본 규칙이었습니다. 컴파일러는 이 규칙을 **더 엄격하게 검증**합니다.

---

## 12. 주요 설정 옵션 레퍼런스

```js
// babel-plugin-react-compiler 전체 옵션
{
  // 컴파일 모드: 'all' | 'annotation'
  compilationMode: 'all',

  // React 버전: '17' | '18' | '19'
  target: '19',

  // 에러 임계값: 'none' | 'critical_errors'
  // 'none': 에러 컴포넌트는 건너뛰고 빌드 계속
  // 'critical_errors': 빌드 실패
  panicThreshold: 'none',

  // 로깅
  logger: {
    logEvent(filename, event) {
      if (event.kind === 'CompileSuccess') {
        console.log('Compiled:', filename);
      }
    }
  },

  // Feature Flag (A/B 테스트)
  gating: {
    source: 'my-feature-flags',
    importSpecifierName: 'isCompilerEnabled',
  }
}
```

---

## 13. 릴리스 로드맵

| 단계 | 상태 | 설명 |
|------|------|------|
| **Experimental** | ✅ 완료 | React Conf 2024에서 공개 |
| **Public Beta** | ✅ 완료 | 2024년 10월 공개 |
| **RC (Release Candidate)** | ✅ 완료 | 대부분의 앱/라이브러리에서 정상 작동 확인 |
| **Stable (GA)** | ✅ 출시 | 정식 안정 버전 출시 |

> React Compiler는 현재 **안정 버전(Stable)으로 출시**되어 프로덕션에서 사용 가능합니다.

---

## 14. 결론

### React Compiler의 핵심 가치

```
┌─────────────────────────────────────────────────────────┐
│                    React Compiler                        │
│                                                          │
│   🎯 자동 메모이제이션 → 수동 최적화 코드 제거          │
│   📝 더 깔끔한 코드 → 유지보수성 향상                   │
│   ⚡ 성능 최적화 → 100% 코드에 메모이제이션 적용        │
│   🧑‍💻 개발 생산성 → 메모이제이션 고민 시간 절약       │
│   🔧 점진적 도입 → 기존 프로젝트에 안전하게 적용        │
│   📦 라이브러리 지원 → 라이브러리 코드도 사전 컴파일    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

React Compiler는 React 개발의 **패러다임 전환**입니다. 기존에 개발자가 수동으로 해야 했던 성능 최적화를 컴파일러가 자동으로 처리함으로써, 개발자는 **비즈니스 로직과 사용자 경험에 집중**할 수 있게 됩니다.

---

## 참고 자료

- [React Compiler 공식 문서](https://react.dev/learn/react-compiler)
- [React Compiler 소개](https://react.dev/learn/react-compiler/introduction)
- [설치 가이드](https://react.dev/learn/react-compiler/installation)
- [점진적 도입](https://react.dev/learn/react-compiler/incremental-adoption)
- [설정 레퍼런스](https://react.dev/reference/react-compiler/configuration)
- [React Compiler Beta 발표 블로그](https://react.dev/blog/2024/10/21/react-compiler-beta-release)
- [React Compiler Working Group](https://github.com/reactwg/react-compiler)
- [React Compiler Playground](https://playground.react.dev)
