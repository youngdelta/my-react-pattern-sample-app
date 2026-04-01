import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import './NavBar.css';

function NavBar() {
  const navigate = useNavigate();
  const { user, accessToken, logout } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            🎰 로또 생성기
          </Link>
          <Link to="/products" className="navbar-link">
            🛍️ 상품
          </Link>
          <Link to="/patterns" className="navbar-link">
            🏗️ 패턴
          </Link>
        </div>

        <div className="navbar-actions">
          {/* 장바구니 아이콘 */}
          <Link to="/cart" className="navbar-cart" title="장바구니">
            🛒
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>
            )}
          </Link>

          {accessToken ? (
            <>
              <Link to="/profile" className="navbar-profile" title="프로필 보기">
                <img
                  src={user?.image || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=667eea&color=fff`}
                  alt={user?.username}
                  className="navbar-avatar"
                />
                <span className="navbar-username">{user?.firstName} {user?.lastName}</span>
              </Link>
              <button className="navbar-btn navbar-btn--logout" onClick={handleLogout}>
                🚪 로그아웃
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-btn navbar-btn--login">
              🔐 로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
