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
} from "react-icons/fa";
import "./LoginModern.css";
import { api } from "../api";

export default function ForgotPassword({ darkMode, setDarkMode, goBackToLogin }) {
  const [step, setStep] = useState("email"); // "email" | "reset"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputs = useRef([]);

  /* =========================
     STEP 1: KIRIM OTP KE EMAIL
     ========================= */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const value = email.trim();
    if (!value) {
      setError("Masukkan email terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);

      // BE: @Post('forgot-password') -> requestPasswordReset(email)
      const res = await api.post("/auth/forgot-password", { email: value });

      console.log(res.data);
      // kalau sukses -> lanjut ke step reset
      setStep("reset");
    } catch (err) {
      console.error(err);
      const raw = err?.response?.data?.message;
      let msg = "";

      if (Array.isArray(raw)) msg = raw.join(" ");
      else msg = raw || "Gagal mengirim OTP, coba lagi.";

      const lower = msg.toLowerCase();

      // kalau BE bilang OTP sudah dikirim, tetap lanjut ke step reset
      if (
        lower.includes("otp") &&
        lower.includes("sudah") &&
        (lower.includes("dikirim") || lower.includes("dikirm"))
      ) {
        setError("");
        setStep("reset");
        return;
      }

      // jika email tidak ditemukan
      if (
        lower.includes("email") &&
        (lower.includes("tidak ditemukan") ||
          lower.includes("not found") ||
          lower.includes("belum terdaftar"))
      ) {
        setError("Email tidak ditemukan. Pastikan email sudah terdaftar.");
        return;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     STEP 2: RESET PASSWORD PAKAI OTP
     ========================= */
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const code = otp.join("");

    if (code.length !== 6) {
      setError("Kode OTP harus 6 digit.");
      return;
    }

    if (!newPassword || !confirmNew) {
      setError("Isi kata sandi baru dan konfirmasi.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmNew) {
      setError("Kata sandi baru dan konfirmasi tidak sama.");
      return;
    }

    try {
      setLoading(true);

      // BE: @Post('reset-password') -> resetPassword(email, newPassword, otp)
      await api.post("/auth/reset-password", {
        email,
        newPassword,
        otp: code,
      });

      alert("Kata sandi berhasil direset. Silakan login dengan password baru.");
      goBackToLogin();
    } catch (err) {
      console.error(err);
      const raw = err?.response?.data?.message;
      let msg = "";

      if (Array.isArray(raw)) msg = raw.join(" ");
      else msg = raw || "Gagal reset password, cek OTP atau coba lagi.";

      const lower = msg.toLowerCase();

      if (
        lower.includes("otp") &&
        (lower.includes("salah") ||
          lower.includes("invalid") ||
          lower.includes("kadaluarsa") ||
          lower.includes("expired"))
      ) {
        setError("Kode OTP salah atau sudah kadaluarsa.");
        return;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     OTP INPUT HANDLER
     ========================= */
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  /* =========================
     RENDER
     ========================= */
  return (
    <div className={`lp-page ${darkMode ? "lp-dark" : ""}`}>
      <div className="lp-card">
        {/* LEFT */}
        <div className="lp-left">
          <div className="lp-illustration">
            <img src="banner_login1.jpg" alt="Forgot Password" />
          </div>

          <div className="lp-left-text">
            <h3>POS NUKA · Lupa Kata Sandi</h3>
            <h2>Reset Kata Sandi Kamu</h2>
            <p>
              Gunakan email yang terdaftar untuk menerima kode OTP, lalu buat
              kata sandi baru yang lebih aman.
            </p>

            <div className="lp-dots">
              <span className="dot active" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lp-right">
          <div className="lp-top-bar">
            <span className="lp-badge">Lupa Kata Sandi</span>

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
                  <FaSun />
                  <span>Mode terang</span>
                </>
              ) : (
                <>
                  <FaMoon />
                  <span>Mode gelap</span>
                </>
              )}
            </button>
          </div>

          <div className="lp-right-main">
            {/* tombol kembali */}
            <button
              type="button"
              onClick={goBackToLogin}
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
              <FaArrowLeft /> Kembali ke Login
            </button>

            {step === "email" && (
              <>
                <h1 className="lp-title">Lupa Kata Sandi</h1>
                <p className="lp-subtitle">
                  Masukkan email yang terdaftar. Kami akan mengirimkan kode OTP
                  untuk reset kata sandi.
                </p>

                {error && <p className="lp-error">{error}</p>}

                <form className="lp-form" onSubmit={handleEmailSubmit}>
                  <div className="lp-field">
                    <label htmlFor="fp-email">Email terdaftar*</label>
                    <div className="lp-field-input">
                      <FaEnvelope className="lp-icon" />
                      <input
                        id="fp-email"
                        type="email"
                        name="email"
                        placeholder="Masukkan email kamu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="lp-btn-primary"
                    style={{ opacity: loading ? 0.7 : 1 }}
                    disabled={loading}
                  >
                    {loading ? "Mengirim OTP..." : "Kirim Kode OTP"}
                  </button>
                </form>
              </>
            )}

            {step === "reset" && (
              <>
                <h1 className="lp-title">Verifikasi OTP & Reset</h1>
                <p className="lp-subtitle">
                  Masukkan kode OTP yang dikirim ke <b>{email}</b> dan buat kata
                  sandi baru.
                </p>

                {error && <p className="lp-error">{error}</p>}

                <form className="lp-form" onSubmit={handleResetSubmit}>
                  {/* OTP */}
                  <div className="lp-field">
                    <label>Kode OTP (6 digit)*</label>
                    <div style={{ display: "flex", gap: "12px" }}>
                      {otp.map((v, i) => (
                        <input
                          key={i}
                          maxLength="1"
                          value={v}
                          ref={(el) => (inputs.current[i] = el)}
                          onChange={(e) =>
                            handleOtpChange(e.target.value, i)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(e, i)}
                          className="lp-otp-box"
                        />
                      ))}
                    </div>
                  </div>

                  {/* PASSWORD BARU */}
                  <div className="lp-field">
                    <label htmlFor="newPassword">Kata Sandi Baru*</label>
                    <div className="lp-field-input">
                      <FaLock className="lp-icon" />
                      <input
                        id="newPassword"
                        type={showNew ? "text" : "password"}
                        name="newPassword"
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

                  {/* KONFIRMASI PASSWORD BARU */}
                  <div className="lp-field">
                    <label htmlFor="confirmNew">Ulangi Kata Sandi Baru*</label>
                    <div className="lp-field-input">
                      <FaLock className="lp-icon" />
                      <input
                        id="confirmNew"
                        type={showConfirm ? "text" : "password"}
                        name="confirmNew"
                        placeholder="Ketik ulang kata sandi baru"
                        value={confirmNew}
                        onChange={(e) => setConfirmNew(e.target.value)}
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

                  <button
                    type="submit"
                    className="lp-btn-primary"
                    style={{ opacity: loading ? 0.7 : 1 }}
                    disabled={loading}
                  >
                    {loading ? "Menyimpan..." : "Reset Kata Sandi"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
