import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";

/**
 * Modern Theme Toggle Switch
 * Switches between light and dark mode with smooth animation
 */
export default function ThemeToggle({ isDark, onToggle }) {
    return (
        <>
            <style>{`
        .theme-toggle {
          position: relative;
          width: 56px;
          height: 28px;
          background: ${isDark
                    ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                    : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'};
          border-radius: 999px;
          border: none;
          cursor: pointer;
          padding: 3px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 2px 8px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(245, 158, 11, 0.3)'},
            inset 0 1px 0 rgba(255,255,255,0.2);
          outline: none;
        }
        .theme-toggle:hover {
          transform: scale(1.05);
          box-shadow: 
            0 4px 16px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(245, 158, 11, 0.4)'},
            inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .theme-toggle:active {
          transform: scale(0.98);
        }
        .toggle-knob {
          position: absolute;
          top: 3px;
          left: ${isDark ? 'calc(100% - 25px)' : '3px'};
          width: 22px;
          height: 22px;
          background: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .toggle-knob svg {
          font-size: 12px;
          color: ${isDark ? '#6366f1' : '#f59e0b'};
          transition: all 0.3s ease;
        }
        .toggle-bg-icons {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 7px;
          pointer-events: none;
        }
        .toggle-bg-icons svg {
          font-size: 10px;
          opacity: 0.6;
          transition: opacity 0.3s;
        }
        .toggle-bg-icons .sun-icon {
          color: #fef3c7;
          opacity: ${isDark ? 0.3 : 0.8};
        }
        .toggle-bg-icons .moon-icon {
          color: #c7d2fe;
          opacity: ${isDark ? 0.8 : 0.3};
        }
      `}</style>

            <button
                className="theme-toggle"
                onClick={onToggle}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                <div className="toggle-bg-icons">
                    <FaSun className="sun-icon" />
                    <FaMoon className="moon-icon" />
                </div>
                <div className="toggle-knob">
                    {isDark ? <FaMoon /> : <FaSun />}
                </div>
            </button>
        </>
    );
}
