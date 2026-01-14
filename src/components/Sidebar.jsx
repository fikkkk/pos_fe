import React, { useState, useEffect } from "react";
import {
  FaThLarge,
  FaShoppingCart,
  FaFileAlt,
  FaChartPie,
  FaUsers,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import "./Dashboard.css";
import ThemeToggle from "./dashboard/ThemeToggle";
import { api } from "../api";

export default function Sidebar({ activeMenu, setActiveMenu, isDarkMode, toggleTheme, onLogout, profileUpdateKey }) {
  const [profile, setProfile] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Decode JWT Token
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Get user info from token
  const token = localStorage.getItem("token");
  const userInfo = token ? decodeJWT(token) : null;

  // Fetch user profile - refetch when profileUpdateKey changes
  useEffect(() => {
    const loadProfile = async () => {
      // Pertama coba ambil dari API
      try {
        const res = await api.get("/profile/me");
        setProfile(res.data);
        return; // Berhasil, keluar
      } catch (err) {
        console.error("Error fetching profile for sidebar:", err);
      }

      // Fallback: gunakan data dari localStorage
      const savedName = localStorage.getItem("profile_name");
      const savedUsername = localStorage.getItem("profile_username");
      const savedPicture = localStorage.getItem("profile_picture");
      const localPicture = localStorage.getItem("profile_picture_local");

      // Decode token untuk fallback
      const tkn = localStorage.getItem("token");
      const info = tkn ? decodeJWT(tkn) : null;

      const fallbackProfile = {
        name: savedName || info?.name || info?.username || "User",
        username: savedUsername || info?.username || info?.email?.split("@")[0] || "user",
        role: info?.role || "KASIR",
        picture: savedPicture || (localPicture ? "LOCAL" : null),
      };
      setProfile(fallbackProfile);
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUpdateKey]); // Hanya bergantung pada profileUpdateKey

  const mainMenus = [
    { id: "dashboard", label: "Dashboard", icon: <FaThLarge /> },
    { id: "transaksi", label: "Transaksi", icon: <FaShoppingCart /> },
    { id: "datamaster", label: "Data Master", icon: <FaFileAlt /> },
    { id: "laporan", label: "Laporan Manajemen", icon: <FaChartPie /> },
    { id: "member", label: "Member", icon: <FaUsers /> },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Clear token and all profile cache data
    localStorage.removeItem("token");
    localStorage.removeItem("profile_name");
    localStorage.removeItem("profile_username");
    localStorage.removeItem("profile_picture");
    localStorage.removeItem("profile_picture_local");
    localStorage.removeItem("last_login");
    localStorage.removeItem("member_since");
    setShowLogoutModal(false);

    setShowLogoutModal(false);

    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Get display name (username first, then name as fallback)
  const displayName = profile?.username || profile?.name || "User";
  // Get role label
  const roleLabel = profile?.role || "User";
  // Get avatar initial
  const avatarInitial = displayName[0]?.toUpperCase() || "U";

  // Get profile picture source
  const getProfilePicSrc = () => {
    if (!profile?.picture) return null;
    if (profile.picture === "LOCAL") {
      return localStorage.getItem("profile_picture_local");
    }
    if (profile.picture.startsWith("data:")) {
      return profile.picture;
    }
    return `http://localhost:3000${profile.picture}`;
  };

  const profilePicSrc = getProfilePicSrc();

  return (
    <>
      <aside className="ds-sidebar ds-sidebar-dark">
        {/* BRAND + THEME TOGGLE */}
        <div className="ds-side-brand" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="ds-brand-logo">N</div>
            <div className="ds-brand-text">
              <div className="brand-name">POS Nuka</div>
              <div className="brand-sub">Kasir UMKM</div>
            </div>
          </div>
          {/* Theme Toggle di kanan */}
          <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
        </div>

        {/* USER CARD - Dynamic user display */}
        <div className="ds-side-user-card">
          <div className="ds-user-avatar">
            {profilePicSrc ? (
              <img
                src={profilePicSrc}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%"
                }}
              />
            ) : (
              <span>{avatarInitial}</span>
            )}
          </div>
          <div className="ds-user-meta">
            <div className="user-name">{displayName}</div>
            <div className="user-role">{roleLabel}</div>
          </div>
        </div>

        {/* MENU UTAMA */}
        <nav className="ds-nav-dark">
          <div className="ds-sidebar-date">
            <span className="ds-date-text">
              {new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="ds-nav-caption">Menu</div>
          {mainMenus.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveMenu(m.id)}
              className={
                "ds-nav-item-dark" + (activeMenu === m.id ? " active" : "")
              }
            >
              <span className="nav-ico">{m.icon}</span>
              <span className="nav-label">{m.label}</span>
            </button>
          ))}
        </nav>

        {/* BAGIAN BAWAH */}
        <div className="ds-side-bottom-dark">
          <button
            type="button"
            className={"ds-nav-item-dark" + (activeMenu === "akun" ? " active" : "")}
            onClick={() => setActiveMenu("akun")}
          >
            <span className="nav-ico">
              <FaUser />
            </span>
            <span className="nav-label">Akun Saya</span>
          </button>

          <button
            type="button"
            className={"ds-nav-item-dark" + (activeMenu === "pengaturan" ? " active" : "")}
            onClick={() => setActiveMenu("pengaturan")}
          >
            <span className="nav-ico">
              <FaCog />
            </span>
            <span className="nav-label">Pengaturan</span>
          </button>

          <button type="button" className="ds-logout-btn" onClick={handleLogoutClick}>
            <span className="nav-ico">
              <FaSignOutAlt />
            </span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="logout-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button className="logout-close-btn" onClick={cancelLogout}>
              <FaTimes />
            </button>

            {/* Icon with Animation */}
            <div className="logout-icon-wrapper">
              <div className="logout-icon-bg"></div>
              <div className="logout-icon">
                <FaExclamationTriangle />
              </div>
            </div>

            {/* Title */}
            <h2 className="logout-title">Konfirmasi Logout</h2>

            {/* Message */}
            <p className="logout-message">
              Apakah Anda yakin ingin keluar dari aplikasi?<br />
              <span className="logout-warning">Sesi Anda akan berakhir dan data yang belum disimpan akan hilang.</span>
            </p>

            {/* User Info */}
            <div className="logout-user-info">
              <div className="logout-user-avatar">
                {profilePicSrc ? (
                  <img src={profilePicSrc} alt="Profile" />
                ) : (
                  <span>{avatarInitial}</span>
                )}
              </div>
              <div className="logout-user-details">
                <span className="logout-user-name">{displayName}</span>
                <span className="logout-user-role">{roleLabel}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="logout-actions">
              <button className="logout-btn-cancel" onClick={cancelLogout}>
                <span>Batal</span>
              </button>
              <button className="logout-btn-confirm" onClick={confirmLogout}>
                <FaSignOutAlt />
                <span>Ya, Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
