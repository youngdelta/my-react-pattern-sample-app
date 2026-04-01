import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import ProductModal from '../components/ProductModal';
import './ProductsPage.css';

const LIMIT = 20;

function StarRating({ rating }) {
  return (
    <span className="star-rating">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      <span className="rating-value"> {rating.toFixed(1)}</span>
    </span>
  );
}

function ProductCard({ product, onAdd, onDetail, added }) {
  const discounted = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);

  return (
    <div className="product-card">
      <button className="product-image-wrap" onClick={() => onDetail(product.id)}>
        <img src={product.thumbnail} alt={product.title} className="product-image" />
        {product.discountPercentage > 0 && (
          <span className="product-badge">-{Math.round(product.discountPercentage)}%</span>
        )}
        <span className="product-detail-hint">🔍 상세보기</span>
      </button>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-title" onClick={() => onDetail(product.id)}>{product.title}</h3>
        <StarRating rating={product.rating} />
        <div className="product-price-wrap">
          <span className="product-price">${discounted}</span>
          {product.discountPercentage > 0 && (
            <span className="product-original">${product.price.toFixed(2)}</span>
          )}
        </div>
        <div className="product-card-actions">
          <button
            className="detail-btn"
            onClick={() => onDetail(product.id)}
          >
            상세보기
          </button>
          <button
            className={`add-to-cart-btn ${added ? 'added' : ''}`}
            onClick={(e) => { e.stopPropagation(); onAdd(product); }}
          >
            {added ? '✓' : '🛒'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductsPage() {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState(new Set());

  // URL ?detail=ID 파라미터로 모달 제어
  const detailParam = searchParams.get('detail');
  const selectedProductId = detailParam ? Number(detailParam) : null;

  const setSelectedProductId = (id) => {
    if (id) {
      setSearchParams({ detail: id }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const skip = page * LIMIT;
      const url = query
        ? `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=${LIMIT}&skip=${skip}`
        : `https://dummyjson.com/products?limit=${LIMIT}&skip=${skip}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setQuery(search);
  };

  const handleAdd = (product) => {
    addItem(product);
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds((prev) => { const next = new Set(prev); next.delete(product.id); return next; });
    }, 1500);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const cartSet = new Set(cartItems.map((i) => i.id));

  return (
    <div className="products-page">
      {/* 헤더 */}
      <div className="products-header">
        <div className="products-header-left">
          <h1>🛍️ 상품 목록</h1>
          {!loading && <span className="products-count">총 {total}개</span>}
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="상품 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>
      </div>

      {query && (
        <div className="search-result-info">
          <span>"<strong>{query}</strong>" 검색 결과 {total}개</span>
          <button className="clear-search" onClick={() => { setQuery(''); setSearch(''); setPage(0); }}>✕ 초기화</button>
        </div>
      )}

      {loading ? (
        <div className="products-loading">
          <div className="loading-spinner" />
          <p>상품 불러오는 중...</p>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAdd={handleAdd}
                onDetail={(id) => setSelectedProductId(id)}
                added={addedIds.has(p.id) || cartSet.has(p.id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(0)} disabled={page === 0}>«</button>
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 0}>‹ 이전</button>
              <span className="pagination-info">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= totalPages}>다음 ›</button>
              <button onClick={() => setPage(totalPages - 1)} disabled={page + 1 >= totalPages}>»</button>
            </div>
          )}
        </>
      )}

      {/* 상세 모달 */}
      {selectedProductId && (
        <ProductModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
}

export default ProductsPage;
