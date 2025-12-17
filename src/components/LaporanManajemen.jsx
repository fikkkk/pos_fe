import React, { useState, useEffect, useCallback } from "react";
import {
    FaChartBar,
    FaChartPie,
    FaFileExcel,
    FaFilePdf,
    FaPrint,
    FaCheckCircle,
    FaUser,
    FaUsers,
    FaSpinner,
    FaSync,
    FaArrowUp,
    FaArrowDown,
    FaMoneyBillWave,
    FaClock,
    FaReceipt,
    FaPercent,
    FaSearch,
    FaEye,
    FaTimes,
} from "react-icons/fa";
import { api } from "../api";
import "./LaporanManajemen.css";

// Decode JWT Token to get user info
function decodeJWT(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Modern Bar Chart Component
function ModernBarChart({ data, maxValue, formatValue }) {
    if (!data || data.length === 0) {
        return <div className="no-data">Tidak ada data untuk periode ini</div>;
    }

    return (
        <div className="modern-bar-chart">
            <div className="bar-chart-container">
                {data.slice(-20).map((d, i) => {
                    const percentage = maxValue > 0 ? ((d.total || 0) / maxValue) * 100 : 0;
                    const isHighest = d.total === maxValue;

                    return (
                        <div key={i} className="bar-column">
                            <div className="bar-tooltip">{formatValue(d.total)}</div>
                            <div className="bar-wrapper">
                                <div
                                    className={`bar-fill ${isHighest ? "highest" : ""}`}
                                    style={{ height: `${Math.max(percentage, 2)}%` }}
                                >
                                    <div className="bar-glow"></div>
                                </div>
                            </div>
                            <span className="bar-label">{d.tanggal?.split("-")[2] || ""}</span>
                        </div>
                    );
                })}
            </div>
            <div className="chart-y-axis">
                <span>{formatValue(maxValue)}</span>
                <span>{formatValue(maxValue / 2)}</span>
                <span>0</span>
            </div>
        </div>
    );
}

// Modern Pie Chart Component with Animation
function ModernPieChart({ data, colors, totalLabel, totalValue, formatNumber }) {
    if (!data || data.length === 0) {
        return <div className="no-data">Tidak ada data pembayaran</div>;
    }

    const total = data.reduce((a, b) => a + (b.jumlahTransaksi || 0), 0);
    let currentAngle = 0;

    return (
        <div className="modern-pie-chart">
            <div className="pie-container">
                <svg viewBox="0 0 100 100" className="pie-svg">
                    <defs>
                        {data.map((item, i) => (
                            <linearGradient key={i} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colors[item.metode] || "#666"} stopOpacity="1" />
                                <stop offset="100%" stopColor={colors[item.metode] || "#666"} stopOpacity="0.7" />
                            </linearGradient>
                        ))}
                    </defs>

                    {data.map((item, i) => {
                        const percentage = total > 0 ? (item.jumlahTransaksi / total) * 100 : 0;
                        const angle = (percentage / 100) * 360;
                        const startAngle = currentAngle;
                        currentAngle += angle;

                        const x1 = 50 + 40 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                        const y1 = 50 + 40 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                        const x2 = 50 + 40 * Math.cos((Math.PI * (startAngle + angle - 90)) / 180);
                        const y2 = 50 + 40 * Math.sin((Math.PI * (startAngle + angle - 90)) / 180);
                        const largeArc = angle > 180 ? 1 : 0;

                        return (
                            <path
                                key={i}
                                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                fill={`url(#grad-${i})`}
                                className="pie-slice"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        );
                    })}

                    <circle cx="50" cy="50" r="25" className="pie-center-circle" />
                </svg>

                <div className="pie-center-content">
                    <span className="pie-center-label">{totalLabel}</span>
                    <span className="pie-center-value">{formatNumber(totalValue)}</span>
                </div>
            </div>

            <div className="pie-legend">
                {data.map((item, i) => {
                    const percentage = total > 0 ? Math.round((item.jumlahTransaksi / total) * 100) : 0;
                    return (
                        <div key={i} className="legend-row">
                            <div className="legend-marker" style={{ background: colors[item.metode] || "#666" }} />
                            <div className="legend-info">
                                <span className="legend-name">{item.metode}</span>
                                <span className="legend-stats">
                                    {item.jumlahTransaksi} transaksi ({percentage}%)
                                </span>
                            </div>
                            <div className="legend-amount">{formatNumber(item.totalNominal)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function LaporanManajemen() {
    // Get user from JWT token
    const token = localStorage.getItem("token");
    const userInfo = token ? decodeJWT(token) : null;
    const isAdmin = userInfo?.role === "ADMIN" || userInfo?.role === "SUPERADMIN";
    const currentUserId = userInfo?.sub;

    // Filter states
    const [dateFrom, setDateFrom] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split("T")[0];
    });
    const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
    const [selectedCashier, setSelectedCashier] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("");

    // Data states
    const [cashiers, setCashiers] = useState([]);
    const [summary, setSummary] = useState(null);
    const [dailyChart, setDailyChart] = useState([]);
    const [paymentStats, setPaymentStats] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [localTransactions, setLocalTransactions] = useState([]); // Transaksi dari localStorage
    const [productsData, setProductsData] = useState([]);
    const [cashierStats, setCashierStats] = useState([]);

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Load transaksi dari localStorage
    useEffect(() => {
        const loadLocalTransactions = () => {
            try {
                const stored = JSON.parse(localStorage.getItem("pos_transactions") || "[]");
                // Convert format localStorage ke format yang sama dengan API
                const formatted = stored.map((t, index) => ({
                    id: t.id || `LOCAL-${index}`,
                    tanggal: t.tanggal,
                    kasir: userInfo?.name || userInfo?.email || "Kasir",
                    pelanggan: "Umum",
                    metodePembayaran: t.metodePembayaran,
                    subtotal: t.subtotal,
                    diskon: 0,
                    total: t.total,
                    items: t.items,
                    isLocal: true, // penanda transaksi lokal
                }));
                setLocalTransactions(formatted);
            } catch (err) {
                console.error("Error loading local transactions:", err);
            }
        };
        loadLocalTransactions();

        // Listen for storage changes (jika transaksi baru ditambahkan)
        const handleStorageChange = () => loadLocalTransactions();
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [userInfo]);

    // Format currency
    const formatCurrency = (value) => {
        if (value >= 1000000000) {
            return `Rp ${(value / 1000000000).toFixed(1)}M`;
        } else if (value >= 1000000) {
            return `Rp ${(value / 1000000).toFixed(1)}Jt`;
        } else if (value >= 1000) {
            return `Rp ${(value / 1000).toFixed(0)}rb`;
        }
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    const formatFullCurrency = (value) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value || 0);
    };

    const formatNumber = (value) => new Intl.NumberFormat("id-ID").format(value || 0);

    // Fetch cashiers list (Admin only) - only KASIR role users
    useEffect(() => {
        if (isAdmin) {
            api
                .get("/admin/users")
                .then((res) => {
                    // Only include KASIR in dropdown filter
                    const kasirList = (res.data || []).filter(
                        (u) => u.role === "KASIR"
                    );
                    setCashiers(kasirList);
                })
                .catch((err) => console.error("Error fetching cashiers:", err));
        }
    }, [isAdmin]);

    // Build filter DTO
    const buildFilterDto = useCallback(() => {
        const dto = { from: dateFrom, to: dateTo };
        if (isAdmin) {
            if (selectedCashier !== "all") dto.cashierId = selectedCashier;
        } else {
            dto.cashierId = String(currentUserId);
        }
        if (paymentFilter) dto.paymentMethod = paymentFilter;
        return dto;
    }, [dateFrom, dateTo, selectedCashier, paymentFilter, isAdmin, currentUserId]);

    // Fetch all report data
    const fetchReportData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const dto = buildFilterDto();

        try {
            // Use Promise.allSettled to handle individual failures gracefully
            const results = await Promise.allSettled([
                api.post("/report/summary", dto),
                api.post("/report/daily", dto),
                api.post("/report/payment", dto),
                api.post(`/report/transactions?page=${currentPage}&limit=10`, dto),
                api.post("/report/product", dto),
                isAdmin ? api.post("/report/cashier", dto) : Promise.resolve({ data: [] }),
                isAdmin ? api.get("/admin/users") : Promise.resolve({ data: [] }),
            ]);

            // Extract values, defaulting to empty on failure
            const [summaryRes, dailyRes, paymentRes, transRes, productRes, cashierRes, usersRes] = results.map(
                (r, i) => {
                    if (r.status === "fulfilled") {
                        return r.value;
                    } else {
                        console.error(`API call ${i} failed:`, r.reason);
                        return { data: null };
                    }
                }
            );

            // Check if critical endpoint failed
            if (summaryRes.data === null) {
                console.error("Failed to load summary - DTO:", dto);
                setError("Gagal memuat ringkasan. Periksa koneksi backend.");
                setLoading(false);
                return;
            }

            setSummary(summaryRes.data);
            setDailyChart(dailyRes.data || []);
            setPaymentStats(paymentRes.data || []);
            setTransactions(transRes.data?.data || transRes.data || []);
            setTotalPages(transRes.data?.pagination?.totalPages || 1);
            setProductsData(productRes.data || []);

            // Merge cashiers: combine user list with sales data
            if (isAdmin) {
                const salesData = cashierRes.data || [];
                // Only show KASIR users in Performa Kasir table (not ADMIN)
                let allUsers = (usersRes.data || []).filter(
                    (u) => u.role === "KASIR"
                );

                // If a specific cashier is selected, filter to show only that cashier
                if (selectedCashier !== "all") {
                    allUsers = allUsers.filter(
                        (u) => String(u.id) === String(selectedCashier)
                    );
                }

                // Create map of sales data by kasir name
                const salesMap = {};
                salesData.forEach((s) => {
                    salesMap[s.kasir] = s;
                });

                // Merge: show users, fill with sales data if available
                const mergedCashierStats = allUsers.map((user) => {
                    const name = user.name || user.username || user.email;
                    const salesInfo = salesMap[name];
                    return {
                        kasir: name,
                        jumlahTransaksi: salesInfo?.jumlahTransaksi || 0,
                        totalPenjualan: salesInfo?.totalPenjualan || 0,
                        rataRataTransaksi: salesInfo?.rataRataTransaksi || 0,
                    };
                });

                setCashierStats(mergedCashierStats);
            } else {
                setCashierStats([]);
            }
        } catch (err) {
            console.error("Error fetching report:", err);
            setError("Gagal memuat data laporan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    }, [buildFilterDto, currentPage, isAdmin, selectedCashier]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    const handleApplyFilter = () => {
        setCurrentPage(1);
        fetchReportData();
    };

    const handleReset = () => {
        const d = new Date();
        d.setDate(1);
        setDateFrom(d.toISOString().split("T")[0]);
        setDateTo(new Date().toISOString().split("T")[0]);
        setSelectedCashier("all");
        setPaymentFilter("");
        setCurrentPage(1);

        // Refresh transaksi lokal dari localStorage
        try {
            const stored = JSON.parse(localStorage.getItem("pos_transactions") || "[]");
            const formatted = stored.map((t, index) => ({
                id: t.id || `LOCAL-${index}`,
                tanggal: t.tanggal,
                kasir: userInfo?.name || userInfo?.email || "Kasir",
                pelanggan: "Umum",
                metodePembayaran: t.metodePembayaran,
                subtotal: t.subtotal,
                diskon: 0,
                total: t.total,
                items: t.items,
                isLocal: true,
            }));
            setLocalTransactions(formatted);
        } catch (err) {
            console.error("Error refreshing local transactions:", err);
        }
    };

    const maxChartValue = Math.max(...dailyChart.map((d) => d.total || 0), 1);

    const paymentColors = {
        TUNAI: "#10b981",
        DEBIT: "#3b82f6",
        KREDIT: "#8b5cf6",
        QRIS: "#f59e0b",
    };

    const totalPaymentTransactions = paymentStats.reduce(
        (a, b) => a + (b.jumlahTransaksi || 0), 0
    );

    // Hitung summary dari transaksi lokal
    const localSummary = React.useMemo(() => {
        // Filter transaksi lokal berdasarkan tanggal
        const filteredLocal = localTransactions.filter((t) => {
            const transDate = new Date(t.tanggal).toISOString().split("T")[0];
            return transDate >= dateFrom && transDate <= dateTo;
        });

        return {
            totalPenjualanKotor: filteredLocal.reduce((sum, t) => sum + (t.subtotal || t.total || 0), 0),
            totalTransaksi: filteredLocal.length,
            totalDiskon: 0,
            totalPajak: filteredLocal.reduce((sum, t) => sum + ((t.total || 0) * 0.11 / 1.11), 0), // estimasi pajak 11%
            totalPenjualanBersih: filteredLocal.reduce((sum, t) => sum + (t.total || 0), 0),
        };
    }, [localTransactions, dateFrom, dateTo]);

    // Gabungkan summary API dengan summary lokal
    const combinedSummary = React.useMemo(() => {
        if (!summary && localTransactions.length === 0) return null;

        const apiSummary = summary || {
            totalPenjualanKotor: 0,
            totalTransaksi: 0,
            totalDiskon: 0,
            totalPajak: 0,
            totalPenjualanBersih: 0,
            waktuRataRataTransaksi: "00:00:00",
        };

        return {
            totalPenjualanKotor: apiSummary.totalPenjualanKotor + localSummary.totalPenjualanKotor,
            totalTransaksi: apiSummary.totalTransaksi + localSummary.totalTransaksi,
            totalDiskon: apiSummary.totalDiskon + localSummary.totalDiskon,
            totalPajak: apiSummary.totalPajak + localSummary.totalPajak,
            totalPenjualanBersih: apiSummary.totalPenjualanBersih + localSummary.totalPenjualanBersih,
            waktuRataRataTransaksi: apiSummary.waktuRataRataTransaksi || "00:00:00",
        };
    }, [summary, localSummary, localTransactions.length]);

    // Summary card configs - menggunakan combinedSummary
    const summaryCards = combinedSummary ? [
        {
            icon: <FaMoneyBillWave />,
            label: "Penjualan Kotor",
            value: formatFullCurrency(combinedSummary.totalPenjualanKotor),
            color: "blue",
            highlight: true,
        },
        {
            icon: <FaReceipt />,
            label: "Total Transaksi",
            value: formatNumber(combinedSummary.totalTransaksi),
            color: "green",
        },
        {
            icon: <FaPercent />,
            label: "Total Diskon",
            value: `-${formatFullCurrency(combinedSummary.totalDiskon)}`,
            color: "red",
        },
        {
            icon: <FaArrowUp />,
            label: "Total Pajak",
            value: formatFullCurrency(combinedSummary.totalPajak),
            color: "purple",
        },
        {
            icon: <FaArrowDown />,
            label: "Penjualan Bersih",
            value: formatFullCurrency(combinedSummary.totalPenjualanBersih),
            color: "emerald",
        },
        {
            icon: <FaClock />,
            label: "Waktu Rata-rata",
            value: combinedSummary.waktuRataRataTransaksi || "00:00:00",
            color: "orange",
        },
    ] : [];

    // Gabungkan transaksi dari API dan localStorage
    const allTransactions = React.useMemo(() => {
        // Gabungkan kedua sumber data
        const combined = [...transactions, ...localTransactions];

        // Filter berdasarkan tanggal
        const filtered = combined.filter((t) => {
            const transDate = new Date(t.tanggal).toISOString().split("T")[0];
            const isInDateRange = transDate >= dateFrom && transDate <= dateTo;

            // Filter berdasarkan metode pembayaran jika ada
            const matchPayment = !paymentFilter || t.metodePembayaran === paymentFilter;

            return isInDateRange && matchPayment;
        });

        // Urutkan berdasarkan tanggal terbaru
        return filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    }, [transactions, localTransactions, dateFrom, dateTo, paymentFilter]);

    // Filter transactions based on search query
    const filteredTransactions = allTransactions.filter((t) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            (t.kasir || "").toLowerCase().includes(query) ||
            (t.pelanggan || "").toLowerCase().includes(query) ||
            (t.metodePembayaran || "").toLowerCase().includes(query) ||
            String(t.total || "").includes(query) ||
            new Date(t.tanggal).toLocaleDateString("id-ID").includes(query)
        );
    });

    // Handle view transaction detail
    const handleViewDetail = (transaction) => {
        setSelectedTransaction(transaction);
        setShowDetailModal(true);
    };

    // Close detail modal
    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedTransaction(null);
    };

    return (
        <div className="laporan-page">
            {/* Header */}
            <div className="laporan-header">
                <div className="laporan-header-content">
                    <div className="laporan-header-icon">
                        <FaChartPie />
                    </div>
                    <div className="laporan-header-text">
                        <h1 className="laporan-title">
                            {isAdmin ? "Laporan Manajemen" : "Laporan Kinerja Saya"}
                        </h1>
                        <p className="laporan-subtitle">
                            {isAdmin
                                ? "Analisis lengkap penjualan, performa kasir, dan statistik operasional"
                                : `Dashboard performa pribadi Anda sebagai ${userInfo?.role || "Kasir"}`}
                        </p>
                    </div>
                </div>
                {!isAdmin && (
                    <div className="user-profile-badge">
                        <FaUser />
                        <span>{userInfo?.email || "User"}</span>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="laporan-filters">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>Dari Tanggal</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Sampai Tanggal</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>

                    {isAdmin && (
                        <div className="filter-group">
                            <label>
                                <FaUsers /> Kasir
                            </label>
                            <select
                                value={selectedCashier}
                                onChange={(e) => setSelectedCashier(e.target.value)}
                            >
                                <option value="all">Semua Kasir</option>
                                {cashiers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name || c.username || c.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="filter-group">
                        <label>Pembayaran</label>
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                        >
                            <option value="">Semua</option>
                            <option value="TUNAI">Tunai</option>
                            <option value="DEBIT">Debit</option>
                            <option value="KREDIT">Kredit</option>
                            <option value="QRIS">QRIS</option>
                        </select>
                    </div>

                    <div className="filter-actions">
                        <button className="btn-reset" onClick={handleReset}>Reset</button>
                        <button className="btn-apply" onClick={handleApplyFilter}>
                            <FaSync /> Terapkan
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        <FaSpinner className="spinner" />
                        <span>Memuat data laporan...</span>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && <div className="error-banner">{error}</div>}

            {/* Scrollable Content */}
            <div className="laporan-content">
                {/* Summary Cards */}
                {combinedSummary && (
                    <div className="summary-grid">
                        {summaryCards.map((card, i) => (
                            <div key={i} className={`summary-card ${card.color} ${card.highlight ? "highlight" : ""}`}>
                                <div className="summary-card-icon">{card.icon}</div>
                                <div className="summary-card-info">
                                    <span className="summary-card-label">{card.label}</span>
                                    <span className="summary-card-value">{card.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Charts Section */}
                <div className="charts-grid">
                    {/* Bar Chart */}
                    <div className="chart-card">
                        <div className="chart-card-header">
                            <div className="chart-card-title">
                                <FaChartBar className="chart-icon orange" />
                                <span>Grafik Penjualan Harian</span>
                            </div>
                            <div className="chart-period">{dateFrom} - {dateTo}</div>
                        </div>
                        <div className="chart-card-body">
                            <ModernBarChart
                                data={dailyChart}
                                maxValue={maxChartValue}
                                formatValue={formatCurrency}
                            />
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="chart-card">
                        <div className="chart-card-header">
                            <div className="chart-card-title">
                                <FaChartPie className="chart-icon blue" />
                                <span>Distribusi Metode Pembayaran</span>
                            </div>
                        </div>
                        <div className="chart-card-body">
                            <ModernPieChart
                                data={paymentStats}
                                colors={paymentColors}
                                totalLabel="Total Transaksi"
                                totalValue={totalPaymentTransactions}
                                formatNumber={formatFullCurrency}
                            />
                        </div>
                    </div>
                </div>

                {/* Tables Section */}
                <div className="tables-section">
                    {/* Transactions Table */}
                    <div className="table-card">
                        <div className="table-card-header">
                            <h3>📋 Riwayat Transaksi</h3>
                            <div className="table-header-right">
                                <div className="table-search">
                                    <FaSearch className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Cari transaksi..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="table-actions">
                                    <button className="table-btn excel"><FaFileExcel /> Excel</button>
                                    <button className="table-btn pdf"><FaFilePdf /> PDF</button>
                                    <button className="table-btn print"><FaPrint /> Cetak</button>
                                </div>
                            </div>
                        </div>
                        <div className="table-scroll-wrapper">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Tanggal</th>
                                        <th>Kasir</th>
                                        <th>Pelanggan</th>
                                        <th>Metode</th>
                                        <th>Subtotal</th>
                                        <th>Diskon</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.length > 0 ? (
                                        filteredTransactions.map((t, i) => (
                                            <tr key={t.id || i}>
                                                <td>{(currentPage - 1) * 10 + i + 1}</td>
                                                <td>
                                                    {new Date(t.tanggal).toLocaleString("id-ID", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </td>
                                                <td>{t.kasir}</td>
                                                <td>{t.pelanggan}</td>
                                                <td>
                                                    <span className={`payment-badge ${t.metodePembayaran?.toLowerCase()}`}>
                                                        {t.metodePembayaran}
                                                    </span>
                                                </td>
                                                <td>{formatFullCurrency(t.subtotal)}</td>
                                                <td className={t.diskon > 0 ? "discount" : ""}>
                                                    {t.diskon > 0 ? `-${formatFullCurrency(t.diskon)}` : "-"}
                                                </td>
                                                <td className="total">{formatFullCurrency(t.total)}</td>
                                                <td>
                                                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                                                        <span className="status-badge success">
                                                            <FaCheckCircle /> Selesai
                                                        </span>
                                                        {t.isLocal && (
                                                            <span className="status-badge local" style={{
                                                                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                                                color: "#fff",
                                                                fontSize: "0.7rem",
                                                                padding: "2px 8px"
                                                            }}>
                                                                Lokal
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        className="detail-btn"
                                                        onClick={() => handleViewDetail(t)}
                                                        title="Lihat Detail"
                                                    >
                                                        <FaEye /> Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="10" className="empty-row">
                                                {searchQuery ? "Tidak ditemukan transaksi yang cocok" : "Tidak ada transaksi untuk periode ini"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                >
                                    ← Sebelumnya
                                </button>
                                <span>Halaman {currentPage} dari {totalPages}</span>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                >
                                    Selanjutnya →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Products Table */}
                    <div className="table-card">
                        <div className="table-card-header">
                            <h3>📦 Penjualan per Produk</h3>
                        </div>
                        <div className="table-scroll-wrapper">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Produk</th>
                                        <th>Kategori</th>
                                        <th>Qty</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productsData.length > 0 ? (
                                        productsData.slice(0, 10).map((p, i) => (
                                            <tr key={i}>
                                                <td>{i + 1}</td>
                                                <td><strong>{p.productName}</strong></td>
                                                <td>{p.categoryName || "-"}</td>
                                                <td>{formatNumber(p.qty)}</td>
                                                <td className="total">{formatFullCurrency(p.totalPenjualan)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="empty-row">Tidak ada data</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Cashier Stats - Admin Only */}
                    {isAdmin && (
                        <div className="table-card">
                            <div className="table-card-header">
                                <h3>👤 Performa Kasir</h3>
                            </div>
                            <div className="table-scroll-wrapper">
                                <table className="modern-table">
                                    <thead>
                                        <tr>
                                            <th>Kasir</th>
                                            <th>Transaksi</th>
                                            <th>Total Penjualan</th>
                                            <th>Rata-rata</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cashierStats.length > 0 ? (
                                            cashierStats.map((c, i) => (
                                                <tr key={i}>
                                                    <td><strong>{c.kasir}</strong></td>
                                                    <td>{formatNumber(c.jumlahTransaksi)}</td>
                                                    <td className="total">{formatFullCurrency(c.totalPenjualan)}</td>
                                                    <td>{formatFullCurrency(c.rataRataTransaksi)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="empty-row">Tidak ada data</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction Detail Modal */}
            {showDetailModal && selectedTransaction && (
                <div className="detail-modal-overlay" onClick={closeDetailModal}>
                    <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="detail-modal-header">
                            <h3>Detail Transaksi</h3>
                            <button className="detail-close-btn" onClick={closeDetailModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="detail-modal-body">
                            <div className="detail-info-grid">
                                <div className="detail-info-item">
                                    <span className="detail-label">Tanggal</span>
                                    <span className="detail-value">
                                        {new Date(selectedTransaction.tanggal).toLocaleString("id-ID", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-label">Kasir</span>
                                    <span className="detail-value">{selectedTransaction.kasir}</span>
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-label">Pelanggan</span>
                                    <span className="detail-value">{selectedTransaction.pelanggan || "-"}</span>
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-label">Metode Pembayaran</span>
                                    <span className={`payment-badge ${selectedTransaction.metodePembayaran?.toLowerCase()}`}>
                                        {selectedTransaction.metodePembayaran}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-items-section">
                                <h4>Barang yang Dibeli</h4>
                                <table className="detail-items-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Nama Produk</th>
                                            <th>Qty</th>
                                            <th>Harga</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                                            selectedTransaction.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{idx + 1}</td>
                                                    <td>{item.productName || item.name || "-"}</td>
                                                    <td>{item.qty || item.quantity || 0}</td>
                                                    <td>{formatFullCurrency(item.price || item.harga || 0)}</td>
                                                    <td>{formatFullCurrency((item.qty || item.quantity || 0) * (item.price || item.harga || 0))}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="empty-row">
                                                    Data item tidak tersedia
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="detail-summary">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{formatFullCurrency(selectedTransaction.subtotal)}</span>
                                </div>
                                {selectedTransaction.diskon > 0 && (
                                    <div className="summary-row discount">
                                        <span>Diskon</span>
                                        <span>-{formatFullCurrency(selectedTransaction.diskon)}</span>
                                    </div>
                                )}
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>{formatFullCurrency(selectedTransaction.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
