import { useState, useEffect, useCallback } from 'react';
import useCartStore from '../store/cartStore';
import './ProductModal.css';

function StarRating({ rating, size = 'md' }) {
  const full = Math.round(rating);
  return (
    <span className={`star-rating star-rating--${size}`}>
      {'★'.repeat(full)}
      {'☆'.repeat(5 - full)}
      <span className="rating-value"> {rating.toFixed(1)}</span>
    </span>
  );
}

function ProductModal({ productId, onClose }) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  const inCart = cartItems.some((i) => i.id === productId);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://dummyjson.com/products/${productId}`);
      const data = await res.json();
      setProduct(data);
      setActiveImg(0);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const discountedPrice = product
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : 0;

  const stockColor =
    product?.availabilityStatus === 'In Stock'
      ? '#10b981'
      : product?.availabilityStatus === 'Low Stock'
      ? '#f59e0b'
      : '#e74c3c';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="닫기">✕</button>

        {loading ? (
          <div className="modal-loading">⏳ 불러오는 중...</div>
        ) : product ? (
          <div className="modal-body">
            {/* 이미지 갤러리 */}
            <div className="modal-gallery">
              <div className="modal-main-img-wrap">
                {product.discountPercentage > 0 && (
                  <span className="modal-badge">-{Math.round(product.discountPercentage)}%</span>
                )}
                <img
                  src={product.images?.[activeImg] ?? product.thumbnail}
                  alt={product.title}
                  className="modal-main-img"
                />
              </div>
              {product.images?.length > 1 && (
                <div className="modal-thumbnails">
                  {product.images.map((src, idx) => (
                    <button
                      key={idx}
                      className={`modal-thumb ${idx === activeImg ? 'active' : ''}`}
                      onClick={() => setActiveImg(idx)}
                    >
                      <img src={src} alt={`${product.title} ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 상세 정보 */}
            <div className="modal-detail">
              <span className="modal-category">{product.category}</span>
              {product.brand && <span className="modal-brand">{product.brand}</span>}

              <h2 className="modal-title">{product.title}</h2>

              <div className="modal-rating-row">
                <StarRating rating={product.rating} size="lg" />
                <span className="modal-reviews">({product.reviews?.length ?? 0}개 리뷰)</span>
              </div>

              <p className="modal-description">{product.description}</p>

              <div className="modal-price-block">
                <span className="modal-price">${discountedPrice}</span>
                {product.discountPercentage > 0 && (
                  <span className="modal-original">${product.price.toFixed(2)}</span>
                )}
              </div>

              <div className="modal-meta">
                <div className="meta-row">
                  <span className="meta-label">재고 상태</span>
                  <span className="meta-value" style={{ color: stockColor }}>
                    ● {product.availabilityStatus}
                    {product.stock != null && ` (${product.stock}개)`}
                  </span>
                </div>
                {product.shippingInformation && (
                  <div className="meta-row">
                    <span className="meta-label">배송</span>
                    <span className="meta-value">{product.shippingInformation}</span>
                  </div>
                )}
                {product.warrantyInformation && (
                  <div className="meta-row">
                    <span className="meta-label">보증</span>
                    <span className="meta-value">{product.warrantyInformation}</span>
                  </div>
                )}
                {product.returnPolicy && (
                  <div className="meta-row">
                    <span className="meta-label">반품</span>
                    <span className="meta-value">{product.returnPolicy}</span>
                  </div>
                )}
              </div>

              <button
                className={`modal-cart-btn ${added || inCart ? 'added' : ''}`}
                onClick={handleAdd}
              >
                {added ? '✓ 장바구니에 담겼습니다!' : inCart ? '✓ 이미 담긴 상품' : '🛒 장바구니 담기'}
              </button>

              {/* 리뷰 */}
              {product.reviews?.length > 0 && (
                <div className="modal-reviews-section">
                  <h3>리뷰</h3>
                  <div className="reviews-list">
                    {product.reviews.slice(0, 3).map((r, i) => (
                      <div key={i} className="review-item">
                        <div className="review-header">
                          <strong>{r.reviewerName}</strong>
                          <StarRating rating={r.rating} size="sm" />
                        </div>
                        <p className="review-comment">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="modal-loading">상품을 불러올 수 없습니다.</div>
        )}
      </div>
    </div>
  );
}

export default ProductModal;
