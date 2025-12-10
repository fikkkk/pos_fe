// Sidebar.jsx
import React from "react";
import {
  FaUserCircle,
  FaThLarge,
  FaPaperPlane,
  FaFileAlt,
  FaUsers,
  FaCog,          // ✅ icon pengaturan
} from "react-icons/fa";
import "./Dashboard.css";
import { Link } from "react-router-dom";

export default function Sidebar({ activeMenu, setActiveMenu }) {
  return (
    <aside className="ds-sidebar">
      {/* Header user di atas sidebar */}
      <div className="ds-side-header">
        <div className="side-user">
          <FaUserCircle />
        </div>
      </div>

      {/* Hanya ICON, teks muncul sebagai bubble saat hover */}
      <nav className="ds-nav">
        {/* MENU DASHBOARD */}
        <a
          className={
            "ds-nav-item " + (activeMenu === "dashboard" ? "active" : "")
          }
          data-label="Dashboard"
          onClick={() => setActiveMenu("dashboard")}
        >
          <span className="ico">
            <FaThLarge />
          </span>
        </a>

        {/* MENU TRANSAKSI */}
        <a
          className={
            "ds-nav-item " + (activeMenu === "transaksi" ? "active" : "")
          }
          data-label="Transaksi"
          onClick={() => setActiveMenu("transaksi")}
        >
          <span className="ico">
            <FaPaperPlane />
          </span>
        </a>

        {/* MENU MASTER DATA */}
{/* MENU MASTER DATA */}
<a
  className={
    "ds-nav-item " + (activeMenu === "datamaster" ? "active" : "")
  }
  data-label="Master Data"
  onClick={() => setActiveMenu("datamaster")}
>
  <span className="ico">
    <FaFileAlt />
  </span>
</a>


        {/* MENU LAPORAN */}
        <a className="ds-nav-item" data-label="Laporan Manajemen">
          <span className="ico">
            <FaUsers />
          </span>
        </a>
      </nav>

      {/* ✅ NAV PENGATURAN DI POJOK KIRI BAWAH */}
      <div className="ds-side-bottom">
        <a
          className={
            "ds-nav-item " + (activeMenu === "pengaturan" ? "active" : "")
          }
          data-label="Pengaturan"
          onClick={() => setActiveMenu && setActiveMenu("pengaturan")}
        >
          <span className="ico">
            <FaCog />
          </span>
        </a>
      </div>
    </aside>
  );
}
