import React, { useState } from "react";
import { FaUserCircle, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { useClickOutside } from "./utils";

export default function ProfilePill() {
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
