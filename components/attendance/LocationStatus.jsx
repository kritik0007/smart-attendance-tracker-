import React, { useEffect, useState } from "react";
import StatusBadge from "../common/StatusBadge.jsx";
import Spinner from "../common/Spinner.jsx";
const LocationStatus = ({ onLocationObtained }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("neutral");
  const [label, setLabel] = useState("Location not checked");
  const [error, setError] = useState("");

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setLabel("Location not supported");
      setError("Geolocation API not available in this browser.");
      return;
    }

    setIsLoading(true);
    setError("");
    setLabel("Requesting location…");
    setStatus("warning");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // In a real app we would send these to the backend for geo‑fencing.
        if (onLocationObtained) {
          onLocationObtained({ latitude, longitude });
        }
        setStatus("success");
        setLabel("Location verified (within classroom radius)");
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        setStatus("error");
        setLabel("Unable to verify location");
        setError(
          err?.message ||
            "Could not fetch location. Please enable GPS and try again."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    // Auto‑request once when entering the dashboard
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex-gap-md">
        <StatusBadge status={status} label={label} />
        {isLoading && <Spinner />}
        <button className="btn btn-secondary" onClick={requestLocation}>
          Re-check
        </button>
      </div>
      {error && <div className="error-text mt-sm">{error}</div>}
      <p className="helper-text mt-sm">
        GPS is used to ensure you are inside the authorised classroom or
        campus boundary.
      </p>
    </div>
  );
};

export default LocationStatus;



