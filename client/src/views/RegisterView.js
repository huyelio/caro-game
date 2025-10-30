import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";
import "./AuthViews.css";

function RegisterView({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register(
        formData.username,
        formData.email,
        formData.password
      );
      onLogin(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-view fade-in">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Đăng ký</h1>
            <p className="auth-subtitle">
              Tạo tài khoản mới để bắt đầu chơi
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Tên người dùng</label>
              <input
                type="text"
                className="form-input"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                minLength="3"
                autoComplete="username"
                placeholder="Tên hiển thị của bạn"
              />
            </div>

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
                placeholder="Email của bạn"
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
                minLength="6"
                autoComplete="new-password"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
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

export default RegisterView;
