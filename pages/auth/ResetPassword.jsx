import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../services/api";
import Spinner from "../../components/common/Spinner.jsx";

const ResetPassword = () => {
    const { resetToken } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            setError("Please fill all fields");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            await API.put(`/auth/resetpassword/${resetToken}`, { password });
            setMessage("Password reset successful! Redirecting to login...");
            setTimeout(() => {
                navigate("/login/student"); // Default redirect, user can choose role
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <div className="auth-title">Reset Password</div>
                <div className="auth-subtitle">
                    Enter your new password below.
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">New Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-field"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="input-field"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {error && <div className="error-text mt-sm">{error}</div>}
                    {message && <div style={{ color: "green", marginTop: "0.5rem" }}>{message}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "1rem" }}
                        disabled={loading}
                    >
                        {loading ? <><Spinner /> Resetting...</> : "Reset Password"}
                    </button>
                </form>

                <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.9rem" }}>
                    <Link to="/login" className="link">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
