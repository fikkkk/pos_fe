import React, { useState } from "react";
import { FaEnvelope, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import "./LoginModern.css";
import { api } from "../api";
import Dashboard from "./Dashboard";

export default function LoginModern() {
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  if (isAuthed) return <Dashboard />;

  return (
    <div className="lp-page">
      <div className="lp-card">
        {/* ============ LEFT ============ */}
        <div className="lp-left">
          <div className="lp-illustration">
            {/* ganti src ilustrasi sesuai aset kamu */}
            <img src="/img/login-illustration.png" alt="Travel illustration" />
          </div>

          <div className="lp-left-text">
            <h3>Starting planning your</h3>
            <h2>Journey</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. A enim,
              est ut eu est dapibus tristique sit tristique risus.
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
          <h1 className="lp-title">Welcome Back</h1>
          <p className="lp-subtitle">
            Welcome Back! Please enter your details.
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
                alert("Login gagal, cek email & password");
              }
            }}
          >
            {/* EMAIL */}
            <div className="lp-field">
              <label htmlFor="email">Email*</label>
              <div className="lp-field-input">
                <FaEnvelope className="lp-icon" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="lp-field">
              <label htmlFor="password">Password*</label>
              <div className="lp-field-input">
                <FaKey className="lp-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
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

            {/* REMEMBER + FORGOT */}
            <div className="lp-remember-row">
              <label className="lp-remember">
                <input type="checkbox" defaultChecked />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                className="lp-forgot"
                onClick={() =>
                  alert("Hubungkan ke flow Forgot Password punyamu")
                }
              >
                Forgot Password?
              </button>
            </div>

            {/* BUTTON LOGIN */}
            <button type="submit" className="lp-btn-primary">
              Login
            </button>

            {/* BUTTON GOOGLE */}
            <button
              type="button"
              className="lp-btn-google"
              onClick={() => alert("Hubungkan ke login Google")}
            >
              <span className="lp-google-circle">G</span>
              <span>Sign in With Google</span>
            </button>
          </form>

          <p className="lp-bottom-text">
            Don’t have an account yet?{" "}
            <button
              type="button"
              className="lp-signup-link"
              onClick={() => alert("Arahkan ke halaman Sign Up")}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
