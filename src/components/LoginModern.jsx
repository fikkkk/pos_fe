// LoginModern.jsx
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
import RegisterModern from "./RegisterModern"; // ⬅️ import

export default function LoginModern() {
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [screen, setScreen] = useState("login"); // "login" | "register"

  if (isAuthed) return <Dashboard />;

  // ⬅️ kalau lagi di mode REGISTER, render RegisterModern
  if (screen === "register") {
    return (
      <RegisterModern
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        goBackToLogin={() => setScreen("login")}
      />
    );
  }

  // ============== TAMPILAN LOGIN ==============
  return (
    <div className={`lp-page ${darkMode ? "lp-dark" : ""}`}>
      <div className="lp-card">
        {/* ============ LEFT ============ */}
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

        {/* ============ RIGHT ============ */}
        <div className="lp-right">
          <div className="lp-top-bar">
            <span className="lp-badge">POS NUKA</span>

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
                  <FaMoon />x
                  <span>Mode gelap</span>
                </>
              )}
            </button>
          </div>

          {/* 🔹 ini yang baru: lp-right-main */}
          <div className="lp-right-main">
            <h1 className="lp-title">Masuk ke POS Nuka</h1>
            <p className="lp-subtitle">
              Login untuk mengelola kasir, stok produk, dan laporan tokomu.
            </p>

            <form
              className="lp-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const email = e.target.email.value;
                const password = e.target.password.value;

                try {
                  const res = await api.post("/auth/login", {
                    identifier: email,
                    password,
                  });
                  localStorage.setItem("token", res.data.access_token);
                  setIsAuthed(true);
                } catch (err) {
                  alert("Login gagal, cek email / kata sandi kamu.");
                }
              }}
            >
              {/* EMAIL */}
              <div className="lp-field">
                <label htmlFor="email">Email / Username*</label>
                <div className="lp-field-input">
                  <FaEnvelope className="lp-icon" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Masukkan email atau username"
                    required
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
                  />
                  <button>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* REMEMBER + FORGOT */}
              <div className="lp-remember-row">
                <label className="lp-remember">
                  <input type="checkbox" defaultChecked />
                  <span>Ingat saya</span>
                </label>

                <button
                  type="button"
                  className="lp-forgot"
                  onClick={() =>
                    alert("Hubungkan ke flow Lupa Kata Sandi versi kamu.")
                  }
                >
                  Lupa kata sandi?
                </button>
              </div>

              {/* BUTTON LOGIN */}
              <button type="submit" className="lp-btn-primary">
                Masuk ke Dashboard
              </button>

              {/* BUTTON GOOGLE */}
              <button
                type="button"
                className="lp-btn-google"
                onClick={() => alert("Hubungkan ke login Google POS Nuka.")}
              >
                <span className="lp-google-circle">G</span>
                <span>Masuk dengan Google</span>
              </button>
            </form>
          </div>

          {/* teks bawah DIPISAH, tetap nempel bawah card */}
          <p className="lp-bottom-text">
            Belum punya akun POS Nuka?{" "}
            <button
              type="button"
              className="lp-signup-link"
              onClick={() => setIsRegister(true)}
            >
              Daftar sekarang
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
