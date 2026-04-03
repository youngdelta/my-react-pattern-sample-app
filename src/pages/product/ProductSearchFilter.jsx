import { Select, Input, Button, Card, Space, Row, Col, DatePicker } from 'antd';

const AVAILABILITY_OPTIONS = [
  { label: 'In Stock', value: 'In Stock' },
  { label: 'Low Stock', value: 'Low Stock' },
  { label: 'Out of Stock', value: 'Out of Stock' },
];

function ProductSearchFilter({ filters, categories, brands, onFilterChange, onReset, onSearch }) {
  return (
    <Card title="조회 조건" size="small" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 12]}>
        <Col xs={24} sm={12} md={6}>
          <label className="filter-label">카테고리</label>
          <Select
            placeholder="전체"
            value={filters.category}
            onChange={(v) => onFilterChange('category', v)}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: '100%' }}
            options={categories.map((c) => ({ label: c.name, value: c.slug }))}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <label className="filter-label">상품명</label>
          <Input
            placeholder="상품명 입력"
            value={filters.title}
            onChange={(e) => onFilterChange('title', e.target.value)}
            allowClear
            onPressEnter={onSearch}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <label className="filter-label">브랜드</label>
          <Select
            placeholder="전체"
            value={filters.brand}
            onChange={(v) => onFilterChange('brand', v)}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: '100%' }}
            options={brands.map((b) => ({ label: b, value: b }))}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <label className="filter-label">SKU (상품코드)</label>
          <Input
            placeholder="SKU 입력"
            value={filters.sku}
            onChange={(e) => onFilterChange('sku', e.target.value)}
            allowClear
            onPressEnter={onSearch}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <label className="filter-label">재고상태</label>
          <Select
            placeholder="전체"
            value={filters.availability}
            onChange={(v) => onFilterChange('availability', v)}
            allowClear
            style={{ width: '100%' }}
            options={AVAILABILITY_OPTIONS}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <label className="filter-label">등록일</label>
          <DatePicker.RangePicker
            value={filters.createdRange}
            onChange={(v) => onFilterChange('createdRange', v)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <label className="filter-label">수정일</label>
          <DatePicker.RangePicker
            value={filters.updatedRange}
            onChange={(v) => onFilterChange('updatedRange', v)}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
      <Row justify="end" style={{ marginTop: 12 }}>
        <Space>
          <Button onClick={onReset}>초기화</Button>
          <Button type="primary" onClick={onSearch}>
            조회
          </Button>
        </Space>
      </Row>
    </Card>
  );
}

export default ProductSearchFilter;
