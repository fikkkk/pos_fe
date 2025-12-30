import React, { useState } from "react";
import { idFmt } from "./utils";

export default function PaymentDonut({ paymentStats, totalTransaksi }) {
    if (!paymentStats || paymentStats.length === 0)
        return <div className="donut-wrap empty" />;

    // Modern vivid colors
    const colorMap = {
        CASH: "#22c55e",
        QRIS: "#f97316",
        DEBIT: "#3b82f6",
        KREDIT: "#a855f7",
    };

    const payments = paymentStats.map((p) => ({
        label: p.method,
        val: p.count || Math.round((p.percentage / 100) * Number(totalTransaksi ?? 0)),
        pct: p.percentage || 0,
        color: colorMap[p.method] || "#64748b",
    }));

    const total = payments.reduce((sum, p) => sum + p.val, 0) || 1;

    const size = 180;
    const strokeWidth = 28;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const cx = size / 2;
    const cy = size / 2;

    const [activeIdx, setActiveIdx] = useState(null);

    // Calculate dash offsets for each segment
    let accumulated = 0;
    const segments = payments.map((p, i) => {
        const pct = p.val / total;
        const dashLength = pct * circumference;
        const dashOffset = circumference * 0.25 - accumulated; // Start from top
        accumulated += dashLength;

        return {
            ...p,
            index: i,
            pct,
            dashLength,
            dashOffset,
            displayPct: Math.round(pct * 100),
        };
    });

    return (
        <div className="donut-wrap">
            <div className="donut-chart-container">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <defs>
                        <filter id="donutGlow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background circle */}
                    <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.1)"
                        strokeWidth={strokeWidth}
                    />

                    {/* Segments */}
                    {segments.map((seg, i) => (
                        <circle
                            key={i}
                            cx={cx}
                            cy={cy}
                            r={radius}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={activeIdx === i ? strokeWidth + 6 : strokeWidth}
                            strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
                            strokeDashoffset={seg.dashOffset}
                            strokeLinecap="round"
                            filter={activeIdx === i ? "url(#donutGlow)" : undefined}
                            style={{
                                cursor: "pointer",
                                transition: "stroke-width 0.2s ease",
                                transformOrigin: "center",
                            }}
                            onMouseEnter={() => setActiveIdx(i)}
                            onMouseLeave={() => setActiveIdx(null)}
                        />
                    ))}

                    {/* Center content */}
                    <circle cx={cx} cy={cy} r={radius - strokeWidth / 2 - 8} fill="#0f172a" />
                    <text x={cx} y={cy - 12} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="500">
                        TOTAL
                    </text>
                    <text x={cx} y={cy + 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#e2e8f0">
                        {idFmt(totalTransaksi)}
                    </text>
                    <text x={cx} y={cy + 22} textAnchor="middle" fontSize="9" fill="#64748b">
                        transaksi
                    </text>
                </svg>
            </div>

            {/* Legend */}
            <ul className="donut-legend">
                {segments.map((seg, i) => (
                    <li
                        key={seg.label}
                        className={activeIdx === i ? "active" : ""}
                        onMouseEnter={() => setActiveIdx(i)}
                        onMouseLeave={() => setActiveIdx(null)}
                    >
                        <span className="dot" style={{ background: seg.color, boxShadow: `0 0 8px ${seg.color}` }} />
                        <div className="dl-text">
                            <div className="dl-label">{seg.label}</div>
                            <div className="dl-sub">{seg.displayPct}% dari total</div>
                        </div>
                        <div className="dl-count">{idFmt(seg.val)}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
