// src/components/Sidebar.jsx
import React from "react";
import {
  FaThLarge,
  FaShoppingCart,
  FaFileAlt,
  FaUsers,
  FaPowerOff,
} from "react-icons/fa";
import "./Dashboard.css";

export default function Sidebar({ activeMenu, setActiveMenu }) {
  const mainMenus = [
    { id: "dashboard", label: "Dashboard", icon: <FaThLarge /> },
    { id: "transaksi", label: "Transaksi", icon: <FaShoppingCart /> },
    { id: "datamaster", label: "Data Master", icon: <FaFileAlt /> },
  ];

  return (
    <aside className="ds-sidebar ds-sidebar-dark">
      {/* BRAND */}
      <div className="ds-side-brand">
        <div className="ds-brand-logo">N</div>
        <div className="ds-brand-text">
          <div className="brand-name">POS Nuka</div>
          <div className="brand-sub">Kasir UMKM</div>
        </div>
      </div>

      {/* USER CARD */}
      <div className="ds-side-user-card">
        <div className="ds-user-avatar">
          <span>A</span>
        </div>
        <div className="ds-user-meta">
          <div className="user-name">Admin</div>
          <div className="user-role">Mode Gelap</div>
        </div>
      </div>

      {/* MENU UTAMA */}
      <nav className="ds-nav-dark">
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
        <button type="button" className="ds-nav-item-dark ghost">
          <span className="nav-ico">
            <FaUsers />
          </span>
          <span className="nav-label">Pengguna</span>
        </button>

        <button type="button" className="ds-logout-btn">
          <span className="nav-ico">
            <FaPowerOff />
          </span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
