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
  FaBoxes,
  FaReceipt,
  FaMoneyBillWave,
  FaUsers,
  FaExclamationTriangle,
  FaClock,
  FaShoppingCart,
} from "react-icons/fa";
import "./Dashboard.css";
import { api } from "../api";

import Sidebar from "./Sidebar";
import Transaksi from "./Transaksi";
import Datamaster from "./Datamaster";
import LaporanManajemen from "./LaporanManajemen";
import AkunSaya from "./AkunSaya";
import Pengaturan from "./Pengaturan";

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
  // MENU AKTIF: "dashboard" | "transaksi" | "datamaster" | "laporan"
  const [activeMenu, setActiveMenu] = useState("dashboard");
  // Show welcome toast - initialize to true so it shows immediately
  const [showWelcomeToast, setShowWelcomeToast] = useState(true);
  // Profile update key - increment to trigger Sidebar refresh
  const [profileUpdateKey, setProfileUpdateKey] = useState(0);

  // Callback when profile is updated in AkunSaya
  const handleProfileUpdate = () => {
    setProfileUpdateKey((prev) => prev + 1);
  };

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

  // ========== TODAY STATS ==========
  const [todayStats, setTodayStats] = useState({
    totalPenjualan: 0,
    totalTransaksi: 0,
    rataRata: 0,
    itemTerjual: 0,
  });
  const [hourlyData, setHourlyData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const sampleHourlyData = [
    { hour: "08:00", value: 150000 },
    { hour: "09:00", value: 280000 },
    { hour: "10:00", value: 420000 },
    { hour: "11:00", value: 350000 },
    { hour: "12:00", value: 580000 },
    { hour: "13:00", value: 320000 },
    { hour: "14:00", value: 450000 },
    { hour: "15:00", value: 280000 },
    { hour: "16:00", value: 190000 },
    { hour: "17:00", value: 120000 },
  ];

  // Sample data untuk testing grafik
  const sampleMonthlyStats = [
    {
      year: 2024,
      months: [
        { month: 1, value: 45 }, { month: 2, value: 62 }, { month: 3, value: 78 },
        { month: 4, value: 55 }, { month: 5, value: 89 }, { month: 6, value: 120 },
        { month: 7, value: 95 }, { month: 8, value: 110 }, { month: 9, value: 85 },
        { month: 10, value: 130 }, { month: 11, value: 145 }, { month: 12, value: 160 },
      ],
    },
    {
      year: 2025,
      months: [
        { month: 1, value: 80 }, { month: 2, value: 95 }, { month: 3, value: 110 },
        { month: 4, value: 88 }, { month: 5, value: 125 }, { month: 6, value: 150 },
        { month: 7, value: 135 }, { month: 8, value: 165 }, { month: 9, value: 140 },
        { month: 10, value: 175 }, { month: 11, value: 190 }, { month: 12, value: 0 },
      ],
    },
  ];

  const sampleYearlyStats = [
    { year: 2024, total: 1174 },
    { year: 2025, total: 1453 },
  ];

  const samplePaymentStats = [
    { method: "CASH", count: 245 },
    { method: "QRIS", count: 180 },
    { method: "DEBIT", count: 95 },
    { method: "KREDIT", count: 60 },
  ];

  const sampleTransactions = [
    { transactionId: "TRX-001", createdAt: "2025-12-14T10:30:00", cashierName: "Admin", totalItem: 5, totalPrice: 125000, paymentMethod: "CASH" },
    { transactionId: "TRX-002", createdAt: "2025-12-14T11:15:00", cashierName: "Admin", totalItem: 3, totalPrice: 78000, paymentMethod: "QRIS" },
    { transactionId: "TRX-003", createdAt: "2025-12-14T12:00:00", cashierName: "Kasir1", totalItem: 8, totalPrice: 245000, paymentMethod: "DEBIT" },
    { transactionId: "TRX-004", createdAt: "2025-12-14T13:30:00", cashierName: "Admin", totalItem: 2, totalPrice: 55000, paymentMethod: "CASH" },
    { transactionId: "TRX-005", createdAt: "2025-12-14T14:00:00", cashierName: "Kasir1", totalItem: 6, totalPrice: 180000, paymentMethod: "KREDIT" },
  ];

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
        // ALWAYS use sample data for charts so user can test
        setPaymentStats(samplePaymentStats);
        setMonthlyStats(sampleMonthlyStats);
        setYearlyStats(sampleYearlyStats);
        setTransactions(sampleTransactions);

        setTopProducts(leaderboardRes.data ?? []);
        setTopProductsPie(pieRes.data ?? []);
        setLatestProducts(latestRes.data ?? []);
        setAllProducts(prodRes.data ?? []);

        // Set today stats (sample data)
        setTodayStats({
          totalPenjualan: 3140000,
          totalTransaksi: 28,
          rataRata: 112143,
          itemTerjual: 156,
        });
        setHourlyData(sampleHourlyData);

        // Low stock products (< 10 units)
        const products = prodRes.data ?? [];
        const lowStock = products.filter((p) => p.stock < 10).slice(0, 5);
        setLowStockProducts(lowStock);
      } catch (err) {
        console.error("Error fetch dashboard:", err);
        // Use sample data on error
        setMonthlyStats(sampleMonthlyStats);
        setYearlyStats(sampleYearlyStats);
        setPaymentStats(samplePaymentStats);
        setTransactions(sampleTransactions);
        setHourlyData(sampleHourlyData);
        setTodayStats({
          totalPenjualan: 3140000,
          totalTransaksi: 28,
          rataRata: 112143,
          itemTerjual: 156,
        });
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
        icon: <FaBoxes />,
      },
      {
        color: "green",
        value: formatNumber(stats.totalTransaksi),
        label: "Total Transaksi",
        year: stats.year,
        icon: <FaReceipt />,
      },
      {
        color: "orange",
        value: formatNumber(stats.totalPemasukan),
        label: "Total Income",
        year: stats.year,
        icon: <FaMoneyBillWave />,
      },
      {
        color: "red",
        value: formatNumber(stats.totalPelanggan),
        label: "Total Pelanggan",
        year: stats.year,
        icon: <FaUsers />,
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

      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        profileUpdateKey={profileUpdateKey}
      />

      <main className="ds-main">
        {/* TOPBAR HIDDEN - tanggal dipindah ke sidebar */}
        {/* 
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
          </div>
        </header>
        */}

        <section className="ds-inner">
          {/* ================= HALAMAN DASHBOARD ================= */}
          {activeMenu === "dashboard" && (
            <>
              {/* Modern Page Header with Animated Icon */}
              <div className="ds-page-header">
                <div className="ds-header-content">
                  <div className="ds-header-icon">
                    <FaChartBar />
                  </div>
                  <div className="ds-header-text">
                    <h1 className="ds-page-title">Dashboard Statistik Bisnis</h1>
                    <p className="ds-page-subtitle">Pantau performa bisnis Anda secara real-time</p>
                  </div>
                </div>
              </div>

              {/* ========== TODAY'S OVERVIEW ========== */}
              <div className="ds-today-section">
                <div className="ds-section-header">
                  <div className="ds-section-title">
                    <FaClock style={{ color: "#f59e0b" }} />
                    <span>Hari Ini — {today}</span>
                  </div>
                </div>

                {/* Today Stats Cards */}
                <div className="ds-today-cards">
                  <div className="ds-today-card green">
                    <div className="ds-today-icon"><FaMoneyBillWave /></div>
                    <div className="ds-today-info">
                      <span className="ds-today-value">{formatRp(todayStats.totalPenjualan)}</span>
                      <span className="ds-today-label">Penjualan Hari Ini</span>
                    </div>
                  </div>
                  <div className="ds-today-card blue">
                    <div className="ds-today-icon"><FaReceipt /></div>
                    <div className="ds-today-info">
                      <span className="ds-today-value">{formatNumber(todayStats.totalTransaksi)}</span>
                      <span className="ds-today-label">Transaksi</span>
                    </div>
                  </div>
                  <div className="ds-today-card orange">
                    <div className="ds-today-icon"><FaShoppingCart /></div>
                    <div className="ds-today-info">
                      <span className="ds-today-value">{formatRp(todayStats.rataRata)}</span>
                      <span className="ds-today-label">Rata-rata/Transaksi</span>
                    </div>
                  </div>
                  <div className="ds-today-card purple">
                    <div className="ds-today-icon"><FaBoxes /></div>
                    <div className="ds-today-info">
                      <span className="ds-today-value">{formatNumber(todayStats.itemTerjual)}</span>
                      <span className="ds-today-label">Item Terjual</span>
                    </div>
                  </div>
                </div>

                {/* Hourly Chart + Low Stock */}
                <div className="ds-today-grid">
                  {/* Hourly Sales Chart */}
                  <div className="ds-hourly-chart">
                    <div className="ds-chart-title">Penjualan Per Jam</div>
                    <div className="ds-hourly-bars">
                      {hourlyData.length > 0 ? hourlyData.map((h, i) => {
                        const maxVal = Math.max(...hourlyData.map(d => d.value), 1);
                        const pct = maxVal > 0 ? (h.value / maxVal) * 100 : 0;
                        return (
                          <div key={i} className="ds-hour-bar">
                            <div className="ds-bar-fill" style={{ height: `${pct}%` }} title={formatRp(h.value)} />
                            <span className="ds-hour-label">{h.hour.split(":")[0]}</span>
                          </div>
                        );
                      }) : (
                        <div style={{ textAlign: "center", color: "#6b7a90", fontSize: 13, padding: "40px" }}>
                          Belum ada data penjualan hari ini
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Low Stock Widget */}
                  <div className="ds-low-stock">
                    <div className="ds-chart-title">
                      <FaExclamationTriangle style={{ color: "#ef4444" }} />
                      <span>Stok Menipis (&lt;10)</span>
                    </div>
                    <div className="ds-low-stock-list">
                      {lowStockProducts.length > 0 ? (
                        lowStockProducts.map((p, i) => (
                          <div key={i} className="ds-low-stock-item">
                            <span className="ds-product-name">{p.name}</span>
                            <span className={`ds-stock-badge ${p.stock < 5 ? "critical" : "warning"}`}>
                              {p.stock} unit
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="ds-low-stock-empty">
                          ✓ Semua stok aman
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ========== YEARLY STATS ========== */}
              <div className="ds-section-header" style={{ marginTop: "24px" }}>
                <div className="ds-section-title">
                  <FaChartBar style={{ color: "#3b82f6" }} />
                  <span>Statistik Tahunan</span>
                </div>
              </div>

              <div className="ds-cards">
                {statCards.map((s, idx) => (
                  <div key={idx} className={`ds-card ${s.color}`}>
                    <div className="ds-card-value">{s.value}</div>
                    <div className="ds-card-sub">{s.label}</div>
                    <div className="ds-card-pill">
                      {s.icon}
                    </div>

                    <div className="ds-card-footer">
                      <span>Tahun {s.year}</span>
                      <span className="ds-card-detail">Detail →</span>
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

              {/* Produk Terbaru */}
              <div className="panel-single">
                <div className="panel-header panel-header--chart">
                  <div className="ph-leftwrap">
                    <div className="ph-title">Produk Terbaru</div>
                  </div>
                </div>

                <div className="ps-body">
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
                    style={{ minHeight: 0 }}
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
              </div>

              <SkillsWheel />
            </>
          )}

          {/* ================= HALAMAN TRANSAKSI ================= */}
          {activeMenu === "transaksi" && <Transaksi />}

          {/* ================= HALAMAN DATA-MASTER ================= */}
          {activeMenu === "datamaster" && <Datamaster />}

          {/* ================= HALAMAN LAPORAN ================= */}
          {activeMenu === "laporan" && <LaporanManajemen />}

          {/* ================= HALAMAN AKUN SAYA ================= */}
          {activeMenu === "akun" && <AkunSaya onProfileUpdate={handleProfileUpdate} />}

          {/* ================= HALAMAN PENGATURAN ================= */}
          {activeMenu === "pengaturan" && <Pengaturan isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
        </section>
      </main>
    </div>
  );
}
