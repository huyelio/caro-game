/**
 * HOME VIEW
 * Main menu with game mode selection
 */

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
          <h1 className="home-title">🎮 CỜ CARO PLATFORM</h1>
          <p className="home-subtitle">
            Advanced Multiplayer Game - Real-time Strategy
          </p>
        </header>

        {/* User Info or Login Button */}
        <div className="home-user-section">
          {user ? (
            <div className="user-info">
              <span className="user-greeting">
                👋 Welcome, <strong>{user.username}</strong>!
              </span>
              <div className="user-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/profile")}
                >
                  📊 Profile
                </button>
                <button className="btn btn-danger btn-sm" onClick={onLogout}>
                  🚪 Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="guest-info">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/login")}
              >
                🔐 Login
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/register")}
              >
                ✨ Register
              </button>
            </div>
          )}
        </div>

        {/* Game Modes */}
        <div className="game-modes">
          <h2 className="section-title">Select Game Mode</h2>

          <div className="mode-grid">
            {/* 2 Player Mode */}
            <div
              className="mode-card scale-in"
              onClick={() => handleGameModeSelect("2player")}
            >
              <div className="mode-icon">👥</div>
              <h3 className="mode-title">2 Players</h3>
              <p className="mode-description">
                Classic 1v1 mode on 10x10 board. First to get 5 in a row wins!
              </p>
              <div className="mode-badge badge-blue">Online Matchmaking</div>
            </div>

            {/* 3 Player Mode */}
            <div
              className="mode-card scale-in"
              onClick={() => handleGameModeSelect("3player")}
              style={{ animationDelay: "0.1s" }}
            >
              <div className="mode-icon">👨‍👩‍👦</div>
              <h3 className="mode-title">3 Players</h3>
              <p className="mode-description">
                Chaotic 3-way battle! X vs O vs V. Strategic thinking required.
              </p>
              <div className="mode-badge badge-purple">Online Matchmaking</div>
            </div>

            {/* VS Bot Mode */}
            <div
              className="mode-card scale-in"
              onClick={() => handleGameModeSelect("vs_bot")}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="mode-icon">🤖</div>
              <h3 className="mode-title">vs AI Bot</h3>
              <p className="mode-description">
                Practice against intelligent AI. Perfect for solo training!
              </p>
              <div className="mode-badge badge-green">Instant Play</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="features-section">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">Real-time Multiplayer</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span className="feature-text">Ranking & Leaderboard</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span className="feature-text">Smart AI Opponent</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-text">Statistics Tracking</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="home-footer">
          <p className="tech-info">
            <span className="tech-badge">Node.js</span>
            <span className="tech-badge">React</span>
            <span className="tech-badge">Socket.IO</span>
            <span className="tech-badge">PostgreSQL</span>
          </p>
          <p className="copyright">Version 2.0 - Advanced Edition</p>
        </footer>
      </div>
    </div>
  );
}

export default HomeView;
