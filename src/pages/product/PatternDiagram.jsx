import { Tag, Typography } from 'antd';

const { Text } = Typography;

const boxBase = {
  borderRadius: 8,
  padding: '10px 14px',
  textAlign: 'center',
  fontSize: '0.82rem',
  fontWeight: 600,
  position: 'relative',
};

const tagStyle = { fontSize: '0.7rem', marginTop: 4 };

function Arrow({ label, direction = 'down', color = '#8b5cf6', dashed = false }) {
  if (direction === 'down') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0' }}>
        <div style={{
          width: 2, height: 20,
          background: color,
          borderLeft: dashed ? `2px dashed ${color}` : 'none',
          backgroundColor: dashed ? 'transparent' : color,
        }} />
        {label && <Text style={{ fontSize: '0.7rem', color }} italic>{label}</Text>}
        <div style={{
          width: 0, height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `8px solid ${color}`,
        }} />
      </div>
    );
  }
  if (direction === 'up') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0' }}>
        <div style={{
          width: 0, height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: `8px solid ${color}`,
        }} />
        {label && <Text style={{ fontSize: '0.7rem', color }} italic>{label}</Text>}
        <div style={{
          width: 2, height: 20,
          background: dashed ? 'transparent' : color,
          borderLeft: dashed ? `2px dashed ${color}` : 'none',
        }} />
      </div>
    );
  }
  return null;
}

function PatternDiagram() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 600, padding: '12px 0' }}>
        {/* Layer 1: External */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 4 }}>
          <div style={{
            ...boxBase,
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            color: '#78350f',
            border: '2px solid #f59e0b',
            minWidth: 180,
          }}>
            🌐 DummyJSON API
            <div><Tag color="gold" style={tagStyle}>외부 데이터 소스</Tag></div>
          </div>
          <div style={{
            ...boxBase,
            background: 'linear-gradient(135deg, #f472b6, #ec4899)',
            color: '#831843',
            border: '2px solid #ec4899',
            minWidth: 180,
          }}>
            🏪 Zustand (lottoStore)
            <div><Tag color="magenta" style={tagStyle}>전역 상태 — isDarkMode</Tag></div>
          </div>
        </div>

        {/* Arrows down */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 120 }}>
          <Arrow label="fetch" color="#f59e0b" />
          <Arrow label="isDarkMode" color="#ec4899" />
        </div>

        {/* Layer 2: Custom Hooks */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 4 }}>
          <div style={{
            ...boxBase,
            background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
            color: '#1e3a5f',
            border: '2px solid #3b82f6',
            minWidth: 180,
          }}>
            🪝 useProducts()
            <div><Tag color="blue" style={tagStyle}>Custom Hook — 데이터 fetch</Tag></div>
          </div>
          <div style={{
            ...boxBase,
            background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
            color: '#2e1065',
            border: '2px solid #8b5cf6',
            minWidth: 180,
          }}>
            🪝 useProductFilter()
            <div><Tag color="purple" style={tagStyle}>Custom Hook — 필터 + useMemo</Tag></div>
          </div>
        </div>

        {/* Arrows to Container */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Arrow label="allProducts, categories, brands" color="#3b82f6" />
        </div>

        {/* Layer 3: Container */}
        <div style={{
          border: '2px dashed #10b981',
          borderRadius: 12,
          padding: 16,
          margin: '0 auto',
          maxWidth: 560,
          background: 'rgba(16, 185, 129, 0.05)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{
              ...boxBase,
              display: 'inline-block',
              background: 'linear-gradient(135deg, #34d399, #10b981)',
              color: '#064e3b',
              border: '2px solid #10b981',
              minWidth: 280,
            }}>
              📋 ProductMngtPage
              <div><Tag color="green" style={tagStyle}>Container — 상태 관리 + 조합</Tag></div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 40,
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: '4px 0',
          }}>
            <span>ConfigProvider 🎨</span>
          </div>

          {/* Arrows to Presentational */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 80 }}>
            <div style={{ textAlign: 'center' }}>
              <Arrow label="props ↓" color="#10b981" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <Arrow label="props ↓" color="#10b981" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <Arrow label="props ↓" color="#10b981" />
            </div>
          </div>

          {/* Layer 4: Presentational */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{
              ...boxBase,
              background: 'linear-gradient(135deg, #fdba74, #fb923c)',
              color: '#7c2d12',
              border: '2px solid #fb923c',
              minWidth: 150,
              flex: 1,
            }}>
              🔍 ProductSearchFilter
              <div><Tag color="orange" style={tagStyle}>Presentational</Tag></div>
            </div>
            <div style={{
              ...boxBase,
              background: 'linear-gradient(135deg, #fdba74, #fb923c)',
              color: '#7c2d12',
              border: '2px solid #fb923c',
              minWidth: 150,
              flex: 1,
            }}>
              📊 ProductResultTable
              <div><Tag color="orange" style={tagStyle}>Presentational</Tag></div>
            </div>
            <div style={{
              ...boxBase,
              background: 'linear-gradient(135deg, #fdba74, #fb923c)',
              color: '#7c2d12',
              border: '2px solid #fb923c',
              minWidth: 130,
              flex: 1,
            }}>
              🪟 ProductModal
              <div><Tag color="orange" style={tagStyle}>Presentational</Tag></div>
            </div>
          </div>

          {/* Callback arrows up */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 80, marginTop: 4 }}>
            <Arrow label="onFilterChange ↑" direction="up" color="#f97316" dashed />
            <Arrow label="onTitleClick ↑" direction="up" color="#f97316" dashed />
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          marginTop: 16,
          flexWrap: 'wrap',
          fontSize: '0.75rem',
        }}>
          <Tag color="blue">🪝 Custom Hook</Tag>
          <Tag color="green">📦 Container</Tag>
          <Tag color="orange">🖼️ Presentational</Tag>
          <Tag color="purple">🧠 Derived State</Tag>
          <Tag color="magenta">🎨 Theme Provider</Tag>
          <Tag color="gold">🌐 External API</Tag>
        </div>

        {/* Data flow legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginTop: 8,
          fontSize: '0.75rem',
          color: '#6b7280',
        }}>
          <span>━━ Props (데이터 전달)</span>
          <span>┈┈ Callback (이벤트 전달)</span>
        </div>
      </div>
    </div>
  );
}

export default PatternDiagram;
