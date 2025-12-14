import React, { useState, useRef, useEffect } from "react";
import {
  FaThLarge,
  FaShoppingCart,
  FaFileAlt,
  FaChartPie,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import "./Dashboard.css";
import ThemeToggle from "./dashboard/ThemeToggle";

export default function Sidebar({ activeMenu, setActiveMenu, isDarkMode, toggleTheme, onLogout }) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const mainMenus = [
    { id: "dashboard", label: "Dashboard", icon: <FaThLarge /> },
    { id: "transaksi", label: "Transaksi", icon: <FaShoppingCart /> },
    { id: "datamaster", label: "Data Master", icon: <FaFileAlt /> },
    { id: "laporan", label: "Laporan", icon: <FaChartPie /> },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  return (
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

      {/* USER CARD WITH DROPDOWN */}
      <div className="ds-side-user-wrapper" ref={dropdownRef}>
        <div
          className={`ds-side-user-card clickable ${userDropdownOpen ? "open" : ""}`}
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
        >
          <div className="ds-user-avatar">
            <span>A</span>
          </div>
          <div className="ds-user-meta">
            <div className="user-name">Admin</div>
            <div className="user-role">Administrator</div>
          </div>
          <div className="ds-user-chevron">
            {userDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        </div>

        {/* Dropdown Menu */}
        {userDropdownOpen && (
          <div className="ds-user-dropdown">
            <button
              className="dropdown-item"
              onClick={() => handleMenuClick("akun")}
            >
              <FaUser />
              <span>Profil Saya</span>
            </button>
            <button
              className="dropdown-item"
              onClick={() => handleMenuClick("pengaturan")}
            >
              <FaCog />
              <span>Pengaturan</span>
            </button>
            <div className="dropdown-divider"></div>
            <button
              className="dropdown-item logout"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* MENU UTAMA */}
      <nav className="ds-nav-dark">
        <div className="ds-nav-caption">Menu</div>
        {mainMenus.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => handleMenuClick(m.id)}
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
          onClick={() => handleMenuClick("akun")}
        >
          <span className="nav-ico">
            <FaUser />
          </span>
          <span className="nav-label">Akun Saya</span>
        </button>

        <button
          type="button"
          className={"ds-nav-item-dark" + (activeMenu === "pengaturan" ? " active" : "")}
          onClick={() => handleMenuClick("pengaturan")}
        >
          <span className="nav-ico">
            <FaCog />
          </span>
          <span className="nav-label">Pengaturan</span>
        </button>

        <button type="button" className="ds-logout-btn" onClick={handleLogout}>
          <span className="nav-ico">
            <FaSignOutAlt />
          </span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}

