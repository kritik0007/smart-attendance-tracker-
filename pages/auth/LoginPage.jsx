import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { login } from "../../services/authService.js";
import Spinner from "../../components/common/Spinner.jsx";

const roleLabels = {
  student: "Student",
  faculty: "Faculty",
  admin: "Admin"
};

const LoginPage = () => {
  const { role = "student" } = useParams();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!identifier) {
      newErrors.identifier = "Email or roll number is required.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      setApiError("");
      const userData = await login({ identifier, password, role });
      const userRole = userData.role;

      if (userRole === "student") navigate("/student", { replace: true });
      else if (userRole === "faculty") navigate("/faculty", { replace: true });
      else navigate("/admin", { replace: true });
    } catch (err) {
      setApiError(err?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const label = roleLabels[role] || "User";

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div className="auth-title">{label} Login</div>
        <div className="auth-subtitle">
          Sign in using your registered email / roll number and password.
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label className="input-label">
              Email / Roll Number<span style={{ color: "#f97316" }}> *</span>
            </label>
            <input
              className="input-field"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. cs21u001@college.edu or 21CS001"
            />
            {errors.identifier && (
              <div className="error-text">{errors.identifier}</div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">
              Password<span style={{ color: "#f97316" }}> *</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
            {errors.password && (
              <div className="error-text">{errors.password}</div>
            )}
          </div>

          {apiError && <div className="error-text mt-sm">{apiError}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.75rem" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner /> <span style={{ marginLeft: 8 }}>Signing in…</span>
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: "0.9rem",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.8rem"
          }}
        >
          <span className="helper-text">
            New {label.toLowerCase()}?{" "}
            <Link className="link" to={`/register/${role}`}>
              Create account
            </Link>
          </span>
          <span className="helper-text">
            <Link className="link" to="/forgot-password">
              Forgot password?
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;



