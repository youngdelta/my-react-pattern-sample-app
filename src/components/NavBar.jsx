import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useCartStore from "../store/cartStore";
import useLottoStore from "../store/lottoStore";
import "./NavBar.css";

function NavBar() {
	const navigate = useNavigate();
	const { user, accessToken, logout } = useAuthStore();
	const cartItems = useCartStore((s) => s.items);
	const { isDarkMode, toggleDarkMode } = useLottoStore();

	const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<nav className="navbar">
			<div className="navbar-inner">
				<div className="navbar-left">
					<Link to="/" className="navbar-brand">
						🎰 로또 생성기
					</Link>
					<Link to="/products" className="navbar-link">
						📋 상품관리
					</Link>
					<Link to="/dashboard" className="navbar-link">
						📊 대시보드
					</Link>
					<div className="navbar-dropdown">
						<button className="navbar-link navbar-dropdown-toggle">🗂️ 개발 패턴 ▾</button>
						<div className="navbar-dropdown-content">
							<Link to="/patterns" className="navbar-dropdown-item">
								🏗️ 패턴
							</Link>
							<Link to="/methods" className="navbar-dropdown-item">
								📚 개발 방법들
							</Link>
							<Link to="/methods2" className="navbar-dropdown-item">
								🔮 개발 방법들 Part2
							</Link>
							<Link to="/design" className="navbar-dropdown-item">
								📐 컴포넌트 설계
							</Link>
						</div>
					</div>
				</div>

				<div className="navbar-actions">
					{/* 다크모드 토글 */}
					<button className="navbar-theme-toggle" onClick={toggleDarkMode} title={isDarkMode ? "라이트 모드" : "다크 모드"}>
						{isDarkMode ? "☀️" : "🌙"}
					</button>

					{/* 장바구니 아이콘 */}
					<Link to="/cart" className="navbar-cart" title="장바구니">
						🛒
						{totalItems > 0 && <span className="cart-badge">{totalItems > 99 ? "99+" : totalItems}</span>}
					</Link>

					{accessToken ? (
						<>
							<Link to="/profile" className="navbar-profile" title="프로필 보기">
								<img
									src={user?.image || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=667eea&color=fff`}
									alt={user?.username}
									className="navbar-avatar"
								/>
								<span className="navbar-username">
									{user?.firstName} {user?.lastName}
								</span>
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
