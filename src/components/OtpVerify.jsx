// OtpVerify.jsx
import React, { useState, useRef } from "react";
import "./LoginModern.css";
import { FaArrowLeft, FaMoon, FaSun } from "react-icons/fa";

export default function OtpVerify({
  email,
  darkMode,
  setDarkMode,
  goBackToRegister,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  // ========================
  // OTP LOGIC
  // ========================
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return; // hanya angka

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const submitOtp = () => {
    const code = otp.join("");
    if (code.length !== 6) return alert("Kode OTP harus 6 digit!");
    alert("OTP diverifikasi! Sambungkan ke backend.");
  };

  return (
    <div className={`lp-page ${darkMode ? "lp-dark" : ""}`}>
      <div className="lp-card">
        
        {/* ================= LEFT SIDE ================ */}
        <div className="lp-left">
          <div className="lp-illustration">
            <img src="banner_login1.jpg" alt="OTP" />
          </div>

          <div className="lp-left-text">
            <h3>POS NUKA · Verifikasi</h3>
            <h2>Masukkan Kode OTP</h2>
            <p>
              Kami mengirimkan 6 digit kode verifikasi ke email:
              <br />
              <b>{email}</b>
            </p>

            <div className="lp-dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot active" />
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================ */}
        <div className="lp-right">

          {/* TOP BAR */}
          <div className="lp-top-bar">
            <span className="lp-badge">OTP</span>

            <button
              type="button"
              className="lp-dark-toggle"
              onClick={() => setDarkMode((v) => !v)}
            >
              {darkMode ? (
                <>
                  <FaSun /> <span>Mode terang</span>
                </>
              ) : (
                <>
                  <FaMoon /> <span>Mode gelap</span>
                </>
              )}
            </button>
          </div>

          {/* MAIN CONTENT */}
          <div className="lp-right-main">

            {/* BUTTON BACK */}
            <button
              type="button"
              onClick={goBackToRegister}
              style={{
                marginBottom: "14px",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: darkMode ? "#d1d5db" : "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
              }}
            >
              <FaArrowLeft /> Kembali
            </button>

            <h1 className="lp-title">Verifikasi OTP</h1>
            <p className="lp-subtitle">
              Masukkan 6 digit kode yang dikirim ke email kamu.
            </p>

            {/* OTP BOXES */}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              {otp.map((v, i) => (
                <input
                  key={i}
                  maxLength="1"
                  value={v}
                  ref={(el) => (inputs.current[i] = el)}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="lp-otp-box"
                />
              ))}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              className="lp-btn-primary"
              style={{ marginTop: "28px" }}
              onClick={submitOtp}
            >
              Verifikasi
            </button>

            {/* RESEND */}
            <p className="lp-bottom-text" style={{ marginTop: "20px" }}>
              Tidak menerima kode?
              <button
                type="button"
                className="lp-signup-link"
                onClick={() => alert("Kirim ulang OTP (hubungkan backend)")}
              >
                Kirim ulang
              </button>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
