import React, { useEffect, useState, useRef } from "react";
import { FaCheckCircle, FaTimes, FaStar } from "react-icons/fa";

/**
 * Modern Login Notification
 * Premium glassmorphism style with animations
 */
export default function LoginNotification({ show, onClose, userName }) {
  const [render, setRender] = useState(show);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressRef = useRef(null);

  const AUTO_DISMISS_MS = 5000;

  useEffect(() => {
    if (show) {
      setRender(true);
      setProgress(100);
      setTimeout(() => setVisible(true), 50);
    } else {
      setVisible(false);
      setTimeout(() => setRender(false), 500);
    }
  }, [show]);

  // Progress bar countdown
  useEffect(() => {
    if (!show) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100);
      setProgress(remaining);

      if (remaining > 0) {
        progressRef.current = requestAnimationFrame(animate);
      }
    };

    progressRef.current = requestAnimationFrame(animate);

    return () => {
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current);
      }
    };
  }, [show]);

  // Auto dismiss
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, AUTO_DISMISS_MS);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!render) return null;

  // Generate sparkle positions
  const sparkles = [
    { top: "10%", left: "15%", delay: "0s", size: 8 },
    { top: "20%", right: "20%", delay: "0.3s", size: 6 },
    { top: "70%", left: "10%", delay: "0.6s", size: 5 },
    { top: "80%", right: "15%", delay: "0.2s", size: 7 },
    { top: "40%", left: "5%", delay: "0.8s", size: 4 },
  ];

  return (
    <>
      {/* Keyframes for animations */}
      <style>{`
        @keyframes slideInBounce {
          0% { transform: translateX(100%) scale(0.8); opacity: 0; }
          60% { transform: translateX(-10px) scale(1.02); opacity: 1; }
          80% { transform: translateX(5px) scale(0.98); }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes slideOut {
          0% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(120%) scale(0.8); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px 10px rgba(46, 204, 113, 0); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .login-notification-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          animation: ${visible ? 'slideInBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'slideOut 0.4s ease-in forwards'};
        }
        .login-notification {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 22px;
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,253,244,0.95) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 
            0 20px 60px rgba(0,0,0,0.12),
            0 8px 25px rgba(46, 204, 113, 0.15),
            0 0 0 1px rgba(255,255,255,0.8) inset,
            0 2px 0 rgba(255,255,255,0.9) inset;
          border: 1px solid rgba(46, 204, 113, 0.2);
          max-width: 380px;
          min-width: 320px;
          position: relative;
          overflow: hidden;
        }
        .login-notification::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #2ecc71, #27ae60, #2ecc71);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        .notification-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2ecc71 0%, #27ae60 50%, #1abc9c 100%);
          border-radius: 14px;
          color: #fff;
          font-size: 22px;
          flex-shrink: 0;
          box-shadow: 
            0 8px 20px rgba(46, 204, 113, 0.35),
            0 2px 4px rgba(0,0,0,0.1) inset;
          animation: pulse 2s ease-in-out infinite, float 3s ease-in-out infinite;
          position: relative;
        }
        .notification-content {
          flex: 1;
          min-width: 0;
        }
        .notification-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.3px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .notification-title .emoji {
          font-size: 18px;
        }
        .notification-subtitle {
          margin: 4px 0 0 0;
          font-size: 13px;
          color: #64748b;
          line-height: 1.4;
        }
        .notification-subtitle b {
          color: #2ecc71;
          font-weight: 600;
        }
        .notification-close {
          background: rgba(0,0,0,0.05);
          border: none;
          cursor: pointer;
          padding: 8px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        .notification-close:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          transform: scale(1.1);
        }
        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(90deg, #2ecc71, #27ae60);
          border-radius: 0 0 20px 20px;
          transition: width 0.1s linear;
        }
        .sparkle {
          position: absolute;
          color: #ffd700;
          animation: sparkle 1.5s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      <div className="login-notification-container">
        <div className="login-notification">
          {/* Sparkles */}
          {sparkles.map((s, i) => (
            <FaStar
              key={i}
              className="sparkle"
              style={{
                top: s.top,
                left: s.left,
                right: s.right,
                animationDelay: s.delay,
                fontSize: s.size,
              }}
            />
          ))}

          {/* Icon */}
          <div className="notification-icon">
            <FaCheckCircle />
          </div>

          {/* Content */}
          <div className="notification-content">
            <h4 className="notification-title">
              Login Berhasil! <span className="emoji">🎉</span>
            </h4>
            <p className="notification-subtitle">
              Selamat datang kembali, <b>{userName || "User"}</b>
            </p>
          </div>

          {/* Close Button */}
          <button className="notification-close" onClick={onClose}>
            <FaTimes size={14} />
          </button>

          {/* Progress Bar */}
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  );
}
