// WhiteBar.jsx
import React from "react";
import { FaShoppingCart, FaCalendarAlt } from "react-icons/fa";
import "./Dashboard.css";

export default function WhiteBar({ today }) {
  return (
    <header className="ds-topbar">
      <div className="left">
        <div className="logo-cart">
          <FaShoppingCart />
        </div>

        <div className="brand-block">
  <div className="brand">NUKA</div>
  <div className="date">
    <FaCalendarAlt /> {today}
  </div>
</div>
      </div>

      <div className="right">
        {/* kalau nanti mau pakai <ProfilePill /> bisa taruh di sini */}
      </div>
    </header>
  );
}
