import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomeView.css";

function HomeView({ user, onLogout }) {
  const navigate = useNavigate();

  const handleGameModeSelect = (mode) => {
    navigate(`/game?mode=${mode}`);
  };

  return (
    <div className="home-view fade-in">
      <div className="home-container">
        {/* Header */}
        <header className="home-header">
          <h1 className="home-title">Cờ Caro Online</h1>
          <p className="home-subtitle">
            Trò chơi cờ caro trực tuyến - Chơi với bạn bè hoặc máy tính
          </p>
        </header>

        {/* User Info */}
        <div className="home-user-section">
          {user ? (
            <div className="user-info">
              <span className="user-greeting">
                Xin chào, <strong>{user.username}</strong>
              </span>
              <div className="user-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/profile")}
                >
                  Thông tin cá nhân
                </button>
                <button className="btn btn-danger btn-sm" onClick={onLogout}>
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="guest-info">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/register")}
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>

        {/* Game Modes */}
        <div className="game-modes">
          <h2 className="section-title">Chọn chế độ chơi</h2>

          <div className="mode-grid">
            {/* 2 Player Mode */}
            <div
              className="mode-card scale-in"
              onClick={() => handleGameModeSelect("2player")}
            >
              <h3 className="mode-title">2 người chơi</h3>
              <p className="mode-description">
                Chơi với người chơi khác trực tuyến. Bàn cờ 10x10, ai xếp được 5
                quân liên tiếp trước sẽ thắng.
              </p>
              <div className="mode-badge badge-blue">
                Tìm đối thủ trực tuyến
              </div>
            </div>

            {/* 3 Player Mode */}
            <div
              className="mode-card scale-in"
              onClick={() => handleGameModeSelect("3player")}
              style={{ animationDelay: "0.1s" }}
            >
              <h3 className="mode-title">3 người chơi</h3>
              <p className="mode-description">
                Chơi với 2 người chơi khác. 3 người lần lượt đánh X, O, V. Cần
                chiến thuật cao để giành chiến thắng.
              </p>
              <div className="mode-badge badge-purple">
                Tìm đối thủ trực tuyến
              </div>
            </div>

            {/* VS Bot Mode */}
            <div
              className="mode-card scale-in"
              onClick={() => handleGameModeSelect("vs_bot")}
              style={{ animationDelay: "0.2s" }}
            >
              <h3 className="mode-title">Chơi với máy</h3>
              <p className="mode-description">
                Luyện tập với máy tính. Phù hợp để làm quen với trò chơi hoặc
                rèn luyện kỹ năng.
              </p>
              <div className="mode-badge badge-green">Chơi ngay lập tức</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="features-section">
          <h2 className="section-title">Tính năng</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-text">Chơi trực tuyến real-time</span>
            </div>
            <div className="feature-item">
              <span className="feature-text">Bảng xếp hạng người chơi</span>
            </div>
            <div className="feature-item">
              <span className="feature-text">Máy tính thông minh</span>
            </div>
            <div className="feature-item">
              <span className="feature-text">Thống kê chi tiết</span>
            </div>
          </div>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
}

export default HomeView;
