import React, { useState } from "react";

export default function SalesChartYearly({ yearlyStats }) {
    if (!yearlyStats || yearlyStats.length === 0)
        return <svg className="chart-svg" />;

    const W = 400, H = 280;
    const PL = 50, PR = 20, PT = 30, PB = 40;
    const innerW = W - PL - PR, innerH = H - PT - PB;

    const data = yearlyStats.map((y) => ({ year: y.year, val: y.total }));

    // Colors - gradient for each bar
    const colors = ["#f97316", "#3b82f6", "#22c55e", "#a855f7"];

    const step = 500;
    const rawMax = Math.max(...data.map((d) => d.val), 10);
    const maxY = Math.ceil(rawMax / step) * step;
    const ticks = Array.from({ length: Math.floor(maxY / step) + 1 }, (_, i) => i * step);

    const barW = Math.min(60, (innerW / data.length) * 0.6);
    const gap = (innerW - barW * data.length) / (data.length + 1);

    const fmtAxis = (m) => `${m.toLocaleString("id-ID")}`;
    const fmtMoney = (v) => `Rp ${v.toLocaleString("id-ID")}`;

    const [activeIdx, setActiveIdx] = useState(null);
    const [tip, setTip] = useState(null);

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" onMouseLeave={() => { setActiveIdx(null); setTip(null); }}>
            <defs>
                {data.map((d, i) => (
                    <linearGradient key={`barGrad-${i}`} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity="1" />
                        <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity="0.6" />
                    </linearGradient>
                ))}
                <filter id="barGlow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Grid lines */}
            {ticks.map((t, i) => {
                const y = PT + innerH - (t / maxY) * innerH;
                return (
                    <line key={`hy${i}`} x1={PL} y1={y} x2={W - PR} y2={y} stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4 4" />
                );
            })}

            {/* Y axis labels */}
            {ticks.map((t, i) => {
                const y = PT + innerH - (t / maxY) * innerH;
                return (
                    <text key={`yt${i}`} x={PL - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
                        {fmtAxis(t)}
                    </text>
                );
            })}

            {/* Bars */}
            {data.map((d, i) => {
                const barH = (d.val / maxY) * innerH;
                const x = PL + gap + i * (barW + gap);
                const y = PT + innerH - barH;
                const color = colors[i % colors.length];
                const active = activeIdx === i;

                return (
                    <g key={d.year}>
                        {/* Glow behind bar */}
                        {active && (
                            <rect x={x - 4} y={y - 4} width={barW + 8} height={barH + 8} rx={10} fill={color} opacity="0.3" filter="url(#barGlow)" />
                        )}

                        {/* Bar with rounded top */}
                        <rect
                            x={x}
                            y={y}
                            width={barW}
                            height={barH}
                            rx={8}
                            fill={`url(#barGrad-${i})`}
                            style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                            onMouseEnter={() => {
                                setActiveIdx(i);
                                setTip({ x: x + barW / 2, y: y - 10, text: `${d.year}: ${fmtMoney(d.val)}`, color });
                            }}
                            onMouseLeave={() => { setActiveIdx(null); setTip(null); }}
                        />

                        {/* Value on top of bar */}
                        <text x={x + barW / 2} y={y - 8} textAnchor="middle" fontSize="12" fontWeight="700" fill={color}>
                            {d.val.toLocaleString("id-ID")}
                        </text>

                        {/* Year label */}
                        <text x={x + barW / 2} y={H - 15} textAnchor="middle" fontSize="13" fontWeight="600" fill="#e2e8f0">
                            {d.year}
                        </text>
                    </g>
                );
            })}

            {/* Tooltip */}
            {tip && (
                <g pointerEvents="none">
                    <rect x={tip.x - 70} y={tip.y - 35} width="140" height="28" rx={8} fill="#1e293b" stroke={tip.color} strokeWidth="2" />
                    <text x={tip.x} y={tip.y - 18} textAnchor="middle" fontSize="12" fontWeight="600" fill="#fff">
                        {tip.text}
                    </text>
                </g>
            )}
        </svg>
    );
}
