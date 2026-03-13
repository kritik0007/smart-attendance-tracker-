import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import TopBar from "./components/layout/TopBar.jsx";

const App = () => {
  return (
    <div className="app-root">
      <TopBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/:role" element={<LoginPage />} />
          <Route path="/register/:role" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/resetpassword/:resetToken" element={<ResetPassword />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;



