// src/components/RegisterModern.jsx
import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import "./LoginModern.css";
import { api } from "../api";
import OtpVerify from "./OtpVerify";

export default function RegisterModern({
  darkMode,
  setDarkMode,
  goBackToLogin,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const fullName = e.target.fullName.value.trim();
    const emailValue = e.target.email.value.trim();
    const password = e.target.password.value;
    const confirm = e.target.confirmPassword.value;

    if (!fullName || !emailValue || !password || !confirm) {
      setError("Lengkapi semua data terlebih dahulu.");
      return;
    }

    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    if (password !== confirm) {
      setError("Kata sandi dan ulangi kata sandi tidak sama.");
      return;
    }

    // simpan email supaya bisa dipakai di layar OTP
    setEmail(emailValue);

    try {
      // ⬇️ SAMBUNG KE BACKEND TANPA DIUBAH:
      // RegisterDto butuh: email, username, password
      await api.post("/auth", {
        email: emailValue,
        username: fullName, // sementara pakai nama lengkap sebagai username
        password,
      });

      // kalau sukses, langsung ke layar OTP
      setStep("otp");
    } catch (err) {
      console.error(err);

      const raw = err?.response?.data?.message;
      let msg = "";
      if (Array.isArray(raw)) msg = raw.join(" ");
      else msg = raw || "Pendaftaran gagal, coba lagi atau hubungi admin.";

      const lower = msg.toLowerCase();

      // 1️⃣ KASUS: backend kirim pesan "OTP sudah dikirim, silakan verifikasi email"
      if (
        lower.includes("otp") &&
        lower.includes("sudah") &&
        (lower.includes("dikirim") || lower.includes("dikirm"))
      ) {
        setError("");
        setStep("otp");
        return;
      }

      // 2️⃣ KASUS: email sudah terdaftar
      if (
        lower.includes("email") &&
        (lower.includes("terdaftar") ||
          lower.includes("sudah digunakan") ||
          lower.includes("sudah dipakai") ||
          lower.includes("already exists") ||
          lower.includes("already registered"))
      ) {
        setError(
          "Email sudah terdaftar. Silakan gunakan email lain atau masuk lewat halaman login."
        );
        return;
      }

      // 3️⃣ ERROR LAIN
      setError(msg);
    }
  };

  // ===== STEP: OTP SCREEN =====
  if (step === "otp") {
    return (
      <OtpVerify
        email={email}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        goBackToRegister={() => setStep("form")}
        goBackToLogin={goBackToLogin}
      />
    );
  }

  // ===== STEP: FORM REGISTER =====
  return (
    <div className={`lp-page ${darkMode ? "lp-dark" : ""}`}>
      <div className="lp-card ">
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
              <span className="dot" />
              <span className="dot active" />
              <span className="dot" />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lp-right">
          <div className="lp-top-bar">
            <span className="lp-badge">Buat Akun</span>

            <button
              type="button"
              className="lp-dark-toggle"
              onClick={() => setDarkMode((v) => !v)}
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
            <h1 className="lp-title">Registrasi POS Nuka</h1>
            <p className="lp-subtitle">
              Isi data di bawah untuk membuat akun POS Nuka.
            </p>

            {error && <p className="lp-error">{error}</p>}

            <form className="lp-form" onSubmit={handleSubmit}>
              {/* NAMA LENGKAP */}
              <div className="lp-field">
                <label htmlFor="fullName">Nama Lengkap*</label>
                <div className="lp-field-input">
                  <FaUser className="lp-icon" />
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="Masukkan nama lengkap kamu"
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="lp-field">
                <label htmlFor="email">Email*</label>
                <div className="lp-field-input">
                  <FaEnvelope className="lp-icon" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Masukkan email aktif"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="lp-field">
                <label htmlFor="password">Kata Sandi*</label>
                <div className="lp-field-input">
                  <FaLock className="lp-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Minimal 8 karakter"
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
              </div>

              {/* ULANGI PASSWORD */}
              <div className="lp-field">
                <label htmlFor="confirmPassword">Ulangi Kata Sandi*</label>
                <div className="lp-field-input">
                  <FaLock className="lp-icon" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Ketik ulang kata sandi"
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

              <button type="submit" className="lp-btn-primary">
                Daftar &amp; Mulai
              </button>
            </form>
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
