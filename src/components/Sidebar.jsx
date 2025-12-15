import React, { useState, useEffect } from "react";
import {
  FaThLarge,
  FaShoppingCart,
  FaFileAlt,
  FaChartPie,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./Dashboard.css";
import ThemeToggle from "./dashboard/ThemeToggle";
import { api } from "../api";

export default function Sidebar({ activeMenu, setActiveMenu, isDarkMode, toggleTheme, onLogout, profileUpdateKey }) {
  const [profile, setProfile] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch user profile - refetch when profileUpdateKey changes
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/me");
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile for sidebar:", err);
      }
    };
    fetchProfile();
  }, [profileUpdateKey]);

  const mainMenus = [
    { id: "dashboard", label: "Dashboard", icon: <FaThLarge /> },
    { id: "transaksi", label: "Transaksi", icon: <FaShoppingCart /> },
    { id: "datamaster", label: "Data Master", icon: <FaFileAlt /> },
    { id: "laporan", label: "Laporan Manajemen", icon: <FaChartPie /> },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  // Get display name (username or name)
  const displayName = profile?.username || profile?.name || "User";
  // Get role label
  const roleLabel = profile?.role || "User";
  // Get avatar initial
  const avatarInitial = displayName[0]?.toUpperCase() || "U";

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
            {profile?.picture ? (
              <img
                src={`http://localhost:3000${profile.picture}`}
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
        <div className="logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <FaExclamationTriangle />
            </div>
            <h3 className="logout-modal-title">Konfirmasi Logout</h3>
            <p className="logout-modal-message">
              Apakah Anda yakin ingin keluar dari aplikasi?
            </p>
            <div className="logout-modal-actions">
              <button className="logout-btn-cancel" onClick={() => setShowLogoutModal(false)}>
                Batal
              </button>
              <button className="logout-btn-confirm" onClick={confirmLogout}>
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

