import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaChevronUp, FaChevronDown, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";

export function useClickOutside(onClose) {
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose?.();
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [onClose]);
    return ref;
}

export function ProfilePill() {
    const [open, setOpen] = useState(false);
    const ref = useClickOutside(() => setOpen(false));

    const pillStyle = {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 14px",
        borderRadius: "999px",
        border: "2px solid #f59e0b",
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)",
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    };

    const avatarStyle = {
        width: "32px",
        height: "32px",
        borderRadius: "999px",
        background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: "700",
        fontSize: "14px",
        boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
    };

    const infoStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
    };

    const nameStyle = {
        fontSize: "13px",
        fontWeight: "600",
        color: "#f1f5f9",
        lineHeight: "1.2",
    };

    const roleStyle = {
        fontSize: "10px",
        color: "#94a3b8",
    };

    const caretStyle = {
        color: "#94a3b8",
        fontSize: "12px",
        transition: "transform 0.2s ease",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
    };

    const menuStyle = {
        position: "absolute",
        top: "calc(100% + 10px)",
        right: "0",
        width: "200px",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        borderRadius: "16px",
        padding: "8px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
        zIndex: 100,
    };

    const menuItemStyle = {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "12px 14px",
        border: "none",
        borderRadius: "10px",
        background: "transparent",
        color: "#e2e8f0",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
    };

    const menuSepStyle = {
        height: "1px",
        background: "rgba(148, 163, 184, 0.2)",
        margin: "6px 0",
    };

    return (
        <div className="profile" ref={ref} style={{ position: "relative" }}>
            <button
                style={pillStyle}
                onClick={() => setOpen((v) => !v)}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(245, 158, 11, 0.3)";
                    e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.5)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
                    e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.3)";
                }}
            >
                <div style={avatarStyle}>A</div>
                <div style={infoStyle}>
                    <span style={nameStyle}>Admin</span>
                    <span style={roleStyle}>Administrator</span>
                </div>
                <span style={caretStyle}>
                    <FaChevronDown />
                </span>
            </button>

            {open && (
                <div style={menuStyle}>
                    <button
                        style={menuItemStyle}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(245, 158, 11, 0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                        <FaUser style={{ color: "#f59e0b" }} />
                        <span>Profil Saya</span>
                    </button>
                    <button
                        style={menuItemStyle}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(245, 158, 11, 0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                        <FaCog style={{ color: "#94a3b8" }} />
                        <span>Pengaturan</span>
                    </button>
                    <div style={menuSepStyle} />
                    <button
                        style={{ ...menuItemStyle, color: "#f87171" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                        <FaSignOutAlt style={{ color: "#f87171" }} />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export function ChartHeader({ title, rightTitle }) {
    return (
        <div className="panel-header panel-header--chart">
            <div className="ph-leftwrap">
                <div className="ph-title">{title}</div>
            </div>
            <div className="ph-righttitle">{rightTitle}</div>
        </div>
    );
}
