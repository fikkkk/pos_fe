import React, { useState } from "react";
import {
  FaEnvelope,
  FaKey,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "./LoginPage.css";
import Dashboard from "./Dashboard";
import { api } from "../api";   // <-- koneksi backend

/* ============================================================
   PASSWORD RULES
   ============================================================ */
function PasswordRules({ value }) {
  const hasMin = value.length >= 8;
  const hasUpper = /[A-Z]/.test(value);
  const hasNumOrSym = /[\d\W]/.test(value);

  const Rule = ({ ok, children }) => (
    <li className={`rule ${ok ? "ok" : "bad"}`}>
      <span className="ico">{ok ? <FaCheckCircle /> : <FaTimesCircle />}</span>
      <span>{children}</span>
    </li>
  );

  return (
    <ul className="pwd-rules">
      <Rule ok={hasMin}>Password must be at least 8 characters long.</Rule>
      <Rule ok={hasUpper}>Password must contain at least one upper case.</Rule>
      <Rule ok={hasNumOrSym}>
        Password must contain at least one number or special character.
      </Rule>
    </ul>
  );
}

/* ============================================================
   STEPPER (NO UI CHANGES)
   ============================================================ */
function SideStepper({ currentStep = 1, mode = "reset" }) {
  const eff = currentStep;

  const steps =
    mode === "signup"
      ? [
          { key: "otp", label: "Autentikasi OTP", icon: <FaLock />, level: 2 },
          { key: "register", label: "Buat Akun", icon: <FaUser />, level: 1 },
        ]
      : [
          { key: "create", label: "Buat Password", icon: <FaKey />, level: 3 },
          { key: "otp", label: "Autentikasi OTP", icon: <FaLock />, level: 2 },
          { key: "email", label: "Verifikasi Email", icon: <FaEnvelope />, level: 1 },
        ];

  return (
    <div className="vstepper">
      {steps.map((s, i) => {
        const state =
          eff > s.level ? "is-done" : eff === s.level ? "is-active" : "is-todo";

        return (
          <div className="vstep" key={s.key}>
            <motion.div
              className={`v-icon ${state}`}
              layout
              initial={false}
              animate={{ scale: state === "is-active" ? 1.06 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              {s.icon}
            </motion.div>
            <div className={`v-label ${state}`}>{s.label}</div>

            {i < steps.length - 1 && (
              <div className="v-connector">
                <motion.div
                  className="v-fill"
                  initial={{ height: 0 }}
                  animate={{ height: eff > steps[i + 1].level ? "100%" : 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   LOGIN PAGE ROOT KOMPONEN (UI TETAP 100% ORIGINAL)
   ============================================================ */
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  // step: 0=login, 1=forgot, 2=otp forgot, 3=new pass, 4=done
  //       5=register, 6=otp signup, 7=success signup
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // OTP (forgot)
  const [otp, setOtp] = useState(Array(6).fill(""));
  // OTP (signup)
  const [sotp, setSotp] = useState(Array(6).fill(""));

  // Sign Up State
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPass, setSuPass] = useState("");
  const [suConf, setSuConf] = useState("");
  const [showSuPass, setShowSuPass] = useState(false);
  const [showSuConf, setShowSuConf] = useState(false);

  // setelah login → dashboard
  const [isAuthed, setIsAuthed] = useState(false);
  if (isAuthed) return <Dashboard />;

  const goTo = (next) => {
    setDirection(next > step ? 1 : -1);
    setStep(Math.max(0, Math.min(next, 7)));
  };

  const variantsSlide = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.55, ease: "easeOut" },
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: { duration: 0.5, ease: "easeIn" },
    }),
  };

  /* ============================================================
     HELPER 6 KOTAK OTP (NO UI CHANGE)
     ============================================================ */
  const renderOtpBoxes = (valueArr, setValueArr) =>
    valueArr.map((v, i) => (
      <input
        key={i}
        type="tel"
        inputMode="numeric"
        maxLength={1}
        className={`otp-box small ${v ? "filled" : ""}`}
        value={v}
        onBeforeInput={(e) => {
          if (e.data && !/^\d$/.test(e.data)) e.preventDefault();
        }}
        onChange={(e) => {
          const t = e.target.value.replace(/\D/g, "");
          const next = [...valueArr];
          next[i] = t[0] || "";
          setValueArr(next);
          if (t) e.target.nextElementSibling?.focus();
        }}
        onPaste={(e) => {
          e.preventDefault();
          const digits = (e.clipboardData.getData("text") || "")
            .replace(/\D/g, "")
            .slice(0, 6 - i);
          if (!digits) return;
          const next = [...valueArr];
          for (let j = 0; j < digits.length; j++) next[i + j] = digits[j];
          setValueArr(next);
        }}
        onKeyDown={(e) => {
          if (e.key === "Backspace") {
            e.preventDefault();
            const next = [...valueArr];
            if (valueArr[i]) {
              next[i] = "";
              setValueArr(next);
            } else {
              e.target.previousElementSibling?.focus();
            }
          }
        }}
      />
    ));

      /* ============================================================
     VALIDASI REGISTER
     ============================================================ */
  const vMin = suPass.length >= 8;
  const vUpper = /[A-Z]/.test(suPass);
  const vNumOrSym = /[\d\W]/.test(suPass);
  const vMatch = suPass !== "" && suPass === suConf;
  const canCreate = suName && suEmail && vMin && vUpper && vNumOrSym && vMatch;

  const stepperMode = step >= 5 ? "signup" : "reset";
  const stepperLevel =
    step >= 5
      ? step === 5
        ? 1
        : step === 6
        ? 2
        : 3
      : step === 1
      ? 1
      : step === 2
      ? 2
      : step === 3
      ? 3
      : 4;

  /* ============================================================
      RETURN UI LOGIN WRAPPER
     ============================================================ */
  return (
    <div className="login-wrapper">
      {/* ==========================
          PANEL KIRI (TETAP SAMA)
         ========================== */}
      <div className="login-left">
        <div className="left-content">
          <h1>
            <span className="red-text">Selamat Datang</span>
            <br />
            <span className="red-text">di</span>
            <span className="purple-text"> POS NUKA</span>
          </h1>
          <p className="lead">
            Kelola transaksimu lebih cepat, mudah, dan akurat
          </p>
        </div>
        <img
          src="/shop.png"
          alt="illustration"
          className="login-illustration"
        />
      </div>

      {/* ==========================
          PANEL KANAN LOGIN
         ========================== */}
      <div className="login-right">
        <div className={`login-card ${step >= 1 ? "dimmed" : ""}`}>
          <h2 className="card-title">LOGIN</h2>

          <div className="subtitle-container">
            <p className="subtitle">Login to Continue</p>
            <div className="subtitle-line"></div>
          </div>

          {/* ============================================================
              LOGIN TERKONEKSI KE BACKEND — API /auth/login
             ============================================================ */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const email = e.target.email.value;
              const password = e.target.password.value;

              try {
                const res = await api.post("/auth/login", {
                  identifier: email,
                  password: password,
                });

                localStorage.setItem("token", res.data.access_token);
                setIsAuthed(true);
              } catch (err) {
                alert(
                  err.response?.data?.message ||
                    "Login gagal, cek email & password"
                );
              }
            }}
          >
            {/* EMAIL */}
            <label className="label">Email</label>
            <div className="input-group">
              <FaEnvelope className="icon" />
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* PASSWORD */}
            <label className="label">Password</label>
            <div className="input-group">
              <FaKey className="icon" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="options">
              <label className="remember">
                <input type="checkbox" className="custom-checkbox" />
                <span className="checkbox-text">Remember me</span>
              </label>

              <button
                type="button"
                className="forgot"
                onClick={() => goTo(1)}
              >
                Forgot Password?
              </button>
            </div>

            {/* TERMS */}
            <p className="terms-text">
              By continuing, you agree to the{" "}
              <a href="#" className="terms-link">
                Terms of Use
              </a>{" "}
              and{" "}
              <a href="#" className="terms-link">
                Privacy Policy
              </a>
              .
            </p>

            {/* LOGIN BUTTON */}
            <button type="submit" className="btn-login">
              LOGIN
            </button>

            {/* SIGNUP BUTTON */}
            <p className="signup-text">
              Don’t have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goTo(5);
                }}
              >
                Sign Up
              </a>
            </p>
          </form>
        </div>

        {/* ============================================================
            WHITE PANEL (ANIMATED) — TIDAK ADA PERUBAHAN UI
           ============================================================ */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              key="white-panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="white-panel"
            >
              {/* Background batik */}
              <div className="white-bg">
                <div className="white-wallpaper" />
                <div className="white-scrim" />
              </div>

              {/* LEFT : PHONE IMAGE */}
              <div className="white-panel__left">
                <img src="/phone.png" alt="Phone Illustration" />
              </div>

              {/* MID : STEPPER */}
              <div className="white-panel__stepper">
                <SideStepper
                  currentStep={stepperLevel}
                  mode={stepperMode}
                />
              </div>

              {/* RIGHT : STACKED CARDS */}
              <div className="white-panel__right">
                <AnimatePresence custom={direction} mode="wait">
                  {/* ============================================================
                      STEP 1 — FORGOT PASSWORD (REQUEST OTP)
                    ============================================================ */}
                  {step === 1 && (
                    <motion.div
                      key="forgot-card"
                      className="stack-card forgot-card"
                      custom={direction}
                      variants={variantsSlide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <div className="forgot-header">
                        <img
                          src="/Gembok.png"
                          alt="Lock"
                          className="forgot-icon"
                        />
                        <h2 className="forgot-title">
                          <span className="forgot-F">F</span>orgot{" "}
                          <span className="forgot-P">P</span>assword?
                        </h2>
                      </div>

                      <p className="forgot-description">
                        Provide the email address linked with your account
                        to reset your password
                      </p>
                      <div className="section-line"></div>

                      {/* REQUEST OTP TO BACKEND */}
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const email = e.target[0].value;

                          try {
                            await api.post(
                              "/auth/requestPasswordReset",
                              { email }
                            );

                            localStorage.setItem(
                              "fp_email",
                              email
                            ); // simpan
                            goTo(2);
                          } catch (err) {
                            alert(
                              err.response?.data?.message ||
                                "Email tidak ditemukan"
                            );
                          }
                        }}
                      >
                        <label className="forgot-label">
                          Email
                        </label>
                        <div className="forgot-input-group">
                          <FaEnvelope className="icon" />
                          <input
                            type="email"
                            placeholder="Masukkan Email Anda"
                            required
                          />
                        </div>

                        <p className="forgot-hint">
                          Harap gunakan email yang sudah terdaftar.
                        </p>

                        <button
                          type="submit"
                          className="btn-request-forgot"
                        >
                          Request Password Reset Link
                        </button>

                        <button
                          type="button"
                          className="btn-back-forgot-clean"
                          onClick={() => goTo(0)}
                        >
                          Back
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* ============================================================
                      STEP 2 — OTP (FORGOT PASSWORD)
                    ============================================================ */}
                  {step === 2 && (
                    <motion.div
                      key="otp-card-fp"
                      className="stack-card otp-card"
                      custom={direction}
                      variants={variantsSlide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <div className="forgot-header">
                        <h2 className="forgot-title">
                          <span className="forgot-F">C</span>ode{" "}
                          <span className="forgot-P">V</span>erification
                        </h2>
                      </div>

                      <p className="forgot-description">
                        Enter OTP sent to your email
                      </p>
                      <div className="section-line"></div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (otp.every((d) => d !== "")) goTo(3);
                        }}
                      >
                        <div className="otp-right-wrap">
                          <div className="otp-inputs clean-otp">
                            {renderOtpBoxes(otp, setOtp)}
                          </div>

                          <p className="hint-text">
                            Didn’t receive the code?{" "}
                            <a href="#" className="resend-link">
                              Resend
                            </a>
                          </p>

                          <button
                            type="submit"
                            className="btn-verify"
                            disabled={otp.some((d) => d === "")}
                          >
                            Verify Code
                          </button>

                          <button
                            type="button"
                            className="btn-back-otp"
                            onClick={() => goTo(1)}
                          >
                            Back
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* ============================================================
                      STEP 3 — CREATE NEW PASSWORD (RESET PASSWORD)
                    ============================================================ */}
                  {step === 3 && (
                    <motion.div
                      key="create-newpass"
                      className="stack-card newpass-card"
                      custom={direction}
                      variants={variantsSlide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <div className="forgot-header">
                        <h2 className="forgot-title">
                          <span className="word">
                            <span className="forgot-F">N</span>ew
                          </span>{" "}
                          <span className="word">
                            <span className="forgot-P">P</span>assword
                          </span>
                        </h2>
                      </div>

                      <p className="forgot-description">
                        Please create a strong new password for your
                        account.
                      </p>

                      <div className="section-line"></div>

                      {/* RESET PASSWORD TO BACKEND */}
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();

                          const email =
                            localStorage.getItem("fp_email");
                          const pass = e.target[0].value;
                          const conf = e.target[1].value;

                          if (pass !== conf)
                            return alert("Password tidak sama");

                          try {
                            await api.post("/auth/resetPassword", {
                              email,
                              otp: otp.join(""),
                              newPassword: pass,
                            });

                            alert(
                              "Password berhasil diperbarui."
                            );
                            goTo(4);
                          } catch (err) {
                            alert(
                              err.response?.data?.message ||
                                "Gagal reset password"
                            );
                          }
                        }}
                      >
                        <label className="forgot-label">
                          New Password
                        </label>
                        <div className="forgot-input-group">
                          <FaKey className="icon" />
                          <input
                            type="password"
                            placeholder="Use at least 8 characters"
                            required
                          />
                        </div>

                        <label className="forgot-label">
                          Confirm Password
                        </label>
                        <div className="forgot-input-group">
                          <FaKey className="icon" />
                          <input
                            type="password"
                            placeholder="Confirm Password"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn-submit"
                        >
                          Submit
                        </button>

                        <button
                          type="button"
                          className="btn-back-newpass"
                          onClick={() => goTo(2)}
                        >
                          Back
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* ============================================================
                      STEP 4 — SUCCESS (RESET PASSWORD)
                    ============================================================ */}
                  {step === 4 && (
                    <motion.div
                      key="success-reset"
                      className="stack-card success-card"
                      custom={direction}
                      variants={variantsSlide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <div className="success-hero">
                        <div className="success-icon">
                          <img
                            src="/check.png"
                            alt="Success"
                            className="success-img"
                          />
                        </div>
                        <p className="success-text">
                          Congratulations! Your password has been
                          updated.
                          <br />
                          Click <b>Continue</b> to login
                        </p>
                      </div>

                      <div className="success-actions">
                        <button
                          type="button"
                          className="btn-submit"
                          onClick={() => goTo(0)}
                        >
                          Continue
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ============================================================
                      STEP 5 — SIGN UP (REGISTER)
                    ============================================================ */}
                  {step === 5 && (
                    <motion.div
                      key="signup-register"
                      className="stack-card signup-card"
                      custom={direction}
                      variants={variantsSlide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <div className="forgot-header">
                        <h2 className="register-title">Register</h2>
                      </div>

                      <div className="section-line"></div>

                      {/* REGISTER TO BACKEND */}
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();

                          if (!canCreate)
                            return alert("Form belum lengkap");

                          try {
                            const res = await api.post(
                              "/auth",
                              {
                                email: suEmail,
                                username: suName,
                                password: suPass,
                              }
                            );

                            alert(res.data.message);
                            goTo(6); // lanjut OTP
                          } catch (err) {
                            alert(
                              err.response?.data?.message ||
                                "Gagal membuat akun"
                            );
                          }
                        }}
                      >
                        {/* USERNAME */}
                        <div className="field-row">
                          <div className="float-field right-icon">
                            <input
                              type="text"
                              placeholder=" "
                              value={suName}
                              onChange={(e) =>
                                setSuName(e.target.value)
                              }
                              required
                            />
                            <label>Username</label>
                            <FaUser className="inbar-icon" />
                          </div>
                        </div>

                        {/* EMAIL */}
                        <div className="field-row">
                          <div className="float-field right-icon">
                            <input
                              type="email"
                              placeholder=" "
                              value={suEmail}
                              onChange={(e) =>
                                setSuEmail(e.target.value)
                              }
                              required
                            />
                            <label>Email</label>
                            <FaEnvelope className="inbar-icon" />
                          </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="field-row">
                          <div className="float-field right-icon">
                            <input
                              type={showSuPass ? "text" : "password"}
                              placeholder=" "
                              value={suPass}
                              onChange={(e) =>
                                setSuPass(e.target.value)
                              }
                              required
                            />
                            <label>Create Password</label>
                            <FaKey className="inbar-icon" />
                          </div>

                          <button
                            type="button"
                            className="outside-ico eye-ctrl"
                            onClick={() =>
                              setShowSuPass((v) => !v)
                            }
                          >
                            {showSuPass ? (
                              <FaEyeSlash />
                            ) : (
                              <FaEye />
                            )}
                          </button>
                        </div>

                        {/* RULES */}
                        <PasswordRules value={suPass} />

                        {/* CONFIRM PASSWORD */}
                        <div className="field-row">
                          <div className="float-field right-icon">
                            <input
                              type={showSuConf ? "text" : "password"}
                              placeholder=" "
                              value={suConf}
                              onChange={(e) =>
                                setSuConf(e.target.value)
                              }
                              required
                            />
                            <label>Confirm Password</label>
                            <FaKey className="inbar-icon" />
                          </div>

                          <button
                            type="button"
                            className="outside-ico eye-ctrl"
                            onClick={() =>
                              setShowSuConf((v) => !v)
                            }
                          >
                            {showSuConf ? (
                              <FaEyeSlash />
                            ) : (
                              <FaEye />
                            )}
                          </button>
                        </div>

                        {/* PASSWORD MATCH TEXT */}
                        <p className="confirm-hint">
                          {suConf.length > 0
                            ? vMatch
                              ? "Password match"
                              : "Password does not match"
                            : ""}
                        </p>

                        {/* BUTTON REGISTER */}
                        <button
                          type="submit"
                          className="btn-submit"
                          disabled={!canCreate}
                        >
                          Buat Akun
                        </button>

                        <button
                          type="button"
                          className="btn-back-newpass"
                          onClick={() => goTo(0)}
                        >
                          Kembali
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* ============================================================
                      STEP 6 — OTP SIGNUP (VERIFY OTP)
                    ============================================================ */}
                  {step === 6 && (
                    <motion.div
                      key="signup-otp"
                      className="stack-card otp-card"
                      custom={direction}
                      variants={variantsSlide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <div className="forgot-header">
                        <h2 className="forgot-title">
                          <span className="forgot-F">A</span>
                          utentikasi{" "}
                          <span className="forgot-P">OTP</span>
                        </h2>
                      </div>

                      <p className="forgot-description">
                        Masukkan kode OTP yang dikirim ke email Anda.
                      </p>

                      <div className="section-line"></div>

                      {/* VERIFY OTP SIGNUP */}
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();

                          const code = sotp.join("");

                          try {
                            await api.post("/auth/verify-otp", {
                              email: suEmail,
                              otp: code,
                            });

                            alert("Akun berhasil diverifikasi!");
                            goTo(7);
                          } catch (err) {
                            alert(
                              err.response?.data?.message ||
                                "OTP salah"
                            );
                          }
                        }}
                      >
                        <div className="otp-right-wrap">
                          <div className="otp-inputs clean-otp">
                            {renderOtpBoxes(sotp, setSotp)}
                          </div>

                          <p className="hint-text">
                            Tidak menerima kode?{" "}
                            <a href="#" className="resend-link">
                              Kirim ulang
                            </a>
                          </p>

                          <button
                            type="submit"
                            className="btn-verify"
                            disabled={sotp.some((d) => d === "")}
                          >
                            Verify Code
                          </button>

                          <button
                            type="button"
                            className="btn-back-otp"
                            onClick={() => goTo(5)}
                          >
                            Kembali
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* ============================================================
                      STEP 7 — SIGNUP SUCCESS
                    ============================================================ */}
                  {step === 7 && (
                    <motion.div
                      key="signup-success"
                      className="stack-card signup-success-card"
                      custom={direction}
                      variants={variantsSlide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <div className="success-hero">
                        <div className="success-icon">
                          <img
                            src="/check.png"
                            alt="Account Created"
                            className="success-img"
                          />
                        </div>

                        <p className="success-text">
                          Your account has been created successfully.
                          <br />
                          You can now sign in and start using our services.
                        </p>
                      </div>

                      <div className="success-actions">
                        <button
                          type="button"
                          className="btn-submit"
                          onClick={() => goTo(0)}
                        >
                          LOGIN
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
