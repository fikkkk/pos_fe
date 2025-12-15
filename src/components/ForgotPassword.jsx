// src/components/ForgotPassword.jsx
import React, { useState, useRef } from "react";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMoon,
  FaSun,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import "./LoginModern.css";
import { api } from "../api";

export default function ForgotPassword({ darkMode, setDarkMode, goBackToLogin }) {
  // Step: 1 = Email, 2 = OTP, 3 = Password
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const otpRefs = useRef([]);

  // ========== STEP 1: Kirim OTP ==========
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Masukkan email terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email: email.trim() });
      setStep(2);
    } catch (err) {
      console.error(err);
      const raw = err?.response?.data?.message;
      let msg = Array.isArray(raw) ? raw.join(" ") : raw || "Gagal mengirim OTP.";

      if (msg.toLowerCase().includes("otp") && msg.toLowerCase().includes("sudah")) {
        setStep(2);
        return;
      }

      if (msg.toLowerCase().includes("email") &&
        (msg.toLowerCase().includes("tidak ditemukan") || msg.toLowerCase().includes("not found"))) {
        setError("Email tidak ditemukan. Pastikan email sudah terdaftar.");
        return;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ========== STEP 2: Verifikasi OTP ==========
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Masukkan kode OTP 6 digit.");
      return;
    }

    try {
      setLoading(true);
      // Verifikasi OTP dulu
      await api.post("/auth/verify-reset-otp", {
        email: email.trim(),
        otp: otpCode,
      });
      setStep(3);
    } catch (err) {
      console.error(err);
      const raw = err?.response?.data?.message;
      let msg = Array.isArray(raw) ? raw.join(" ") : raw || "Kode OTP tidak valid.";

      if (msg.toLowerCase().includes("otp") &&
        (msg.toLowerCase().includes("salah") || msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("expired"))) {
        setError("Kode OTP salah atau sudah kadaluarsa.");
        return;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ========== STEP 3: Buat Password Baru ==========
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Kata sandi dan konfirmasi tidak sama.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", {
        email: email.trim(),
        otp: otp.join(""),
        newPassword: newPassword,
      });

      setSuccess("Kata sandi berhasil direset!");
      setTimeout(() => goBackToLogin(), 2000);
    } catch (err) {
      console.error(err);
      const raw = err?.response?.data?.message;
      let msg = Array.isArray(raw) ? raw.join(" ") : raw || "Gagal reset password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Handlers
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step Indicator Component
  const StepIndicator = () => (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      marginBottom: "24px",
    }}>
      {[1, 2, 3].map((s) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: "600",
            background: step >= s
              ? "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)"
              : darkMode ? "#374151" : "#e5e7eb",
            color: step >= s ? "#fff" : darkMode ? "#9ca3af" : "#6b7280",
            transition: "all 0.3s ease",
          }}>
            {step > s ? <FaCheckCircle size={14} /> : s}
          </div>
          {s < 3 && (
            <div style={{
              width: "40px",
              height: "3px",
              borderRadius: "2px",
              background: step > s
                ? "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)"
                : darkMode ? "#374151" : "#e5e7eb",
              transition: "all 0.3s ease",
            }} />
          )}
        </div>
      ))}
    </div>
  );

  // Step Labels
  const stepLabels = {
    1: { title: "Masukkan Email", subtitle: "Masukkan email yang terdaftar untuk menerima kode OTP." },
    2: { title: "Verifikasi OTP", subtitle: `Masukkan kode 6 digit yang dikirim ke ${email}` },
    3: { title: "Buat Password Baru", subtitle: "Buat kata sandi baru yang aman untuk akun kamu." },
  };

  // Back handler
  const handleBack = () => {
    if (step === 1) goBackToLogin();
    else if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  // ========== RENDER ==========
  return (
    <div className={`lp-page ${darkMode ? "lp-dark" : ""}`}>
      {/* Loading Overlay */}
      {loading && (
        <div className="lp-loading-overlay">
          <div className="lp-loading-box">
            <div className="lp-loader">
              <span></span><span></span><span></span>
            </div>
            <p className="lp-loading-text">
              {step === 1 ? "Mengirim OTP..." : step === 2 ? "Memverifikasi..." : "Menyimpan..."}
            </p>
          </div>
        </div>
      )}

      <div className="lp-card">
        {/* LEFT */}
        <div className="lp-left">
          <div className="lp-illustration">
            <img src="banner_login1.jpg" alt="Forgot Password" />
          </div>
          <div className="lp-left-text">
            <h3>POS NUKA · Reset Password</h3>
            <h2>Lupa Kata Sandi?</h2>
            <p>
              Jangan khawatir! Masukkan email yang terdaftar dan kami
              akan membantu reset kata sandi kamu.
            </p>
            <div className="lp-dots">
              <span className={`dot ${step === 1 ? "active" : ""}`} />
              <span className={`dot ${step === 2 ? "active" : ""}`} />
              <span className={`dot ${step === 3 ? "active" : ""}`} />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lp-right">
          <div className="lp-top-bar">
            <span className="lp-badge">Step {step} dari 3</span>
            <button
              type="button"
              className="lp-dark-toggle"
              onClick={() => setDarkMode((v) => !v)}
            >
              {darkMode ? <><FaSun /><span>Mode terang</span></> : <><FaMoon /><span>Mode gelap</span></>}
            </button>
          </div>

          <div className="lp-right-main">
            {/* Back Button */}
            <button
              type="button"
              onClick={handleBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                color: darkMode ? "#9ca3af" : "#64748b",
                cursor: "pointer",
                fontSize: "13px",
                marginBottom: "16px",
                padding: 0,
              }}
            >
              <FaArrowLeft size={12} />
              {step === 1 ? "Kembali ke Login" : "Kembali"}
            </button>

            <StepIndicator />

            <h1 className="lp-title">{stepLabels[step].title}</h1>
            <p className="lp-subtitle">{stepLabels[step].subtitle}</p>

            {success && (
              <div style={{
                padding: "12px 16px",
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                borderRadius: "12px",
                color: "#22c55e",
                fontSize: "13px",
                marginBottom: "16px",
              }}>
                ✓ {success}
              </div>
            )}
            {error && <p className="lp-error">{error}</p>}

            {/* ========== STEP 1: Email ========== */}
            {step === 1 && (
              <form className="lp-form" onSubmit={handleEmailSubmit}>
                <div className="lp-field">
                  <label htmlFor="email">Email Terdaftar*</label>
                  <div className="lp-field-input">
                    <FaEnvelope className="lp-icon" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Masukkan email kamu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="lp-btn-primary" disabled={loading}>
                  Kirim Kode OTP
                </button>
              </form>
            )}

            {/* ========== STEP 2: OTP ========== */}
            {step === 2 && (
              <form className="lp-form" onSubmit={handleOtpSubmit}>
                <div className="lp-field">
                  <label>Kode OTP (6 Digit)*</label>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="lp-otp-box"
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        ref={(el) => (otpRefs.current[index] = el)}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" className="lp-btn-primary" disabled={loading}>
                  Verifikasi OTP
                </button>
              </form>
            )}

            {/* ========== STEP 3: Password ========== */}
            {step === 3 && (
              <form className="lp-form" onSubmit={handlePasswordSubmit}>
                <div className="lp-field">
                  <label htmlFor="newPassword">Kata Sandi Baru*</label>
                  <div className="lp-field-input">
                    <FaLock className="lp-icon" />
                    <input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      placeholder="Minimal 8 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="lp-eye-btn"
                      onClick={() => setShowNew((v) => !v)}
                    >
                      {showNew ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="lp-field">
                  <label htmlFor="confirmPassword">Ulangi Kata Sandi Baru*</label>
                  <div className="lp-field-input">
                    <FaLock className="lp-icon" />
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Ketik ulang kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="lp-eye-btn"
                      onClick={() => setShowConfirm((v) => !v)}
                    >
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="lp-btn-primary" disabled={loading}>
                  Reset Kata Sandi
                </button>
              </form>
            )}
          </div>

          <p className="lp-bottom-text">
            Ingat kata sandi?{" "}
            <button
              type="button"
              className="lp-signup-link"
              onClick={goBackToLogin}
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
