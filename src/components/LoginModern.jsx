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
    <div className="sso-wrapper">
      {/* LEFT SIDE */}
      <div className="sso-left">
        <div className="left-logo">
          <img src="/logo.png" alt="logo" />
          <h2>
            Single sign-on
            <br />
            (SSO)
          </h2>
        </div>

        <div className="left-text">
          <h1>WELCOME BACK !</h1>
          <p>
            Enter your ID and
            <br />
            Password to continue
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="sso-right">
        <div className="right-header">
          <h1>SIGN IN</h1>
          <p>TO ACCESS THE PORTAL</p>
        </div>

        {/* FORM */}
        <form
          className="sso-form"
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
          <div className="input-wrap">
            <FaEnvelope className="ico" />
            <input
              type="email"
              name="email"
              placeholder="Enter User Name Here"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="input-wrap">
            <FaKey className="ico" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter Password"
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="btn-login-sso">
            Login
          </button>

          <button
            type="button"
            className="forgot-link"
            onClick={() => alert("Hubungkan ke step forgot password kamu")}
          >
            Forgot Password ?
          </button>
        </form>

        <p className="copy">Copyright © 2025</p>
      </div>
    </div>
  );
}
