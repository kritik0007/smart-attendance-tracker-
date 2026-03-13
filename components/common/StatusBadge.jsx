import React from "react";

const StatusBadge = ({ status = "neutral", label }) => {
  const map = {
    success: "status-success",
    error: "status-error",
    warning: "status-warning",
    neutral: "status-neutral"
  };

  return (
    <span className={`status-badge ${map[status] || map.neutral}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
};

export default StatusBadge;



