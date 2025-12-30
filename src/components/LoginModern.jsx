// src/components/LoginModern.jsx
import React, { useState } from "react";
import {
  FaEnvelope,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import "./LoginModern.css";
import { api } from "../api";
import Dashboard from "./Dashboard";
import RegisterModern from "./RegisterModern";
import ForgotPassword from "./ForgotPassword";
import PosAlert from "./PosAlert";

export default function LoginModern() {
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  // Sinkronisasi mode tema dengan Dashboard via localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : false;
  });
  const [screen, setScreen] = useState("login"); // "login" | "register" | "forgot"
  const [loading, setLoading] = useState(false); // loading overlay
  const [alertConfig, setAlertConfig] = useState(null); // modern alert

  // kalau sudah login → ke Dashboard
  if (isAuthed) return <Dashboard />;

  // ===== SCREEN Forgot Password =====
  if (screen === "forgot") {
    return (
      <ForgotPassword
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        goBackToLogin={() => setScreen("login")}
      />
    );
  }

  // ===== SCREEN REGISTER =====
  if (screen === "register") {
    return (
      <RegisterModern
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        goBackToLogin={() => setScreen("login")}
      />
    );
  }

  // ===== SCREEN LOGIN =====
  return (
    <div className={`lp-page ${darkMode ? "lp-dark" : ""}`}>
      {/* 🔥 Loading overlay */}
      {loading && (
        <div className="lp-loading-overlay">
          <div className="lp-loading-box">
            <div className="lp-loader">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="lp-loading-text">Sedang memeriksa akunmu...</p>
          </div>
        </div>
      )}

      {/* 🌈 Modern alert */}
      {alertConfig && (
        <PosAlert
          open={!!alertConfig}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={() => setAlertConfig(null)}
        />
      )}

      <div className="lp-card">
        {/* LEFT */}
        <div className="lp-left">
          <div className="lp-illustration">
            <img src="banner_login1.jpg" alt="POS NUKA Illustration" />
          </div>

          <div className="lp-left-text">
            <h3>POS NUKA · Nusantara Kasir</h3>
            <h2>Bantu UMKM Naik Kelas</h2>
            <p>
              Catat transaksi, pantau stok, dan lihat laporan harian dalam satu
              layar. POS Nuka dirancang khusus untuk UMKM Indonesia supaya
              jualan lebih rapi, cepat, dan terkontrol.
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
            <span className="lp-badge">POS NUKA</span>

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
            <h1 className="lp-title">Masuk ke POS Nuka</h1>
            <p className="lp-subtitle">
              Login untuk mengelola kasir, stok produk, dan laporan tokomu.
            </p>

            <form
              className="lp-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const identifier = e.target.email.value;
                const password = e.target.password.value;

                try {
                  setLoading(true);

                  const res = await api.post("/auth/login", {
                    identifier, // email / username
                    password,
                  });

                  localStorage.setItem("token", res.data.access_token);
                  // Simpan data user termasuk role
                  localStorage.setItem("user", JSON.stringify(res.data.user));

                  // Simpan waktu login terakhir
                  localStorage.setItem("last_login", new Date().toISOString());

                  // Simpan waktu pertama kali login (member sejak) jika belum ada
                  if (!localStorage.getItem("member_since")) {
                    localStorage.setItem("member_since", new Date().toISOString());
                  }

                  setIsAuthed(true);
                } catch (err) {
                  console.error(err);

                  // ambil pesan dari backend kalau ada
                  const raw = err?.response?.data?.message;
                  let msg = "";
                  if (Array.isArray(raw)) msg = raw.join(" ");
                  else msg =
                    raw ||
                    "Email atau kata sandi kamu belum cocok. Coba cek lagi, ya.";

                  setAlertConfig({
                    type: "error",
                    title: "Login gagal",
                    message: msg,
                  });
                } finally {
                  setLoading(false);
                }
              }}
            >
              {/* EMAIL / USERNAME */}
              <div className="lp-field">
                <label htmlFor="email">Email / Username*</label>
                <div className="lp-field-input">
                  <FaEnvelope className="lp-icon" />
                  <input
                    id="email"
                    type="text"
                    name="email"
                    placeholder="Masukkan email atau username"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="lp-field">
                <label htmlFor="password">Kata Sandi*</label>
                <div className="lp-field-input">
                  <FaKey className="lp-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Masukkan kata sandi"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="lp-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* REMEMBER + FORGOT */}
              <div className="lp-remember-row">
                <label className="lp-remember">
                  <input
                    type="checkbox"
                    defaultChecked
                    disabled={loading}
                  />
                  <span>Ingat saya</span>
                </label>

                <button
                  type="button"
                  className="lp-forgot"
                  onClick={() => !loading && setScreen("forgot")}
                  disabled={loading}
                >
                  Lupa kata sandi?
                </button>
              </div>

              <button
                type="submit"
                className="lp-btn-primary"
                disabled={loading}
                style={{ opacity: loading ? 0.8 : 1 }}
              >
                {loading ? "Masuk..." : "Masuk ke Dashboard"}
              </button>

              <button
                type="button"
                className="lp-btn-google"
                onClick={() =>
                  !loading && alert("Hubungkan ke login Google POS Nuka.")
                }
                disabled={loading}
              >
                <span className="lp-google-circle">G</span>
                <span>Masuk dengan Google</span>
              </button>
            </form>
          </div>

          <p className="lp-bottom-text">
            Belum punya akun POS Nuka?{" "}
            <button
              type="button"
              className="lp-signup-link"
              onClick={() => !loading && setScreen("register")}
              disabled={loading}
            >
              Daftar sekarang
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
