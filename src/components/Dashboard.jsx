// =============================
// Dashboard.jsx FINAL TERHUBUNG BE (DARK MODE)
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
  FaReceipt,
  FaDollarSign,
  FaUsers,
  FaArrowRight,
  FaCheckCircle
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "./Dashboard.css";
import { api } from "../api";
import Sidebar from "./Sidebar";
// WhiteBar dihapus, sekarang topbar ada di sini
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
  // MENU AKTIF: "dashboard" | "transaksi" | "datamaster"
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
            {/* Search inputs removed per request */}
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


              {/* Widgets removed per user request */}
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                Belum ada data statistik.
              </div>
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
    </div>
  );

}
