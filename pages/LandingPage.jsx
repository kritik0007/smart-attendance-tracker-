import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <section className="landing-hero">
      <div>
        <span className="pill">
          <span className="badge-dot" />
          Next‑gen attendance · No more proxies
        </span>
        <h1 style={{ fontSize: "2.1rem", marginTop: "1rem", marginBottom: 0 }}>
          Smart Attendance Tracker
        </h1>
        <p
          style={{
            marginTop: "0.8rem",
            color: "#9ca3af",
            fontSize: "0.95rem",
            maxWidth: "32rem"
          }}
        >
          A secure attendance system that combines{" "}
          <strong>face recognition</strong>,{" "}
          <strong>liveness detection</strong>,{" "}
          <strong>GPS geo‑fencing</strong>, and{" "}
          <strong>session‑based unique keys</strong> to block proxy and buddy
          punching.
        </p>
        <div className="mt-lg" style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/login/student")}
          >
            Student Login
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/login/faculty")}
          >
            Faculty Login
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/login/admin")}
          >
            Admin Login
          </button>
        </div>
        <div className="badge-row mt-md">
          <span className="chip chip-success">Real‑time face match</span>
          <span className="chip">GPS &amp; classroom radius</span>
          <span className="chip">6‑digit rotating session keys</span>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">How it works</div>
            <div className="card-subtitle">
              Three‑layer security for accurate attendance
            </div>
          </div>
        </div>
        <ol
          style={{
            paddingLeft: "1.1rem",
            fontSize: "0.85rem",
            color: "#d1d5db",
            lineHeight: 1.5
          }}
        >
          <li>Student logs in from their own device.</li>
          <li>System runs face recognition with liveness checks.</li>
          <li>GPS verifies that the student is inside the classroom geo‑fence.</li>
          <li>Faculty shares a unique 6‑digit session key for that lecture.</li>
          <li>Student enters the key and attendance is recorded securely.</li>
        </ol>
        <p className="helper-text mt-md">
          All detection logic and face models run securely on the backend. This
          frontend focuses on a clean, responsive experience.
        </p>
      </div>
    </section>
  );
};

export default LandingPage;



