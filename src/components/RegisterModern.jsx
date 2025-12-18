// src/components/RegisterModern.jsx
import React, { useState, useRef } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMoon,
  FaSun,
  FaCheckCircle,
} from "react-icons/fa";
import "./LoginModern.css";
import { api } from "../api";

export default function RegisterModern({
  darkMode,
  setDarkMode,
  goBackToLogin,
}) {
  // Step: 1 = Identitas (Nama, Email, Password), 2 = OTP
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const otpRefs = useRef([]);

  // ========== STEP 1: Kirim Data Identitas ==========
  const handleIdentitySubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim()) {
      setError("Lengkapi nama dan email terlebih dahulu.");
      return;
    }

    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Kata sandi dan konfirmasi tidak sama.");
      return;
    }

    try {
      setLoading(true);
      // Kirim request register untuk mendapat OTP
      await api.post("/auth", {
        email: email.trim(),
        username: fullName.trim(),
        password: password,
      });
      setStep(2);
    } catch (err) {
      console.error(err);
      const raw = err?.response?.data?.message;
      let msg = Array.isArray(raw) ? raw.join(" ") : raw || "Gagal mengirim OTP.";

      // Jika OTP sudah dikirim, lanjut ke step 2
      if (msg.toLowerCase().includes("otp") && msg.toLowerCase().includes("sudah")) {
        setStep(2);
        return;
      }

      // Jika email sudah terdaftar
      if (msg.toLowerCase().includes("email") &&
        (msg.toLowerCase().includes("terdaftar") || msg.toLowerCase().includes("already"))) {
        setError("Email sudah terdaftar. Gunakan email lain atau login.");
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
      // Verifikasi OTP
      await api.post("/auth/verify-otp", {
        email: email.trim(),
        otp: otpCode,
      });

      alert("Akun berhasil dibuat! Silakan login.");
      goBackToLogin();
    } catch (err) {
      console.error(err);
      const raw = err?.response?.data?.message;
      let msg = Array.isArray(raw) ? raw.join(" ") : raw || "Kode OTP tidak valid.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Password Strength Indicator Component
  const PasswordStrengthIndicator = ({ password }) => {
    const checks = [
      { label: "Minimal 8 karakter", valid: password.length >= 8 },
      { label: "Huruf besar (A-Z)", valid: /[A-Z]/.test(password) },
      { label: "Huruf kecil (a-z)", valid: /[a-z]/.test(password) },
      { label: "Angka (0-9)", valid: /[0-9]/.test(password) },
    ];

    return (
      <div style={{
        marginTop: "8px",
        marginBottom: "12px",
        padding: "12px",
        borderRadius: "8px",
        background: darkMode ? "rgba(55, 65, 81, 0.5)" : "rgba(243, 244, 246, 0.8)",
      }}>
        <p style={{
          fontSize: "12px",
          fontWeight: "600",
          color: darkMode ? "#d1d5db" : "#374151",
          marginBottom: "8px",
        }}>
          Kekuatan Password:
        </p>
        {checks.map((check, index) => (
          <div key={index} style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: check.valid
              ? "#22c55e"
              : darkMode ? "#9ca3af" : "#6b7280",
            marginBottom: "4px",
          }}>
            <span style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: check.valid
                ? "rgba(34, 197, 94, 0.2)"
                : darkMode ? "rgba(107, 114, 128, 0.2)" : "rgba(156, 163, 175, 0.2)",
              border: `1.5px solid ${check.valid ? "#22c55e" : darkMode ? "#6b7280" : "#9ca3af"}`,
              fontSize: "10px",
            }}>
              {check.valid ? "✓" : ""}
            </span>
            {check.label}
          </div>
        ))}
      </div>
    );
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

  // Step Indicator Component (2 steps)
  const StepIndicator = () => (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      marginBottom: "24px",
    }}>
      {[1, 2].map((s) => (
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
          {s < 2 && (
            <div style={{
              width: "60px",
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
    1: { title: "Buat Identitas", subtitle: "Lengkapi data diri untuk membuat akun POS Nuka." },
    2: { title: "Verifikasi OTP", subtitle: `Masukkan kode 6 digit yang dikirim ke ${email}` },
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
              {step === 1 ? "Membuat akun..." : "Memverifikasi..."}
            </p>
          </div>
        </div>
      )}

      <div className="lp-card">
        {/* LEFT */}
        <div className="lp-left">
          <div className="lp-illustration">
            <img src="banner_login1.jpg" alt="POS NUKA Register" />
          </div>
          <div className="lp-left-text">
            <h3>POS NUKA · Nusantara Kasir</h3>
            <h2>Daftarkan Tokomu</h2>
            <p>
              Buat akun POS Nuka untuk mulai pakai kasir digital, pantau stok,
              dan lihat laporan harian toko dalam satu dashboard.
            </p>
            <div className="lp-dots">
              <span className={`dot ${step === 1 ? "active" : ""}`} />
              <span className={`dot ${step === 2 ? "active" : ""}`} />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lp-right">
          <div className="lp-top-bar">
            <span className="lp-badge">Step {step} dari 2</span>
            <button
              type="button"
              className="lp-dark-toggle"
              onClick={() => setDarkMode((v) => !v)}
            >
              {darkMode ? <><FaSun /><span>Mode terang</span></> : <><FaMoon /><span>Mode gelap</span></>}
            </button>
          </div>

          <div className="lp-right-main">
            <StepIndicator />

            <h1 className="lp-title">{stepLabels[step].title}</h1>
            <p className="lp-subtitle">{stepLabels[step].subtitle}</p>

            {error && <p className="lp-error">{error}</p>}

            {/* ========== STEP 1: Identitas ========== */}
            {step === 1 && (
              <form className="lp-form" onSubmit={handleIdentitySubmit}>
                <div className="lp-field">
                  <label htmlFor="fullName">Nama Lengkap*</label>
                  <div className="lp-field-input">
                    <FaUser className="lp-icon" />
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="lp-field">
                  <label htmlFor="email">Email*</label>
                  <div className="lp-field-input">
                    <FaEnvelope className="lp-icon" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Masukkan email aktif"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="lp-field">
                  <label htmlFor="password">Kata Sandi*</label>
                  <div className="lp-field-input">
                    <FaLock className="lp-icon" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 8 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="lp-eye-btn"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={password} />
                </div>

                <div className="lp-field">
                  <label htmlFor="confirmPassword">Ulangi Kata Sandi*</label>
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
                  Daftar & Kirim OTP
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
                  Verifikasi & Buat Akun
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: "none",
                    border: "none",
                    color: darkMode ? "#9ca3af" : "#64748b",
                    cursor: "pointer",
                    fontSize: "13px",
                    marginTop: "8px",
                  }}
                >
                  ← Kembali ke data identitas
                </button>
              </form>
            )}
          </div>

          <p className="lp-bottom-text">
            Sudah punya akun POS Nuka?{" "}
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
