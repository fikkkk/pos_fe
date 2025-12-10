// =============================
// Dashboard.jsx - REFACTORED
// =============================

import React, {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import {
  FaCalendarAlt,
  FaChartBar,
  FaSearch,
} from "react-icons/fa";
import "./Dashboard.css";
import { api } from "../api";

import Sidebar from "./Sidebar";
import Transaksi from "./Transaksi";
import Datamaster from "./Datamaster";

// New Components
import LoginNotification from "./LoginNotification";
import {
  formatRp,
  formatNumber,
  buildMonthlyYearlyFromTransactions,
} from "./dashboard/utils";
import {
  ChartHeader,
  ProfilePill,
} from "./dashboard/DashboardComponents";
import SalesChartMonthly from "./dashboard/SalesChartMonthly";
import SalesChartYearly from "./dashboard/SalesChartYearly";
import PaymentDonut from "./dashboard/PaymentDonut";
import TransactionsTable from "./dashboard/TransactionsTable";
import TopProductsPie from "./dashboard/TopProductsPie";
import ThemeToggle from "./dashboard/ThemeToggle";

/* ======================= PLACEHOLDER ======================= */

function SkillsWheel() {
  return <div className="ps-placeholder">(Skills Wheel placeholder)</div>;
}

/* ============================= MAIN DASHBOARD ============================= */

export default function Dashboard() {
  // MENU AKTIF: "dashboard" | "transaksi" | "datamaster"
  const [activeMenu, setActiveMenu] = useState("dashboard");
  // Show welcome toast - initialize to true so it shows immediately
  const [showWelcomeToast, setShowWelcomeToast] = useState(true);

  // Theme state - check localStorage for saved preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : false; // default: light mode
  });

  // Toggle theme and save to localStorage
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem("theme", newValue ? "dark" : "light");
      return newValue;
    });
  };

  const today = new Date().toLocaleDateString("id-ID", {
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
          leaderboardRes,
          pieRes,
          latestRes,
          prodRes,
          trxRes,
        ] = await Promise.all([
          api.get(`/admin/dashboard/${year}`),
          api.get("/admin/products/leaderboard"),
          api.get("/admin/products/leaderboard"),
          api.get("/admin/products/latest"),
          api.get("/admin/products"),
          api.get("/admin/orders"),
        ]);

        setStats(dashRes.data);
        setPaymentStats(dashRes.data.paymentMethodStats ?? []);
        setTopProducts(leaderboardRes.data ?? []);
        setTopProductsPie(pieRes.data ?? []);
        setLatestProducts(latestRes.data ?? []);
        setAllProducts(prodRes.data ?? []);

        const trxData = trxRes.data ?? [];
        setTransactions(trxData);

        const { monthly, yearly } = buildMonthlyYearlyFromTransactions(trxData);
        setMonthlyStats(monthly);
        setYearlyStats(yearly);
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
    <div className={`dashboard ${isDarkMode ? "dark" : "light"}`}>
      <LoginNotification
        show={showWelcomeToast}
        onClose={() => setShowWelcomeToast(false)}
        userName="Admin"
      />

      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <main className="ds-main">
        {/* TOPBAR DARK MODE */}
        <header className="ds-topbar">
          <div className="ds-topbar-left">
            <div className="ds-topbar-title-row">
              <span className="ds-topbar-title">NUKA</span>
            </div>
            <div className="ds-topbar-sub">
              <FaCalendarAlt />
              <span>{today}</span>
              <span className="dot-sep" />
              <span>Dashboard Statistik Bisnis</span>
            </div>
          </div>

          <div className="ds-topbar-right">
            <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
            <div className="ds-topbar-pill">
              <FaSearch />
              <input type="text" placeholder="Cari produk / transaksi" />
            </div>
            <ProfilePill />
          </div>
        </header>

        <section className="ds-inner">
          {/* ================= HALAMAN DASHBOARD ================= */}
          {activeMenu === "dashboard" && (
            <>
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
                          <button
                            className="btn btn-gray"
                            onClick={copySemuaProduk}
                          >
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

                          <div className="tc-right" style={{ gap: 6 }}>
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
            </>
          )}

          {/* ================= HALAMAN TRANSAKSI ================= */}
          {activeMenu === "transaksi" && <Transaksi />}

          {/* ================= HALAMAN DATA-MASTER ================= */}
          {activeMenu === "datamaster" && <Datamaster />}
        </section>
      </main>
    </div>
  );
}
