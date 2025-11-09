// DashboardShell.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaCalendarAlt, FaUserCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./Dashboard.css";

function ProfilePill() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="profile" ref={ref}>
      <button className={`profile-pill ${open ? "is-open" : ""}`} onClick={() => setOpen(v => !v)}>
        <span className="avatar"><FaUserCircle /></span>
        <span className="caret">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {open && (
        <div className="profile-menu">
          <button className="menu-item"><span>Profil</span></button>
          <button className="menu-item"><span>Pengaturan</span></button>
          <div className="menu-sep" />
          <button className="menu-item danger"><span>Logout</span></button>
        </div>
      )}
    </div>
  );
}

/** Shell = area biru muda. Anak (children) = area biru tua (scroll). */
export default function DashboardShell({ brand = "POS NUKA", date = "Kamis, 2 Oktober 2025", children }) {
  return (
    <main className="ds-main">{/* ← grid-rows: 72px + 1fr (lihat CSS) */}
      {/* TOPBAR (tetap diam, tidak ikut scroll) */}
      <header className="ds-topbar">
        <div className="left">
          <div className="brand">{brand}</div>
          <div className="date"><FaCalendarAlt /> {date}</div>
        </div>
        <div className="right"><ProfilePill /></div>
      </header>

      {/* ISI (area biru tua) — hanya bagian ini yang scroll */}
      <section className="ds-inner hide-scrollbar">
        {children}
      </section>
    </main>
  );
}
