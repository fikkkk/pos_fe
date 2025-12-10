import React, { useState, useEffect } from "react";

export default function SalesChartMonthly({ monthlyStats }) {
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
    ];

    if (!monthlyStats || monthlyStats.length === 0)
        return <div className="chart-container empty" />;

    const yearsAvailable = monthlyStats.map((y) => y.year);
    const newestYear = Math.max(...yearsAvailable);

    const datasets = monthlyStats.map((y) => ({
        label: y.year,
        // Tahun terbaru kuning, lainnya biru
        color: y.year === newestYear ? "#f6b21c" : "#1560d9",
        data: months.map((_, idx) => y.months[idx]?.value ?? 0),
    }));

    const W = 700,
        H = 270,
        PL = 68,
        PR = 18,
        PT = 16,
        PB = 30;
    const innerW = W - PL - PR,
        innerH = H - PT - PB;

    const allVals = datasets.flatMap((d) => d.data);
    const rawMax = Math.max(...allVals, 10);
    const maxY = Math.ceil(rawMax / 50) * 50;
    const yStep = 50;
    const yTicks = Array.from(
        { length: Math.floor(maxY / yStep) + 1 },
        (_, i) => i * yStep
    );

    const toXY = (i, v) => [
        PL + (i / (months.length - 1)) * innerW,
        PT + innerH - (v / maxY) * innerH,
    ];
    const pathFor = (arr) =>
        arr
            .map((v, i) => {
                const [x, y] = toXY(i, v);
                return `${i === 0 ? "M" : "L"}${x},${y}`;
            })
            .join(" ");

    const fmtAxis = (m) => `${m.toLocaleString("id-ID")}`;
    const fmtMoney = (v) => `Rp ${v.toLocaleString("id-ID")}`;

    const [activeKey, setActiveKey] = useState(null);
    const [tip, setTip] = useState(null);

    const Tooltip = ({ x, y, text, bg, appearKey }) => {
        const pad = 8,
            h = 26,
            r = 6;
        const w = Math.max(60, text.length * 7 + pad * 2);
        let ty = y - h - 10,
            pointerUp = true;
        if (ty < PT + 6) {
            ty = y + 14;
            pointerUp = false;
        }
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        const tx = clamp(x - w / 2, PL + 4, W - PR - w - 4);
        const px = clamp(x, tx + 10, tx + w - 10);
        const py = pointerUp ? ty + h : ty;

        const [show, setShow] = useState(false);
        useEffect(() => {
            const id = requestAnimationFrame(() => setShow(true));
            return () => cancelAnimationFrame(id);
        }, []);

        return (
            <g
                key={appearKey}
                pointerEvents="none"
                style={{
                    opacity: show ? 1 : 0,
                    transform: `translateY(${show ? 0 : 6}px)`,
                    transition: "opacity .18s ease, transform .18s ease",
                }}
            >
                <rect
                    x={tx}
                    y={ty}
                    width={w}
                    height={h}
                    rx={r}
                    fill={bg}
                    opacity="0.95"
                    stroke="rgba(0,0,0,.15)"
                />
                <text
                    x={tx + w / 2}
                    y={ty + h / 2 + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="#fff"
                    style={{ paintOrder: "stroke" }}
                    stroke="rgba(0,0,0,.35)"
                    strokeWidth="1"
                >
                    {text}
                </text>
                <path
                    d={
                        pointerUp
                            ? `M ${px - 6} ${py} L ${px + 6} ${py} L ${px} ${py + 6} Z`
                            : `M ${px - 6} ${py} L ${px + 6} ${py} L ${px} ${py - 6} Z`
                    }
                    fill={bg}
                    opacity="0.95"
                    stroke="rgba(0,0,0,.15)"
                />
            </g>
        );
    };

    return (
        <div
            className="chart-container"
            onMouseLeave={() => {
                setActiveKey(null);
                setTip(null);
            }}
        >
            <div className="chart-overlay">
                <label className="filter-label">Pilih Periode</label>
                <div className="filter-row">
                    <div className="overlay-legend">
                        {datasets.map((d) => (
                            <span key={d.label} className="legend-item">
                                <span className="pill" style={{ background: d.color }}></span>
                                <span className="legend-text">{d.label}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
                {months.map((_, i) => {
                    const x = PL + (i / (months.length - 1)) * innerW;
                    return (
                        <line
                            key={`vx${i}`}
                            x1={x}
                            y1={PT}
                            x2={x}
                            y2={PT + innerH}
                            stroke="rgba(255,255,255,0.08)"
                            opacity=".9"
                        />
                    );
                })}

                {yTicks.map((t, i) => {
                    const y = PT + innerH - (t / maxY) * innerH;
                    return (
                        <line
                            key={`hy${i}`}
                            x1={PL}
                            y1={y}
                            x2={W - PR}
                            y2={y}
                            stroke="rgba(255,255,255,0.08)"
                            opacity=".9"
                        />
                    );
                })}

                <rect
                    x={PL}
                    y={PT}
                    width={innerW}
                    height={innerH}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                />

                {months.map((m, i) => {
                    const [x] = toXY(i, 0);
                    return (
                        <text
                            key={m}
                            x={x}
                            y={H - 8}
                            textAnchor="middle"
                            fontSize="10"
                            fill="rgba(255,255,255,0.6)"
                        >
                            {m}
                        </text>
                    );
                })}

                {yTicks.map((t, i) => {
                    const y = PT + innerH - (t / maxY) * innerH;
                    return (
                        <text
                            key={`yt${i}`}
                            x={PL - 8}
                            y={y + 3}
                            textAnchor="end"
                            fontSize="10"
                            fill="rgba(255,255,255,0.6)"
                        >
                            {fmtAxis(t)}
                        </text>
                    );
                })}

                {datasets.map((ds, di) => (
                    <g key={ds.label}>
                        <path
                            d={pathFor(ds.data)}
                            fill="none"
                            stroke={ds.color}
                            strokeWidth="2.6"
                        />

                        {ds.data.map((v, i) => {
                            const [cx, cy] = toXY(i, v);
                            const key = `${di}-${i}`;
                            const active = activeKey === key;

                            return (
                                <g key={key}>
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={active ? 5.2 : 4.2}
                                        fill={ds.color}
                                        stroke="#fff"
                                        strokeWidth="1.5"
                                    />
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r="12"
                                        fill="transparent"
                                        style={{ cursor: "pointer" }}
                                        onMouseEnter={() => {
                                            setActiveKey(key);
                                            setTip({
                                                x: cx,
                                                y: cy,
                                                text: `${ds.label} ${months[i]} · ${fmtMoney(v)}`,
                                                color: ds.color,
                                            });
                                        }}
                                        onMouseLeave={() => {
                                            setActiveKey(null);
                                            setTip(null);
                                        }}
                                    />
                                </g>
                            );
                        })}
                    </g>
                ))}

                {tip && (
                    <Tooltip
                        x={tip.x}
                        y={tip.y}
                        text={tip.text}
                        bg={tip.color}
                        appearKey={activeKey}
                    />
                )}
            </svg>
        </div>
    );
}
