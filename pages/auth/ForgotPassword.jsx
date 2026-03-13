import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import Spinner from "../../components/common/Spinner.jsx";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError("Email is required");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            await API.post("/auth/forgotpassword", { email });
            setMessage("Email sent successfully! Please check your inbox.");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <div className="auth-title">Forgot Password</div>
                <div className="auth-subtitle">
                    Enter your email address to verify your account.
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        {loading ? <><Spinner /> Sending...</> : "Send Reset Link"}
                    </button>
                </form>

                <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.9rem" }}>
                    <Link to="/login" className="link">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
