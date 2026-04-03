import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const { accessToken, logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('https://dummyjson.com/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || '프로필 조회에 실패했습니다.');
        }

        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">⏳ 프로필 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <p>⚠️ {error}</p>
          <button onClick={handleLogout}>로그인으로 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src={profile.image}
            alt={profile.username}
            className="profile-avatar"
          />
          <div className="profile-name">
            <h1>
              {profile.firstName} {profile.lastName}
            </h1>
            <span className="profile-username">@{profile.username}</span>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-section">
            <h2>기본 정보</h2>
            <ul className="profile-info-list">
              <li>
                <span className="info-label">📧 이메일</span>
                <span>{profile.email}</span>
              </li>
              <li>
                <span className="info-label">🎂 생년월일</span>
                <span>{profile.birthDate}</span>
              </li>
              <li>
                <span className="info-label">👤 성별</span>
                <span>{profile.gender === 'female' ? '여성' : '남성'}</span>
              </li>
              <li>
                <span className="info-label">📞 전화번호</span>
                <span>{profile.phone}</span>
              </li>
            </ul>
          </div>

          <div className="profile-section">
            <h2>추가 정보</h2>
            <ul className="profile-info-list">
              <li>
                <span className="info-label">🏢 회사</span>
                <span>{profile.company?.name}</span>
              </li>
              <li>
                <span className="info-label">💼 직책</span>
                <span>{profile.company?.title}</span>
              </li>
              <li>
                <span className="info-label">📍 주소</span>
                <span>
                  {profile.address?.city}, {profile.address?.state}
                </span>
              </li>
              <li>
                <span className="info-label">🌐 도메인</span>
                <span>{profile.domain}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="profile-footer">
          <button className="logout-button" onClick={handleLogout}>
            🚪 로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
