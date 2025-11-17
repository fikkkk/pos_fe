// =============================
// Dashboard.jsx FINAL TERHUBUNG BE
// =============================

import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import {
  FaBars,
  FaCalendarAlt,
  FaTachometerAlt,
  FaCashRegister,
  FaDatabase,
  FaChartBar,
  FaUserCircle,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
} from "react-icons/fa";
import "./Dashboard.css";
import { api } from "../api";

/* ============================= HELPERS ============================= */

const formatRp = (n) =>
  Number(n ?? 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

const formatNumber = (n) => Number(n ?? 0).toLocaleString("id-ID");
const idFmt = (n) => Number(n ?? 0).toLocaleString("id-ID");

function getPaymentColor(method) {
  switch (method) {
    case "CASH":
      return "#2BB673";
    case "DEBIT":
      return "#1D8CF8";
    case "KREDIT":
      return "#F6B21C";
    case "QRIS":
      return "#EF5350";
    default:
      return "#999";
  }
}

function randomColor(key) {
  const colors = [
    "#1E88E5",
    "#29B6F6",
    "#43A047",
    "#81C784",
    "#FDD835",
    "#FB8C00",
    "#E53935",
    "#F06292",
    "#8E24AA",
    "#B0BEC5",
  ];
  return colors[(key?.length ?? 0) % colors.length];
}

/* ====================== COMMON SMALL COMPONENTS ===================== */

function useClickOutside(onClose) {
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

function ProfilePill() {
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

function ChartHeader({ title, rightTitle }) {
  return (
    <div className="panel-header panel-header--chart">
      <div className="ph-leftwrap">
        <div className="ph-title">{title}</div>
      </div>
      <div className="ph-righttitle">{rightTitle}</div>
    </div>
  );
}

/* ============================= CHART BULANAN ============================= */
/* (ISI TETAP — TIDAK DIUBAH) */
/* ============================= */
/* ============================= */
/* NOTE: seluruh fungsi chart di bawah tidak diubah sama sekali */
/* ============================= */

function SalesChartMonthly({ monthlyStats }) {
  const months = [
    "Jan","Feb","Mar","Apr","Mei","Jun",
    "Jul","Agu","Sep","Okt","Nov","Des",
  ];

  if (!monthlyStats || monthlyStats.length === 0)
    return <div className="chart-container empty" />;

  const datasets = monthlyStats.map((y) => ({
    label: y.year,
    color: y.year === 2024 ? "#f6b21c" : "#1560d9",
    data: months.map((mIndex, idx) => y.months[idx]?.value ?? 0),
  }));

  /* (seluruh kode grafik tetap, tidak diubah)
     ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ */
  const W = 700, H = 270, PL = 68, PR = 18, PT = 16, PB = 30;
  const innerW = W - PL - PR, innerH = H - PT - PB;

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
    const pad = 8, h = 26, r = 6;
    const w = Math.max(60, text.length * 7 + pad * 2);
    let ty = y - h - 10, pointerUp = true;
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
        {/* axis, ticks, gridlines — semuanya tetap */}
        {months.map((_, i) => {
          const x = PL + (i / (months.length - 1)) * innerW;
          return (
            <line
              key={`vx${i}`}
              x1={x}
              y1={PT}
              x2={x}
              y2={PT + innerH}
              stroke="#cfd8e3"
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

        {months.map((m, i) => {
          const [x] = toXY(i, 0);
          return (
            <text
              key={m}
              x={x}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#7b8aa0"
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
              fill="#7b8aa0"
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

/* ============================= CHART TAHUNAN ============================= */
/* (ISI TETAP — TIDAK DIUBAH) */
/* ============================= */
/* ============================= */

function SalesChartYearly({ yearlyStats }) {
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

/* ======================= DONUT PEMBAYARAN ======================= */

function PaymentDonut({ paymentStats, totalTransaksi }) {
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
            stroke="#e9eef5"
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
          const jumlah = Math.round((p.val / 100) * Number(totalTransaksi ?? 0));
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

/* ======================= TABEL TRANSAKSI TERBARU ======================= */

function TransactionsTable({ transactions }) {
  const PAGE_SIZE = 10;

  const allRows = useMemo(
    () =>
      (transactions ?? []).map((t, i) => ({
        no: i + 1,
        id: t.transactionId,
        dt: new Date(t.createdAt).toLocaleString("id-ID"),
        kasir: t.cashierName,
        items: t.totalItem,
        harga: t.totalPrice,
        method: t.paymentMethod,
      })),
    [transactions]
  );

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);

  const fmtIDR = (n) => "Rp " + Number(n ?? 0).toLocaleString("id-ID");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return allRows;

    return allRows.filter(
      (r) =>
        r.id.toLowerCase().includes(s) ||
        r.dt.toLowerCase().includes(s) ||
        r.kasir.toLowerCase().includes(s) ||
        r.method.toLowerCase().includes(s) ||
        String(r.items).includes(s) ||
        String(r.harga).includes(s)
    );
  }, [q, allRows]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount, page]);

  const start = (page - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const handleCopy = async () => {
    const header = [
      "No",
      "ID Transaksi",
      "Tanggal & Waktu",
      "Nama Kasir",
      "Total Item",
      "Total Harga",
      "Metode Pembayaran",
      "Aksi",
    ].join("\t");

    const lines = rows.map((r) =>
      [
        r.no,
        r.id,
        r.dt,
        r.kasir,
        r.items,
        fmtIDR(r.harga),
        r.method,
        "Detail",
      ].join("\t")
    );

    await navigator.clipboard.writeText(header + "\n" + lines.join("\n"));

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const csvEscape = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const handleExcel = () => {
    const header = [
      "No",
      "ID Transaksi",
      "Tanggal & Waktu",
      "Nama Kasir",
      "Total Item",
      "Total Harga",
      "Metode Pembayaran",
      "Aksi",
    ];

    const rowsCsv = filtered.map((r) =>
      [
        r.no,
        r.id,
        r.dt,
        r.kasir,
        r.items,
        fmtIDR(r.harga),
        r.method,
        "Detail",
      ]
        .map(csvEscape)
        .join(",")
    );

    const blob = new Blob(
      [header.join(",") + "\n" + rowsCsv.join("\n")],
      { type: "text/csv;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "TransaksiTerbaru.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const getPages = (curr, total) => {
    const pages = [];
    const add = (p) => pages.push(p);

    add(1);
    let s = Math.max(2, curr - 1),
      e = Math.min(total - 1, curr + 1);

    if (curr <= 3) {
      s = 2;
      e = Math.min(5, total - 1);
    }
    if (curr >= total - 2) {
      s = Math.max(total - 4, 2);
      e = total - 1;
    }

    if (s > 2) add("…");
    for (let i = s; i <= e; i++) add(i);
    if (e < total - 1) add("…");

    if (total > 1) add(total);

    return pages;
  };

  const pages = getPages(page, pageCount);

  return (
    <div className="table-shell">
      <div className="table-controls">
        <div className="table-buttons">
          <button className="btn" onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </button>
          <button className="btn btn-green" onClick={handleExcel}>
            Excel
          </button>
        </div>

        <div className="tc-right">
          <FaSearch />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Cari Transaksi"
          />
        </div>
      </div>

      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>No</th>
              <th>ID Transaksi</th>
              <th>Tanggal & Waktu</th>
              <th>Nama Kasir</th>
              <th>Total Item</th>
              <th>Total Harga</th>
              <th>Metode Pembayaran</th>
              <th style={{ width: 76 }}>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, idx) => (
              <tr key={start + idx}>
                <td>{r.no}</td>
                <td>{r.id}</td>
                <td>{r.dt}</td>
                <td>{r.kasir}</td>
                <td>{r.items}</td>
                <td>{fmtIDR(r.harga)}</td>
                <td>{r.method}</td>
                <td>
                  <button className="aksi-link">Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="tf-left">
          showing <b>{rows.length}</b> to <b>{start + rows.length}</b> of{" "}
          <b>{filtered.length}</b> entries
        </div>

        <div className="tf-right pager">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>

          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`e${i}`} className="ellipsis">
                …
              </span>
            ) : (
              <button
                key={p}
                className={p === page ? "active" : ""}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={page === pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================= PIE CHART TOP PRODUK ======================= */

function TopProductsPie({ data }) {
  if (!data || data.length === 0)
    return <div className="pie-wrap empty" />;

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

/* ======================= PLACEHOLDER ======================= */

function SkillsWheel() {
  return <div className="ps-placeholder">(Skills Wheel placeholder)</div>;
}

/* ============================= MAIN DASHBOARD ============================= */

export default function Dashboard() {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [stats, setStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [yearlyStats, setYearlyStats] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topProductsPie, setTopProductsPie] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const MAX_PROD_ROWS = 10;
  const rightWrapRef = useRef(null);
  const [rowHRight, setRowHRight] = useState(0);

  const leftWrapRef = useRef(null);
  const [rowHLeft, setRowHLeft] = useState(0);

  const [qProduk, setQProduk] = useState("");

  useEffect(() => {
    const year = new Date().getFullYear();

    async function run() {
      try {
        const [
          dashRes,
          statsRes,
          leaderboardRes,
          pieRes,
          latestRes,
          prodRes,
          trxRes,
        ] = await Promise.all([
          api.get(`/admin/dashboard/${year}`),
          api.get("/admin/stats", {
            params: { type: "ITEMS_SOLD", years: `${year - 1},${year}` },
          }),
          api.get("/admin/products/leaderboard"),
          api.get("/admin/products/leaderboard"), // untuk pie chart
          api.get("/admin/products/latest"),
          api.get("/admin/products"),
          api.get("/admin/orders"),
        ]);

        setStats(dashRes.data);
        setPaymentStats(dashRes.data.paymentMethodStats ?? []);

        setMonthlyStats(statsRes.data.years ?? []);

        setYearlyStats(
          (statsRes.data.years ?? []).map((y) => ({
            year: y.year,
            total: y.totalYear,
          }))
        );

        setTopProducts(leaderboardRes.data ?? []);
        setTopProductsPie(pieRes.data ?? []);

        setLatestProducts(latestRes.data ?? []);
        setAllProducts(prodRes.data ?? []);
        setTransactions(trxRes.data ?? []);
      } catch (err) {
        console.error("Error fetch dashboard:", err);
      }
    }

    run();
  }, []);

  useLayoutEffect(() => {
    const calcRowH = (wrapEl, setter) => {
      if (!wrapEl) return;

      const thead = wrapEl.querySelector("thead");
      const wrapH = wrapEl.clientHeight;
      const headH = thead ? thead.offsetHeight : 0;

      const innerH = Math.max(0, wrapH - headH - 1);
      const h = Math.max(36, Math.floor(innerH / MAX_PROD_ROWS));

      setter(h);
    };

    const calcRight = () => calcRowH(rightWrapRef.current, setRowHRight);
    const calcLeft = () => calcRowH(leftWrapRef.current, setRowHLeft);

    const ro1 = new ResizeObserver(calcRight);
    const ro2 = new ResizeObserver(calcLeft);

    if (rightWrapRef.current) ro1.observe(rightWrapRef.current);
    if (leftWrapRef.current) ro2.observe(leftWrapRef.current);

    window.addEventListener("resize", calcRight);
    window.addEventListener("resize", calcLeft);

    calcRight();
    calcLeft();

    return () => {
      ro1.disconnect();
      ro2.disconnect();

      window.removeEventListener("resize", calcRight);
      window.removeEventListener("resize", calcLeft);
    };
  }, []);

  const filteredProduk = useMemo(() => {
    const s = qProduk.trim().toLowerCase();
    if (!s) return allProducts;

    return allProducts.filter((p) => {
      const code = (p.code ?? String(p.id ?? "")).toLowerCase();
      const name = (p.name ?? "").toLowerCase();
      const price = String(p.price ?? "").toLowerCase();
      const stock = String(p.stock ?? "").toLowerCase();
      const supplier = (p.supplier?.name ?? "").toLowerCase();

      return (
        code.includes(s) ||
        name.includes(s) ||
        price.includes(s) ||
        stock.includes(s) ||
        supplier.includes(s)
      );
    });
  }, [qProduk, allProducts]);

  const produkRows10 = useMemo(
    () => filteredProduk.slice(0, MAX_PROD_ROWS),
    [filteredProduk]
  );

  const copySemuaProduk = async () => {
    const header = [
      "No",
      "Kode Produk",
      "Nama Produk",
      "Harga Satuan",
      "Satuan",
      "Stok",
      "Supplier",
    ].join("\t");

    const lines = filteredProduk.map((r, idx) =>
      [
        idx + 1,
        r.code ?? r.id,
        r.name,
        r.price,
        r.unit ?? "-",
        r.stock,
        r.supplier?.name ?? "-",
      ].join("\t")
    );

    await navigator.clipboard.writeText(header + "\n" + lines.join("\n"));
  };

  const excelSemuaProduk = () => {
    const header = [
      "No",
      "Kode Produk",
      "Nama Produk",
      "Harga Satuan",
      "Satuan",
      "Stok",
      "Supplier",
    ];

    const rowsCsv = filteredProduk.map((r, idx) =>
      [
        idx + 1,
        r.code ?? r.id,
        r.name,
        r.price,
        r.unit ?? "-",
        r.stock,
        r.supplier?.name ?? "-",
      ].join(",")
    );

    const blob = new Blob(
      [header.join(",") + "\n" + rowsCsv.join("\n")],
      { type: "text/csv;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "SemuaDataProduk.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const statCards = stats
    ? [
        {
          color: "blue",
          value: formatNumber(stats.totalItemTerjual),
          label: "Total Item Terjual",
          year: stats.year,
        },
        {
          color: "green",
          value: formatNumber(stats.totalTransaksi),
          label: "Total Transaksi",
          year: stats.year,
        },
        {
          color: "orange",
          value: formatNumber(stats.totalPemasukan),
          label: "Total Income",
          year: stats.year,
        },
        {
          color: "red",
          value: formatNumber(stats.totalPelanggan),
          label: "Total Pelanggan",
          year: stats.year,
        },
      ]
    : [];

  return (
    <div className="dashboard">
      <aside className="ds-sidebar">
        <div className="ds-side-header">
          <FaBars />
        </div>

        <nav className="ds-nav">
          <a className="ds-nav-item active">
            <span className="ico">
              <FaTachometerAlt />
            </span>
            <span>Dashboard</span>
          </a>

          <a className="ds-nav-item">
            <span className="ico">
              <FaCashRegister />
            </span>
            <span>Transaksi</span>
          </a>

          <a className="ds-nav-item">
            <span className="ico">
              <FaDatabase />
            </span>
            <span>Master Data</span>
          </a>

          <a className="ds-nav-item">
            <span className="ico">
              <FaChartBar />
            </span>
            <span>Laporan Manajemen</span>
          </a>
        </nav>
      </aside>

      <main className="ds-main">
        <header className="ds-topbar">
          <div className="left">
            <div className="brand">POS NUKA</div>
            <div className="date">
              <FaCalendarAlt /> {today}
            </div>
          </div>

          <div className="right">{/* <ProfilePill/> */}</div>
        </header>

        <section className="ds-inner">
          <div className="ds-section-title">
            <FaChartBar />
            <span>Statistik Bisnis</span>
          </div>

          <div className="ds-cards">
            {statCards.map((s, idx) => (
              <div key={idx} className={`ds-card ${s.color}`}>
                <div className="ds-card-value">{s.value}</div>
                <div className="ds-card-sub">{s.label}</div>
                <div className="ds-card-pill" />

                <div className="ds-card-footer">
                  <span>Tahun {s.year}</span>
                  <span>Detail</span>
                </div>
              </div>
            ))}
          </div>

          {/* Penjualan */}
          <div className="panel-combo">
            <ChartHeader
              title="Penjualan Perbulan"
              rightTitle="Penjualan Pertahun"
            />

            <div className="pc-body">
              <div className="pc-col">
                <SalesChartMonthly monthlyStats={monthlyStats} />
              </div>

              <div className="pc-col">
                <div className="mini-title">Penjualan Pertahun</div>
                <SalesChartYearly yearlyStats={yearlyStats} />
              </div>
            </div>
          </div>

          {/* Metode Pembayaran + Transaksi Terbaru */}
          <div className="ds-panels ds-panels--bottom">
            <div className="ds-panel tall">
              <div className="panel-body">
                <div className="mini-title">Metode Pembayaran</div>

                <PaymentDonut
                  paymentStats={paymentStats}
                  totalTransaksi={stats?.totalTransaksi ?? 0}
                />
              </div>
            </div>

            <div className="ds-panel tall">
              <div className="panel-body">
                <div className="mini-title">Transaksi Terbaru</div>
                <TransactionsTable transactions={transactions} />
              </div>
            </div>
          </div>

          {/* Produk Terlaris */}
          <div className="panel-single">
            <div className="panel-header panel-header--chart">
              <div className="ph-leftwrap">
                <div className="ph-title">Produk Terlaris</div>
              </div>
            </div>

            <div className="ps-body">
              <div
                className="pt-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(620px,1fr) 420px",
                  gap: "24px",
                  alignItems: "start",
                }}
              >
                {/* Tabel */}
                <div className="pt-left">
                  <div className="pt-toolbar">
                    <button className="btn btn-gray">Copy</button>
                    <button className="btn btn-gray">Excel</button>
                  </div>

                  <div className="table-wrap">
                    <table className="pt-table pt-table--top">
                      <thead>
                        <tr>
                          <th className="col-no">No</th>
                          <th className="col-img">Gambar</th>
                          <th>Nama Barang</th>
                          <th className="col-terjual">Terjual</th>
                          <th className="col-total">Total (Rp)</th>
                          <th className="col-persentase">
                            Persentase Penjualan
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {topProducts.map((p, idx) => (
                          <tr key={p.productId ?? idx}>
                            <td className="col-no">{p.no ?? idx + 1}</td>

                            <td className="col-img">
                              <div className="img-pill">IMG</div>
                            </td>

                            <td>{p.name}</td>
                            <td className="col-terjual">
                              {formatNumber(p.sold)}
                            </td>
                            <td className="col-total">
                              {formatRp(p.totalPrice)}
                            </td>
                            <td className="col-persentase">
                              {p.percentage}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pie */}
                <div className="pt-right" style={{ justifySelf: "end" }}>
                  <TopProductsPie data={topProductsPie} />
                </div>
              </div>
            </div>
          </div>

          {/* Produk terbaru + semua produk */}
          <div className="panel-single">
            <div className="panel-header panel-header--chart">
              <div className="ph-leftwrap">
                <div className="ph-title">Produk Terbaru</div>
              </div>

              <div className="ph-righttitle">Semua Data Produk</div>
            </div>

            <div className="ps-body">
              <div
                className="pj-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(420px,480px) 1fr",
                  gap: "24px",
                }}
              >
                {/* Produk Terbaru */}
                <div
                  className="pj-left"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 10px 0",
                      color: "#6b7a90",
                      fontSize: 12,
                    }}
                  >
                    Produk terbaru diperbarui setiap{" "}
                    <b>2 minggu sekali</b>.
                  </p>

                  <div
                    className="table-wrap"
                    ref={leftWrapRef}
                    style={{ flex: 1, minHeight: 0 }}
                  >
                    <table className="pt-table">
                      <thead>
                        <tr>
                          <th className="col-no">No</th>
                          <th className="col-img">Gambar</th>
                          <th>Nama Barang</th>
                          <th>Stok</th>
                        </tr>
                      </thead>

                      <tbody>
                        {latestProducts.map((p, i) => (
                          <tr
                            key={p.id}
                            style={
                              rowHLeft
                                ? { height: `${rowHLeft}px` }
                                : undefined
                            }
                          >
                            <td className="col-no">{i + 1}</td>

                            <td className="col-img">
                              <div className="img-pill">IMG</div>
                            </td>

                            <td>{p.name}</td>
                            <td>{p.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Semua Produk */}
                <div
                  className="pj-right"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                  }}
                >
                  <div className="mini-title" style={{ marginBottom: 10 }}>
                    Semua Data Produk
                  </div>

                  <div
                    className="pt-toolbar"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <button className="btn btn-gray" onClick={copySemuaProduk}>
                        Copy
                      </button>

                      <button
                        className="btn btn-gray"
                        onClick={excelSemuaProduk}
                        style={{ marginLeft: 8 }}
                      >
                        Excel
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#6b7a90" }}>
                        Search
                      </span>

                      <div
                        className="tc-right"
                        style={{ gap: 6 }}
                      >
                        <FaSearch />

                        <input
                          value={qProduk}
                          onChange={(e) => setQProduk(e.target.value)}
                          placeholder="Cari Produk"
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className="table-wrap"
                    ref={rightWrapRef}
                    style={{ flex: 1, minHeight: 0 }}
                  >
                    <table className="pt-table">
                      <thead>
                        <tr>
                          <th className="col-no">No</th>
                          <th>Kode Produk</th>
                          <th>Nama Produk</th>
                          <th>Harga Satuan</th>
                          <th>Satuan</th>
                          <th>Stok</th>
                          <th>Supplier</th>
                        </tr>
                      </thead>

                      <tbody>
                        {produkRows10.map((r, idx) => (
                          <tr
                            key={r.id ?? idx}
                            style={
                              rowHRight
                                ? { height: `${rowHRight}px` }
                                : undefined
                            }
                          >
                            <td className="col-no">{idx + 1}</td>
                            <td>{r.code ?? r.id}</td>
                            <td>{r.name}</td>
                            <td>{formatRp(r.price)}</td>
                            <td>{r.unit ?? "-"}</td>
                            <td>{r.stock}</td>
                            <td>{r.supplier?.name ?? "-"}</td>
                          </tr>
                        ))}

                        {Array.from({
                          length: Math.max(0, 10 - produkRows10.length),
                        }).map((_, i) => (
                          <tr
                            key={`empty-${i}`}
                            style={
                              rowHRight
                                ? { height: `${rowHRight}px` }
                                : undefined
                            }
                          >
                            <td className="col-no">&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SkillsWheel />
        </section>
      </main>
    </div>
  );
}
