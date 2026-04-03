import { useState, useEffect, useMemo } from 'react';
import { Table, Select, Input, Button, Card, Space, Image, Tag, Row, Col, ConfigProvider, theme } from 'antd';
import useLottoStore from '../store/lottoStore';
import './ProductsPage.css';

function ProductsPage() {
  const { isDarkMode } = useLottoStore();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 조회 조건 (입력 중)
  const [selCategory, setSelCategory] = useState(undefined);
  const [inputTitle, setInputTitle] = useState('');
  const [selBrand, setSelBrand] = useState(undefined);
  const [inputSku, setInputSku] = useState('');

  // 적용된 조회 조건
  const [appliedFilter, setAppliedFilter] = useState({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('https://dummyjson.com/products?limit=0').then((r) => r.json()),
      fetch('https://dummyjson.com/products/categories').then((r) => r.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setAllProducts(productsData.products);
        setCategories(categoriesData);
      })
      .finally(() => setLoading(false));
  }, []);

  const brands = useMemo(() => {
    return [...new Set(allProducts.map((p) => p.brand).filter(Boolean))].sort();
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const { category, title, brand, sku } = appliedFilter;
    return allProducts.filter((p) => {
      if (category && p.category !== category) return false;
      if (title && !p.title.toLowerCase().includes(title.toLowerCase())) return false;
      if (brand && p.brand !== brand) return false;
      if (sku && !(p.sku || '').toLowerCase().includes(sku.toLowerCase())) return false;
      return true;
    });
  }, [allProducts, appliedFilter]);

  const handleSearch = () => {
    setAppliedFilter({
      category: selCategory,
      title: inputTitle,
      brand: selBrand,
      sku: inputSku,
    });
  };

  const handleReset = () => {
    setSelCategory(undefined);
    setInputTitle('');
    setSelBrand(undefined);
    setInputSku('');
    setAppliedFilter({});
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: '이미지',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 80,
      render: (src) => (
        <Image
          src={src}
          width={50}
          height={50}
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: '상품명',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (cat) => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: '가격',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      sorter: (a, b) => a.price - b.price,
      render: (v) => `$${v.toFixed(2)}`,
    },
    {
      title: '평점',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      sorter: (a, b) => a.rating - b.rating,
      render: (v) => (
        <span>
          <span style={{ color: '#faad14' }}>★</span> {v.toFixed(1)}
        </span>
      ),
    },
    {
      title: '재고',
      dataIndex: 'stock',
      key: 'stock',
      width: 70,
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: '브랜드',
      dataIndex: 'brand',
      key: 'brand',
      width: 120,
      render: (v) => v || '-',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 110,
    },
    {
      title: '반품정책',
      dataIndex: 'returnPolicy',
      key: 'returnPolicy',
      width: 160,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className="products-page">
        <h1 className="products-page-title">📋 상품관리</h1>

        {/* 조회 조건 */}
        <Card title="조회 조건" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 12]}>
            <Col xs={24} sm={12} md={6}>
              <label className="filter-label">카테고리</label>
              <Select
                placeholder="전체"
                value={selCategory}
                onChange={setSelCategory}
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
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                allowClear
                onPressEnter={handleSearch}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <label className="filter-label">브랜드</label>
              <Select
                placeholder="전체"
                value={selBrand}
                onChange={setSelBrand}
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
                value={inputSku}
                onChange={(e) => setInputSku(e.target.value)}
                allowClear
                onPressEnter={handleSearch}
              />
            </Col>
          </Row>
          <Row justify="end" style={{ marginTop: 12 }}>
            <Space>
              <Button onClick={handleReset}>초기화</Button>
              <Button type="primary" onClick={handleSearch}>
                조회
              </Button>
            </Space>
          </Row>
        </Card>

        {/* 조회 결과 */}
        <Card title={`조회 결과 (${filteredProducts.length}건)`} size="small">
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `총 ${total}건`,
            }}
            scroll={{ x: 1200 }}
            size="middle"
          />
        </Card>
      </div>
    </ConfigProvider>
  );
}

export default ProductsPage;
