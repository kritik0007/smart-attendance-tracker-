import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import Spinner from "../common/Spinner.jsx";


const CameraPreview = forwardRef(({ onStreamReady, onError }, ref) => {
  const videoRef = useRef(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraError, setCameraError] = useState("");

  useImperativeHandle(ref, () => ({
    getSnapshot: async () => {
      if (!videoRef.current) return null;

      const canvas = document.createElement("canvas");
      let width = videoRef.current.videoWidth;
      let height = videoRef.current.videoHeight;
      const MAX_WIDTH = 800;

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, width, height);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) resolve(null);
          const file = new File([blob], "attendance_snapshot.jpg", { type: "image/jpeg" });
          resolve(file);
        }, "image/jpeg", 0.8);
      });
    }
  }));

  useEffect(() => {
    let stream;

    const enableCamera = async () => {
      try {
        setIsInitializing(true);
        setCameraError("");

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser.");
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if (onStreamReady) {
          onStreamReady(stream);
        }
      } catch (err) {
        const message =
          err?.message || "Unable to access camera. Please check permissions.";
        setCameraError(message);
        if (onError) onError(message);
      } finally {
        setIsInitializing(false);
      }
    };

    enableCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onStreamReady, onError]);

  return (
    <div className="camera-preview">
      {isInitializing && (
        <div className="flex-gap-md">
          <Spinner />
          <span>Requesting camera access…</span>
        </div>
      )}
      {!isInitializing && <video ref={videoRef} muted playsInline />}
      <div className="camera-overlay" />
      {cameraError && (
        <div
          style={{
            position: "absolute",
            bottom: "0.5rem",
            left: "0.75rem",
            right: "0.75rem",
            fontSize: "0.75rem",
            color: "#fecaca",
            background: "rgba(15,23,42,0.85)",
            padding: "0.3rem 0.45rem",
            borderRadius: "0.5rem"
          }}
        >
          {cameraError}
        </div>
      )}
    </div>
  );
});

export default CameraPreview;



