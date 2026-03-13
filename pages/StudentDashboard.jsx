import React, { useState, useRef, useEffect } from "react";
import CameraPreview from "../components/attendance/CameraPreview.jsx";
import LocationStatus from "../components/attendance/LocationStatus.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import Spinner from "../components/common/Spinner.jsx";
import { markAttendance, getAttendanceHistory } from "../services/studentService.js";
import { getCurrentUser } from "../services/authService.js";

const StudentDashboard = () => {
  const [faceVerified, setFaceVerified] = useState(false);
  const [faceError, setFaceError] = useState("");
  const [isVerifyingFace, setIsVerifyingFace] = useState(false);
  const [sessionKey, setSessionKey] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [attendanceError, setAttendanceError] = useState("");
  const [isMarking, setIsMarking] = useState(false);
  const [location, setLocation] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  // Face API State
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [labeledFaceDescriptors, setLabeledFaceDescriptors] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Loading Stages: 
  // 0: Initializing
  // 1: Loading AI Models
  // 2: Fetching User Profile
  // 3: Processing Registered Photos
  // 4: Ready
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  const cameraRef = useRef(null);

  useEffect(() => {
    loadHistory();
    initializeApp();
    // eslint-disable-next-line
  }, []);

  const initializeApp = async () => {
    try {
      setLoadingStage(1);
      setLoadingMessage("Loading AI Models...");
      await loadModels();

      setLoadingStage(2);
      setLoadingMessage("Fetching User Profile...");
      const user = await getCurrentUser();

      if (user) {
        setCurrentUser(user);
        if (user.faceImages && user.faceImages.length > 0) {
          setLoadingStage(3);
          setLoadingMessage("Processing Registered Photos...");
          await processRegisteredFaces(user.faceImages, user.name);
        } else {
          setFaceError("No registered face images found. Please contact admin.");
          setLoadingMessage("Failed: No photos found.");
        }
      } else {
        setFaceError("Failed to load user profile.");
        setLoadingMessage("Failed: User load error.");
      }
    } catch (err) {
      console.error("Init failed", err);
      setFaceError("Initialization failed. Please refresh.");
    }
  };

  const loadModels = async () => {
    try {
      const faceapi = window.faceapi;
      if (!faceapi) {
        // Inject script if not present
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
        script.async = true;
        return new Promise((resolve, reject) => {
          script.onload = async () => {
            await loadFaceApiModels();
            resolve();
          };
          script.onerror = reject;
          document.body.appendChild(script);
        });
      } else {
        await loadFaceApiModels();
      }
    } catch (e) {
      console.error("Error loading face-api", e);
      setFaceError("Failed to load face recognition models.");
      throw e;
    }
  };

  const loadFaceApiModels = async () => {
    const faceapi = window.faceapi;
    const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL), // Load Tiny Face Detector
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    setModelsLoaded(true);
  };

  const processRegisteredFaces = async (faceImages, name) => {
    const faceapi = window.faceapi;
    const descriptors = [];

    try {
      console.log("Starting to process registered faces...", faceImages);
      let processedCount = 0;

      for (const imageSrc of faceImages) {
        setLoadingMessage(`Processing photo ${processedCount + 1} of ${faceImages.length}...`);
        try {
          // Ensure CORS is handled
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = imageSrc;

          // Wait for image load
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = (e) => reject(new Error(`Failed to load image: ${imageSrc}`));
          });

          // Try SSD Mobilenet V1 first (High Accuracy) with lower threshold
          const ssdOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1 });
          let detections = await faceapi.detectSingleFace(img, ssdOptions).withFaceLandmarks().withFaceDescriptor();

          // Fallback to Tiny Face Detector with lenient options
          if (!detections) {
            console.log("SSD failed, trying TinyFaceDetector with lenient options...");
            const tinyOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.1 });
            detections = await faceapi.detectSingleFace(img, tinyOptions).withFaceLandmarks().withFaceDescriptor();
          }

          if (detections) {
            console.log("Face detected in registered image.");
            descriptors.push(detections.descriptor);
          } else {
            console.warn(`No face detected in image ${processedCount + 1}.`);
          }
        } catch (innerErr) {
          console.error("Error processing a single image:", innerErr);
        }
        processedCount++;
      }

      if (descriptors.length > 0) {
        setLabeledFaceDescriptors(new faceapi.LabeledFaceDescriptors(name, descriptors));
        setLoadingStage(4);
        setLoadingMessage("Ready for Verification");
      } else {
        setFaceError("Could not detect faces in registered profile photos.");
        setLoadingMessage("Failed: No faces detected.");
      }
    } catch (err) {
      console.error("Critical error in processRegisteredFaces:", err);
      setFaceError("Failed to process profile photos.");
      setLoadingMessage("Error processing photos.");
    }
  };


  const loadHistory = async () => {
    const history = await getAttendanceHistory();
    setAttendanceHistory(history);
  };

  const handleVerifyFace = async () => {
    if (loadingStage < 4 || !labeledFaceDescriptors) {
      setFaceError("System not ready. Please wait.");
      return;
    }

    setIsVerifyingFace(true);
    setFaceError("");
    setFaceVerified(false);
    setAttendanceStatus(null);
    setLoadingMessage("Accessing Camera...");

    try {
      // Capture image from camera
      const file = await cameraRef.current?.getSnapshot();
      if (!file) {
        throw new Error("Could not capture image from camera.");
      }
      setCapturedImage(file);

      setLoadingMessage("Analyzing Face...");
      // Perform Face API Check
      const faceapi = window.faceapi;

      const img = await faceapi.bufferToImage(file);

      // Try SSD first
      let detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

      // Fallback to Tiny
      if (!detections) {
        console.log("SSD failed for live cam, trying TinyFaceDetector...");
        detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      }

      if (!detections) {
        throw new Error("No face detected in camera. Please ensure good lighting.");
      }

      setLoadingMessage("Matching...");
      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6); // Relaxed threshold to 0.6 (default) for better UX
      const match = faceMatcher.findBestMatch(detections.descriptor);

      if (match.label === currentUser.name) {
        setFaceVerified(true);
        setLoadingMessage("Verified Successfully!");
      } else {
        setFaceError(`Verification failed. Not recognized as ${currentUser.name}. (Distance: ${match.distance.toFixed(2)}) - Try better lighting.`);
        setLoadingMessage("Verification Failed.");
      }

    } catch (err) {
      setFaceError(err?.message || "Face verification failed. Please retry.");
      setLoadingMessage("Error during verification.");
    } finally {
      setIsVerifyingFace(false);
      // Reset message after delay if success, or keep error
      if (loadingStage === 4) {
        setTimeout(() => setLoadingMessage("Ready for Verification"), 3000);
      }
    }
  };

  const handleMarkAttendance = async () => {
    setAttendanceStatus(null);
    setAttendanceError("");

    if (!faceVerified || !capturedImage) {
      setAttendanceError("Please verify your face before marking attendance.");
      return;
    }

    if (!sessionKey || sessionKey.length !== 6) {
      setAttendanceError("Please enter the 6‑digit session key shared by faculty.");
      return;
    }

    if (!location || !location.latitude || !location.longitude) {
      setAttendanceError("Location not verified. Please allow GPS access.");
      return;
    }

    setIsMarking(true);
    try {
      // Pass the captured image file to the service
      const result = await markAttendance({
        sessionKey,
        location: {
          lat: location?.latitude || 0,
          lng: location?.longitude || 0
        },
        imageFile: capturedImage
      });

      if (result.ok) {
        setAttendanceStatus("SUCCESS");
        loadHistory(); // Refresh history
      } else {
        if (result.reason === "GPS_OUTSIDE") {
          setAttendanceError(
            result.reason
          );
        } else if (result.reason === "INVALID_KEY") {
          setAttendanceError("Invalid session key. Please check with your faculty.");
        } else {
          setAttendanceError(result.reason || "Attendance failed. Please try again.");
        }
      }
    } catch (err) {
      setAttendanceError(err?.message || "Unable to mark attendance.");
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <section className="grid grid-2">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Student Profile</div>
            <div className="card-subtitle">
              Verify your identity before marking attendance
            </div>
          </div>
          <StatusBadge
            status={faceVerified ? "success" : "neutral"}
            label={faceVerified ? "Face verified" : "Not verified"}
          />
        </div>

        {currentUser && (
          <div className="badge-row">
            <span className="chip chip-success">Name: {currentUser.name}</span>
            <span className="chip">Roll No: {currentUser.rollNo || "N/A"}</span>
            <span className="chip">Branch: {currentUser.branch || "N/A"}</span>
          </div>
        )}

        <div className="mt-md">
          {!faceVerified ? (
            <CameraPreview
              ref={cameraRef}
              onStreamReady={() => setFaceError("")}
              onError={(msg) => setFaceError(msg)}
            />
          ) : (
            <div className="text-center p-md" style={{ background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📸✔️</div>
              <div style={{ color: '#166534', fontWeight: 'bold' }}>Camera Off</div>
              <div style={{ fontSize: '0.9rem', color: '#15803d' }}>Face verified successfully. snapshot saved.</div>
              <button
                className="btn btn-secondary mt-sm"
                onClick={() => { setFaceVerified(false); setCapturedImage(null); }}
                style={{ fontSize: '0.8rem', padding: '4px 8px' }}
              >
                Retake / Verify Again
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-sm" style={{ fontWeight: 'bold', color: '#666', minHeight: '24px' }}>
          {loadingMessage}
        </div>

        <button
          className="btn btn-primary mt-md"
          onClick={handleVerifyFace}
          disabled={loadingStage < 4 || isVerifyingFace}
        >
          {isVerifyingFace ? (
            <>
              <Spinner />{" "}
              <span style={{ marginLeft: 8 }}>Verifying...</span>
            </>
          ) : (
            "Verify Face"
          )}
        </button>

        {faceError && <div className="error-text mt-sm">{faceError}</div>}

        <div className="mt-md">
          <LocationStatus onLocationObtained={setLocation} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Mark Attendance</div>
            <div className="card-subtitle">
              Enter the session key shared by your faculty
            </div>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">6‑digit Session Key</label>
          <input
            className="input-field"
            value={sessionKey}
            onChange={(e) =>
              setSessionKey(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="e.g. 482193"
          />
          <span className="helper-text">
            Session keys are unique to each class and expire after the active
            time set by faculty.
          </span>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleMarkAttendance}
          disabled={isMarking}
        >
          {isMarking ? (
            <>
              <Spinner />{" "}
              <span style={{ marginLeft: 8 }}>Marking attendance…</span>
            </>
          ) : (
            "Mark Attendance"
          )}
        </button>

        {attendanceStatus === "SUCCESS" && (
          <div className="mt-sm">
            <StatusBadge
              status="success"
              label="Attendance marked successfully!"
            />
          </div>
        )}

        {attendanceError && (
          <div className="error-text mt-sm">{attendanceError}</div>
        )}

        <div className="mt-lg">
          <div className="card-header" style={{ padding: 0, marginBottom: 4 }}>
            <div className="card-title">Recent Attendance</div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map((row) => (
                <tr key={`${row.date}-${row.subject}`}>
                  <td>{row.date}</td>
                  <td>{row.subject}</td>
                  <td>
                    <span
                      className={`chip ${row.status === "Present"
                        ? "chip-success"
                        : "chip-danger"
                        }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {attendanceHistory.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center" style={{ color: '#888' }}>No attendance history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default StudentDashboard;
