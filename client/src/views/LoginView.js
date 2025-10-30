import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";
import "./AuthViews.css";

function LoginView({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      onLogin(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-view fade-in">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Đăng nhập</h1>
            <p className="auth-subtitle">
              Đăng nhập để tiếp tục chơi
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                autoComplete="email"
                placeholder="Nhập email của bạn"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
            <p>
              <Link to="/">← Quay lại trang chủ</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginView;
