// src/components/PosAlert.jsx
import React from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import "./LoginModern.css";

export default function PosAlert({
  open,
  type = "info", // "success" | "error" | "info"
  title,
  message,
  onClose,
}) {
  if (!open) return null;

  let Icon = FaInfoCircle;
  if (type === "success") Icon = FaCheckCircle;
  if (type === "error") Icon = FaExclamationTriangle;

  return (
    <div className="lp-alert-overlay">
      <div className="lp-alert-card">
        <div className={`lp-alert-icon lp-alert-${type}`}>
          <Icon />
        </div>
        <h2 className="lp-alert-title">{title}</h2>
        <p className="lp-alert-message">{message}</p>

        <button type="button" className="lp-alert-btn" onClick={onClose}>
          Oke, mengerti
        </button>
      </div>
    </div>
  );
}
