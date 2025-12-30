import React, { useState, useEffect } from "react";

export default function SalesChartMonthly({ monthlyStats }) {
    const months = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];

    if (!monthlyStats || monthlyStats.length === 0)
        return <div className="chart-container empty" />;

    const yearsAvailable = monthlyStats.map((y) => y.year);
    const newestYear = Math.max(...yearsAvailable);

    // Modern colors - cyan for newest, magenta for older
    const datasets = monthlyStats.map((y) => ({
        label: y.year,
        color: y.year === newestYear ? "#22d3ee" : "#f472b6",
        colorLight: y.year === newestYear ? "rgba(34, 211, 238, 0.15)" : "rgba(244, 114, 182, 0.15)",
        data: months.map((_, idx) => y.months[idx]?.value ?? 0),
    }));

    const W = 700, H = 280;
    const PL = 55, PR = 20, PT = 20, PB = 35;
    const innerW = W - PL - PR, innerH = H - PT - PB;

    const allVals = datasets.flatMap((d) => d.data);
    const rawMax = Math.max(...allVals, 10);
    const maxY = Math.ceil(rawMax / 50) * 50;
    const yStep = 50;
    const yTicks = Array.from({ length: Math.floor(maxY / yStep) + 1 }, (_, i) => i * yStep);

    const toXY = (i, v) => [
        PL + (i / (months.length - 1)) * innerW,
        PT + innerH - (v / maxY) * innerH,
    ];

    // Smooth curve path using bezier
    const smoothPath = (arr) => {
        const points = arr.map((v, i) => toXY(i, v));
        if (points.length < 2) return "";

        let d = `M ${points[0][0]},${points[0][1]}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx = (prev[0] + curr[0]) / 2;
            d += ` C ${cpx},${prev[1]} ${cpx},${curr[1]} ${curr[0]},${curr[1]}`;
        }
        return d;
    };

    // Area path for gradient fill
    const areaPath = (arr) => {
        const linePath = smoothPath(arr);
        const firstX = toXY(0, 0)[0];
        const lastX = toXY(arr.length - 1, 0)[0];
        const bottom = PT + innerH;
        return `${linePath} L ${lastX},${bottom} L ${firstX},${bottom} Z`;
    };

    const fmtAxis = (m) => `${m.toLocaleString("id-ID")}`;
    const fmtMoney = (v) => `Rp ${v.toLocaleString("id-ID")}`;

    const [activeKey, setActiveKey] = useState(null);
    const [tip, setTip] = useState(null);

    const Tooltip = ({ x, y, text, bg }) => {
        const w = Math.max(100, text.length * 7 + 16);
        const h = 32;
        const tx = Math.max(PL, Math.min(x - w / 2, W - PR - w));
        const ty = y - h - 12;

        return (
            <g pointerEvents="none">
                <rect x={tx} y={ty} width={w} height={h} rx={8} fill="#1e293b" stroke={bg} strokeWidth="2" />
                <text x={tx + w / 2} y={ty + h / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill="#fff">
                    {text}
                </text>
            </g>
        );
    };

    return (
        <div className="chart-container" onMouseLeave={() => { setActiveKey(null); setTip(null); }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
                <defs>
                    {datasets.map((ds, i) => (
                        <linearGradient key={`grad-${i}`} id={`areaGrad-${ds.label}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={ds.color} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={ds.color} stopOpacity="0" />
                        </linearGradient>
                    ))}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Grid lines */}
                {yTicks.map((t, i) => {
                    const y = PT + innerH - (t / maxY) * innerH;
                    return (
                        <line key={`hy${i}`} x1={PL} y1={y} x2={W - PR} y2={y} stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4 4" />
                    );
                })}

                {/* Y axis labels */}
                {yTicks.map((t, i) => {
                    const y = PT + innerH - (t / maxY) * innerH;
                    return (
                        <text key={`yt${i}`} x={PL - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
                            {fmtAxis(t)}
                        </text>
                    );
                })}

                {/* X axis labels */}
                {months.map((m, i) => {
                    const [x] = toXY(i, 0);
                    return (
                        <text key={m} x={x} y={H - 10} textAnchor="middle" fontSize="11" fill="#94a3b8">
                            {m}
                        </text>
                    );
                })}

                {/* Area fills */}
                {datasets.map((ds) => (
                    <path key={`area-${ds.label}`} d={areaPath(ds.data)} fill={`url(#areaGrad-${ds.label})`} />
                ))}

                {/* Lines with glow */}
                {datasets.map((ds) => (
                    <path
                        key={`line-${ds.label}`}
                        d={smoothPath(ds.data)}
                        fill="none"
                        stroke={ds.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        filter="url(#glow)"
                    />
                ))}

                {/* Data points */}
                {datasets.map((ds, di) =>
                    ds.data.map((v, i) => {
                        const [cx, cy] = toXY(i, v);
                        const key = `${di}-${i}`;
                        const active = activeKey === key;

                        return (
                            <g key={key}>
                                {active && <circle cx={cx} cy={cy} r="12" fill={ds.color} opacity="0.2" />}
                                <circle cx={cx} cy={cy} r={active ? 6 : 4} fill="#0f172a" stroke={ds.color} strokeWidth="2.5" />
                                <circle
                                    cx={cx} cy={cy} r="14" fill="transparent" style={{ cursor: "pointer" }}
                                    onMouseEnter={() => {
                                        setActiveKey(key);
                                        setTip({ x: cx, y: cy, text: `${ds.label} ${months[i]}: ${fmtMoney(v)}`, color: ds.color });
                                    }}
                                    onMouseLeave={() => { setActiveKey(null); setTip(null); }}
                                />
                            </g>
                        );
                    })
                )}

                {tip && <Tooltip x={tip.x} y={tip.y} text={tip.text} bg={tip.color} />}
            </svg>

            {/* Legend */}
            <div className="chart-legend">
                {datasets.map((d) => (
                    <div key={d.label} className="legend-item">
                        <span className="legend-dot" style={{ background: d.color, boxShadow: `0 0 8px ${d.color}` }} />
                        <span className="legend-text">{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
