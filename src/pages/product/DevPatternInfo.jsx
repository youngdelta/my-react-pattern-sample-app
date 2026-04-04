import { useState } from 'react';
import { Card, Collapse, Tag, Tabs, Typography } from 'antd';
import { CodeOutlined, AppstoreOutlined, ApiOutlined, FilterOutlined, SkinOutlined, PartitionOutlined, UnorderedListOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import PatternDiagram from './PatternDiagram';

const { Text } = Typography;

const PATTERNS = [
  {
    key: 'custom-hooks',
    icon: <ApiOutlined />,
    tag: 'Custom Hooks',
    tagColor: 'blue',
    title: '커스텀 훅 패턴',
    description:
      'useProducts()와 useProductFilter() 커스텀 훅으로 데이터 fetch, 상태 관리, 필터링 로직을 UI에서 완전히 분리했습니다. ' +
      '컴포넌트는 순수하게 렌더링만 담당하며, 비즈니스 로직의 재사용성과 테스트 용이성이 높아집니다.',
    file: 'useProductData.js',
  },
  {
    key: 'container-presentational',
    icon: <AppstoreOutlined />,
    tag: 'Container / Presentational',
    tagColor: 'green',
    title: '컨테이너 / 프레젠테이셔널 패턴',
    description:
      'ProductMngtPage(컨테이너)가 상태와 로직을 관리하고, ProductSearchFilter와 ProductResultTable(프레젠테이셔널)은 ' +
      'props를 통해 데이터를 전달받아 UI만 렌더링합니다. 관심사 분리(SoC)를 통해 각 컴포넌트의 역할이 명확해집니다.',
    file: 'ProductMngtPage.jsx → ProductSearchFilter.jsx, ProductResultTable.jsx',
  },
  {
    key: 'derived-state',
    icon: <FilterOutlined />,
    tag: 'Derived State (useMemo)',
    tagColor: 'purple',
    title: '파생 상태 패턴',
    description:
      'filteredProducts는 별도의 상태가 아닌 useMemo로 계산된 파생 상태입니다. ' +
      '필터 조건이 변경되면 자동으로 재계산되어 실시간 필터링이 구현됩니다. ' +
      '불필요한 상태 동기화 문제를 방지하고 Single Source of Truth 원칙을 유지합니다.',
    file: 'useProductData.js → useProductFilter()',
  },
  {
    key: 'props-callback',
    icon: <CodeOutlined />,
    tag: 'Props & Callback',
    tagColor: 'orange',
    title: '단방향 데이터 흐름 (Props-down, Events-up)',
    description:
      '부모(ProductMngtPage)에서 자식으로 데이터를 props로 내려주고, 자식에서 부모로는 콜백 함수(onFilterChange, onTitleClick)를 통해 ' +
      '이벤트를 전달합니다. React의 단방향 데이터 흐름 원칙을 준수하여 데이터 흐름을 예측 가능하게 합니다.',
    file: 'ProductMngtPage.jsx → props 전달 구조',
  },
  {
    key: 'theme-provider',
    icon: <SkinOutlined />,
    tag: 'Theme Provider',
    tagColor: 'magenta',
    title: '테마 프로바이더 패턴',
    description:
      'antd ConfigProvider를 활용하여 다크/라이트 테마를 전역 상태(Zustand)와 연동합니다. ' +
      '하위 모든 antd 컴포넌트에 테마가 자동 적용되며, Provider 패턴으로 props drilling 없이 테마를 전파합니다.',
    file: 'ProductMngtPage.jsx → ConfigProvider',
  },
];

function DevPatternInfo() {
  const [open, setOpen] = useState(false);

  const collapseItems = PATTERNS.map((p) => ({
    key: p.key,
    label: (
      <span>
        {p.icon} <Tag color={p.tagColor} style={{ marginLeft: 8 }}>{p.tag}</Tag> <Text strong>{p.title}</Text>
      </span>
    ),
    children: (
      <div>
        <p style={{ margin: '0 0 8px', lineHeight: 1.7 }}>{p.description}</p>
        <Text type="secondary" style={{ fontSize: '0.85rem' }}>📂 관련 파일: {p.file}</Text>
      </div>
    ),
  }));

  const tabItems = [
    {
      key: 'diagram',
      label: <span><PartitionOutlined /> 아키텍처 다이어그램</span>,
      children: <PatternDiagram />,
    },
    {
      key: 'details',
      label: <span><UnorderedListOutlined /> 패턴 상세 설명</span>,
      children: (
        <Collapse
          items={collapseItems}
          bordered={false}
          size="small"
          accordion
          defaultActiveKey={[]}
          expandIconPosition="end"
        />
      ),
    },
  ];

  return (
    <Card
      title="🧩 적용된 개발 패턴"
      size="small"
      style={{ marginBottom: 16, cursor: 'pointer' }}
      extra={
        <a onClick={() => setOpen((v) => !v)}>
          {open ? <UpOutlined /> : <DownOutlined />} {open ? '접기' : '펼치기'}
        </a>
      }
      onHeaderClick={() => setOpen((v) => !v)}
    >
      {open && <Tabs items={tabItems} defaultActiveKey="diagram" size="small" />}
    </Card>
  );
}

export default DevPatternInfo;
