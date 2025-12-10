import React from "react";
import { idFmt, getPaymentColor } from "./utils";

export default function PaymentDonut({ paymentStats, totalTransaksi }) {
    if (!paymentStats || paymentStats.length === 0)
        return <div className="donut-wrap empty" />;

    const payments = paymentStats.map((p) => ({
        label: p.method,
        val: p.percentage,
        color: getPaymentColor(p.method),
    }));

    const size = 240,
        stroke = 26,
        pad = 24;

    const r = (size - stroke) / 2;
    const cx = pad + size / 2;
    const cy = pad + size / 2;

    const W = size + pad * 2;
    const H = size + pad * 2;

    const C = 2 * Math.PI * r;
    const gapArc = 4;
    const totalPct = payments.reduce((a, b) => a + b.val, 0);

    let accPct = 0;
    const pctLabels = [];

    const rings = payments.map((p) => {
        const frac = p.val / totalPct;
        const dash = Math.max(0, frac * C - gapArc);
        const offset = C * 0.25 - accPct * C - gapArc / 2;

        const start = -Math.PI / 2 + accPct * 2 * Math.PI;
        const mid = start + (frac * 2 * Math.PI) / 2;
        const txtR = r + 18;

        const tx = cx + txtR * Math.cos(mid);
        const ty = cy + txtR * Math.sin(mid) + 4;

        pctLabels.push({ x: tx, y: ty, text: `${p.val}%` });

        accPct += frac;

        return (
            <circle
                key={p.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={p.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={offset}
            />
        );
    });

    return (
        <div className="donut-wrap">
            <div className="donut-box">
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                    <circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={stroke}
                    />

                    {rings}

                    {pctLabels.map((pt, i) => (
                        <text
                            key={i}
                            x={pt.x}
                            y={pt.y}
                            textAnchor="middle"
                            className="donut-pct"
                            fill="rgba(255,255,255,0.9)"
                        >
                            {pt.text}
                        </text>
                    ))}
                </svg>

                <div className="donut-center" style={{ inset: "24px" }}>
                    <div>
                        <div className="dc-top">Total Transaksi</div>
                        <div className="dc-big">{idFmt(totalTransaksi)}</div>
                        <div className="dc-sub">semua metode</div>
                    </div>
                </div>
            </div>

            <ul className="donut-legend">
                {payments.map((p) => {
                    const jumlah = Math.round(
                        (p.val / 100) * Number(totalTransaksi ?? 0)
                    );
                    return (
                        <li key={p.label}>
                            <span className="dot" style={{ background: p.color }} />
                            <div className="dl-text">
                                <div className="dl-label">{p.label}</div>
                                <div className="dl-sub">Jumlah Transaksi Sebanyak</div>
                            </div>
                            <div className="dl-count">{idFmt(jumlah)}</div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
