import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { register } from "../../services/authService.js";
import Spinner from "../../components/common/Spinner.jsx";
import { compressImage, fileToBase64 } from "../../utils/imageUtils.js";

const roleLabels = {
  student: "Student",
  faculty: "Faculty",
  admin: "Admin"
};

const RegisterPage = () => {
  const { role = "student" } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faceImages, setFaceImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + faceImages.length > 3) {
      alert("You can only upload a maximum of 3 images.");
      return;
    }

    // Process files sequentially
    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        const base64 = await fileToBase64(compressed);

        setFaceImages(prev => [...prev, base64]);
        setImagePreviews(prev => [...prev, base64]);
      } catch (err) {
        console.error("Error processing image:", err);
        alert("Failed to process an image.");
      }
    }
  };

  const removeImage = (index) => {
    setFaceImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required.";
    if (!identifier.trim())
      newErrors.identifier = "Email or roll number is required.";
    if (!password) newErrors.password = "Password is required.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      setApiError("");
      setApiError("");
      await register({ name, identifier, password, role, phone, faceImages });
      navigate(`/login/${role}`, { replace: true });
    } catch (err) {
      setApiError(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const label = roleLabels[role] || "User";

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div className="auth-title">{label} Registration</div>
        <div className="auth-subtitle">
          Create a new {label.toLowerCase()} account. All fields are required.
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ananya Sharma"
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>

          <div className="input-group">
            <label className="input-label">Email / Roll Number</label>
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
            <label className="input-label">Phone Number</label>
            <input
              className="input-field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile number"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
            />
            {errors.password && (
              <div className="error-text">{errors.password}</div>
            )}
            {errors.password && (
              <div className="error-text">{errors.password}</div>
            )}
          </div>

          {/* Face Images Upload */}
          <div className="input-group">
            <label className="input-label">Face Images (for Attendance)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="input-field"
            />
            <small style={{ color: '#666' }}>Upload 1-3 clear photos of your face.</small>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {imagePreviews.map((src, index) => (
                <div key={index} style={{ position: 'relative', width: '60px', height: '60px' }}>
                  <img
                    src={src}
                    alt={`Preview ${index}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      background: 'red',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
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
                <Spinner />{" "}
                <span style={{ marginLeft: 8 }}>Creating account…</span>
              </>
            ) : (
              "Register"
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
            Already registered?{" "}
            <Link className="link" to={`/login/${role}`}>
              Back to login
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;



