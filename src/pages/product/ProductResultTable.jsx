import { Table, Tag, Card, Popover } from 'antd';

function getColumns(onTitleClick) {
  return [
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
        <a onClick={() => onTitleClick(record.id)}>{text}</a>
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
      render: (v) => (v > 0 ? <Tag color="red">-{Math.round(v)}%</Tag> : '-'),
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
      render: (v) => (v ? new Date(v).toLocaleDateString('ko-KR') : '-'),
    },
    {
      title: '수정일',
      dataIndex: ['meta', 'updatedAt'],
      key: 'updatedAt',
      width: 120,
      sorter: (a, b) => new Date(a.meta?.updatedAt) - new Date(b.meta?.updatedAt),
      render: (v) => (v ? new Date(v).toLocaleDateString('ko-KR') : '-'),
    },
  ];
}

function ProductResultTable({ products, loading, onTitleClick }) {
  const columns = getColumns(onTitleClick);

  return (
    <Card title={`조회 결과 (${products.length}건)`} size="small">
      <Table
        columns={columns}
        dataSource={products}
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
  );
}

export default ProductResultTable;
