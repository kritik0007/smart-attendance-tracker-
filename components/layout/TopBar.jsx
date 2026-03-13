import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goHome = () => navigate("/");

  const isOnDashboard =
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/faculty") ||
    location.pathname.startsWith("/admin");

  return (
    <header className="topbar">
      <div onClick={goHome} style={{ cursor: "pointer" }}>
        <div className="topbar-title">SMART ATTENDANCE TRACKER</div>
        <div className="topbar-subtitle">
          Face · GPS · Session Key — Anti‑proxy attendance
        </div>
      </div>
      <div className="topbar-actions">
        {isOnDashboard ? (
          <button className="btn btn-outline" onClick={goHome}>
            Logout
          </button>
        ) : (
          <>
            <button
              className="btn btn-outline"
              onClick={() => navigate("/login/student")}
            >
              Student
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate("/login/faculty")}
            >
              Faculty
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/login/admin")}
            >
              Admin
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default TopBar;



