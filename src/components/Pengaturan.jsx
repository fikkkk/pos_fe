import React, { useState, useEffect } from "react";
import {
    FaCog,
    FaPalette,
    FaBell,
    FaLock,
    FaInfoCircle,
    FaMoon,
    FaSun,
    FaToggleOn,
    FaToggleOff,
    FaSave,
    FaSpinner,
    FaCheckCircle,
    FaTimes,
    FaEye,
    FaEyeSlash,
    FaCode,
    FaHeart,
} from "react-icons/fa";
import { api } from "../api";
import "./Pengaturan.css";

export default function Pengaturan({ isDarkMode, toggleTheme }) {
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    // Notification settings
    const [notifications, setNotifications] = useState({
        emailNotif: true,
        soundNotif: true,
        transactionAlert: true,
        lowStockAlert: true,
    });

    // Password form
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false,
    });
    const [changingPassword, setChangingPassword] = useState(false);

    const handleNotificationToggle = (key) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
        // Save to localStorage
        const updated = { ...notifications, [key]: !notifications[key] };
        localStorage.setItem("notificationSettings", JSON.stringify(updated));
        showSuccess("Pengaturan notifikasi disimpan");
    };

    const showSuccess = (message) => {
        setSuccess(message);
        setTimeout(() => setSuccess(null), 3000);
    };

    const showError = (message) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleChangePassword = async () => {
        // Validation
        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            showError("Semua field password harus diisi");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            showError("Password baru minimal 6 karakter");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showError("Konfirmasi password tidak cocok");
            return;
        }

        setChangingPassword(true);
        try {
            await api.patch("/auth/change-password", {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
            });

            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
            showSuccess("Password berhasil diubah!");
        } catch (err) {
            console.error("Error changing password:", err);
            showError(err.response?.data?.message || "Gagal mengubah password");
        } finally {
            setChangingPassword(false);
        }
    };

    // Load notification settings from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("notificationSettings");
        if (saved) {
            try {
                setNotifications(JSON.parse(saved));
            } catch (e) {
                console.error("Error loading notification settings");
            }
        }
    }, []);

    const ToggleSwitch = ({ enabled, onToggle, label }) => (
        <div className="toggle-row" onClick={onToggle}>
            <span className="toggle-label">{label}</span>
            <div className={`toggle-switch ${enabled ? "active" : ""}`}>
                <div className="toggle-thumb"></div>
            </div>
        </div>
    );

    return (
        <div className="pengaturan-page">
            {/* Header */}
            <div className="pengaturan-header">
                <div className="pengaturan-header-content">
                    <div className="pengaturan-header-icon">
                        <FaCog />
                    </div>
                    <div className="pengaturan-header-text">
                        <h1 className="pengaturan-title">Pengaturan</h1>
                        <p className="pengaturan-subtitle">
                            Kelola preferensi dan pengaturan aplikasi Anda
                        </p>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="pengaturan-alert error">
                    <FaTimes className="alert-icon" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><FaTimes /></button>
                </div>
            )}
            {success && (
                <div className="pengaturan-alert success">
                    <FaCheckCircle className="alert-icon" />
                    <span>{success}</span>
                </div>
            )}

            <div className="pengaturan-content">
                {/* Appearance Section */}
                <div className="pengaturan-card">
                    <div className="pengaturan-card-header">
                        <div className="card-header-title">
                            <FaPalette className="header-icon purple" />
                            <h3>Tampilan</h3>
                        </div>
                    </div>
                    <div className="pengaturan-card-body">
                        <div className="theme-toggle-section">
                            <div className="theme-info">
                                <div className="theme-icon-wrap">
                                    {isDarkMode ? <FaMoon className="theme-icon moon" /> : <FaSun className="theme-icon sun" />}
                                </div>
                                <div className="theme-text">
                                    <span className="theme-label">Mode Tema</span>
                                    <span className="theme-value">{isDarkMode ? "Mode Gelap" : "Mode Terang"}</span>
                                </div>
                            </div>
                            <button className="theme-toggle-btn" onClick={toggleTheme}>
                                {isDarkMode ? <FaSun /> : <FaMoon />}
                                <span>Ganti ke {isDarkMode ? "Terang" : "Gelap"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="pengaturan-card">
                    <div className="pengaturan-card-header">
                        <div className="card-header-title">
                            <FaBell className="header-icon yellow" />
                            <h3>Notifikasi</h3>
                        </div>
                    </div>
                    <div className="pengaturan-card-body">
                        <ToggleSwitch
                            enabled={notifications.emailNotif}
                            onToggle={() => handleNotificationToggle("emailNotif")}
                            label="Notifikasi Email"
                        />
                        <ToggleSwitch
                            enabled={notifications.soundNotif}
                            onToggle={() => handleNotificationToggle("soundNotif")}
                            label="Suara Notifikasi"
                        />
                        <ToggleSwitch
                            enabled={notifications.transactionAlert}
                            onToggle={() => handleNotificationToggle("transactionAlert")}
                            label="Alert Transaksi Baru"
                        />
                        <ToggleSwitch
                            enabled={notifications.lowStockAlert}
                            onToggle={() => handleNotificationToggle("lowStockAlert")}
                            label="Alert Stok Rendah"
                        />
                    </div>
                </div>

                {/* Security Section */}
                <div className="pengaturan-card">
                    <div className="pengaturan-card-header">
                        <div className="card-header-title">
                            <FaLock className="header-icon green" />
                            <h3>Keamanan</h3>
                        </div>
                    </div>
                    <div className="pengaturan-card-body">
                        <div className="password-section">
                            <h4>Ubah Password</h4>
                            <p className="password-desc">Pastikan password baru minimal 6 karakter dan berbeda dari sebelumnya</p>

                            <div className="password-form">
                                <div className="form-group">
                                    <label>Password Lama</label>
                                    <div className="password-input-wrap">
                                        <input
                                            type={showPasswords.old ? "text" : "password"}
                                            name="oldPassword"
                                            value={passwordForm.oldPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Masukkan password lama"
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPasswords(p => ({ ...p, old: !p.old }))}
                                        >
                                            {showPasswords.old ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Password Baru</label>
                                    <div className="password-input-wrap">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            name="newPassword"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Masukkan password baru"
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                                        >
                                            {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Konfirmasi Password</label>
                                    <div className="password-input-wrap">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Konfirmasi password baru"
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                                        >
                                            {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="change-password-btn"
                                    onClick={handleChangePassword}
                                    disabled={changingPassword}
                                >
                                    {changingPassword ? (
                                        <><FaSpinner className="spinner" /> Menyimpan...</>
                                    ) : (
                                        <><FaSave /> Ubah Password</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="pengaturan-card">
                    <div className="pengaturan-card-header">
                        <div className="card-header-title">
                            <FaInfoCircle className="header-icon blue" />
                            <h3>Tentang Aplikasi</h3>
                        </div>
                    </div>
                    <div className="pengaturan-card-body">
                        <div className="about-section">
                            <div className="app-logo">
                                <span className="logo-text">N</span>
                            </div>
                            <div className="app-info">
                                <h4>POS Nuka</h4>
                                <p className="app-version">Versi 1.0.0</p>
                                <p className="app-desc">Aplikasi Point of Sale modern untuk UMKM Indonesia</p>
                            </div>
                        </div>

                        <div className="about-meta">
                            <div className="meta-row">
                                <FaCode />
                                <span>Dibangun dengan React & NestJS</span>
                            </div>
                            <div className="meta-row">
                                <FaHeart className="heart" />
                                <span>Made with love in Indonesia</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
