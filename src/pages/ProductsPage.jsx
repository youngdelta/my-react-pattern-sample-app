import { useState, useEffect, useMemo } from 'react';
import { Table, Select, Input, Button, Card, Space, Image, Tag, Row, Col, ConfigProvider, theme, DatePicker, Popover } from 'antd';
import useLottoStore from '../store/lottoStore';
import ProductModal from '../components/ProductModal';
import './ProductsPage.css';

function ProductsPage() {
  const { isDarkMode } = useLottoStore();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 조회 조건
  const [selCategory, setSelCategory] = useState(undefined);
  const [inputTitle, setInputTitle] = useState('');
  const [selBrand, setSelBrand] = useState(undefined);
  const [inputSku, setInputSku] = useState('');
  const [selAvailability, setSelAvailability] = useState(undefined);
  const [createdRange, setCreatedRange] = useState(null);
  const [updatedRange, setUpdatedRange] = useState(null);

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
    return allProducts.filter((p) => {
      if (selCategory && p.category !== selCategory) return false;
      if (inputTitle && !p.title.toLowerCase().includes(inputTitle.toLowerCase())) return false;
      if (selBrand && p.brand !== selBrand) return false;
      if (inputSku && !(p.sku || '').toLowerCase().includes(inputSku.toLowerCase())) return false;
      if (selAvailability && p.availabilityStatus !== selAvailability) return false;
      if (createdRange) {
        const created = new Date(p.meta?.createdAt);
        if (created < createdRange[0].startOf('day') || created > createdRange[1].endOf('day')) return false;
      }
      if (updatedRange) {
        const updated = new Date(p.meta?.updatedAt);
        if (updated < updatedRange[0].startOf('day') || updated > updatedRange[1].endOf('day')) return false;
      }
      return true;
    });
  }, [allProducts, selCategory, inputTitle, selBrand, inputSku, selAvailability, createdRange, updatedRange]);

  const handleSearch = () => {
    // 현재 조건으로 이미 실시간 필터링 중이므로 추가 동작 불필요
  };

  const handleReset = () => {
    setSelCategory(undefined);
    setInputTitle('');
    setSelBrand(undefined);
    setInputSku('');
    setSelAvailability(undefined);
    setCreatedRange(null);
    setUpdatedRange(null);
  };

  // 상세 모달
  const [selectedProductId, setSelectedProductId] = useState(null);

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
        <Popover
          content={<img src={src} alt="" style={{ width: 250, borderRadius: 8 }} />}
          trigger="hover"
          placement="right"
        >
          <img
            src={src}
            alt=""
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
          />
        </Popover>
      ),
    },
    {
      title: '상품명',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text, record) => (
        <a onClick={() => setSelectedProductId(record.id)}>{text}</a>
      ),
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
      title: '할인율',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      width: 80,
      sorter: (a, b) => a.discountPercentage - b.discountPercentage,
      render: (v) =>
        v > 0 ? <Tag color="red">-{Math.round(v)}%</Tag> : '-',
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
      title: '재고상태',
      dataIndex: 'availabilityStatus',
      key: 'availabilityStatus',
      width: 110,
      render: (v) => {
        const colorMap = { 'In Stock': 'green', 'Low Stock': 'orange', 'Out of Stock': 'red' };
        return <Tag color={colorMap[v] || 'default'}>{v}</Tag>;
      },
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
    {
      title: '배송정보',
      dataIndex: 'shippingInformation',
      key: 'shippingInformation',
      width: 150,
    },
    {
      title: '보증정보',
      dataIndex: 'warrantyInformation',
      key: 'warrantyInformation',
      width: 140,
    },
    {
      title: '최소주문',
      dataIndex: 'minimumOrderQuantity',
      key: 'minimumOrderQuantity',
      width: 90,
      sorter: (a, b) => a.minimumOrderQuantity - b.minimumOrderQuantity,
      render: (v) => `${v}개`,
    },
    {
      title: '등록일',
      dataIndex: ['meta', 'createdAt'],
      key: 'createdAt',
      width: 120,
      sorter: (a, b) => new Date(a.meta?.createdAt) - new Date(b.meta?.createdAt),
      render: (v) => v ? new Date(v).toLocaleDateString('ko-KR') : '-',
    },
    {
      title: '수정일',
      dataIndex: ['meta', 'updatedAt'],
      key: 'updatedAt',
      width: 120,
      sorter: (a, b) => new Date(a.meta?.updatedAt) - new Date(b.meta?.updatedAt),
      render: (v) => v ? new Date(v).toLocaleDateString('ko-KR') : '-',
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
            <Col xs={24} sm={12} md={6}>
              <label className="filter-label">재고상태</label>
              <Select
                placeholder="전체"
                value={selAvailability}
                onChange={setSelAvailability}
                allowClear
                style={{ width: '100%' }}
                options={[
                  { label: 'In Stock', value: 'In Stock' },
                  { label: 'Low Stock', value: 'Low Stock' },
                  { label: 'Out of Stock', value: 'Out of Stock' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <label className="filter-label">등록일</label>
              <DatePicker.RangePicker
                value={createdRange}
                onChange={setCreatedRange}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <label className="filter-label">수정일</label>
              <DatePicker.RangePicker
                value={updatedRange}
                onChange={setUpdatedRange}
                style={{ width: '100%' }}
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
            scroll={{ x: 2050 }}
            size="middle"
          />
        </Card>
        {/* 상세 모달 */}
        {selectedProductId && (
          <ProductModal
            productId={selectedProductId}
            onClose={() => setSelectedProductId(null)}
          />
        )}
      </div>
    </ConfigProvider>
  );
}

export default ProductsPage;
