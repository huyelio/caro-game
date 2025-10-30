import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, getLeaderboard } from "../services/api";
import "./ProfileView.css";

function ProfileView({ user, onLogout }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileData, leaderboardData] = await Promise.all([
        getProfile(),
        getLeaderboard(10),
      ]);
      setProfile(profileData);
      setLeaderboard(leaderboardData);
    } catch (err) {
      setError("Không thể tải dữ liệu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-view">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-view">
        <div className="error-container">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const winRate =
    profile.games_played > 0
      ? ((profile.wins / profile.games_played) * 100).toFixed(1)
      : 0;

  return (
    <div className="profile-view fade-in">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <button className="btn-back" onClick={() => navigate("/")}>
            ← Quay lại
          </button>
          <h1>Thông tin cá nhân</h1>
          <button className="btn btn-danger btn-sm" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>

        {/* Profile Card */}
        <div className="profile-card card scale-in">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <h2 className="profile-username">{profile.username}</h2>
          <p className="profile-email">{profile.email}</p>
          <div className="profile-rating">
            <span className="rating-label">Điểm xếp hạng:</span>
            <span className="rating-value">{profile.rating || 1000}</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div
            className="stat-card card scale-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="stat-value">{profile.games_played || 0}</div>
            <div className="stat-label">Số trận đã chơi</div>
          </div>

          <div
            className="stat-card card scale-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="stat-value stat-win">{profile.wins || 0}</div>
            <div className="stat-label">Thắng</div>
          </div>

          <div
            className="stat-card card scale-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="stat-value stat-loss">{profile.losses || 0}</div>
            <div className="stat-label">Thua</div>
          </div>

          <div
            className="stat-card card scale-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="stat-value">{profile.draws || 0}</div>
            <div className="stat-label">Hòa</div>
          </div>

          <div
            className="stat-card card scale-in"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="stat-value">{winRate}%</div>
            <div className="stat-label">Tỷ lệ thắng</div>
          </div>

          <div
            className="stat-card card scale-in"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="stat-value">{profile.highest_streak || 0}</div>
            <div className="stat-label">Chuỗi thắng cao nhất</div>
          </div>
        </div>

        {/* Leaderboard */}
        <div
          className="leaderboard-section card scale-in"
          style={{ animationDelay: "0.7s" }}
        >
          <h2 className="section-title">Bảng xếp hạng (Top 10)</h2>
          <div className="leaderboard-table">
            {leaderboard.map((player, index) => (
              <div
                key={player.id}
                className={`leaderboard-row ${
                  player.id === profile.id ? "highlight" : ""
                }`}
              >
                <div className="rank">
                  {index === 0 && "🥇"}
                  {index === 1 && "🥈"}
                  {index === 2 && "🥉"}
                  {index > 2 && `${index + 1}`}
                </div>
                <div className="player-name">{player.username}</div>
                <div className="player-stats">
                  <span className="stat-item">Điểm: {player.rating}</span>
                  <span className="stat-item">Thắng: {player.wins}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;
