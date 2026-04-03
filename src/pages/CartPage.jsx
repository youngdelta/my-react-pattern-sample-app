import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import ProductModal from '@/components/ProductModal';
import './CartPage.css';

function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();

  const [ordering, setOrdering] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalDiscounted = items.reduce((sum, i) => {
    const disc = i.price * (1 - (i.discountPercentage || 0) / 100) * i.quantity;
    return sum + disc;
  }, 0);

  const handleOrder = async () => {
    if (!accessToken) {
      setOrderError('로그인 후 주문하실 수 있습니다.');
      return;
    }
    setOrdering(true);
    setOrderError('');
    try {
      const res = await fetch('https://dummyjson.com/carts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id ?? 1,
          products: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '주문 실패');
      setOrderDone(true);
      clearCart();
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setOrdering(false);
    }
  };

  if (orderDone) {
    return (
      <div className="cart-page">
        <div className="cart-success">
          <span className="success-icon">🎉</span>
          <h2>주문이 완료되었습니다!</h2>
          <p>장바구니가 비워졌습니다.</p>
          <Link to="/products" className="continue-btn">🛍️ 쇼핑 계속하기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">🛒 장바구니</h1>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="empty-icon">🛒</span>
            <p>장바구니가 비어 있습니다.</p>
            <Link to="/products" className="continue-btn">🛍️ 상품 보러가기</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* 상품 목록 */}
            <div className="cart-items">
              {items.map((item) => {
                const discountedPrice = item.price * (1 - (item.discountPercentage || 0) / 100);
                return (
                  <div key={item.id} className="cart-item">
                    {/* 이미지 클릭 → 모달 */}
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="cart-item-img clickable"
                      onClick={() => setSelectedProductId(item.id)}
                      title="클릭하여 상세보기"
                    />
                    <div className="cart-item-info">
                      {/* 상품명 클릭 → 상품 목록 페이지로 이동 후 모달 오픈 */}
                      <p
                        className="cart-item-title clickable-title"
                        onClick={() => navigate(`/products?detail=${item.id}`)}
                        title="상품 페이지에서 상세보기"
                      >
                        {item.title}
                      </p>
                      <div className="cart-item-price-row">
                        <span className="cart-item-price">${(discountedPrice * item.quantity).toFixed(2)}</span>
                        <span className="cart-item-unit">(${discountedPrice.toFixed(2)} × {item.quantity})</span>
                      </div>
                    </div>
                    <div className="cart-item-qty">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeItem(item.id)} title="삭제">✕</button>
                  </div>
                );
              })}

              <button className="clear-cart-btn" onClick={clearCart}>🗑️ 전체 삭제</button>
            </div>

            {/* 요약 */}
            <div className="cart-summary">
              <h2>주문 요약</h2>
              <div className="summary-row">
                <span>상품 금액</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-row discount">
                <span>할인 금액</span>
                <span>-${(totalPrice - totalDiscounted).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>최종 금액</span>
                <span>${totalDiscounted.toFixed(2)}</span>
              </div>

              {orderError && <p className="order-error">⚠️ {orderError}</p>}

              <button
                className="order-btn"
                onClick={handleOrder}
                disabled={ordering}
              >
                {ordering ? '주문 처리 중...' : '💳 주문하기'}
              </button>

              {!accessToken && (
                <p className="login-notice">
                  <Link to="/login">로그인</Link> 후 주문하실 수 있습니다.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 상품 상세 모달 */}
      {selectedProductId && (
        <ProductModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
}

export default CartPage;

