import React, { useState, useEffect } from "react";

export default function SalesChartYearly({ yearlyStats }) {
    if (!yearlyStats || yearlyStats.length === 0)
        return <svg className="chart-svg" />;

    const W = 420,
        H = 270,
        PL = 48,
        PR = 16,
        PT = 16,
        PB = 30;
    const innerW = W - PL - PR,
        innerH = H - PT - PB;

    const data = yearlyStats.map((y) => ({ year: y.year, val: y.total }));

    const step = 500;
    const rawMax = Math.max(...data.map((d) => d.val), 10);
    const maxY = Math.ceil(rawMax / step) * step;

    const ticks = Array.from(
        { length: Math.floor(maxY / step) + 1 },
        (_, i) => i * step
    );

    const barW = 50,
        gap = 60;

    const startX =
        PL + (innerW - (data.length * barW + (data.length - 1) * gap)) / 2;

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
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="chart-svg"
            onMouseLeave={() => {
                setActiveKey(null);
                setTip(null);
            }}
        >
            {ticks.map((t, i) => {
                const y = PT + innerH - (t / maxY) * innerH;
                return (
                    <line
                        key={i}
                        x1={PL}
                        y1={y}
                        x2={W - PR}
                        y2={y}
                        stroke="#cfd8e3"
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
                stroke="#cfd8e3"
            />

            {ticks.map((t, i) => {
                const y = PT + innerH - (t / maxY) * innerH;
                return (
                    <text
                        key={`yt${i}`}
                        x={PL - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="10"
                        fill="#7b8aa0"
                    >
                        {fmtAxis(t)}
                    </text>
                );
            })}

            {data.map((d, i) => {
                const h = (d.val / maxY) * innerH;
                const x = startX + i * (barW + gap);
                const y = PT + innerH - h;

                const color = i === 0 ? "#f6b21c" : "#1560d9";
                const cx = x + barW / 2;
                const cy = y;

                return (
                    <g key={d.year}>
                        <rect
                            x={x}
                            y={y}
                            width={barW}
                            height={h}
                            rx="6"
                            fill={color}
                            style={{ cursor: "pointer" }}
                            onMouseEnter={() => {
                                setActiveKey(i);
                                setTip({
                                    x: cx,
                                    y: cy,
                                    text: `${d.year} · ${fmtMoney(d.val)}`,
                                    color,
                                });
                            }}
                            onMouseMove={() => {
                                setActiveKey(i);
                                setTip({
                                    x: cx,
                                    y: cy,
                                    text: `${d.year} · ${fmtMoney(d.val)}`,
                                    color,
                                });
                            }}
                            onMouseLeave={() => {
                                setActiveKey(null);
                                setTip(null);
                            }}
                        />

                        <text
                            x={x + barW / 2}
                            y={H - 8}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#4b5b71"
                        >
                            {d.year}
                        </text>
                    </g>
                );
            })}

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
    );
}
