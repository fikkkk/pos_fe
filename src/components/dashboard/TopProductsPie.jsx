import React from "react";
import { randomColor } from "./utils";

export default function TopProductsPie({ data }) {
    if (!data || data.length === 0) return <div className="pie-wrap empty" />;

    const pieData = data.map((p) => ({
        label: p.name,
        val: p.percentage,
        color: randomColor(p.name),
    }));

    const total = pieData.reduce((a, b) => a + b.val, 0);

    const size = 260,
        stroke = 65,
        pad = 8;

    const r = (size - stroke) / 2;

    const W = size + pad * 2;
    const H = size + pad * 2;

    const cx = pad + size / 2;
    const cy = pad + size / 2;

    const C = 2 * Math.PI * r;

    let acc = 0;

    const rings = pieData.map((d) => {
        const frac = d.val / total;
        const dash = frac * C;
        const offset = C * 0.25 - acc * C;

        const startA = -Math.PI / 2 + acc * 2 * Math.PI;
        const midA = startA + frac * Math.PI;

        const tx = cx + (r + stroke * 0.12) * Math.cos(midA);
        const ty = cy + (r + stroke * 0.12) * Math.sin(midA) + 4;

        acc += frac;

        return (
            <g key={d.label}>
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={d.color}
                    strokeWidth={stroke}
                    strokeDasharray={`${dash} ${C - dash}`}
                    strokeDashoffset={offset}
                />
                <text x={tx} y={ty} className="pie-pct" textAnchor="middle">
                    {d.val}%
                </text>
            </g>
        );
    });

    const left = pieData.slice(0, 5);
    const right = pieData.slice(5);

    return (
        <div className="pie-wrap">
            <div className="pie-box">
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                    <circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke="#e9eef5"
                        strokeWidth={stroke}
                    />

                    {rings}
                </svg>

                <div className="pie-center" style={{ inset: "24px" }}>
                    <div>
                        <div className="pc-top">Top 10</div>
                        <div className="pc-sub">Produk Terlaris</div>
                    </div>
                </div>
            </div>

            <div className="pie-legend2c">
                <ul>
                    {left.map((d) => (
                        <li key={d.label}>
                            <span className="dot" style={{ background: d.color }} />
                            <span className="name">{d.label}</span>
                        </li>
                    ))}
                </ul>

                <ul>
                    {right.map((d) => (
                        <li key={d.label}>
                            <span className="dot" style={{ background: d.color }} />
                            <span className="name">{d.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
