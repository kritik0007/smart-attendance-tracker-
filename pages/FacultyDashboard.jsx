import React, { useState } from "react";
import Spinner from "../components/common/Spinner.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import {
  createSession,
  endSession,
  fetchLiveAttendance,
  downloadAttendance
} from "../services/facultyService.js";

const FacultyDashboard = () => {
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [activeMinutes, setActiveMinutes] = useState(5);
  const [currentSession, setCurrentSession] = useState(null);
  const [liveStudents, setLiveStudents] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setError("");

    if (!subject.trim() || !className.trim()) {
      setError("Subject name and class are required.");
      return;
    }

    setIsCreating(true);

    // Fetch Location Details
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsCreating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          radius: 100 // 100 meters radius
        };

        const session = await createSession({
          subject,
          className,
          activeMinutes,
          location
        });
        setCurrentSession(session);
        const list = await fetchLiveAttendance(session.id);
        setLiveStudents(list);
      } catch (err) {
        setError(err?.message || "Unable to create session.");
      } finally {
        setIsCreating(false);
      }
    }, (err) => {
      console.error("Location error:", err);
      setError("Location access is required to start a session. Please enable GPS.");
      setIsCreating(false);
    }, { enableHighAccuracy: true });
  };

  // Auto-refresh live attendance every 10 seconds
  React.useEffect(() => {
    let interval;
    if (currentSession && !isEnding) {
      interval = setInterval(() => {
        fetchLiveAttendance(currentSession.id).then(list => {
          if (list !== null) setLiveStudents(list);
        });
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [currentSession, isEnding]);

  const handleEndSession = async () => {
    if (!currentSession) return;
    setIsEnding(true);
    try {
      await endSession(currentSession.id);
      setCurrentSession(null);
      setLiveStudents([]);
    } catch (err) {
      setError(err?.message || "Unable to end session.");
    } finally {
      setIsEnding(false);
    }
  };

  const handleDownload = async (format) => {
    if (!currentSession) return;
    await downloadAttendance(currentSession.id, format);
  };

  return (
    <section className="grid grid-2">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Create Attendance Session</div>
            <div className="card-subtitle">
              Generate a unique 6‑digit session key for your class
            </div>
          </div>
          {currentSession ? (
            <StatusBadge
              status="success"
              label={`Live · Key ${currentSession.sessionKey}`}
            />
          ) : (
            <StatusBadge status="neutral" label="No active session" />
          )}
        </div>

        <form onSubmit={handleCreateSession} noValidate>
          <div className="input-group">
            <label className="input-label">Subject name</label>
            <input
              className="input-field"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Data Structures"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Class</label>
            <input
              className="input-field"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. CSE‑3A"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Active time (minutes)</label>
            <input
              type="number"
              className="input-field"
              value={activeMinutes}
              min={5}
              max={180}
              onChange={(e) => setActiveMinutes(Number(e.target.value))}
            />
            <span className="helper-text">
              After this time, the session key automatically expires.
            </span>
          </div>

          {error && <div className="error-text mt-sm">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Spinner />{" "}
                <span style={{ marginLeft: 8 }}>Creating session…</span>
              </>
            ) : (
              "Generate Session Key"
            )}
          </button>
        </form>

        {currentSession && (
          <div className="mt-md">
            <p className="helper-text">
              Share this key with students in the classroom:{" "}
              <strong>{currentSession.sessionKey}</strong>
            </p>
            <p className="helper-text">
              Live until: <strong>{new Date(currentSession.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Live Session Status</div>
            <div className="card-subtitle">
              View students marking attendance in real time
            </div>
          </div>
          <div className="flex-gap-sm">
            <button
              className="btn btn-secondary"
              disabled={!currentSession || isRefreshing}
              onClick={async () => {
                if (currentSession) {
                  setIsRefreshing(true);
                  const list = await fetchLiveAttendance(currentSession.id);
                  if (list !== null) setLiveStudents(list);
                  setIsRefreshing(false);
                }
              }}
            >
              {isRefreshing ? "Refreshing…" : "Refresh list"}
            </button>
            <button
              className="btn btn-danger"
              disabled={!currentSession || isEnding}
              onClick={handleEndSession}
            >
              {isEnding ? "Ending…" : "End session"}
            </button>
          </div>
        </div>

        {currentSession ? (
          <>
            <div className="badge-row mt-sm">
              <span className="chip chip-success">
                Present: {liveStudents ? liveStudents.length : 0}
              </span>
              <span className="chip">Subject: {currentSession.subject}</span>
              <span className="chip">Class: {currentSession.className}</span>
            </div>

            <div className="mt-md flex-gap-sm">
              <button
                className="btn btn-outline"
                onClick={() => handleDownload("pdf")}
              >
                Download PDF
              </button>
              <button
                className="btn btn-outline"
                onClick={() => handleDownload("excel")}
              >
                Download Excel
              </button>
            </div>

            <div className="mt-md">
              <table className="table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Marked at</th>
                  </tr>
                </thead>
                <tbody>
                  {liveStudents && liveStudents.map((s) => (
                    <tr key={s.rollNo}>
                      <td>{s.rollNo}</td>
                      <td>{s.name}</td>
                      <td>{s.markedAt}</td>
                    </tr>
                  ))}
                  {(!liveStudents || liveStudents.length === 0) && (
                    <tr>
                      <td colSpan={3} style={{ color: "#6b7280" }}>
                        No students have marked attendance yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="helper-text mt-md">
            Start a new session to begin receiving attendance entries.
          </p>
        )}
      </div>
    </section>
  );
};

export default FacultyDashboard;



