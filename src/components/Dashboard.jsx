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
  FaCalendarAlt,
  FaChartBar,
  FaSearch,
  FaShoppingCart,
  FaUsers,
  FaArrowRight,
  FaCheckCircle,
  FaReceipt,
  FaDollarSign,
  FaThLarge,
  FaPaperPlane,
  FaFileAlt
} from "react-icons/fa";

import { motion, AnimatePresence } from "framer-motion";
import "./Dashboard.css";
import { api } from "../api";
import Sidebar from "./Sidebar";
import WhiteBar from "./Whitebar";
import Transaksi from "./Transaksi";
import Datamaster from "./Datamaster";

// Widgets & Utils
import {
  formatRp,
  formatNumber,
  buildMonthlyYearlyFromTransactions,
} from "./dashboard-widgets/utils";
import ProfilePill from "./dashboard-widgets/ProfilePill";
import ChartHeader from "./dashboard-widgets/ChartHeader";
import SalesChartMonthly from "./dashboard-widgets/SalesChartMonthly";
import SalesChartYearly from "./dashboard-widgets/SalesChartYearly";
import PaymentDonut from "./dashboard-widgets/PaymentDonut";
import TransactionsTable from "./dashboard-widgets/TransactionsTable";
import TopProductsPie from "./dashboard-widgets/TopProductsPie";

/* ============================= MAIN DASHBOARD ============================= */




export default function Dashboard() {
  // 🔹 MENU AKTIF: "dashboard" atau "transaksi"
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showWelcome, setShowWelcome] = useState(true);

  // Hide welcome message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);
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

          // top produk & pie chart
          api.get("/admin/products/leaderboard"),
          api.get("/admin/products/leaderboard"), // untuk pie chart

          // produk terbaru & semua produk
          api.get("/admin/products/latest"),
          api.get("/admin/products"),

          // 🔥 sumber data utama untuk grafik bulanan & tahunan
          api.get("/admin/orders"),
        ]);

        // ===== kartu statistik atas =====
        setStats(dashRes.data);
        setPaymentStats(dashRes.data.paymentMethodStats ?? []);

        // ===== data produk & transaksi =====
        setTopProducts(leaderboardRes.data ?? []);
        setTopProductsPie(pieRes.data ?? []);

        setLatestProducts(latestRes.data ?? []);
        setAllProducts(prodRes.data ?? []);

        const trxData = trxRes.data ?? [];
        setTransactions(trxData);

        // 🔥 bangun data grafik dari transaksi yang sudah pasti ada
        const { monthly, yearly } =
          buildMonthlyYearlyFromTransactions(trxData);
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
        icon: <FaShoppingCart />,
        value: formatNumber(stats.totalItemTerjual),
        label: "Total Item Terjual",
        year: stats.year,
      },
      {
        color: "green",
        icon: <FaReceipt />,
        value: formatNumber(stats.totalTransaksi),
        label: "Total Transaksi",
        year: stats.year,
      },
      {
        color: "orange",
        icon: <FaDollarSign />,
        value: formatNumber(stats.totalPemasukan),
        label: "Total Income",
        year: stats.year,
      },
      {
        color: "red",
        icon: <FaUsers />,
        value: formatNumber(stats.totalPelanggan),
        label: "Total Pelanggan",
        year: stats.year,
      },
    ]
    : [];

  return (
  <div className="dashboard">
          <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <main className="ds-main">
          <WhiteBar today={today} />

          <div className="ds-topbar-right">
            {/* Search inputs removed per request */}
            <ProfilePill />
          </div>

        <section className="ds-inner">
          {/* ================= HALAMAN DASHBOARD ================= */}
          {activeMenu === "dashboard" && (
            <>
              <div className="ds-section-title">
                <FaChartBar />
                <span>Statistik Bisnis</span>
              </div>


              {/* Widgets removed per user request */}
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                Belum ada data statistik.
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
                                <td className="col-no">
                                  {p.no ?? idx + 1}
                                </td>

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
                    <div
                      className="pt-right"
                      style={{ justifySelf: "end" }}
                    >
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
                      <div
                        className="mini-title"
                        style={{ marginBottom: 10 }}
                      >
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
                          <span
                            style={{ fontSize: 12, color: "#6b7a90" }}
                          >
                            Search
                          </span>

                          <div
                            className="tc-right"
                            style={{ gap: 6 }}
                          >
                            <FaSearch />

                            <input
                              value={qProduk}
                              onChange={(e) =>
                                setQProduk(e.target.value)
                              }
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
                              length: Math.max(
                                0,
                                10 - produkRows10.length
                              ),
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
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed",
              top: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(16, 185, 129, 0.9)", // Emerald green glass
              backdropFilter: "blur(12px)",
              padding: "12px 24px",
              borderRadius: "50px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
              zIndex: 9999,
              minWidth: "300px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10b981",
                fontSize: "16px",
                flexShrink: 0,
              }}
            >
              <FaCheckCircle />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "white" }}>
                Login Berhasil!
              </span>
              <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.9)" }}>
                Selamat datang kembali, Super Admin.
              </span>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "none",
                color: "white",
                opacity: 0.7,
                cursor: "pointer",
                fontSize: "18px"
              }}
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );

}
