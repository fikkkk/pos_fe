import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaChevronUp, FaChevronDown } from "react-icons/fa";

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
    return (
        <div className="profile" ref={ref}>
            <button
                className={`profile-pill ${open ? "is-open" : ""}`}
                onClick={() => setOpen((v) => !v)}
            >
                <span className="avatar">
                    <FaUserCircle />
                </span>
                <span className="caret">
                    {open ? <FaChevronUp /> : <FaChevronDown />}
                </span>
            </button>

            {open && (
                <div className="profile-menu">
                    <button className="menu-item">
                        <span>Profil</span>
                    </button>
                    <button className="menu-item">
                        <span>Pengaturan</span>
                    </button>
                    <div className="menu-sep" />
                    <button className="menu-item danger">
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
