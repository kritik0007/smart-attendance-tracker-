import React, { useState, useEffect } from "react";
import StatusBadge from "../components/common/StatusBadge.jsx";
import Spinner from "../components/common/Spinner.jsx";
import {
  getDashboardStats,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getClassrooms,
  addClassroom,
  updateClassroom,
  deleteClassroom,
  getAttendanceReports
} from "../services/adminService.js";
import { compressImage, fileToBase64 } from "../utils/imageUtils.js";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, faculty: 0, classrooms: 0 });
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filters, setFilters] = useState({ date: "", subject: "", className: "" });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    branch: "",
    year: "",
    email: "",
    faceImages: [],
    password: ""
  });

  const [newFaculty, setNewFaculty] = useState({
    name: "",
    subject: "",
    department: "",
    email: "",
    phone: "",
    password: ""
  });

  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showFacultyPassword, setShowFacultyPassword] = useState(false);

  const [newClassroom, setNewClassroom] = useState({
    name: "",
    building: "",
    floor: "",
    referenceImages: []
  });

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Classroom Liveliness Management
  const [showLivelinessModal, setShowLivelinessModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [classroomImages, setClassroomImages] = useState([]);
  const [livelinessError, setLivelinessError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, studentsData, facultyData, classroomsData, reportsData] = await Promise.all([
        getDashboardStats(),
        getUsers("student"),
        getUsers("faculty"),
        getClassrooms(),
        getAttendanceReports(filters)
      ]);

      setStats(statsData);
      setStudents(studentsData);
      setFaculty(facultyData);
      setClassrooms(classroomsData);
      setAttendanceRecords(reportsData);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []); // Initial load

  useEffect(() => {
    // Reload attendance when filters change
    const debounce = setTimeout(() => {
      getAttendanceReports(filters).then(setAttendanceRecords).catch(console.error);
    }, 500);
    return () => clearTimeout(debounce);
  }, [filters]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.rollNo || !newStudent.email || !newStudent.password) {
      alert("Please fill all required fields including password");
      return;
    }
    try {
      await addUser({ ...newStudent, role: "student" });
      setNewStudent({ name: "", rollNo: "", branch: "", year: "", email: "", phone: "", faceImages: [], password: "" });
      fetchData(); // Refresh all
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add student");
    }
  };

  const handleFaceImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        // Compress image before processing
        const compressedFile = await compressImage(file);
        const base64 = await fileToBase64(compressedFile);

        const updatedImages = [...newStudent.faceImages];
        updatedImages[index] = base64; // Compressed Base64 string
        setNewStudent({ ...newStudent, faceImages: updatedImages });
      } catch (err) {
        console.error("Error compressing image:", err);
        alert("Failed to process image. Please try another one.");
      }
    }
  };

  const handleRemoveFaceImage = (index) => {
    const updatedImages = [...newStudent.faceImages];
    updatedImages.splice(index, 1);
    setNewStudent({ ...newStudent, faceImages: updatedImages });
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteUser(id);
      fetchData();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.subject || !newFaculty.email || !newFaculty.password) {
      alert("Please fill all required fields including password");
      return;
    }
    try {
      await addUser({ ...newFaculty, role: "faculty" });
      setNewFaculty({ name: "", subject: "", department: "", email: "", phone: "", password: "" });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add faculty");
    }
  };

  const handleAddClassroom = async (e) => {
    e.preventDefault();
    if (!newClassroom.name || !newClassroom.building) return;
    try {
      await addClassroom(newClassroom);
      setNewClassroom({ name: "", building: "", floor: "", referenceImages: [] });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add classroom");
    }
  };

  const handleDeleteClassroom = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteClassroom(id);
      fetchData();
    } catch (err) {
      alert("Failed to delete classroom");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({ ...user }); // Populate form
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    try {
      await updateUser(editingUser._id, editFormData);
      setShowEditModal(false);
      setEditingUser(null);
      fetchData(); // Refresh list
      alert("User updated successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update user");
    }
  };

  // --- Liveliness Logic ---
  const handleOpenLivelinessModal = (classroom) => {
    setSelectedClassroom(classroom);
    setClassroomImages(classroom.referenceImages || []);
    setShowLivelinessModal(true);
    setLivelinessError("");
  };

  const handleCloseLivelinessModal = () => {
    setShowLivelinessModal(false);
    setSelectedClassroom(null);
    setClassroomImages([]);
    setLivelinessError("");
  };

  const handleClassroomImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const processedImages = [];
    try {
      for (const file of files) {
        const compressed = await compressImage(file);
        const base64 = await fileToBase64(compressed);
        processedImages.push(base64);
      }
      setClassroomImages(prev => [...prev, ...processedImages]);
    } catch (err) {
      console.error("Error processing images:", err);
      setLivelinessError("Failed to process some images.");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveClassroomImageItem = (index) => {
    setClassroomImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveLiveliness = async () => {
    if (classroomImages.length < 6) {
      setLivelinessError("Minimum 6 images are required for liveliness detection.");
      return;
    }

    setUploadingImages(true);
    setLivelinessError("");

    try {
      await updateClassroom(selectedClassroom._id, { referenceImages: classroomImages });
      // Update local state by refetching or mapping
      setClassrooms(prev => prev.map(c => c._id === selectedClassroom._id ? { ...c, referenceImages: classroomImages } : c));
      handleCloseLivelinessModal();
      alert("Classroom images updated successfully!");
    } catch (err) {
      console.error("Failed to update classroom images:", err);
      setLivelinessError(err.response?.data?.message || "Failed to save images.");
    } finally {
      setUploadingImages(false);
    }
  };


  if (loading && !stats.students) { // Show full spinner only on initial load
    return <div className="p-xl text-center"><Spinner /> Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="p-xl text-center error-text">{error} <button className="btn btn-outline" onClick={fetchData}>Retry</button></div>;
  }

  return (
    <section className="admin-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Manage students, faculty, classrooms, and view attendance records
          </p>
        </div>
        <div className="dashboard-stats">
          <div className="stat-item">
            <div className="stat-value">{stats.students}</div>
            <div className="stat-label">Students</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.faculty}</div>
            <div className="stat-label">Faculty</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.classrooms}</div>
            <div className="stat-label">Classrooms</div>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="section-header">
        <h2 className="section-title">User Management</h2>
        <p className="section-description">Add and manage students and faculty members</p>
      </div>

      <div className="grid grid-2" style={{ gap: "20px", marginBottom: "32px" }}>
        {/* Manage Students Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Manage Students</div>
              <div className="card-subtitle">Add students with face identification</div>
            </div>
            <StatusBadge status="success" label={`${students.length} registered`} />
          </div>

          <form onSubmit={handleAddStudent} className="student-form" autoComplete="off">
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Name *</label>
                <input
                  className="input-field"
                  placeholder="Full name"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Roll No *</label>
                <input
                  className="input-field"
                  placeholder="21CS001"
                  value={newStudent.rollNo}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, rollNo: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Branch</label>
                <input
                  className="input-field"
                  placeholder="CSE, ECE, etc."
                  value={newStudent.branch}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, branch: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Year</label>
                <input
                  className="input-field"
                  placeholder="1st, 2nd, 3rd, 4th"
                  value={newStudent.year}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, year: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Domain Email *</label>
              <input
                type="email"
                className="input-field"
                placeholder="student@university.edu"
                value={newStudent.email}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, email: e.target.value })
                }
                autoComplete="new-password"
              />
              <p className="helper-text">Use institutional domain email</p>
            </div>

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input
                className="input-field"
                placeholder="Mobile number"
                value={newStudent.phone}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, phone: e.target.value })
                }
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showStudentPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="Enter password"
                  value={newStudent.password}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, password: e.target.value })
                  }
                  style={{ paddingRight: "40px" }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowStudentPassword(!showStudentPassword)}
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
                  {showStudentPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Face Identification Images</label>
              <p className="helper-text">
                Upload 3 different face images for verification
              </p>
              <div className="face-images-grid">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="face-image-slot">
                    <input
                      type="file"
                      accept="image/*"
                      className="input-field"
                      onChange={(e) => handleFaceImageChange(e, index)}
                      style={{ fontSize: "12px", padding: "6px" }}
                    />
                    {newStudent.faceImages[index] ? (
                      <div className="face-preview">
                        <img
                          src={newStudent.faceImages[index]}
                          alt={`Face ${index + 1} preview`}
                        />
                        <button
                          type="button"
                          className="btn-remove-image"
                          onClick={() => handleRemoveFaceImage(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="face-placeholder">
                        Image {index + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Add Student
            </button>
          </form>

          <div className="table-container">
            <div className="table-header">
              <span className="table-title">Registered Students</span>
              <span className="table-count">({students.length})</span>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.rollNo || '-'}</strong></td>
                      <td>{s.name}</td>
                      <td className="email-cell">{s.email || "—"}</td>
                      <td style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          type="button"
                          onClick={() => handleEditUser(s)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          type="button"
                          onClick={() => handleDeleteUser(s._id)}
                          style={{ borderColor: '#ef4444', color: '#ef4444' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && <tr><td colSpan="4">No students found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Manage Faculty Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Manage Faculty</div>
              <div className="card-subtitle">Add faculty members</div>
            </div>
            <StatusBadge status="success" label={`${faculty.length} registered`} />
          </div>

          <form onSubmit={handleAddFaculty} className="student-form" autoComplete="off">
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Name *</label>
                <input
                  className="input-field"
                  placeholder="Full name"
                  value={newFaculty.name}
                  onChange={(e) =>
                    setNewFaculty({ ...newFaculty, name: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Department *</label>
                <input
                  className="input-field"
                  placeholder="CSE, ECE..."
                  value={newFaculty.department}
                  onChange={(e) =>
                    setNewFaculty({ ...newFaculty, department: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Subject</label>
                <input
                  className="input-field"
                  placeholder="Teaching Subject"
                  value={newFaculty.subject}
                  onChange={(e) =>
                    setNewFaculty({ ...newFaculty, subject: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input
                  className="input-field"
                  placeholder="Mobile number"
                  value={newFaculty.phone}
                  onChange={(e) =>
                    setNewFaculty({ ...newFaculty, phone: e.target.value })
                  }
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email *</label>
              <input
                type="email"
                className="input-field"
                placeholder="faculty@university.edu"
                value={newFaculty.email}
                onChange={(e) =>
                  setNewFaculty({ ...newFaculty, email: e.target.value })
                }
                autoComplete="new-password"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showFacultyPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="Enter password"
                  value={newFaculty.password}
                  onChange={(e) =>
                    setNewFaculty({ ...newFaculty, password: e.target.value })
                  }
                  style={{ paddingRight: "40px" }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowFacultyPassword(!showFacultyPassword)}
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
                  {showFacultyPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Add Faculty
            </button>
          </form>

          <div className="table-container">
            <div className="table-header">
              <span className="table-title">Registered Faculty</span>
              <span className="table-count">({faculty.length})</span>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.map((f) => (
                    <tr key={f._id}>
                      <td><strong>{f.name}</strong></td>
                      <td>{f.subject || '-'}</td>
                      <td className="email-cell">{f.email || "—"}</td>
                      <td style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          type="button"
                          onClick={() => handleEditUser(f)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          type="button"
                          onClick={() => handleDeleteUser(f._id)}
                          style={{ borderColor: '#ef4444', color: '#ef4444' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {faculty.length === 0 && <tr><td colSpan="4">No faculty found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Classroom Management Section */}
      <div className="section-header">
        <h2 className="section-title">Classroom Management</h2>
        <p className="section-description">
          Upload reference images of all sides of classrooms for background verification
        </p>
      </div>

      <div className="card classroom-card">
        <div className="card-header">
          <div>
            <div className="card-title">Manage Classroom Liveliness</div>
            <div className="card-subtitle">
              Prevent proxy attendance by verifying student backgrounds match classroom reference images
            </div>
          </div>
        </div>

        <form onSubmit={handleAddClassroom} className="classroom-form">
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Classroom Name *</label>
              <input
                className="input-field"
                placeholder="e.g., CSE-3A, LAB-101"
                value={newClassroom.name}
                onChange={(e) =>
                  setNewClassroom({ ...newClassroom, name: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label className="input-label">Building *</label>
              <input
                className="input-field"
                placeholder="e.g., Engineering Block"
                value={newClassroom.building}
                onChange={(e) =>
                  setNewClassroom({ ...newClassroom, building: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label className="input-label">Floor</label>
              <input
                className="input-field"
                placeholder="e.g., 3rd Floor"
                value={newClassroom.floor}
                onChange={(e) =>
                  setNewClassroom({ ...newClassroom, floor: e.target.value })
                }
              />
            </div>

            <div className="input-group">
              <label className="input-label">Reference Images (Min 6)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="input-field"
                onChange={async (e) => {
                  const files = Array.from(e.target.files);
                  if (files.length > 0) {
                    const processed = [];
                    for (const file of files) {
                      try {
                        const compressed = await compressImage(file);
                        const base64 = await fileToBase64(compressed);
                        processed.push(base64);
                      } catch (err) { console.error(err); }
                    }
                    setNewClassroom(prev => ({ ...prev, referenceImages: [...prev.referenceImages, ...processed] }));
                  }
                }}
              />
              <div className="flex-gap-sm mt-sm">
                {newClassroom.referenceImages.length > 0 && (
                  <span className="status-badge status-success">
                    {newClassroom.referenceImages.length} images selected
                  </span>
                )}
              </div>
            </div>

          </div>
          <button type="submit" className="btn btn-primary">
            Add Classroom
          </button>
        </form>

        <div className="classrooms-list">
          <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#e5e7eb' }}>Existing Classrooms</h3>
          {classrooms.map((classroom) => (
            <div key={classroom._id} className="classroom-item">
              <div className="classroom-item-header">
                <div>
                  <div className="classroom-name">{classroom.name}</div>
                  <div className="classroom-location">
                    {classroom.building} {classroom.floor && `• ${classroom.floor}`}
                  </div>
                </div>
                <div className="classroom-actions">
                  <StatusBadge
                    status={classroom.referenceImages && classroom.referenceImages.length > 0 ? "success" : "warning"}
                    label={
                      classroom.referenceImages && classroom.referenceImages.length > 0
                        ? `${classroom.referenceImages.length} images`
                        : "No images"
                    }
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    onClick={() => handleOpenLivelinessModal(classroom)}
                    style={{ marginLeft: '10px' }}
                  >
                    Manage Images
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    type="button"
                    onClick={() => handleDeleteClassroom(classroom._id)}
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {classrooms.length === 0 && <div className="p-md text-center">No classrooms found. Add one above.</div>}
        </div>
      </div>

      {/* Attendance Records Section */}
      <div className="section-header">
        <h2 className="section-title">Attendance Records</h2>
        <p className="section-description">View and filter attendance records</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Attendance History</div>
            <div className="card-subtitle">
              Filter by date, subject, or class to review attendance data
            </div>
          </div>
        </div>

        <div className="filters-row">
          <div className="input-group">
            <label className="input-label">Date</label>
            <input
              type="date"
              className="input-field"
              value={filters.date}
              onChange={(e) =>
                setFilters({ ...filters, date: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <label className="input-label">Subject</label>
            <input
              className="input-field"
              placeholder="Filter by subject"
              value={filters.subject}
              onChange={(e) =>
                setFilters({ ...filters, subject: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <label className="input-label">Class</label>
            <input
              className="input-field"
              placeholder="Filter by class"
              value={filters.className}
              onChange={(e) =>
                setFilters({ ...filters, className: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <label className="input-label">Actions</label>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setFilters({ date: "", subject: "", className: "" })
              }
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Present Count</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((a) => (
                <tr key={a.sessionKey}>
                  <td><strong>{a.date}</strong></td>
                  <td>{a.subject}</td>
                  <td>{a.className}</td>
                  <td>
                    <StatusBadge status="success" label={`${a.present} Present`} />
                  </td>
                </tr>
              ))}
              {attendanceRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="no-data">
                    No records found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveUser();
            }}>
              <div className="input-group">
                <label className="input-label">Name</label>
                <input
                  className="input-field"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  className="input-field"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone</label>
                <input
                  className="input-field"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>

              {/* Face Images Management for Edit User */}
              <div className="input-group">
                <label className="input-label">Face Images</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {editFormData.faceImages && editFormData.faceImages.map((src, index) => (
                    <div key={index} style={{ position: 'relative', width: '60px', height: '60px' }}>
                      <img
                        src={src}
                        alt={`Face ${index}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = editFormData.faceImages.filter((_, i) => i !== index);
                          setEditFormData({ ...editFormData, faceImages: newImages });
                        }}
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
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditFormData(prev => ({
                          ...prev,
                          faceImages: [...(prev.faceImages || []), reader.result]
                        }));
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="input-field"
                />
              </div>

              {editingUser.role === 'student' && (
                <>
                  <div className="input-group">
                    <label className="input-label">Roll No</label>
                    <input
                      className="input-field"
                      value={editFormData.rollNo || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Branch</label>
                    <input
                      className="input-field"
                      value={editFormData.branch || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, branch: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Year</label>
                    <input
                      className="input-field"
                      value={editFormData.year || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
                    />
                  </div>
                </>
              )}

              {editingUser.role === 'faculty' && (
                <>
                  <div className="input-group">
                    <label className="input-label">Subject</label>
                    <input
                      className="input-field"
                      value={editFormData.subject || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Department</label>
                    <input
                      className="input-field"
                      value={editFormData.department || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liveliness Management Modal */}
      {showLivelinessModal && selectedClassroom && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Manage Liveliness: {selectedClassroom.name}</h3>
            <p style={{ fontSize: "0.9em", color: "#555", marginBottom: "15px" }}>
              Upload at least 6 images of the empty classroom from different angles. These images will be used for background subtraction and liveliness detection.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Add Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleClassroomImageUpload}
                disabled={uploadingImages}
                style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
              {uploadingImages && <div style={{ fontSize: '0.8rem', color: 'blue' }}>Processing images...</div>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", maxHeight: "300px", overflowY: "auto", marginBottom: "20px" }}>
              {classroomImages.map((img, idx) => (
                <div key={idx} style={{ position: "relative", border: "1px solid #ddd", borderRadius: "4px", overflow: "hidden" }}>
                  <img src={img} alt={`Classroom View ${idx + 1}`} style={{ width: "100%", height: "80px", objectFit: "cover" }} />
                  <button
                    onClick={() => handleRemoveClassroomImageItem(idx)}
                    disabled={uploadingImages}
                    style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(255, 0, 0, 0.8)", color: "white", border: "none", borderRadius: "50%", width: "18px", height: "18px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", fontSize: "12px" }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "10px" }}>
              <strong>Total Images: {classroomImages.length}</strong>
              {classroomImages.length < 6 && <span style={{ color: "red", marginLeft: "10px" }}>(Minimum 6 required)</span>}
            </div>

            {livelinessError && <div style={{ color: "red", marginBottom: "10px" }}>{livelinessError}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                type="button"
                onClick={handleCloseLivelinessModal}
                disabled={uploadingImages}
                style={{ marginRight: "10px", padding: "8px 15px", cursor: 'pointer', background: '#ccc', border: 'none', borderRadius: '4px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLiveliness}
                disabled={uploadingImages}
                style={{ backgroundColor: "#007bff", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: uploadingImages ? "not-allowed" : "pointer", opacity: uploadingImages ? 0.7 : 1 }}
              >
                {uploadingImages ? "Saving..." : "Save Images"}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

// Simple inline styles for modal
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '8px',
  width: '600px', // Wider implementation
  maxWidth: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

export default AdminDashboard;
