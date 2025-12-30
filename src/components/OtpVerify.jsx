// src/components/OtpVerify.jsx
import React, { useState, useRef } from "react";
import "./LoginModern.css";
import { FaArrowLeft, FaMoon, FaSun } from "react-icons/fa";
import { api } from "../api";

export default function OtpVerify({
  email,
  darkMode,
  setDarkMode,
  goBackToRegister,
  goBackToLogin,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const submitOtp = async () => {
    setError("");
    const code = otp.join("");

    if (code.length !== 6) {
      setError("Kode OTP harus 6 digit!");
      return;
    }

    try {
      setLoading(true);

      // ⬇️ SAMBUNG KE BACKEND TANPA DIUBAH:
      // AuthController.verifyOtp(@Body() body: { email, otp })
      await api.post("/auth/verify-otp", {
        email,
        otp: code,
      });

      alert("OTP berhasil diverifikasi. Silakan login.");
      goBackToLogin();
    } catch (err) {
      console.error(err);
      const raw = err?.response?.data?.message;
      let msg = "";

      if (Array.isArray(raw)) msg = raw.join(" ");
      else msg = raw || "OTP tidak valid atau sudah kadaluarsa.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`lp-page ${darkMode ? "lp-dark" : ""}`}>
      <div className="lp-card">
        {/* LEFT */}
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

        {/* RIGHT */}
        <div className="lp-right">
          <div className="lp-top-bar">
            <span className="lp-badge">OTP</span>

            <button
              type="button"
              className="lp-dark-toggle"
              onClick={() => {
                setDarkMode((v) => {
                  const newValue = !v;
                  localStorage.setItem("theme", newValue ? "dark" : "light");
                  return newValue;
                });
              }}
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

          <div className="lp-right-main">
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
              <FaArrowLeft /> Kembali ke Registrasi
            </button>

            <h1 className="lp-title">Verifikasi OTP</h1>
            <p className="lp-subtitle">
              Masukkan 6 digit kode yang dikirim ke email kamu.
            </p>

            {error && <p className="lp-error">{error}</p>}

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

            <button
              className="lp-btn-primary"
              style={{ marginTop: "28px", opacity: loading ? 0.7 : 1 }}
              onClick={submitOtp}
              disabled={loading}
            >
              {loading ? "Memverifikasi..." : "Verifikasi"}
            </button>

            <p className="lp-bottom-text" style={{ marginTop: "20px" }}>
              Tidak menerima kode?{" "}
              <button
                type="button"
                className="lp-signup-link"
                onClick={() =>
                  alert("Tinggal sambungkan ke endpoint resend OTP di backend.")
                }
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
